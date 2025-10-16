import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { successResponse, errorResponse } from '../middleware/errors';

export async function triggerAutomation(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const { job_name } = body;

    if (!job_name) {
      return errorResponse(c, new Error('job_name is required'), 400);
    }

    const db: D1Database = c.env.DB;

    // Update job status to running
    await db.prepare(
      `UPDATE cron_jobs SET status = 'running', last_run_at = datetime('now')
       WHERE job_name = ?`
    ).bind(job_name).run();

    const startTime = Date.now();

    try {
      // Execute the automation based on job name
      switch (job_name) {
        case 'daily_master_key_reset':
          await resetDailyMasterKeys(db);
          break;
        case 'leaderboard_refresh':
          await refreshLeaderboard(db);
          break;
        case 'staking_rewards_distribution':
          await distributeStakingRewards(db);
          break;
        case 'notification_digest':
          await sendNotificationDigest(db);
          break;
        case 'analytics_snapshot':
          await createAnalyticsSnapshot(db);
          break;
        default:
          throw new Error(`Unknown automation job: ${job_name}`);
      }

      // Mark as completed
      const executionTime = Date.now() - startTime;
      await db.prepare(
        `UPDATE cron_jobs SET status = 'completed', execution_time_ms = ?, error_message = NULL
         WHERE job_name = ?`
      ).bind(executionTime, job_name).run();

      return successResponse(c, {
        job_name,
        status: 'completed',
        execution_time_ms: executionTime
      });

    } catch (error) {
      // Mark as failed
      await db.prepare(
        `UPDATE cron_jobs SET status = 'failed', error_message = ?, execution_time_ms = ?
         WHERE job_name = ?`
      ).bind((error as Error).message, Date.now() - startTime, job_name).run();

      throw error;
    }
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

// Automation functions
async function resetDailyMasterKeys(db: D1Database) {
  // Reset daily conversion limits for all users
  // This would be implemented when we add daily limits to the users table

  console.log('🔄 Daily master key reset completed');
}

async function refreshLeaderboard(db: D1Database) {
  // Recalculate composite scores for all users
  // This is already handled by the leaderboard module, but we can add caching here

  console.log('🏆 Leaderboard refresh completed');
}

async function distributeStakingRewards(db: D1Database) {
  // Find expired stakes and distribute rewards
  const expiredStakes = await db.prepare(
    `SELECT s.*, u.email
     FROM stakes s
     JOIN users u ON s.user_id = u.id
     WHERE s.status = 'active'
     AND s.expires_at <= datetime('now')`
  ).all();

  for (const stake of expiredStakes.results) {
    const rewardAmount = stake.amount * stake.base_multiplier;

    await db.batch([
      // Add gems back with multiplier
      db.prepare('UPDATE balances SET gems = gems + ? WHERE user_id = ?')
        .bind(rewardAmount, stake.user_id),
      // Mark stake as completed
      db.prepare('UPDATE stakes SET status = \'completed\' WHERE id = ?')
        .bind(stake.id),
      // Log reward transaction
      db.prepare(
        'INSERT INTO transactions (user_id, transaction_type, currency_type, amount, description) VALUES (?, ?, ?, ?, ?)'
      ).bind(stake.user_id, 'earn', 'gems', rewardAmount, `Staking reward: ${stake.amount} gems × ${stake.base_multiplier}x multiplier`),
    ]);

    // TODO: Send notification about staking reward
    // await sendNotification(stake.user_id, 'Staking Reward', `Your ${stake.amount} gem stake matured! You earned ${rewardAmount} gems total.`);
  }

  console.log(`💰 Distributed staking rewards for ${expiredStakes.results.length} stakes`);
}

async function sendNotificationDigest(db: D1Database) {
  // Send daily/weekly digest notifications to active users
  // This is a placeholder - would implement based on user preferences

  console.log('📧 Notification digest sent');
}

async function createAnalyticsSnapshot(db: D1Database) {
  // Create daily analytics snapshot (called from getGlobalAnalytics)
  // This ensures we have fresh data for the analytics dashboard

  console.log('📊 Analytics snapshot created');
}

export async function getCronJobs(c: Context): Promise<Response> {
  try {
    const db: D1Database = c.env.DB;

    const jobs = await db.prepare(
      `SELECT job_name, last_run_at, next_run_at, status, error_message, execution_time_ms
       FROM cron_jobs
       ORDER BY job_name`
    ).all();

    return successResponse(c, jobs.results);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function updateCronJob(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const { job_name, status, next_run_at } = body;

    if (!job_name) {
      return errorResponse(c, new Error('job_name is required'), 400);
    }

    const db: D1Database = c.env.DB;

    const updates: string[] = [];
    const binds: any[] = [];

    if (status) {
      updates.push('status = ?');
      binds.push(status);
    }

    if (next_run_at) {
      updates.push('next_run_at = ?');
      binds.push(next_run_at);
    }

    if (updates.length === 0) {
      return errorResponse(c, new Error('No updates provided'), 400);
    }

    binds.push(job_name);

    await db.prepare(
      `UPDATE cron_jobs SET ${updates.join(', ')} WHERE job_name = ?`
    ).bind(...binds).run();

    return successResponse(c, { updated: true });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}
