// Achievement processing utilities for the backend

interface Env {
  DB: any; // D1Database
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria_type: string;
  criteria_value: number;
  criteria_field: string;
  gold_reward: number;
  xp_reward: number;
}

// Calculate achievement progress for a user
export async function calculateAchievementProgress(
  userId: number, 
  achievement: Achievement, 
  env: Env
): Promise<number> {
  const { criteria_type, criteria_field } = achievement;
  
  switch (criteria_type) {
    case 'count':
      // Count records in a specific table/field
      if (criteria_field === 'points_transactions') {
        const result = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM points_transactions WHERE user_id = ?"
        ).bind(userId).first();
        return (result as any)?.count || 0;
      }
      if (criteria_field === 'drop_applications') {
        const result = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM drop_applications WHERE user_id = ? AND status = 'completed'"
        ).bind(userId).first();
        return (result as any)?.count || 0;
      }
      if (criteria_field === 'content_pieces') {
        const result = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM content_pieces WHERE creator_id = ?"
        ).bind(userId).first();
        return (result as any)?.count || 0;
      }
      break;
      
    case 'total':
      // Check current value of a field
      if (['points_balance', 'keys_balance', 'gems_balance', 'gold_collected', 'level', 'points_streak_days'].includes(criteria_field)) {
        const result = await env.DB.prepare(
          `SELECT ${criteria_field} as value FROM users WHERE id = ?`
        ).bind(userId).first();
        return (result as any)?.value || 0;
      }
      break;
  }
  
  return 0;
}

// Check and award achievements for a user (simplified to avoid compound SELECT issues)
export async function checkAndAwardAchievements(_userId: number, _env: Env) {
  // For now, return empty array to avoid compound SELECT issues
  // This function can be re-enabled with proper batching in the future
  return [];
}
