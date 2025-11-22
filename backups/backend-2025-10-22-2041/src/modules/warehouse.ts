import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { successResponse, errorResponse } from '../middleware/errors';

export async function exportAnalyticsToWarehouse(c: Context): Promise<Response> {
  try {
    const db: D1Database = c.env.DB;

    // Export daily metrics to warehouse
    const today = new Date().toISOString().split('T')[0];

    // Calculate metrics for today
    const metrics = await calculateWarehouseMetrics(db, today);

    // Insert into warehouse table
    for (const metric of metrics) {
      await db.prepare(
        `INSERT INTO analytics_warehouse (metric_date, metric_type, region, value, metadata)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        metric.date,
        metric.type,
        metric.region,
        metric.value,
        JSON.stringify(metric.metadata || {})
      ).run();
    }

    return successResponse(c, {
      exported: true,
      metrics_count: metrics.length,
      export_date: today
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getWarehouseData(c: Context): Promise<Response> {
  try {
    const db: D1Database = c.env.DB;

    const startDate = c.req.query('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = c.req.query('end_date') || new Date().toISOString().split('T')[0];
    const metricType = c.req.query('metric_type');
    const region = c.req.query('region') || 'global';

    let query = `
      SELECT metric_date, metric_type, region, value, metadata
      FROM analytics_warehouse
      WHERE metric_date BETWEEN ? AND ?
    `;

    const binds: any[] = [startDate, endDate];

    if (metricType) {
      query += ' AND metric_type = ?';
      binds.push(metricType);
    }

    if (region !== 'global') {
      query += ' AND region = ?';
      binds.push(region);
    }

    query += ' ORDER BY metric_date DESC, metric_type';

    const data = await db.prepare(query).bind(...binds).all();

    // Group data by metric type for easier consumption
    const groupedData: { [key: string]: any[] } = {};

    for (const row of data.results) {
      if (!groupedData[row.metric_type]) {
        groupedData[row.metric_type] = [];
      }
      groupedData[row.metric_type].push({
        date: row.metric_date,
        value: row.value,
        region: row.region,
        metadata: JSON.parse(row.metadata || '{}')
      });
    }

    return successResponse(c, {
      data: groupedData,
      period: { start: startDate, end: endDate },
      regions: region !== 'global' ? [region] : ['global', 'us', 'caribbean', 'eu', 'asia']
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getBIInsights(c: Context): Promise<Response> {
  try {
    const db: D1Database = c.env.DB;

    // Get revenue metrics
    const revenueMetrics = await db.prepare(
      `SELECT
         SUM(CASE WHEN metric_type = 'revenue' THEN value END) as total_revenue,
         AVG(CASE WHEN metric_type = 'arpu' THEN value END) as avg_arpu,
         COUNT(DISTINCT CASE WHEN metric_type = 'dau' AND value > 0 THEN metric_date END) as active_days
       FROM analytics_warehouse
       WHERE metric_date >= date('now', '-30 days')`
    ).first();

    // Get growth metrics
    const growthMetrics = await db.prepare(
      `SELECT
         SUM(CASE WHEN metric_type = 'new_users' THEN value END) as new_users_30d,
         SUM(CASE WHEN metric_type = 'dau' THEN value END) as total_dau_30d,
         AVG(CASE WHEN metric_type = 'retention_rate' THEN value END) as avg_retention
       FROM analytics_warehouse
       WHERE metric_date >= date('now', '-30 days')`
    ).first();

    // Get staking metrics
    const stakingMetrics = await db.prepare(
      `SELECT
         SUM(CASE WHEN metric_type = 'staking_volume' THEN value END) as total_staked,
         COUNT(CASE WHEN metric_type = 'staking_events' THEN value END) as staking_events,
         AVG(CASE WHEN metric_type = 'staking_roi' THEN value END) as avg_roi
       FROM analytics_warehouse
       WHERE metric_date >= date('now', '-30 days')`
    ).first();

    return successResponse(c, {
      revenue: {
        total_revenue: revenueMetrics?.total_revenue || 0,
        avg_arpu: revenueMetrics?.avg_arpu || 0,
        active_days: revenueMetrics?.active_days || 0
      },
      growth: {
        new_users_30d: growthMetrics?.new_users_30d || 0,
        total_dau_30d: growthMetrics?.total_dau_30d || 0,
        avg_retention: growthMetrics?.avg_retention || 0
      },
      staking: {
        total_staked: stakingMetrics?.total_staked || 0,
        staking_events: stakingMetrics?.staking_events || 0,
        avg_roi: stakingMetrics?.avg_roi || 0
      }
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

// Helper function to calculate warehouse metrics
async function calculateWarehouseMetrics(db: D1Database, date: string) {
  const metrics = [];

  // DAU for each region
  const regions = ['global', 'us', 'caribbean', 'eu', 'asia'];

  for (const region of regions) {
    const dauResult = await db.prepare(
      `SELECT COUNT(DISTINCT user_id) as dau
       FROM transactions t
       ${region !== 'global' ? `JOIN users_${region} u ON t.user_id = u.id` : ''}
       WHERE t.created_at >= date(?) AND t.created_at < date(?, '+1 day')
       ${region !== 'global' ? `AND u.region = '${region}'` : ''}`
    ).bind(date, date).first();

    metrics.push({
      date,
      type: 'dau',
      region,
      value: dauResult?.dau || 0,
      metadata: { calculated_at: new Date().toISOString() }
    });
  }

  // Transactions count
  const transactionsResult = await db.prepare(
    `SELECT COUNT(*) as total FROM transactions
     WHERE created_at >= date(?) AND created_at < date(?, '+1 day')`
  ).bind(date, date).first();

  metrics.push({
    date,
    type: 'transactions',
    region: 'global',
    value: transactionsResult?.total || 0,
    metadata: { calculated_at: new Date().toISOString() }
  });

  // Revenue (from payments)
  const revenueResult = await db.prepare(
    `SELECT SUM(amount) as revenue FROM payments
     WHERE payment_type = 'deposit' AND status = 'completed'
     AND created_at >= date(?) AND created_at < date(?, '+1 day')`
  ).bind(date, date).first();

  metrics.push({
    date,
    type: 'revenue',
    region: 'global',
    value: revenueResult?.revenue || 0,
    metadata: { calculated_at: new Date().toISOString() }
  });

  // ARPU calculation
  const arpuResult = await db.prepare(
    `SELECT
       SUM(p.amount) / COUNT(DISTINCT t.user_id) as arpu
     FROM payments p
     JOIN transactions t ON p.user_id = t.user_id
     WHERE p.payment_type = 'deposit' AND p.status = 'completed'
     AND p.created_at >= date(?) AND p.created_at < date(?, '+1 day')
     AND t.created_at >= date(?) AND t.created_at < date(?, '+1 day')`
  ).bind(date, date, date, date).first();

  metrics.push({
    date,
    type: 'arpu',
    region: 'global',
    value: arpuResult?.arpu || 0,
    metadata: { calculated_at: new Date().toISOString() }
  });

  return metrics;
}
