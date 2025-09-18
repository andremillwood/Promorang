import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { 
  getCurrentUser,
  MOCHA_SESSION_TOKEN_COOKIE_NAME
} from '@getmocha/users-service/backend';

type Env = {
  DB: any;
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
};

const currency = new Hono<{ Bindings: Env }>();

// Helper function to get or create user in database
async function getOrCreateUser(mochaUser: any, db: any) {
  try {
    // First try to find existing user
    const existingUser = await db.prepare(
      'SELECT * FROM users WHERE mocha_user_id = ?'
    ).bind(mochaUser.id).first();

    if (existingUser) {
      return existingUser;
    }

    // Create new user if doesn't exist
    const baseUsername = mochaUser.email ? mochaUser.email.split('@')[0] : `user${Date.now()}`;
    const username = baseUsername;
    const displayName = mochaUser.google_user_data?.name || mochaUser.google_user_data?.given_name || username;
    const referralCode = `${username.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4) || 'USER'}${Math.floor(Math.random() * 9000) + 1000}`;

    const result = await db.prepare(`
      INSERT INTO users (
        mocha_user_id, email, username, display_name, bio, avatar_url,
        xp_points, level, referral_code, points_balance, keys_balance, 
        gems_balance, gold_collected, user_tier, points_streak_days,
        last_activity_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      mochaUser.id,
      mochaUser.email || '',
      username,
      displayName,
      'Welcome to Promorang!',
      mochaUser.google_user_data?.picture || null,
      100, // Starting XP
      1,   // Starting level
      referralCode,
      25,  // Starting points
      1,   // Starting keys
      0,   // Starting gems
      0,   // Starting gold
      'free',
      0,   // Streak days
      new Date().toISOString().split('T')[0],
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    // Return the newly created user
    const newUser = await db.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(result.meta.last_row_id).first();
    
    return newUser;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
}

// Convert currency endpoint
currency.post('/convert', async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    
    if (!sessionToken) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    if (!mochaUser) {
      return c.json({ error: 'Authentication failed' }, 401);
    }

    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ error: 'Failed to get user data' }, 500);
    }

    const { from_currency, to_currency, amount } = await c.req.json();

    if (!from_currency || !to_currency || !amount || amount < 1) {
      return c.json({ error: 'Invalid conversion data' }, 400);
    }

    // Define conversion rates
    const conversionRates: { [key: string]: { [key: string]: number } } = {
      points: { keys: 500 }, // 500 points = 1 key
      gems: { keys: 2 },     // 2 gems = 1 key
    };

    if (!conversionRates[from_currency] || !conversionRates[from_currency][to_currency]) {
      return c.json({ error: 'Invalid conversion path' }, 400);
    }

    const rate = conversionRates[from_currency][to_currency];
    const requiredAmount = amount * rate;

    // Check if user has enough balance
    const currentBalance = from_currency === 'points' ? (user.points_balance || 0) : (user.gems_balance || 0);
    
    if (currentBalance < requiredAmount) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }

    // Check daily limit for points conversion
    if (from_currency === 'points') {
      const today = new Date().toISOString().split('T')[0];
      const todayConversions = await c.env.DB.prepare(
        'SELECT SUM(to_amount) as total FROM currency_conversions WHERE user_id = ? AND from_currency = ? AND DATE(created_at) = ?'
      ).bind(user.id, 'points', today).first();

      const todayTotal = (todayConversions?.total || 0) + amount;
      if (todayTotal > 3) {
        return c.json({ error: 'Daily limit of 3 keys from points exceeded' }, 400);
      }
    }

    // Perform the conversion
    const updateField = from_currency === 'points' ? 'points_balance' : 'gems_balance';
    
    // Update user balances
    await c.env.DB.prepare(`
      UPDATE users SET 
        ${updateField} = ${updateField} - ?,
        keys_balance = keys_balance + ?,
        updated_at = ?
      WHERE id = ?
    `).bind(requiredAmount, amount, new Date().toISOString(), user.id).run();

    // Record the conversion
    await c.env.DB.prepare(`
      INSERT INTO currency_conversions (
        user_id, from_currency, to_currency, from_amount, to_amount, conversion_rate, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      from_currency,
      to_currency,
      requiredAmount,
      amount,
      rate,
      new Date().toISOString()
    ).run();

    // Create transaction record
    await c.env.DB.prepare(`
      INSERT INTO transactions (
        user_id, transaction_type, amount, currency_type, status, 
        description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      'currency_conversion',
      amount,
      'KEYS',
      'completed',
      `Converted ${requiredAmount} ${from_currency} to ${amount} keys`,
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    return c.json({
      success: true,
      converted: {
        from_amount: requiredAmount,
        from_currency,
        to_amount: amount,
        to_currency
      }
    });

  } catch (error) {
    console.error('Error converting currency:', error);
    return c.json({ error: 'Failed to convert currency' }, 500);
  }
});

export default currency;
