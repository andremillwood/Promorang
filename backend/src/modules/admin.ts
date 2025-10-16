import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { errors, successResponse, errorResponse } from '../middleware/errors';

export async function moderateContent(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { content_id, action, reason } = body;

    if (!content_id || !action) {
      throw errors.badRequest('content_id and action are required');
    }

    if (!['approve', 'reject', 'flag'].includes(action)) {
      throw errors.badRequest('Invalid action');
    }

    const db: D1Database = c.env.DB;

    // Log admin action
    await db.prepare(
      `INSERT INTO admin_logs (admin_id, action_type, target_id, action_details)
       VALUES (?, ?, ?, ?)`
    ).bind(userId, 'content_moderate', content_id, JSON.stringify({ action, reason })).run();

    // Update content status based on action
    let newStatus = 'active';
    if (action === 'reject') newStatus = 'rejected';
    if (action === 'flag') newStatus = 'flagged';

    await db.prepare(
      'UPDATE content SET status = ? WHERE id = ?'
    ).bind(newStatus, content_id).run();

    return successResponse(c, {
      content_id,
      action,
      new_status: newStatus,
      logged: true
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function approveDrop(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { drop_id, action } = body;

    if (!drop_id || !action) {
      throw errors.badRequest('drop_id and action are required');
    }

    if (!['approve', 'reject'].includes(action)) {
      throw errors.badRequest('Invalid action');
    }

    const db: D1Database = c.env.DB;

    // Update drop application status
    await db.prepare(
      `UPDATE drop_applications SET status = ?
       WHERE drop_id = ? AND status = 'pending'`
    ).bind(action === 'approve' ? 'approved' : 'rejected', drop_id).run();

    // Log admin action
    await db.prepare(
      `INSERT INTO admin_logs (admin_id, action_type, target_id, action_details)
       VALUES (?, ?, ?, ?)`
    ).bind(userId, 'drop_approve', drop_id, JSON.stringify({ action })).run();

    return successResponse(c, {
      drop_id,
      action,
      updated: true
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function auditRewards(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { transaction_id, action, notes } = body;

    if (!transaction_id || !action) {
      throw errors.badRequest('transaction_id and action are required');
    }

    if (!['verify', 'flag', 'reverse'].includes(action)) {
      throw errors.badRequest('Invalid action');
    }

    const db: D1Database = c.env.DB;

    // Log admin action
    await db.prepare(
      `INSERT INTO admin_logs (admin_id, action_type, target_id, action_details)
       VALUES (?, ?, ?, ?)`
    ).bind(userId, 'reward_audit', transaction_id, JSON.stringify({ action, notes })).run();

    // If reversing, create reversal transaction
    if (action === 'reverse') {
      const transaction = await db.prepare(
        'SELECT * FROM transactions WHERE id = ?'
      ).bind(transaction_id).first();

      if (transaction) {
        await db.prepare(
          `INSERT INTO transactions (user_id, transaction_type, currency_type, amount, description)
           VALUES (?, ?, ?, ?, ?)`
        ).bind(
          transaction.user_id,
          'spend',
          transaction.currency_type,
          -transaction.amount,
          `Reward audit reversal: ${notes || 'Admin action'}`
        ).run();
      }
    }

    return successResponse(c, {
      transaction_id,
      action,
      logged: true
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getAdminLogs(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const actionType = c.req.query('type');

    const db: D1Database = c.env.DB;

    let query = `
      SELECT al.*, u.name as admin_name
      FROM admin_logs al
      JOIN users u ON al.admin_id = u.id
    `;

    const binds: any[] = [];

    if (actionType) {
      query += ' WHERE al.action_type = ?';
      binds.push(actionType);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    binds.push(limit, offset);

    const logs = await db.prepare(query).bind(...binds).all();

    return successResponse(c, logs.results);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getAdminDashboard(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const db: D1Database = c.env.DB;

    // Get pending moderations
    const pendingContent = await db.prepare(
      `SELECT COUNT(*) as count FROM content WHERE status = 'pending'`
    ).first();

    const pendingDrops = await db.prepare(
      `SELECT COUNT(*) as count FROM drop_applications WHERE status = 'pending'`
    ).first();

    // Get recent admin actions
    const recentActions = await db.prepare(
      `SELECT al.action_type, COUNT(*) as count
       FROM admin_logs al
       WHERE al.created_at >= datetime('now', '-24 hours')
       GROUP BY al.action_type`
    ).all();

    // Get flagged content
    const flaggedContent = await db.prepare(
      `SELECT COUNT(*) as count FROM content WHERE status = 'flagged'`
    ).first();

    return successResponse(c, {
      pending_moderations: {
        content: pendingContent?.count || 0,
        drops: pendingDrops?.count || 0,
        total: (pendingContent?.count || 0) + (pendingDrops?.count || 0)
      },
      flagged_content: flaggedContent?.count || 0,
      recent_actions: recentActions.results,
      admin_id: userId
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}
