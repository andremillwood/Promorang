import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { successResponse, errorResponse } from '../middleware/errors';

export async function getLeaderboard(c: Context): Promise<Response> {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const db: D1Database = c.env.DB;

    // Calculate composite scores for all users
    // Formula: (points * 0.25) + (gems * 0.4) + (keys * 0.15) + (gold * 0.2)
    const result = await db.prepare(
      `SELECT
         u.id,
         u.name,
         u.picture,
         COALESCE(b.points, 0) as points,
         COALESCE(b.keys, 0) as keys,
         COALESCE(b.gems, 0) as gems,
         COALESCE(b.gold, 0) as gold,
         (COALESCE(b.points, 0) * 0.25 +
          COALESCE(b.gems, 0) * 0.4 +
          COALESCE(b.keys, 0) * 0.15 +
          COALESCE(b.gold, 0) * 0.2) as composite_score,
         u.tier,
         u.level
       FROM users u
       LEFT JOIN balances b ON u.id = b.user_id
       ORDER BY composite_score DESC, u.created_at ASC
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    const leaderboard = result.results.map((user: any, index: number) => ({
      rank: offset + index + 1,
      id: user.id,
      name: user.name,
      picture: user.picture,
      points: user.points,
      keys: user.keys,
      gems: user.gems,
      gold: user.gold,
      composite_score: Math.round(user.composite_score * 100) / 100,
      tier: user.tier,
      level: user.level,
    }));

    return successResponse(c, leaderboard);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getUserRank(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return successResponse(c, { rank: null, total_users: 0 });
    }

    const db: D1Database = c.env.DB;

    // Get user's composite score
    const userResult = await db.prepare(
      `SELECT
         (COALESCE(b.points, 0) * 0.25 +
          COALESCE(b.gems, 0) * 0.4 +
          COALESCE(b.keys, 0) * 0.15 +
          COALESCE(b.gold, 0) * 0.2) as composite_score
       FROM users u
       LEFT JOIN balances b ON u.id = b.user_id
       WHERE u.id = ?`
    ).bind(userId).first();

    if (!userResult) {
      return successResponse(c, { rank: null, total_users: 0 });
    }

    // Count users with higher scores
    const rankResult = await db.prepare(
      `SELECT COUNT(*) as rank
       FROM users u
       LEFT JOIN balances b ON u.id = b.user_id
       WHERE (COALESCE(b.points, 0) * 0.25 +
              COALESCE(b.gems, 0) * 0.4 +
              COALESCE(b.keys, 0) * 0.15 +
              COALESCE(b.gold, 0) * 0.2) > ?`
    ).bind(userResult.composite_score).first();

    // Get total user count
    const totalResult = await db.prepare(
      'SELECT COUNT(*) as total FROM users'
    ).first();

    return successResponse(c, {
      rank: (rankResult?.rank || 0) + 1,
      total_users: totalResult?.total || 0,
      score: Math.round(userResult.composite_score * 100) / 100,
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}
