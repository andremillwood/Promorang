import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { errors, successResponse, errorResponse } from '../middleware/errors';

export async function stakeGems(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { amount, channel_name } = body;

    // Validate input
    if (!amount || amount <= 0) {
      throw errors.badRequest('Amount must be greater than 0');
    }

    if (!channel_name) {
      throw errors.badRequest('Channel name is required');
    }

    const db: D1Database = c.env.DB;

    // Check balance
    const balances = await db.prepare(
      'SELECT gems FROM balances WHERE user_id = ?'
    ).bind(userId).first();

    if (!balances || balances.gems < amount) {
      throw errors.insufficientFunds('gems');
    }

    // Define channels and multipliers
    const channels = {
      'LowRisk': { lockPeriod: 7, multiplier: 1.2 },
      'MediumRisk': { lockPeriod: 14, multiplier: 1.5 },
      'HighRisk': { lockPeriod: 30, multiplier: 2.0 },
    };

    const channel = channels[channel_name as keyof typeof channels];
    if (!channel) {
      throw errors.badRequest('Invalid channel name');
    }

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + channel.lockPeriod);

    // Create stake
    await db.batch([
      // Deduct gems
      db.prepare('UPDATE balances SET gems = gems - ? WHERE user_id = ?')
        .bind(amount, userId),
      // Create stake record
      db.prepare(
        `INSERT INTO stakes (user_id, channel_name, amount, lock_period_days, base_multiplier, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(userId, channel_name, amount, channel.lockPeriod, channel.multiplier, expiresAt.toISOString()),
      // Log transaction
      db.prepare(
        'INSERT INTO transactions (user_id, transaction_type, currency_type, amount, description) VALUES (?, ?, ?, ?, ?)'
      ).bind(userId, 'spend', 'gems', -amount, `Staked ${amount} gems in ${channel_name} channel`),
    ]);

    return successResponse(c, {
      staked: amount,
      channel: channel_name,
      multiplier: channel.multiplier,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function listFundingProjects(c: Context): Promise<Response> {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const db: D1Database = c.env.DB;

    const result = await db.prepare(
      `SELECT fp.*, u.name as creator_name, u.picture as creator_picture
       FROM funding_projects fp
       JOIN users u ON fp.creator_id = u.id
       WHERE fp.status = 'active'
       AND (fp.ends_at IS NULL OR fp.ends_at > datetime('now'))
       ORDER BY fp.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    return successResponse(c, result.results);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function createFundingProject(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { title, description, funding_goal, duration_days = 30 } = body;

    // Validate input
    if (!title || !funding_goal || funding_goal <= 0) {
      throw errors.badRequest('Title and funding goal are required');
    }

    if (duration_days < 1 || duration_days > 90) {
      throw errors.badRequest('Duration must be between 1 and 90 days');
    }

    const db: D1Database = c.env.DB;

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + duration_days);

    const result = await db.prepare(
      `INSERT INTO funding_projects (creator_id, title, description, funding_goal, duration_days, ends_at)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING *`
    ).bind(userId, title, description || null, funding_goal, duration_days, endsAt.toISOString()).first();

    return successResponse(c, result, 201);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}
