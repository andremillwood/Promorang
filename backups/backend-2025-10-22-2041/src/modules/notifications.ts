import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { errors, successResponse, errorResponse } from '../middleware/errors';

export async function getNotifications(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const db: D1Database = c.env.DB;

    const result = await db.prepare(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(userId, limit, offset).all();

    return successResponse(c, result.results);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function markNotificationsRead(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { notification_ids } = body;

    if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
      throw errors.badRequest('notification_ids array is required');
    }

    const db: D1Database = c.env.DB;

    // Mark notifications as read
    const placeholders = notification_ids.map(() => '?').join(',');
    await db.prepare(
      `UPDATE notifications SET is_read = 1
       WHERE id IN (${placeholders}) AND user_id = ?`
    ).bind(...notification_ids, userId).run();

    return successResponse(c, { marked_read: notification_ids.length });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function createNotification(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const { user_id, title, message, type = 'info' } = body;

    // Validate input
    if (!user_id || !title || !message) {
      throw errors.badRequest('user_id, title, and message are required');
    }

    if (!['info', 'reward', 'system'].includes(type)) {
      throw errors.badRequest('Invalid notification type');
    }

    const db: D1Database = c.env.DB;

    const result = await db.prepare(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, ?, ?, ?)
       RETURNING *`
    ).bind(user_id, title, message, type).first();

    return successResponse(c, result, 201);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}
