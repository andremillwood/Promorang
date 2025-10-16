import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { 
  EconomyProfile, 
  Transaction, 
  ConvertCurrencyRequest,
  TIER_MULTIPLIERS,
  CONVERSION_RATES 
} from '../types';
import { errors, AppError, successResponse, errorResponse } from '../middleware/errors';

export async function getEconomyProfile(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const db: D1Database = c.env.DB;

    // Get user info
    const user = await db.prepare(
      'SELECT tier FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) throw errors.notFound('User');

    // Get balances
    const balances = await db.prepare(
      'SELECT points, keys, gems, gold FROM balances WHERE user_id = ?'
    ).bind(userId).first();

    const profile: EconomyProfile = {
      points: balances?.points || 0,
      keys: balances?.keys || 0,
      gems: balances?.gems || 0,
      gold: balances?.gold || 0,
      level: 1, // Default for now
      tier: (user.tier as any) || 'free',
      streak: 0, // Default for now
      multiplier: TIER_MULTIPLIERS[user.tier || 'free'] || 1.0,
    };

    return successResponse(c, profile);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function convertCurrency(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body: ConvertCurrencyRequest = await c.req.json();
    const { from, to, amount } = body;

    // Validate input
    if (!from || !to || !amount || amount <= 0) {
      throw errors.badRequest('Invalid conversion parameters');
    }

    // Only support Points → Keys for now
    if (from !== 'points' || to !== 'keys') {
      throw errors.badRequest('Only Points → Keys conversion is currently supported');
    }

    const db: D1Database = c.env.DB;

    // For now, skip daily limit check (would need to add columns to users table)
    const keysToConvert = Math.floor(amount / CONVERSION_RATES.POINTS_TO_KEYS);
    if (keysToConvert <= 0) {
      throw errors.badRequest(`Minimum ${CONVERSION_RATES.POINTS_TO_KEYS} points required to convert to 1 key`);
    }

    const pointsCost = keysToConvert * CONVERSION_RATES.POINTS_TO_KEYS;

    // Check balance
    const balances = await db.prepare(
      'SELECT points FROM balances WHERE user_id = ?'
    ).bind(userId).first();

    if (!balances || balances.points < pointsCost) {
      throw errors.insufficientFunds('points');
    }

    // Perform conversion in transaction
    await db.batch([
      // Deduct points
      db.prepare('UPDATE balances SET points = points - ? WHERE user_id = ?')
        .bind(pointsCost, userId),
      // Add keys
      db.prepare('UPDATE balances SET keys = keys + ? WHERE user_id = ?')
        .bind(keysToConvert, userId),
      // Log transaction (debit)
      db.prepare('INSERT INTO transactions (user_id, transaction_type, currency_type, amount, description) VALUES (?, ?, ?, ?, ?)')
        .bind(userId, 'convert', 'points', -pointsCost, `Converted to ${keysToConvert} keys`),
      // Log transaction (credit)
      db.prepare('INSERT INTO transactions (user_id, transaction_type, currency_type, amount, description) VALUES (?, ?, ?, ?, ?)')
        .bind(userId, 'convert', 'keys', keysToConvert, `Converted from ${pointsCost} points`),
    ]);

    return successResponse(c, {
      converted: keysToConvert,
      cost: pointsCost,
      remaining_daily: CONVERSION_RATES.DAILY_KEY_LIMIT, // No tracking yet
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getTransactionHistory(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const db: D1Database = c.env.DB;

    const result = await db.prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(userId, limit, offset).all();

    const transactions: Transaction[] = result.results as Transaction[];

    return successResponse(c, transactions);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}
