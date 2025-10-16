import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { Drop, DropApplication, ApplyToDropRequest } from '../types';
import { errors, successResponse, errorResponse } from '../middleware/errors';

export async function listDrops(c: Context): Promise<Response> {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    const status = c.req.query('status') || 'active';

    const db: D1Database = c.env.DB;

    const result = await db.prepare(
      `SELECT * FROM drops 
       WHERE status = ? 
       AND (deadline_at IS NULL OR deadline_at > datetime('now'))
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`
    ).bind(status, limit, offset).all();

    const drops: Drop[] = result.results as Drop[];

    return successResponse(c, drops);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function applyToDrop(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const dropId = parseInt(c.req.param('id'));
    if (!dropId) throw errors.badRequest('Invalid drop ID');

    const body: ApplyToDropRequest = await c.req.json().catch(() => ({}));
    const { submission_url } = body;

    const db: D1Database = c.env.DB;

    // Check if drop exists and is active
    const drop = await db.prepare(
      'SELECT * FROM drops WHERE id = ?'
    ).bind(dropId).first();

    if (!drop) throw errors.notFound('Drop');

    if (drop.status !== 'active') {
      throw errors.badRequest('Drop is not active');
    }

    // Check deadline
    if (drop.deadline_at && new Date(drop.deadline_at) < new Date()) {
      throw errors.badRequest('Drop deadline has passed');
    }

    // Check if user already applied (unique index will catch this, but we can check first)
    const existing = await db.prepare(
      'SELECT id FROM drop_applications WHERE drop_id = ? AND user_id = ?'
    ).bind(dropId, userId).first();

    if (existing) {
      throw errors.conflict('You have already applied to this drop');
    }

    // Check max participants
    if (drop.max_participants) {
      const count = await db.prepare(
        'SELECT COUNT(*) as count FROM drop_applications WHERE drop_id = ?'
      ).bind(dropId).first();

      if (count && count.count >= drop.max_participants) {
        throw errors.badRequest('Drop has reached maximum participants');
      }
    }

    // Create application
    const result = await db.prepare(
      `INSERT INTO drop_applications (drop_id, user_id, submission_url, status) 
       VALUES (?, ?, ?, 'pending')
       RETURNING *`
    ).bind(dropId, userId, submission_url || null).first();

    return successResponse(c, result as DropApplication, 201);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getUserApplications(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const db: D1Database = c.env.DB;

    const result = await db.prepare(
      `SELECT 
         da.*,
         d.title as drop_title,
         d.description as drop_description,
         d.drop_type,
         d.reward_points,
         d.reward_keys,
         d.reward_gems,
         d.deadline_at
       FROM drop_applications da
       JOIN drops d ON da.drop_id = d.id
       WHERE da.user_id = ?
       ORDER BY da.submitted_at DESC`
    ).bind(userId).all();

    return successResponse(c, result.results);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}
