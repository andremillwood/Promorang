import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { errors, successResponse, errorResponse } from '../middleware/errors';

export async function startAssistantSession(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { initial_message } = body;

    if (!initial_message) {
      throw errors.badRequest('initial_message is required');
    }

    const db: D1Database = c.env.DB;

    // Generate session ID
    const sessionId = `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get user context for AI
    const userContext = await db.prepare(
      `SELECT u.name, u.tier,
              (SELECT JSON_GROUP_ARRAY(activity_type) FROM community_feed WHERE user_id = ? AND created_at >= datetime('now', '-7 days')) as recent_activity
       FROM users u WHERE u.id = ?`
    ).bind(userId, userId).first();

    // Generate AI response
    const aiResponse = await generateAssistantResponse(initial_message, userContext);

    // Store session
    await db.prepare(
      `INSERT INTO assistant_sessions (user_id, session_id, messages, context_memory)
       VALUES (?, ?, ?, ?)`
    ).bind(
      userId,
      sessionId,
      JSON.stringify([
        { role: 'user', content: initial_message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: aiResponse.content, timestamp: new Date().toISOString() }
      ]),
      JSON.stringify({
        user_name: userContext?.name,
        tier: userContext?.tier,
        recent_activity: JSON.parse(userContext?.recent_activity || '[]')
      })
    ).run();

    return successResponse(c, {
      session_id: sessionId,
      message: aiResponse.content,
      suggestions: aiResponse.suggestions || [],
      context_used: aiResponse.context_used
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function continueAssistantSession(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { session_id, message } = body;

    if (!session_id || !message) {
      throw errors.badRequest('session_id and message are required');
    }

    const db: D1Database = c.env.DB;

    // Get existing session
    const session = await db.prepare(
      `SELECT * FROM assistant_sessions WHERE user_id = ? AND session_id = ?`
    ).bind(userId, session_id).first();

    if (!session) {
      throw errors.notFound('Session not found');
    }

    // Update session with new message
    const messages = JSON.parse(session.messages || '[]');
    messages.push({ role: 'user', content: message, timestamp: new Date().toISOString() });

    // Generate AI response
    const context = JSON.parse(session.context_memory || '{}');
    const aiResponse = await generateAssistantResponse(message, context);

    messages.push({ role: 'assistant', content: aiResponse.content, timestamp: new Date().toISOString() });

    // Update session
    await db.prepare(
      `UPDATE assistant_sessions SET messages = ?, updated_at = datetime('now')
       WHERE session_id = ?`
    ).bind(JSON.stringify(messages), session_id).run();

    return successResponse(c, {
      session_id,
      message: aiResponse.content,
      suggestions: aiResponse.suggestions || []
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function getAssistantSessions(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const db: D1Database = c.env.DB;

    const sessions = await db.prepare(
      `SELECT session_id, created_at, updated_at,
              (SELECT COUNT(*) FROM json_each(messages)) as message_count
       FROM assistant_sessions
       WHERE user_id = ?
       ORDER BY updated_at DESC
       LIMIT 20`
    ).bind(userId).all();

    return successResponse(c, sessions.results);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function sendCommunityNotification(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const { message, target_audience = 'all', priority = 'normal' } = body;

    if (!message) {
      throw errors.badRequest('message is required');
    }

    const db: D1Database = c.env.DB;

    // Create notification for all users or specific audience
    const targetUsers = target_audience === 'all'
      ? await db.prepare('SELECT id FROM users').all()
      : await getTargetAudience(db, target_audience);

    const notifications = [];

    for (const user of targetUsers.results) {
      const notification = await db.prepare(
        `INSERT INTO notifications (user_id, title, message, type, is_read)
         VALUES (?, ?, ?, ?, ?)
         RETURNING *`
      ).bind(
        user.id,
        'Community Update',
        message,
        'system',
        false
      ).first();

      notifications.push(notification);
    }

    return successResponse(c, {
      sent_to: notifications.length,
      audience: target_audience,
      priority
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

// Helper functions
async function generateAssistantResponse(message: string, context: any) {
  // Generate AI response based on user context and message
  // In production, this would call OpenAI/Anthropic API

  const responses = {
    staking: {
      content: `Hi ${context.user_name}! Based on your ${context.tier} tier status, I recommend starting with our Low Risk staking channel for steady 1.2x returns. You can stake gems in the Growth Hub section.`,
      suggestions: ['View staking options', 'Check current rates', 'See staking history'],
      context_used: ['user_tier', 'staking_recommendation']
    },
    funding: {
      content: `Hello ${context.user_name}! As a ${context.tier} user, you can create funding projects to get community support. Start with a clear goal and engaging description.`,
      suggestions: ['Create funding project', 'Browse existing projects', 'View funding guidelines'],
      context_used: ['user_tier', 'funding_capabilities']
    },
    leaderboard: {
      content: `Hi ${context.user_name}! Your current ${context.tier} tier gives you a ${context.tier === 'super' ? '2.0x' : context.tier === 'premium' ? '1.5x' : '1.0x'} multiplier on earnings. Keep participating to climb the rankings!`,
      suggestions: ['View leaderboard', 'Check your rank', 'See top performers'],
      context_used: ['user_tier', 'multiplier_info']
    },
    general: {
      content: `Hello ${context.user_name}! I'm your Promorang AI assistant. I can help you with staking, funding projects, checking leaderboards, or any questions about the platform. What would you like to know?`,
      suggestions: ['Help with staking', 'Create funding project', 'Check leaderboard', 'View analytics'],
      context_used: ['user_greeting', 'general_help']
    }
  };

  // Simple keyword matching for demo
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('stake') || lowerMessage.includes('staking')) {
    return responses.staking;
  } else if (lowerMessage.includes('fund') || lowerMessage.includes('project')) {
    return responses.funding;
  } else if (lowerMessage.includes('leaderboard') || lowerMessage.includes('rank')) {
    return responses.leaderboard;
  } else {
    return responses.general;
  }
}

async function getTargetAudience(db: D1Database, audience: string) {
  switch (audience) {
    case 'active_stakers':
      return await db.prepare(
        `SELECT DISTINCT u.id FROM users u
         JOIN stakes s ON u.id = s.user_id
         WHERE s.status = 'active'`
      ).all();

    case 'premium_users':
      return await db.prepare(
        `SELECT id FROM users WHERE tier IN ('premium', 'super')`
      ).all();

    case 'recent_activity':
      return await db.prepare(
        `SELECT DISTINCT u.id FROM users u
         JOIN community_feed cf ON u.id = cf.user_id
         WHERE cf.created_at >= datetime('now', '-7 days')`
      ).all();

    default:
      return await db.prepare('SELECT id FROM users LIMIT 100').all();
  }
}
