import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { errors, successResponse, errorResponse } from '../middleware/errors';

export async function getRecommendations(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { type = 'content', limit = 10 } = body;

    const db: D1Database = c.env.DB;

    // Get user context for AI recommendations
    const userContext = await db.prepare(
      `SELECT u.tier, u.level, b.points, b.keys, b.gems, b.gold,
              (SELECT JSON_GROUP_ARRAY(activity_type) FROM community_feed WHERE user_id = ? AND created_at >= datetime('now', '-30 days')) as recent_activity
       FROM users u
       LEFT JOIN balances b ON u.id = b.user_id
       WHERE u.id = ?`
    ).bind(userId, userId).first();

    if (!userContext) throw errors.notFound('User not found');

    // Get recommendations from cache or generate new ones
    const recommendations = await getCachedRecommendations(db, userId, type, limit);

    return successResponse(c, {
      recommendations,
      context: {
        tier: userContext.tier,
        level: userContext.level,
        balances: {
          points: userContext.points || 0,
          keys: userContext.keys || 0,
          gems: userContext.gems || 0,
          gold: userContext.gold || 0,
        },
        recent_activity: JSON.parse(userContext.recent_activity || '[]')
      }
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function analyzeContent(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { content_id, analysis_type = 'virality' } = body;

    if (!content_id) throw errors.badRequest('content_id is required');

    const db: D1Database = c.env.DB;

    // Get content for analysis
    const content = await db.prepare(
      `SELECT c.*, u.name as creator_name, u.tier as creator_tier
       FROM content c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`
    ).bind(content_id).first();

    if (!content) throw errors.notFound('Content not found');

    // Generate AI analysis
    const analysis = await generateContentAnalysis(content, analysis_type);

    // Store analysis session
    await db.prepare(
      `INSERT INTO ai_sessions (user_id, session_type, prompt, response, context_data, model_used)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      userId,
      'analysis',
      `Analyze content ${content_id} for ${analysis_type}`,
      JSON.stringify(analysis),
      JSON.stringify({ content_id, analysis_type }),
      'gpt-4'
    ).run();

    return successResponse(c, analysis);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function generateForecast(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { forecast_type = 'user_growth', timeframe = '30d' } = body;

    const db: D1Database = c.env.DB;

    // Generate forecast based on historical data
    const forecast = await generateForecastData(db, forecast_type, timeframe);

    // Store forecast session
    await db.prepare(
      `INSERT INTO ai_sessions (user_id, session_type, prompt, response, context_data, model_used)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      userId,
      'forecast',
      `Generate ${forecast_type} forecast for ${timeframe}`,
      JSON.stringify(forecast),
      JSON.stringify({ forecast_type, timeframe }),
      'gpt-4'
    ).run();

    return successResponse(c, forecast);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getAIInsights(c: Context): Promise<Response> {
  try {
    const db: D1Database = c.env.DB;

    // Get recent AI sessions for insights
    const recentSessions = await db.prepare(
      `SELECT COUNT(*) as total_sessions,
              AVG(accuracy_score) as avg_accuracy,
              model_used,
              COUNT(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 END) as sessions_24h
       FROM ai_sessions
       GROUP BY model_used`
    ).all();

    // Get top performing recommendations
    const topRecommendations = await db.prepare(
      `SELECT content_id, AVG(recommendation_score) as avg_score, COUNT(*) as recommendation_count
       FROM content_recommendations
       WHERE created_at >= datetime('now', '-7 days')
       GROUP BY content_id
       ORDER BY avg_score DESC
       LIMIT 10`
    ).all();

    return successResponse(c, {
      ai_usage: recentSessions.results,
      top_recommendations: topRecommendations.results,
      insights: {
        total_ai_sessions: recentSessions.results.reduce((sum, r) => sum + r.total_sessions, 0),
        average_accuracy: recentSessions.results.length > 0
          ? recentSessions.results.reduce((sum, r) => sum + r.avg_accuracy, 0) / recentSessions.results.length
          : 0,
        recommendations_served: topRecommendations.results.reduce((sum, r) => sum + r.recommendation_count, 0)
      }
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

// Helper functions for AI operations
async function getCachedRecommendations(db: D1Database, userId: string, type: string, limit: number) {
  // Check cache first
  const cached = await db.prepare(
    `SELECT content_id, recommendation_score, recommendation_reason
     FROM content_recommendations
     WHERE user_id = ? AND expires_at > datetime('now')
     ORDER BY recommendation_score DESC
     LIMIT ?`
  ).bind(userId, limit).all();

  if (cached.results.length >= limit) {
    return cached.results;
  }

  // Generate new recommendations using AI
  const recommendations = await generateAIRecommendations(db, userId, type, limit);

  // Cache recommendations
  for (const rec of recommendations) {
    await db.prepare(
      `INSERT INTO content_recommendations (user_id, content_id, recommendation_score, recommendation_reason, ai_model_used, expires_at)
       VALUES (?, ?, ?, ?, ?, datetime('now', '+1 hour'))`
    ).bind(userId, rec.content_id, rec.score, rec.reason, 'gpt-4').run();
  }

  return recommendations;
}

async function generateAIRecommendations(db: D1Database, userId: string, type: string, limit: number) {
  // Get user's preferences and history
  const userHistory = await db.prepare(
    `SELECT c.platform, c.share_price, c.total_shares,
            AVG(CASE WHEN cr.recommendation_score IS NOT NULL THEN cr.recommendation_score ELSE 0 END) as avg_rating
     FROM transactions t
     JOIN content c ON t.description LIKE '%' || c.id || '%'
     LEFT JOIN content_recommendations cr ON c.id = cr.content_id AND cr.user_id = ?
     WHERE t.user_id = ? AND t.transaction_type = 'earn'
     GROUP BY c.platform, c.share_price, c.total_shares
     ORDER BY COUNT(*) DESC
     LIMIT 5`
  ).bind(userId, userId).all();

  // Generate recommendations using AI (simplified for demo)
  const recommendations = [];

  // In production, this would call OpenAI/Anthropic API
  for (let i = 0; i < limit; i++) {
    recommendations.push({
      content_id: `content_${Date.now()}_${i}`,
      score: Math.random() * 0.9 + 0.1,
      reason: `Based on your ${userHistory.results.length > 0 ? 'previous investments' : 'profile'}`
    });
  }

  return recommendations;
}

async function generateContentAnalysis(content: any, analysisType: string) {
  // Generate AI analysis (simplified for demo)
  const analysis = {
    virality_score: Math.random() * 100,
    engagement_potential: Math.random() * 100,
    recommended_actions: [
      'Share on multiple platforms',
      'Add more visual elements',
      'Include call-to-action'
    ],
    predicted_views: Math.floor(Math.random() * 10000) + 1000,
    analysis_type: analysisType,
    generated_at: new Date().toISOString()
  };

  return analysis;
}

async function generateForecastData(db: D1Database, forecastType: string, timeframe: string) {
  // Generate forecast based on historical data (simplified for demo)
  const days = timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 7;

  const forecast = {
    forecast_type: forecastType,
    timeframe: timeframe,
    data_points: [],
    confidence: Math.random() * 0.3 + 0.7,
    generated_at: new Date().toISOString()
  };

  for (let i = 1; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    forecast.data_points.push({
      date: date.toISOString().split('T')[0],
      predicted_value: Math.floor(Math.random() * 1000) + 500,
      confidence_interval: {
        lower: Math.floor(Math.random() * 400) + 300,
        upper: Math.floor(Math.random() * 600) + 700
      }
    });
  }

  return forecast;
}
