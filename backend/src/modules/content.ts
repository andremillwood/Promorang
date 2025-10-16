import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { Content, CreateContentRequest, BuySharesRequest } from '../types';
import { errors, successResponse, errorResponse } from '../middleware/errors';

export async function listContent(c: Context): Promise<Response> {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const db: D1Database = c.env.DB;

    const result = await db.prepare(
      'SELECT * FROM content ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all();

    const content: Content[] = result.results as Content[];

    return successResponse(c, content);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function createContent(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body: CreateContentRequest = await c.req.json();
    const {
      title,
      description,
      platform,
      platform_url,
      image_url,
      total_shares = 100,
      share_price = 0.01,
    } = body;

    // Validate required fields
    if (!title || !platform) {
      throw errors.badRequest('Title and platform are required');
    }

    // Validate shares and price
    if (total_shares < 1 || total_shares > 10000) {
      throw errors.badRequest('Total shares must be between 1 and 10,000');
    }

    if (share_price < 0 || share_price > 1000) {
      throw errors.badRequest('Share price must be between 0 and 1,000 gems');
    }

    const db: D1Database = c.env.DB;

    // Note: existing content table uses 'user_id' not 'creator_id'
    const result = await db.prepare(
      `INSERT INTO content 
       (user_id, title, description, platform, platform_url, media_url, share_price, total_shares) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    ).bind(
      userId,
      title,
      description || null,
      platform,
      platform_url || null,
      image_url || null,
      share_price,
      total_shares
    ).first();

    return successResponse(c, result as Content, 201);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function buyShares(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body: BuySharesRequest = await c.req.json();
    const { content_id, shares_count } = body;

    // Validate input
    if (!content_id || !shares_count || shares_count <= 0) {
      throw errors.badRequest('Invalid content_id or shares_count');
    }

    const db: D1Database = c.env.DB;

    // Get content details (existing table uses user_id not creator_id)
    const content = await db.prepare(
      'SELECT id, user_id, title, share_price, total_shares, engagement_shares_total FROM content WHERE id = ?'
    ).bind(content_id).first();

    if (!content) throw errors.notFound('Content');

    // Calculate available shares (total - already sold)
    const availableShares = content.total_shares - (content.engagement_shares_total || 0);
    
    // Check available shares
    if (availableShares < shares_count) {
      throw errors.badRequest(`Only ${availableShares} shares available`);
    }

    // Calculate cost
    const totalCost = content.share_price * shares_count;

    // Check buyer's gem balance
    const balances = await db.prepare(
      'SELECT gems FROM balances WHERE user_id = ?'
    ).bind(userId).first();

    if (!balances || balances.gems < totalCost) {
      throw errors.insufficientFunds('gems');
    }

    // Perform purchase in transaction
    await db.batch([
      // Deduct gems from buyer
      db.prepare('UPDATE balances SET gems = gems - ? WHERE user_id = ?')
        .bind(totalCost, userId),
      // Add gems to creator
      db.prepare('UPDATE balances SET gems = gems + ? WHERE user_id = ?')
        .bind(totalCost, content.user_id),
      // Increase engagement_shares_total
      db.prepare('UPDATE content SET engagement_shares_total = engagement_shares_total + ? WHERE id = ?')
        .bind(shares_count, content_id),
      // Record share purchase
      db.prepare('INSERT INTO content_shares (content_id, buyer_id, shares_count, price_each) VALUES (?, ?, ?, ?)')
        .bind(content_id, userId, shares_count, content.share_price),
      // Log buyer transaction
      db.prepare('INSERT INTO transactions (user_id, transaction_type, currency_type, amount, description) VALUES (?, ?, ?, ?, ?)')
        .bind(userId, 'spend', 'gems', -totalCost, `Bought ${shares_count} shares of "${content.title}"`),
      // Log creator transaction
      db.prepare('INSERT INTO transactions (user_id, transaction_type, currency_type, amount, description) VALUES (?, ?, ?, ?, ?)')
        .bind(content.user_id, 'earn', 'gems', totalCost, `Sold ${shares_count} shares of "${content.title}"`),
    ]);

    return successResponse(c, {
      shares_purchased: shares_count,
      total_cost: totalCost,
      remaining_shares: availableShares - shares_count,
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}
