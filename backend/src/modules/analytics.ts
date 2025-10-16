import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { successResponse, errorResponse } from '../middleware/errors';

export async function getUserAnalytics(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return errorResponse(c, new Error('Unauthorized'), 401);
    }

    const db: D1Database = c.env.DB;

    // Get user's activity metrics
    const userMetrics = await db.prepare(
      `SELECT
         COUNT(CASE WHEN t.created_at >= datetime('now', '-1 day') THEN 1 END) as transactions_1d,
         COUNT(CASE WHEN t.created_at >= datetime('now', '-7 days') THEN 1 END) as transactions_7d,
         COUNT(CASE WHEN t.created_at >= datetime('now', '-30 days') THEN 1 END) as transactions_30d,
         SUM(CASE WHEN t.transaction_type = 'earn' AND t.created_at >= datetime('now', '-1 day') THEN t.amount ELSE 0 END) as earned_1d,
         SUM(CASE WHEN t.transaction_type = 'spend' AND t.created_at >= datetime('now', '-1 day') THEN t.amount ELSE 0 END) as spent_1d,
         COUNT(CASE WHEN da.submitted_at >= datetime('now', '-1 day') THEN 1 END) as drops_applied_1d,
         COUNT(CASE WHEN da.status = 'approved' AND da.submitted_at >= datetime('now', '-7 days') THEN 1 END) as drops_completed_7d,
         COUNT(CASE WHEN s.started_at >= datetime('now', '-1 day') THEN 1 END) as stakes_1d,
         SUM(CASE WHEN s.amount IS NOT NULL THEN s.amount ELSE 0 END) as total_staked,
         COUNT(CASE WHEN fp.id IS NOT NULL THEN 1 END) as funding_projects_created,
         SUM(CASE WHEN fp.funded_amount IS NOT NULL THEN fp.funded_amount ELSE 0 END) as total_funded
       FROM users u
       LEFT JOIN transactions t ON u.id = t.user_id
       LEFT JOIN drop_applications da ON u.id = da.user_id
       LEFT JOIN stakes s ON u.id = s.user_id
       LEFT JOIN funding_projects fp ON u.id = fp.creator_id
       WHERE u.id = ?`
    ).bind(userId).first();

    // Get user's balance snapshot
    const balances = await db.prepare(
      'SELECT points, keys, gems, gold FROM balances WHERE user_id = ?'
    ).bind(userId).first();

    // Get user's current tier and level
    const userInfo = await db.prepare(
      'SELECT tier, level FROM users WHERE id = ?'
    ).bind(userId).first();

    return successResponse(c, {
      user_id: userId,
      balances: balances || { points: 0, keys: 0, gems: 0, gold: 0 },
      tier: userInfo?.tier || 'free',
      level: userInfo?.level || 1,
      activity: {
        transactions_last_1d: userMetrics?.transactions_1d || 0,
        transactions_last_7d: userMetrics?.transactions_7d || 0,
        transactions_last_30d: userMetrics?.transactions_30d || 0,
        earned_last_1d: userMetrics?.earned_1d || 0,
        spent_last_1d: userMetrics?.spent_1d || 0,
        drops_applied_last_1d: userMetrics?.drops_applied_1d || 0,
        drops_completed_last_7d: userMetrics?.drops_completed_7d || 0,
        stakes_last_1d: userMetrics?.stakes_1d || 0,
        total_staked: userMetrics?.total_staked || 0,
        funding_projects_created: userMetrics?.funding_projects_created || 0,
        total_funded: userMetrics?.total_funded || 0,
      }
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getGlobalAnalytics(c: Context): Promise<Response> {
  try {
    const db: D1Database = c.env.DB;

    // Get today's snapshot or create one
    const today = new Date().toISOString().split('T')[0];

    let snapshot = await db.prepare(
      'SELECT * FROM analytics_snapshots WHERE snapshot_date = ?'
    ).bind(today).first();

    if (!snapshot) {
      // Calculate metrics for today
      const metrics = await calculateGlobalMetrics(db);

      // Insert new snapshot
      await db.prepare(
        `INSERT INTO analytics_snapshots (
          snapshot_date, dau, wau, mau, arpu, total_users, total_transactions,
          total_gems_purchased, total_gems_spent, total_stakes, total_funding_projects,
          task_completion_rate, average_session_duration
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        today,
        metrics.dau,
        metrics.wau,
        metrics.mau,
        metrics.arpu,
        metrics.total_users,
        metrics.total_transactions,
        metrics.total_gems_purchased,
        metrics.total_gems_spent,
        metrics.total_stakes,
        metrics.total_funding_projects,
        metrics.task_completion_rate,
        metrics.average_session_duration
      ).run();

      snapshot = await db.prepare(
        'SELECT * FROM analytics_snapshots WHERE snapshot_date = ?'
      ).bind(today).first();
    }

    // Get historical data for trends (last 30 days)
    const historical = await db.prepare(
      `SELECT snapshot_date, dau, wau, mau, arpu, total_transactions, total_gems_purchased
       FROM analytics_snapshots
       WHERE snapshot_date >= date('now', '-30 days')
       ORDER BY snapshot_date DESC`
    ).all();

    return successResponse(c, {
      today: snapshot,
      historical: historical.results,
      trends: {
        dau_trend: calculateTrend(historical.results.map(r => r.dau)),
        transactions_trend: calculateTrend(historical.results.map(r => r.total_transactions)),
        gems_purchased_trend: calculateTrend(historical.results.map(r => r.total_gems_purchased)),
      }
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

// Helper function to calculate global metrics
async function calculateGlobalMetrics(db: D1Database) {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // DAU: Users with transactions in last 24h
  const dauResult = await db.prepare(
    `SELECT COUNT(DISTINCT user_id) as dau
     FROM transactions
     WHERE created_at >= datetime('now', '-1 day')`
  ).first();

  // WAU: Users with transactions in last 7 days
  const wauResult = await db.prepare(
    `SELECT COUNT(DISTINCT user_id) as wau
     FROM transactions
     WHERE created_at >= datetime('now', '-7 days')`
  ).first();

  // MAU: Users with transactions in last 30 days
  const mauResult = await db.prepare(
    `SELECT COUNT(DISTINCT user_id) as mau
     FROM transactions
     WHERE created_at >= datetime('now', '-30 days')`
  ).first();

  // Total users
  const totalUsersResult = await db.prepare(
    'SELECT COUNT(*) as total FROM users'
  ).first();

  // Total transactions
  const totalTransactionsResult = await db.prepare(
    'SELECT COUNT(*) as total FROM transactions'
  ).first();

  // Gems purchased (from payments table)
  const gemsPurchasedResult = await db.prepare(
    `SELECT SUM(amount) as total
     FROM payments
     WHERE payment_type = 'deposit' AND status = 'completed'`
  ).first();

  // Gems spent (from transactions)
  const gemsSpentResult = await db.prepare(
    `SELECT SUM(ABS(amount)) as total
     FROM transactions
     WHERE currency_type = 'gems' AND amount < 0`
  ).first();

  // Total stakes
  const totalStakesResult = await db.prepare(
    `SELECT COUNT(*) as total, SUM(amount) as total_amount
     FROM stakes
     WHERE status = 'active'`
  ).first();

  // Total funding projects
  const totalFundingResult = await db.prepare(
    `SELECT COUNT(*) as total, SUM(funded_amount) as total_funded
     FROM funding_projects
     WHERE status = 'active'`
  ).first();

  // Task completion rate (drops completed vs applied)
  const taskCompletionResult = await db.prepare(
    `SELECT
       COUNT(CASE WHEN status = 'approved' THEN 1 END) as completed,
       COUNT(*) as total
     FROM drop_applications`
  ).first();

  const taskCompletionRate = taskCompletionResult?.total > 0
    ? (taskCompletionResult.completed / taskCompletionResult.total) * 100
    : 0;

  // ARPU calculation (simplified - total gems purchased / total users)
  const arpu = totalUsersResult?.total > 0
    ? (gemsPurchasedResult?.total || 0) * 0.10 / totalUsersResult.total // Assuming $0.10 per gem
    : 0;

  return {
    dau: dauResult?.dau || 0,
    wau: wauResult?.wau || 0,
    mau: mauResult?.mau || 0,
    arpu: Math.round(arpu * 100) / 100,
    total_users: totalUsersResult?.total || 0,
    total_transactions: totalTransactionsResult?.total || 0,
    total_gems_purchased: gemsPurchasedResult?.total || 0,
    total_gems_spent: gemsSpentResult?.total || 0,
    total_stakes: totalStakesResult?.total || 0,
    total_funding_projects: totalFundingResult?.total || 0,
    task_completion_rate: Math.round(taskCompletionRate * 100) / 100,
    average_session_duration: 300, // Placeholder - would need session tracking
  };
}

// Helper function to calculate trend direction
function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';

  const first = values.slice(0, Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(values.length / 2);
  const second = values.slice(Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(values.length / 2);

  const change = (second - first) / first;

  if (change > 0.05) return 'up';
  if (change < -0.05) return 'down';
  return 'stable';
}
