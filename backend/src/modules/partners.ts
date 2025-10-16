import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { errors, successResponse, errorResponse } from '../middleware/errors';

export async function registerPartner(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { app_name, app_description, app_url, webhook_url, permissions } = body;

    if (!app_name || !app_url) {
      throw errors.badRequest('app_name and app_url are required');
    }

    const db: D1Database = c.env.DB;

    // Generate API key
    const apiKey = `pk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Hash the API key for storage
    const apiKeyHash = await hashApiKey(apiKey);

    const result = await db.prepare(
      `INSERT INTO partner_apps (partner_id, app_name, app_description, app_url, webhook_url, api_key_hash, permissions)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    ).bind(
      userId,
      app_name,
      app_description || null,
      app_url,
      webhook_url || null,
      apiKeyHash,
      JSON.stringify(permissions || ['read_economy'])
    ).first();

    return successResponse(c, {
      partner_app: result,
      api_key: apiKey // Only returned once during registration
    }, 201);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function listPartnerApps(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const db: D1Database = c.env.DB;

    const apps = await db.prepare(
      `SELECT id, app_name, app_description, app_url, webhook_url, permissions, status, created_at
       FROM partner_apps
       WHERE partner_id = ?
       ORDER BY created_at DESC`
    ).bind(userId).all();

    return successResponse(c, apps.results);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function handlePartnerWebhook(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const { partner_id, event_type, event_data } = body;

    if (!partner_id || !event_type) {
      return errorResponse(c, new Error('partner_id and event_type are required'), 400);
    }

    const db: D1Database = c.env.DB;

    // Verify partner exists and is approved
    const partner = await db.prepare(
      `SELECT pa.*, u.email
       FROM partner_apps pa
       JOIN users u ON pa.partner_id = u.id
       WHERE pa.partner_id = ? AND pa.status = 'approved'`
    ).bind(partner_id).first();

    if (!partner) {
      return errorResponse(c, new Error('Partner not found or not approved'), 404);
    }

    // Store webhook event
    await db.prepare(
      `INSERT INTO webhook_events (partner_id, event_type, event_data, webhook_url)
       VALUES (?, ?, ?, ?)`
    ).bind(partner_id, event_type, JSON.stringify(event_data), partner.webhook_url).run();

    // Process event based on type
    await processWebhookEvent(db, event_type, event_data, partner);

    return successResponse(c, { processed: true });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getPartnerUsage(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const db: D1Database = c.env.DB;

    // Get usage stats for this partner
    const usage = await db.prepare(
      `SELECT endpoint, SUM(request_count) as total_requests,
              AVG(response_time_ms) as avg_response_time,
              COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
       FROM partner_usage
       WHERE partner_id = ? AND usage_date >= date('now', '-30 days')
       GROUP BY endpoint
       ORDER BY total_requests DESC`
    ).bind(userId).all();

    // Get total usage for the period
    const totalUsage = await db.prepare(
      `SELECT SUM(request_count) as total_requests,
              AVG(response_time_ms) as avg_response_time
       FROM partner_usage
       WHERE partner_id = ? AND usage_date >= date('now', '-30 days')`
    ).bind(userId).first();

    return successResponse(c, {
      usage_by_endpoint: usage.results,
      total_usage: totalUsage,
      period: '30 days'
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function validatePartnerApiKey(c: Context): Promise<Response> {
  try {
    const apiKey = c.req.header('X-API-Key') || c.req.query('api_key');

    if (!apiKey) {
      return errorResponse(c, new Error('API key required'), 401);
    }

    const db: D1Database = c.env.DB;

    // Hash the provided API key for comparison
    const apiKeyHash = await hashApiKey(apiKey);

    // Find partner app
    const partnerApp = await db.prepare(
      `SELECT pa.*, u.name as partner_name
       FROM partner_apps pa
       JOIN users u ON pa.partner_id = u.id
       WHERE pa.api_key_hash = ? AND pa.status = 'approved'`
    ).bind(apiKeyHash).first();

    if (!partnerApp) {
      return errorResponse(c, new Error('Invalid API key'), 401);
    }

    // Set partner context for the request
    c.set('partnerId', partnerApp.id);
    c.set('partnerPermissions', JSON.parse(partnerApp.permissions || '[]'));

    return successResponse(c, {
      partner_id: partnerApp.partner_id,
      app_name: partnerApp.app_name,
      permissions: JSON.parse(partnerApp.permissions || '[]')
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

// Helper functions
async function hashApiKey(apiKey: string): Promise<string> {
  // In production, use proper crypto hashing
  return btoa(apiKey).slice(0, 32);
}

async function processWebhookEvent(db: D1Database, eventType: string, eventData: any, partner: any) {
  switch (eventType) {
    case 'content_created':
      // Notify partner about new content
      await sendWebhookNotification(db, partner, 'content_created', eventData);
      break;
    case 'drop_completed':
      // Notify partner about completed drops
      await sendWebhookNotification(db, partner, 'drop_completed', eventData);
      break;
    case 'staking_reward':
      // Notify partner about staking rewards
      await sendWebhookNotification(db, partner, 'staking_reward', eventData);
      break;
  }
}

async function sendWebhookNotification(db: D1Database, partner: any, eventType: string, eventData: any) {
  if (!partner.webhook_url) return;

  try {
    const response = await fetch(partner.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Promorang-Webhook/1.0'
      },
      body: JSON.stringify({
        event_type: eventType,
        partner_id: partner.partner_id,
        event_data: eventData,
        timestamp: new Date().toISOString()
      })
    });

    // Update webhook delivery status
    await db.prepare(
      `UPDATE webhook_events SET delivery_status = ?, delivery_attempts = delivery_attempts + 1, last_delivery_at = datetime('now')
       WHERE partner_id = ? AND event_type = ? AND delivery_status = 'pending'
       ORDER BY created_at DESC LIMIT 1`
    ).bind(response.ok ? 'delivered' : 'failed', partner.partner_id, eventType).run();

  } catch (error) {
    console.error('Webhook delivery failed:', error);

    // Mark as failed
    await db.prepare(
      `UPDATE webhook_events SET delivery_status = 'failed', delivery_attempts = delivery_attempts + 1, last_delivery_at = datetime('now')
       WHERE partner_id = ? AND event_type = ? AND delivery_status = 'pending'
       ORDER BY created_at DESC LIMIT 1`
    ).bind(partner.partner_id, eventType).run();
  }
}
