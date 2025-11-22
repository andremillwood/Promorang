import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { successResponse, errorResponse } from '../middleware/errors';

export async function getRegionInfo(c: Context): Promise<Response> {
  try {
    const region = c.req.header('x-region-hint') || 'global';
    const db: D1Database = c.env.DB;

    // Get region-specific metrics
    const regionMetrics = await getRegionMetrics(db, region);

    return successResponse(c, {
      region,
      metrics: regionMetrics,
      available_regions: ['global', 'us', 'caribbean', 'eu', 'asia']
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function migrateUserToRegion(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return errorResponse(c, new Error('Unauthorized'), 401);
    }

    const body = await c.req.json();
    const { target_region } = body;

    if (!target_region || !['us', 'caribbean', 'eu', 'asia'].includes(target_region)) {
      return errorResponse(c, new Error('Invalid target region'), 400);
    }

    const db: D1Database = c.env.DB;

    // Get user data from global table
    const userData = await db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!userData) {
      return errorResponse(c, new Error('User not found'), 404);
    }

    // Get user's balances
    const balances = await db.prepare(
      'SELECT * FROM balances WHERE user_id = ?'
    ).bind(userId).first();

    // Insert into region-specific table
    const regionTable = `users_${target_region}`;

    await db.prepare(
      `INSERT INTO ${regionTable} (id, email, name, picture, tier, level, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         picture = excluded.picture,
         tier = excluded.tier,
         level = excluded.level,
         updated_at = excluded.updated_at`
    ).bind(
      userId,
      userData.email,
      userData.name,
      userData.picture,
      userData.tier,
      userData.level,
      userData.created_at,
      new Date().toISOString()
    ).run();

    // Migrate balances to region-specific table if needed
    if (balances) {
      await db.prepare(
        `INSERT OR REPLACE INTO balances_${target_region} (user_id, points, keys, gems, gold)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        userId,
        balances.points || 0,
        balances.keys || 0,
        balances.gems || 0,
        balances.gold || 0
      ).run();
    }

    return successResponse(c, {
      user_id: userId,
      migrated_to: target_region,
      message: 'User data migrated successfully'
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getRegionLeaderboard(c: Context): Promise<Response> {
  try {
    const region = c.req.query('region') || 'global';
    const limit = parseInt(c.req.query('limit') || '50');

    const db: D1Database = c.env.DB;

    // Get region-specific leaderboard
    let leaderboardQuery = `
      SELECT u.id, u.name, u.picture, u.tier, u.level,
             COALESCE(b.points, 0) as points,
             COALESCE(b.keys, 0) as keys,
             COALESCE(b.gems, 0) as gems,
             COALESCE(b.gold, 0) as gold,
             (COALESCE(b.points, 0) * 0.25 +
              COALESCE(b.gems, 0) * 0.4 +
              COALESCE(b.keys, 0) * 0.15 +
              COALESCE(b.gold, 0) * 0.2) as composite_score
      FROM users u
      LEFT JOIN balances b ON u.id = b.user_id
    `;

    // Add region filter if specified
    if (region !== 'global') {
      leaderboardQuery += ` WHERE u.region = '${region}'`;
    }

    leaderboardQuery += `
      ORDER BY composite_score DESC, u.created_at ASC
      LIMIT ?
    `;

    const leaderboard = await db.prepare(leaderboardQuery).bind(limit).all();

    const rankedLeaderboard = leaderboard.results.map((user: any, index: number) => ({
      rank: index + 1,
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

    return successResponse(c, {
      region,
      leaderboard: rankedLeaderboard,
      total_users: rankedLeaderboard.length
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

// Helper function to get region-specific metrics
async function getRegionMetrics(db: D1Database, region: string) {
  const today = new Date().toISOString().split('T')[0];

  // Get region-specific DAU
  const dauResult = await db.prepare(
    `SELECT COUNT(DISTINCT user_id) as dau
     FROM transactions t
     JOIN users u ON t.user_id = u.id
     WHERE t.created_at >= datetime('now', '-1 day')
     ${region !== 'global' ? `AND u.region = '${region}'` : ''}`
  ).first();

  // Get region-specific total users
  const totalUsersResult = await db.prepare(
    `SELECT COUNT(*) as total FROM users
     ${region !== 'global' ? `WHERE region = '${region}'` : ''}`
  ).first();

  // Get region-specific transactions
  const transactionsResult = await db.prepare(
    `SELECT COUNT(*) as total FROM transactions t
     JOIN users u ON t.user_id = u.id
     ${region !== 'global' ? `WHERE u.region = '${region}'` : ''}`
  ).first();

  return {
    dau: dauResult?.dau || 0,
    total_users: totalUsersResult?.total || 0,
    total_transactions: transactionsResult?.total || 0,
    region: region
  };
}
