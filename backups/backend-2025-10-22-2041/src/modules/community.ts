import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { successResponse, errorResponse } from '../middleware/errors';

export async function getCommunityFeed(c: Context): Promise<Response> {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    const activityType = c.req.query('type'); // filter by activity type

    const db: D1Database = c.env.DB;

    let query = `
      SELECT cf.*, u.name as user_name, u.picture as user_picture, u.tier
      FROM community_feed cf
      JOIN users u ON cf.user_id = u.id
    `;

    const binds: any[] = [];

    if (activityType) {
      query += ' WHERE cf.activity_type = ?';
      binds.push(activityType);
    }

    query += ' ORDER BY cf.created_at DESC LIMIT ? OFFSET ?';
    binds.push(limit, offset);

    const feed = await db.prepare(query).bind(...binds).all();

    return successResponse(c, feed.results);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function createCommunityActivity(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return errorResponse(c, new Error('Unauthorized'), 401);
    }

    const body = await c.req.json();
    const { activity_type, activity_data, points_earned = 0, gems_earned = 0 } = body;

    if (!activity_type) {
      return errorResponse(c, new Error('activity_type is required'), 400);
    }

    const db: D1Database = c.env.DB;

    const result = await db.prepare(
      `INSERT INTO community_feed (user_id, activity_type, activity_data, points_earned, gems_earned)
       VALUES (?, ?, ?, ?, ?)
       RETURNING *`
    ).bind(userId, activity_type, JSON.stringify(activity_data || {}), points_earned, gems_earned).first();

    return successResponse(c, result, 201);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getCommunityStats(c: Context): Promise<Response> {
  try {
    const db: D1Database = c.env.DB;

    // Get activity counts by type
    const activityStats = await db.prepare(
      `SELECT activity_type, COUNT(*) as count
       FROM community_feed
       WHERE created_at >= datetime('now', '-7 days')
       GROUP BY activity_type
       ORDER BY count DESC`
    ).all();

    // Get top contributors this week
    const topContributors = await db.prepare(
      `SELECT u.name, u.picture, u.tier,
              SUM(cf.points_earned) as total_points,
              SUM(cf.gems_earned) as total_gems,
              COUNT(*) as activity_count
       FROM community_feed cf
       JOIN users u ON cf.user_id = u.id
       WHERE cf.created_at >= datetime('now', '-7 days')
       GROUP BY cf.user_id, u.name, u.picture, u.tier
       ORDER BY total_points DESC
       LIMIT 10`
    ).all();

    return successResponse(c, {
      activity_stats: activityStats.results,
      top_contributors: topContributors.results,
      total_activities_7d: activityStats.results.reduce((sum, stat) => sum + stat.count, 0)
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}
