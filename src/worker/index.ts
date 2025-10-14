import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { 
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  deleteSession,
  getCurrentUser,
  MOCHA_SESSION_TOKEN_COOKIE_NAME
} from '@getmocha/users-service/backend';
import { getCookie, setCookie } from 'hono/cookie';
import { CreateContentRequestSchema, CreateDropRequestSchema } from '@/shared/types';
import payments from './payments';
import currency from './currency';
import { handleImageUpload } from './image-upload';


type Env = {
  DB: any; // D1 Database
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

// Add CORS middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Mount payments and currency routes
app.route('/api/payments', payments);
app.route('/api/users', currency);

// Health check endpoint
app.get('/', (c) => c.text('Hello from Promorang!'));

// Helper function to get or create user in database
async function getOrCreateUser(mochaUser: any, db: any) {
  console.log('Getting or creating user for Mocha user:', { 
    id: mochaUser.id, 
    email: mochaUser.email,
    hasGoogleData: !!mochaUser.google_user_data
  });
  
  try {
    // First try to find existing user
    const existingUser = await db.prepare(
      'SELECT * FROM users WHERE mocha_user_id = ?'
    ).bind(mochaUser.id).first();

    if (existingUser) {
      console.log('Found existing user:', {
        id: existingUser.id,
        email: existingUser.email,
        gems_balance: existingUser.gems_balance
      });
      return existingUser;
    }

    console.log('No existing user found, creating new user...');

    // Create new user with unique username
    const baseUsername = mochaUser.email ? mochaUser.email.split('@')[0] : `user${Date.now()}`;
    let username = baseUsername;
    let usernameAttempts = 0;
    
    // Ensure unique username
    while (usernameAttempts < 10) {
      try {
        const existingUsername = await db.prepare(
          'SELECT id FROM users WHERE username = ?'
        ).bind(username).first();
        
        if (!existingUsername) {
          break; // Username is unique
        }
        
        usernameAttempts++;
        username = `${baseUsername}${usernameAttempts}`;
      } catch (usernameError) {
        console.error('Error checking username uniqueness:', usernameError);
        username = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
        break;
      }
    }
    
    const displayName = mochaUser.google_user_data?.name || mochaUser.google_user_data?.given_name || username;
    
    // Generate unique referral code
    let referralCode = `${username.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4) || 'USER'}${Math.floor(Math.random() * 9000) + 1000}`;
    
    console.log('Creating new user with data:', {
      mocha_user_id: mochaUser.id,
      email: mochaUser.email,
      username: username,
      display_name: displayName,
      referral_code: referralCode
    });

    try {
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

      console.log('User creation result:', {
        success: result.success,
        lastRowId: result.meta.last_row_id,
        changes: result.meta.changes
      });

      if (!result.success || !result.meta.last_row_id) {
        throw new Error('Failed to insert user - no row ID returned');
      }

      // Return the newly created user
      const newUser = await db.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(result.meta.last_row_id).first();
      
      if (!newUser) {
        throw new Error('Failed to retrieve newly created user');
      }
      
      console.log('New user created successfully:', {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        gems_balance: newUser.gems_balance
      });
      
      return newUser;
    } catch (insertError) {
      console.error('Error inserting new user:', insertError);
      
      // Try to find if user was created despite error
      const existingAfterError = await db.prepare(
        'SELECT * FROM users WHERE mocha_user_id = ?'
      ).bind(mochaUser.id).first();
      
      if (existingAfterError) {
        console.log('Found user after insert error, returning existing user');
        return existingAfterError;
      }
      
      throw insertError;
    }
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    throw error;
  }
}

// Get OAuth redirect URL
app.get('/api/oauth/google/redirect_url', async (c) => {
  try {
    const redirectUrl = await getOAuthRedirectUrl('google', {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    return c.json({ redirectUrl }, 200);
  } catch (error) {
    return c.json({ error: 'Failed to get redirect URL' }, 500);
  }
});

// Exchange code for session token
app.post('/api/sessions', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.code) {
      return c.json({ error: 'No authorization code provided' }, 400);
    }

    // Check if environment variables are available
    if (!c.env.MOCHA_USERS_SERVICE_API_URL || !c.env.MOCHA_USERS_SERVICE_API_KEY) {
      return c.json({ error: 'Service configuration error' }, 500);
    }

    let sessionToken;
    try {
      sessionToken = await exchangeCodeForSessionToken(body.code, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
      });
    } catch (exchangeError) {
      return c.json({ 
        error: 'Authentication failed', 
        details: exchangeError instanceof Error ? exchangeError.message : 'Token exchange failed'
      }, 500);
    }

    if (!sessionToken) {
      return c.json({ error: 'Failed to obtain session token' }, 500);
    }

    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });

    // Also verify the session token works by getting the user
    try {
      const user = await getCurrentUser(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
      });

      if (!user) {
        return c.json({ error: 'Session token verification failed' }, 500);
      }

      // Create or update user in our database
      try {
        const dbUser = await getOrCreateUser(user, c.env.DB);
        console.log('User created/updated in database:', dbUser?.id);
      } catch (dbError) {
        console.error('Database user creation failed:', dbError);
        // Continue even if database fails - don't block authentication
      }

      return c.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          name: user.google_user_data?.name || user.google_user_data?.given_name
        }
      }, 200);
    } catch (verificationError) {
      return c.json({ 
        error: 'Session verification failed', 
        details: verificationError instanceof Error ? verificationError.message : 'Unknown error'
      }, 500);
    }
  } catch (error) {
    return c.json({ 
      error: 'Authentication failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Standard AuthProvider endpoint - /api/users/me  
app.get('/api/users/me', async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    
    if (!sessionToken) {
      return c.json(null);
    }

    // Check if environment variables are available
    if (!c.env.MOCHA_USERS_SERVICE_API_URL || !c.env.MOCHA_USERS_SERVICE_API_KEY) {
      return c.json(null);
    }

    try {
      const mochaUser = await getCurrentUser(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
      });

      if (!mochaUser) {
        return c.json(null);
      }

      // Return the Mocha user object for AuthProvider compatibility
      return c.json(mochaUser);
    } catch (userError) {
      return c.json(null);
    }
  } catch (error) {
    return c.json(null);
  }
});

// Enhanced database user endpoint with better error handling
app.get('/api/app/users/me', async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    
    console.log('=== /api/app/users/me Debug ===');
    console.log('Session token exists:', !!sessionToken);
    console.log('Session token value:', sessionToken ? `${sessionToken.substring(0, 10)}...` : 'null');
    console.log('Environment check:', {
      hasApiUrl: !!c.env.MOCHA_USERS_SERVICE_API_URL,
      hasApiKey: !!c.env.MOCHA_USERS_SERVICE_API_KEY,
      hasDB: !!c.env.DB
    });
    
    if (!sessionToken) {
      console.log('No session token, returning null');
      return c.json(null);
    }

    if (!c.env.MOCHA_USERS_SERVICE_API_URL || !c.env.MOCHA_USERS_SERVICE_API_KEY) {
      console.error('Missing Mocha service configuration');
      return c.json({ error: 'Service configuration missing' }, 500);
    }

    try {
      console.log('Attempting to get current user from Mocha service...');
      const mochaUser = await getCurrentUser(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
      });

      console.log('Mocha user result:', mochaUser ? { 
        id: mochaUser.id, 
        email: mochaUser.email,
        hasGoogleData: !!mochaUser.google_user_data 
      } : 'null');

      if (!mochaUser) {
        console.log('No Mocha user found, returning null');
        return c.json(null);
      }

      console.log('Getting or creating user in database...');
      
      // Try to get existing user first
      let user = await c.env.DB.prepare(
        'SELECT * FROM users WHERE mocha_user_id = ?'
      ).bind(mochaUser.id).first();
      
      if (user) {
        console.log('Found existing database user:', { id: user.id, email: user.email });
        return c.json(user);
      }
      
      console.log('No existing user found, creating new user...');
      // Create new user if doesn't exist
      user = await getOrCreateUser(mochaUser, c.env.DB);
      
      console.log('Database user result:', user ? { 
        id: user.id, 
        email: user.email, 
        gems_balance: user.gems_balance,
        points_balance: user.points_balance,
        keys_balance: user.keys_balance
      } : 'null');
      
      if (!user) {
        console.error('Failed to create or retrieve user');
        return c.json({ error: 'Failed to create user' }, 500);
      }
      
      return c.json(user);
    } catch (authError) {
      console.error('Auth error in /api/app/users/me:', authError);
      console.error('Auth error stack:', authError instanceof Error ? authError.stack : 'No stack');
      return c.json({ error: 'Authentication failed' }, 500);
    }
  } catch (error) {
    console.error('General error in /api/app/users/me:', error);
    console.error('General error stack:', error instanceof Error ? error.stack : 'No stack');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

  // Upload image endpoint
  app.post('/api/images/upload', async (c) => {
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

      const formData = await c.req.formData();
      const result = await handleImageUpload(formData, c.env, mochaUser.id);
      
      return c.json(result);
    } catch (error) {
      console.error('Image upload error:', error);
      return c.json({ 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }, 400);
    }
  });

  // Update user brand profile
  app.put('/api/users/brand-profile', async (c) => {
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

      const body = await c.req.json();
      const { brand_name, brand_logo_url, brand_description, brand_website, brand_email, brand_phone } = body;

      // Validate required fields
      if (!brand_name?.trim()) {
        return c.json({ error: 'Brand name is required' }, 400);
      }

      // Update user record with brand information
      await c.env.DB.prepare(`
        UPDATE users 
        SET brand_name = ?, brand_logo_url = ?, brand_description = ?, 
            brand_website = ?, brand_email = ?, brand_phone = ?, updated_at = CURRENT_TIMESTAMP
        WHERE mocha_user_id = ?
      `).bind(
        brand_name.trim(),
        brand_logo_url || null,
        brand_description?.trim() || null,
        brand_website?.trim() || null,
        brand_email?.trim() || null,
        brand_phone?.trim() || null,
        mochaUser.id
      ).run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Error updating brand profile:', error);
      return c.json({ error: 'Failed to update brand profile' }, 500);
    }
  });

// Update user profile
app.put('/api/users/profile', async (c) => {
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

    const body = await c.req.json();
    const { username, display_name, bio, avatar_url, banner_url, website_url, social_links } = body;

    // Validate username if provided
    if (username !== undefined) {
      if (username && username.length < 3) {
        return c.json({ error: 'Username must be at least 3 characters long' }, 400);
      }
      
      if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
        return c.json({ error: 'Username can only contain letters, numbers, and underscores' }, 400);
      }

      // Check if username is already taken (if it's different from current)
      if (username && username !== user.username) {
        const existingUser = await c.env.DB.prepare(
          'SELECT id FROM users WHERE username = ? AND id != ?'
        ).bind(username, user.id).first();
        
        if (existingUser) {
          return c.json({ error: 'Username is already taken' }, 400);
        }
      }
    }

    // Validate bio length
    if (bio && bio.length > 500) {
      return c.json({ error: 'Bio must be less than 500 characters' }, 400);
    }

    // Validate website URL
    if (website_url && website_url.trim()) {
      try {
        new URL(website_url);
      } catch {
        return c.json({ error: 'Please enter a valid website URL' }, 400);
      }
    }

    // Validate social links JSON if provided
    if (social_links && social_links.trim()) {
      try {
        const parsed = JSON.parse(social_links);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Invalid format');
        }
      } catch {
        return c.json({ error: 'Social links must be valid JSON format' }, 400);
      }
    }

    // Update user profile
    await c.env.DB.prepare(`
      UPDATE users 
      SET username = ?, display_name = ?, bio = ?, avatar_url = ?, 
          banner_url = ?, website_url = ?, social_links = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      username !== undefined ? (username || null) : user.username,
      display_name !== undefined ? (display_name || null) : user.display_name,
      bio !== undefined ? (bio || null) : user.bio,
      avatar_url !== undefined ? (avatar_url || null) : user.avatar_url,
      banner_url !== undefined ? (banner_url || null) : user.banner_url,
      website_url !== undefined ? (website_url || null) : user.website_url,
      social_links !== undefined ? (social_links || null) : user.social_links,
      new Date().toISOString(),
      user.id
    ).run();

    // Return updated user data
    const updatedUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(user.id).first();

    return c.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Check username availability
app.get('/api/users/check-username/:username', async (c) => {
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

    const username = c.req.param('username');
    
    if (!username || username.length < 3) {
      return c.json({ available: false, reason: 'Username must be at least 3 characters long' });
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return c.json({ available: false, reason: 'Username can only contain letters, numbers, and underscores' });
    }

    // Check if it's the current user's username
    if (username === user.username) {
      return c.json({ available: true, reason: 'This is your current username' });
    }

    // Check if username is taken
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).bind(username).first();
    
    if (existingUser) {
      return c.json({ available: false, reason: 'Username is already taken' });
    }

    return c.json({ available: true });
  } catch (error) {
    console.error('Error checking username:', error);
    return c.json({ error: 'Failed to check username availability' }, 500);
  }
});

// Become advertiser endpoint
app.post('/api/users/become-advertiser', async (c) => {
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

    // Get or create user in our database first
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    
    if (!user) {
      return c.json({ error: 'Failed to get user data' }, 500);
    }

    // Update user type to advertiser
    await c.env.DB.prepare(
      'UPDATE users SET user_type = ?, updated_at = ? WHERE id = ?'
    ).bind(
      'advertiser',
      new Date().toISOString(),
      user.id
    ).run();

    // Create initial advertiser inventory for this month (sample allocation)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Check if monthly inventory already exists
    const existingMonthly = await c.env.DB.prepare(
      'SELECT id FROM advertiser_inventory WHERE advertiser_id = ? AND period_type = ? AND period_start = ?'
    ).bind(user.id, 'monthly', monthStart).first();

    if (!existingMonthly) {
      await c.env.DB.prepare(`
        INSERT INTO advertiser_inventory (
          advertiser_id, period_type, period_start, period_end,
          moves_allocated, proof_drops_allocated, paid_drops_allocated,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        'monthly',
        monthStart,
        monthEnd,
        50,  // Free tier gets 50 moves per month
        5,   // Free tier gets 5 proof drops per month
        0,   // Free tier gets no paid drops
        new Date().toISOString(),
        new Date().toISOString()
      ).run();
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error becoming advertiser:', error);
    return c.json({ error: 'Failed to become advertiser' }, 500);
  }
});

// Logout endpoint - support both GET and POST
app.get('/api/logout', async (c) => {
  return handleLogout(c);
});

app.post('/api/logout', async (c) => {
  return handleLogout(c);
});

async function handleLogout(c: any) {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

    if (sessionToken) {
      try {
        await deleteSession(sessionToken, {
          apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
          apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
        });
      } catch (sessionError) {
        // Continue with cookie deletion even if session deletion fails
      }
    }

    // Delete cookie by setting max age to 0
    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: true,
      maxAge: 0,
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json({ error: 'Logout failed' }, 500);
  }
}

// Create drops endpoint
app.post('/api/drops', async (c) => {
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

    // Check if user is an advertiser
    if (user.user_type !== 'advertiser') {
      return c.json({ error: 'Only advertisers can create drops' }, 403);
    }

    const body = await c.req.json();
    
    // Validate the request data
    const validationResult = CreateDropRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({ 
        error: 'Invalid drop data',
        details: validationResult.error.errors
      }, 400);
    }

    const dropData = validationResult.data;

    // Check advertiser inventory
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    const inventory = await c.env.DB.prepare(`
      SELECT * FROM advertiser_inventory 
      WHERE advertiser_id = ? AND period_type = 'monthly' AND period_start = ?
    `).bind(user.id, monthStart).first();

    if (!inventory) {
      return c.json({ error: 'No advertiser inventory found for this month' }, 400);
    }

    // Check if they have enough allocation
    if (dropData.is_proof_drop) {
      if (inventory.proof_drops_used >= inventory.proof_drops_allocated) {
        return c.json({ error: 'You have used all your proof drops for this month' }, 400);
      }
    } else if (dropData.is_paid_drop) {
      if (inventory.paid_drops_used >= inventory.paid_drops_allocated) {
        return c.json({ error: 'You have used all your paid drops for this month' }, 400);
      }
    }

    // Set gem pool remaining to total initially
    const gemPoolRemaining = dropData.gem_pool_total || 0;

    // Insert drop into database
    const result = await c.env.DB.prepare(`
      INSERT INTO drops (
        creator_id, title, description, drop_type, difficulty, key_cost, 
        gem_reward_base, gem_pool_total, gem_pool_remaining, reward_logic,
        follower_threshold, time_commitment, requirements, deliverables, 
        deadline_at, max_participants, platform, content_url, move_cost_points,
        key_reward_amount, is_proof_drop, is_paid_drop, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      dropData.title,
      dropData.description,
      dropData.drop_type,
      dropData.difficulty,
      dropData.key_cost,
      dropData.gem_reward_base,
      dropData.gem_pool_total || 0,
      gemPoolRemaining,
      dropData.reward_logic || null,
      dropData.follower_threshold,
      dropData.time_commitment || null,
      dropData.requirements || null,
      dropData.deliverables || null,
      dropData.deadline_at || null,
      dropData.max_participants || null,
      dropData.platform || null,
      dropData.content_url || null,
      dropData.move_cost_points,
      dropData.key_reward_amount,
      dropData.is_proof_drop,
      dropData.is_paid_drop,
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    // Update advertiser inventory
    if (dropData.is_proof_drop) {
      await c.env.DB.prepare(
        'UPDATE advertiser_inventory SET proof_drops_used = proof_drops_used + 1, updated_at = ? WHERE id = ?'
      ).bind(new Date().toISOString(), inventory.id).run();
    } else if (dropData.is_paid_drop) {
      await c.env.DB.prepare(
        'UPDATE advertiser_inventory SET paid_drops_used = paid_drops_used + 1, updated_at = ? WHERE id = ?'
      ).bind(new Date().toISOString(), inventory.id).run();
    }

    // Get the created drop with creator info
    const newDrop = await c.env.DB.prepare(`
      SELECT d.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.id = ?
    `).bind(result.meta.last_row_id).first();

    return c.json({ 
      success: true, 
      drop: newDrop,
      dropId: result.meta.last_row_id
    }, 201);

  } catch (error) {
    console.error('Error creating drop:', error);
    return c.json({ error: 'Failed to create drop' }, 500);
  }
});

// Get drops endpoint (for home feed)
app.get('/api/drops', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const result = await c.env.DB.prepare(`
      SELECT d.*, 
             u.username as creator_name, 
             u.avatar_url as creator_avatar,
             u.brand_name,
             u.brand_logo_url,
             COALESCE(u.brand_name, u.display_name, u.username) as display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as display_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.status = 'active'
      ORDER BY d.created_at DESC
      LIMIT ?
    `).bind(limit).all();

    const drops = result.results || [];
    return c.json(drops);
  } catch (error) {
    return c.json({ error: 'Failed to fetch drops' }, 500);
  }
});

// Get specific drop by ID
app.get('/api/drops/:id', async (c) => {
  try {
    const dropId = parseInt(c.req.param('id'));
    
    if (isNaN(dropId)) {
      return c.json({ error: 'Invalid drop ID' }, 400);
    }

    const drop = await c.env.DB.prepare(`
      SELECT d.*, 
             u.username as creator_name,
             u.display_name as creator_display_name,
             u.avatar_url as creator_avatar,
             u.brand_name,
             u.brand_logo_url,
             COALESCE(u.brand_name, u.display_name, u.username) as display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as display_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.id = ?
    `).bind(dropId).first();

    if (!drop) {
      return c.json({ error: 'Drop not found' }, 404);
    }

    return c.json(drop);
  } catch (error) {
    console.error('Failed to fetch drop:', error);
    return c.json({ error: 'Failed to fetch drop' }, 500);
  }
});

// Update drop endpoint
app.put('/api/drops/:id', async (c) => {
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

    const dropId = parseInt(c.req.param('id'));
    
    if (isNaN(dropId)) {
      return c.json({ error: 'Invalid drop ID' }, 400);
    }

    // Check if drop exists and user owns it
    const existingDrop = await c.env.DB.prepare(
      'SELECT * FROM drops WHERE id = ? AND creator_id = ?'
    ).bind(dropId, user.id).first();

    if (!existingDrop) {
      return c.json({ error: 'Drop not found or you do not have permission to edit it' }, 404);
    }

    const body = await c.req.json();
    
    // Validate the update data
    const validationResult = CreateDropRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({ 
        error: 'Invalid drop data',
        details: validationResult.error.errors
      }, 400);
    }

    const dropData = validationResult.data;

    // Update drop in database
    await c.env.DB.prepare(`
      UPDATE drops SET
        title = ?, description = ?, drop_type = ?, difficulty = ?, 
        key_cost = ?, gem_reward_base = ?, gem_pool_total = ?, 
        follower_threshold = ?, time_commitment = ?, requirements = ?, 
        deliverables = ?, deadline_at = ?, max_participants = ?, 
        platform = ?, content_url = ?, move_cost_points = ?, 
        key_reward_amount = ?, updated_at = ?
      WHERE id = ? AND creator_id = ?
    `).bind(
      dropData.title,
      dropData.description,
      dropData.drop_type,
      dropData.difficulty,
      dropData.key_cost,
      dropData.gem_reward_base,
      dropData.gem_pool_total || 0,
      dropData.follower_threshold,
      dropData.time_commitment || null,
      dropData.requirements || null,
      dropData.deliverables || null,
      dropData.deadline_at || null,
      dropData.max_participants || null,
      dropData.platform || null,
      dropData.content_url || null,
      dropData.move_cost_points,
      dropData.key_reward_amount,
      new Date().toISOString(),
      dropId,
      user.id
    ).run();

    // Get the updated drop with creator info
    const updatedDrop = await c.env.DB.prepare(`
      SELECT d.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.id = ?
    `).bind(dropId).first();

    return c.json({ 
      success: true, 
      drop: updatedDrop
    });

  } catch (error) {
    console.error('Error updating drop:', error);
    return c.json({ error: 'Failed to update drop' }, 500);
  }
});

// Delete drop endpoint
app.delete('/api/drops/:id', async (c) => {
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

    const dropId = parseInt(c.req.param('id'));
    
    if (isNaN(dropId)) {
      return c.json({ error: 'Invalid drop ID' }, 400);
    }

    // Check if drop exists and user owns it
    const existingDrop = await c.env.DB.prepare(
      'SELECT * FROM drops WHERE id = ? AND creator_id = ?'
    ).bind(dropId, user.id).first();

    if (!existingDrop) {
      return c.json({ error: 'Drop not found or you do not have permission to delete it' }, 404);
    }

    // Check if there are active applications
    const hasApplications = await c.env.DB.prepare(
      'SELECT id FROM drop_applications WHERE drop_id = ? AND status IN (?, ?) LIMIT 1'
    ).bind(dropId, 'pending', 'approved').first();

    if (hasApplications) {
      return c.json({ 
        error: 'Cannot delete drop with active applications. Please complete or reject all applications first.' 
      }, 400);
    }

    // Delete related records first
    await c.env.DB.prepare('DELETE FROM drop_applications WHERE drop_id = ?').bind(dropId).run();
    
    // Delete the drop
    await c.env.DB.prepare('DELETE FROM drops WHERE id = ? AND creator_id = ?').bind(dropId, user.id).run();

    return c.json({ success: true });

  } catch (error) {
    console.error('Error deleting drop:', error);
    return c.json({ error: 'Failed to delete drop' }, 500);
  }
});

// Get all content endpoint
app.get('/api/content', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT cp.*, 
             u.username as creator_name, 
             u.avatar_url as creator_avatar,
             u.brand_name,
             u.brand_logo_url,
             COALESCE(u.brand_name, u.display_name, u.username) as display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as display_avatar
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      ORDER BY cp.created_at DESC
      LIMIT 50
    `).all();

    // D1 returns results in .results property for .all() queries
    const content = result.results || [];
    
    return c.json(content);
  } catch (error) {
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// Get sponsored content endpoint
app.get('/api/content/sponsored', async (c) => {
  try {
    // Get content with active sponsorships (unexpired)
    const result = await c.env.DB.prepare(`
      SELECT cp.*, 
             u.username as creator_name, 
             u.avatar_url as creator_avatar,
             u.brand_name as creator_brand_name,
             u.brand_logo_url as creator_brand_logo,
             COALESCE(u.brand_name, u.display_name, u.username) as creator_display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as creator_display_avatar,
             GROUP_CONCAT(sc.boost_multiplier) as boost_multipliers,
             GROUP_CONCAT(sc.gems_allocated) as gems_allocated_list,
             GROUP_CONCAT(COALESCE(u2.brand_name, u2.display_name, u2.username, 'Advertiser')) as sponsor_names,
             GROUP_CONCAT(COALESCE(u2.brand_logo_url, u2.avatar_url)) as sponsor_logos,
             SUM(sc.boost_multiplier) as total_boost_multiplier,
             SUM(sc.gems_allocated) as total_gems_allocated,
             COUNT(sc.id) as sponsor_count,
             MIN(sc.expires_at) as earliest_expiry
      FROM content_pieces cp
      JOIN sponsored_content sc ON cp.id = sc.content_id
      JOIN users u ON cp.creator_id = u.id
      LEFT JOIN users u2 ON sc.advertiser_id = u2.id
      WHERE sc.status = 'active' AND sc.expires_at > datetime('now')
      GROUP BY cp.id
      ORDER BY total_boost_multiplier DESC, sponsor_count DESC, sc.created_at DESC
      LIMIT 20
    `).bind().all();

    const sponsoredContent = result.results || [];
    
    return c.json(sponsoredContent);
  } catch (error) {
    console.error('Error fetching sponsored content:', error);
    return c.json([], 500);
  }
});

// Fund content endpoint
app.post('/api/content/:id/fund', async (c) => {
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

    const contentId = c.req.param('id');
    const { amount, currency_type } = await c.req.json();

    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid funding amount' }, 400);
    }

    // Convert amount to USD if needed
    let usdAmount = amount;
    if (currency_type === 'Points') {
      usdAmount = amount / 1000; // 1000 points = $1 USD
    }

    // Get current content
    const content = await c.env.DB.prepare(
      'SELECT * FROM content_pieces WHERE id = ?'
    ).bind(contentId).first();

    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    // Record the funding
    await c.env.DB.prepare(`
      INSERT INTO content_funding (creator_id, content_id, funding_amount, currency_type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user.id,
      contentId,
      usdAmount,
      'USD',
      new Date().toISOString()
    ).run();

    // Update content revenue
    const newRevenue = content.current_revenue + usdAmount;
    const newSharePrice = content.total_shares > 0 ? newRevenue / content.total_shares : 0;

    await c.env.DB.prepare(
      'UPDATE content_pieces SET current_revenue = ?, share_price = ?, updated_at = ? WHERE id = ?'
    ).bind(newRevenue, newSharePrice, new Date().toISOString(), contentId).run();

    // Deduct from user balance based on currency type
    if (currency_type === 'Points') {
      await c.env.DB.prepare(
        'UPDATE users SET points_balance = points_balance - ?, updated_at = ? WHERE id = ?'
      ).bind(amount, new Date().toISOString(), user.id).run();
    } else if (currency_type === 'Gems') {
      await c.env.DB.prepare(
        'UPDATE users SET gems_balance = gems_balance - ?, updated_at = ? WHERE id = ?'
      ).bind(amount, new Date().toISOString(), user.id).run();
    }

    return c.json({
      success: true,
      new_revenue: newRevenue,
      new_share_price: newSharePrice
    });

  } catch (error) {
    console.error('Error funding content:', error);
    return c.json({ error: 'Failed to fund content' }, 500);
  }
});

// Tip content endpoint
app.post('/api/content/:id/tip', async (c) => {
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

    const contentId = c.req.param('id');
    const { amount, currency_type } = await c.req.json();

    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid tip amount' }, 400);
    }

    // Convert amount to USD if needed
    let usdAmount = amount;
    if (currency_type === 'Points') {
      usdAmount = amount / 1000; // 1000 points = $1 USD
    }

    // Get current content
    const content = await c.env.DB.prepare(
      'SELECT * FROM content_pieces WHERE id = ?'
    ).bind(contentId).first();

    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    // Record the tip
    await c.env.DB.prepare(`
      INSERT INTO content_tips (tipper_id, content_id, tip_amount, currency_type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user.id,
      contentId,
      usdAmount,
      'USD',
      new Date().toISOString()
    ).run();

    // Update content revenue (tips contribute to content value)
    const newRevenue = content.current_revenue + usdAmount;
    const newSharePrice = content.total_shares > 0 ? newRevenue / content.total_shares : 0;

    await c.env.DB.prepare(
      'UPDATE content_pieces SET current_revenue = ?, share_price = ?, updated_at = ? WHERE id = ?'
    ).bind(newRevenue, newSharePrice, new Date().toISOString(), contentId).run();

    // Deduct from user balance based on currency type
    if (currency_type === 'Points') {
      await c.env.DB.prepare(
        'UPDATE users SET points_balance = points_balance - ?, updated_at = ? WHERE id = ?'
      ).bind(amount, new Date().toISOString(), user.id).run();
    } else if (currency_type === 'Gems') {
      await c.env.DB.prepare(
        'UPDATE users SET gems_balance = gems_balance - ?, updated_at = ? WHERE id = ?'
      ).bind(amount, new Date().toISOString(), user.id).run();
    }

    return c.json({
      success: true,
      new_revenue: newRevenue,
      new_share_price: newSharePrice
    });

  } catch (error) {
    console.error('Error tipping content:', error);
    return c.json({ error: 'Failed to tip content' }, 500);
  }
});

// Get individual content endpoint
app.get('/api/content/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const content = await c.env.DB.prepare(`
      SELECT cp.*, 
             u.username as creator_name, 
             u.avatar_url as creator_avatar,
             u.brand_name,
             u.brand_logo_url,
             COALESCE(u.brand_name, u.display_name, u.username) as display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as display_avatar
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      WHERE cp.id = ?
    `).bind(id).first();

    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    return c.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// Get content sponsorship data
app.get('/api/content/:id/sponsorship', async (c) => {
  try {
    const contentId = c.req.param('id');
    
    // Get all active sponsorships for this content
    const sponsorships = await c.env.DB.prepare(`
      SELECT sc.*, 
             u.display_name as advertiser_name, 
             u.username as advertiser_username,
             u.brand_name as advertiser_brand_name,
             u.brand_logo_url as advertiser_brand_logo,
             COALESCE(u.brand_name, u.display_name, u.username) as advertiser_display_name,
             COALESCE(u.brand_logo_url, u.avatar_url) as advertiser_display_logo
      FROM sponsored_content sc
      JOIN users u ON sc.advertiser_id = u.id
      WHERE sc.content_id = ? AND sc.status = 'active' AND sc.expires_at > datetime('now')
      ORDER BY sc.boost_multiplier DESC, sc.created_at ASC
    `).bind(contentId).all();

    if (!sponsorships || sponsorships.results.length === 0) {
      return c.json(null);
    }

    // Calculate total boost multiplier (additive for multiple sponsors)
    const totalBoostMultiplier = sponsorships.results.reduce((sum: number, s: any) => sum + s.boost_multiplier, 0);
    const totalGemsAllocated = sponsorships.results.reduce((sum: number, s: any) => sum + s.gems_allocated, 0);
    
    // Get sponsor names (prioritize brand names)
    const sponsorNames = sponsorships.results.map((s: any) => s.advertiser_display_name || 'Advertiser');
    const sponsorLogos = sponsorships.results.map((s: any) => s.advertiser_display_logo);

    return c.json({
      sponsors: sponsorships.results,
      sponsor_names: sponsorNames,
      sponsor_logos: sponsorLogos,
      total_boost_multiplier: totalBoostMultiplier,
      total_gems_allocated: totalGemsAllocated,
      sponsor_count: sponsorships.results.length,
      primary_sponsor: sponsorNames[0], // Highest boost or earliest sponsor
      primary_sponsor_logo: sponsorLogos[0],
      boost_multiplier: totalBoostMultiplier, // For backward compatibility
      gems_allocated: totalGemsAllocated, // For backward compatibility
      advertiser_name: sponsorNames[0] // For backward compatibility
    });

  } catch (error) {
    console.error('Error fetching sponsorship data:', error);
    return c.json({ error: 'Failed to fetch sponsorship data' }, 500);
  }
});

// Create content sponsorship
app.post('/api/content/:id/sponsor', async (c) => {
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

    // Check if user is an advertiser
    if (user.user_type !== 'advertiser') {
      return c.json({ error: 'Only advertisers can sponsor content' }, 403);
    }

    const contentId = c.req.param('id');
    const { gems_allocated, boost_multiplier, duration_hours } = await c.req.json();

    if (!gems_allocated || !boost_multiplier || !duration_hours || gems_allocated <= 0 || boost_multiplier < 1 || duration_hours <= 0) {
      return c.json({ error: 'Invalid sponsorship parameters' }, 400);
    }

    // Check if user has enough gems
    if (user.gems_balance < gems_allocated) {
      return c.json({ error: 'Insufficient gems' }, 400);
    }

    // Check if content exists
    const content = await c.env.DB.prepare(
      'SELECT * FROM content_pieces WHERE id = ?'
    ).bind(contentId).first();

    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    // Prevent self-sponsoring
    if (content.creator_id === user.id) {
      return c.json({ error: 'Cannot sponsor your own content' }, 400);
    }

    // Check for active sponsorship by this user (allow multiple sponsors, but not duplicate by same user)
    const existingSponsorship = await c.env.DB.prepare(
      'SELECT * FROM sponsored_content WHERE advertiser_id = ? AND content_id = ? AND status = "active" AND expires_at > datetime("now")'
    ).bind(user.id, contentId).first();

    if (existingSponsorship) {
      return c.json({ error: 'You already have an active sponsorship for this content' }, 400);
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + duration_hours);

    // Deduct gems from advertiser
    await c.env.DB.prepare(
      'UPDATE users SET gems_balance = gems_balance - ?, updated_at = ? WHERE id = ?'
    ).bind(gems_allocated, new Date().toISOString(), user.id).run();

    // Create sponsorship record
    await c.env.DB.prepare(`
      INSERT INTO sponsored_content (
        advertiser_id, content_id, gems_allocated, boost_multiplier, status, 
        expires_at, duration_hours, advertiser_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      contentId,
      gems_allocated,
      boost_multiplier,
      'active',
      expiresAt.toISOString(),
      duration_hours,
      user.brand_name || user.display_name || user.username || 'Advertiser',
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    return c.json({ success: true });

  } catch (error) {
    console.error('Error creating content sponsorship:', error);
    return c.json({ error: 'Failed to create sponsorship' }, 500);
  }
});

// Get content engagement metrics endpoint
app.get('/api/content/:id/metrics', async (c) => {
  try {
    const contentId = c.req.param('id');
    
    // Get engagement counts from various sources
    const [likes, comments, shares, moves, externalMoves] = await Promise.all([
      // Count likes from points_transactions table
      c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM points_transactions WHERE action_type = ? AND reference_id = ? AND reference_type = ?'
      ).bind('like', contentId, 'content').first(),
      
      // Count comments from points_transactions table
      c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM points_transactions WHERE action_type = ? AND reference_id = ? AND reference_type = ?'
      ).bind('comment', contentId, 'content').first(),
      
      // Count shares from content_shares table
      c.env.DB.prepare(
        'SELECT COUNT(*) as count, COALESCE(SUM(verified_shares), 0) as total_shares FROM content_shares WHERE content_id = ?'
      ).bind(contentId).first(),
      
      // Count internal moves
      c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM move_transactions WHERE content_id = ?'
      ).bind(contentId).first(),
      
      // Count external moves
      c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM external_moves WHERE content_id = ?'
      ).bind(contentId).first()
    ]);

    // Calculate total engagement and views estimate
    const totalEngagement = (likes?.count || 0) + (comments?.count || 0) + (shares?.count || 0);
    const estimatedViews = Math.max(totalEngagement * 50, totalEngagement + 100); // Conservative estimate

    return c.json({
      likes: likes?.count || 0,
      comments: comments?.count || 0,
      shares: shares?.total_shares || 0,
      views: estimatedViews,
      internal_moves: moves?.count || 0,
      external_moves: externalMoves?.count || 0,
      total_engagement: totalEngagement
    });
  } catch (error) {
    console.error('Error fetching content metrics:', error);
    return c.json({ error: 'Failed to fetch metrics' }, 500);
  }
});

// Record social action endpoint
app.post('/api/users/social-action', async (c) => {
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

    const { action_type, reference_id, reference_type } = await c.req.json();

    if (!action_type || !reference_id || !reference_type) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Handle like actions - check if already liked
    if (action_type === 'like' && reference_type === 'content') {
      const existingLike = await c.env.DB.prepare(
        'SELECT id FROM user_content_likes WHERE user_id = ? AND content_id = ?'
      ).bind(user.id, reference_id).first();

      if (existingLike) {
        return c.json({ error: 'Content already liked' }, 400);
      }

      // Record the like
      await c.env.DB.prepare(`
        INSERT INTO user_content_likes (user_id, content_id, created_at)
        VALUES (?, ?, ?)
      `).bind(user.id, reference_id, new Date().toISOString()).run();
    }

    // Handle save actions
    if (action_type === 'save' && reference_type === 'content') {
      const existingSave = await c.env.DB.prepare(
        'SELECT id FROM user_saved_content WHERE user_id = ? AND content_id = ?'
      ).bind(user.id, reference_id).first();

      if (existingSave) {
        return c.json({ error: 'Content already saved' }, 400);
      }

      // Record the save
      await c.env.DB.prepare(`
        INSERT INTO user_saved_content (user_id, content_id, created_at)
        VALUES (?, ?, ?)
      `).bind(user.id, reference_id, new Date().toISOString()).run();
    }

    // Calculate points based on action and user tier
    const basePoints = {
      like: 0.1,
      comment: 0.3,
      save: 0.5,
      share: 1.0
    };

    const tierMultipliers = {
      free: 1.0,
      premium: 1.5,
      super: 2.0
    };

    const base = basePoints[action_type as keyof typeof basePoints] || 0.1;
    const multiplier = tierMultipliers[user.user_tier as keyof typeof tierMultipliers] || 1.0;
    const pointsEarned = Math.floor(base * multiplier * 10) / 10;

    // Record the points transaction
    await c.env.DB.prepare(`
      INSERT INTO points_transactions (
        user_id, action_type, points_earned, reference_id, reference_type,
        base_points, multiplier, user_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      action_type,
      pointsEarned,
      reference_id,
      reference_type,
      base,
      multiplier,
      user.user_tier,
      new Date().toISOString()
    ).run();

    // Update user's points balance
    await c.env.DB.prepare(
      'UPDATE users SET points_balance = points_balance + ?, updated_at = ? WHERE id = ?'
    ).bind(pointsEarned, new Date().toISOString(), user.id).run();

    // For share actions, also record in content_shares table
    if (action_type === 'share' && reference_type === 'content') {
      await c.env.DB.prepare(`
        INSERT INTO content_shares (user_id, content_id, platform, verified_shares, points_earned, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        reference_id,
        'internal', // internal share
        1,
        pointsEarned,
        new Date().toISOString()
      ).run();
    }

    // Check if user should get engagement shares
    if (reference_type === 'content') {
      const content = await c.env.DB.prepare(
        'SELECT engagement_shares_remaining FROM content_pieces WHERE id = ?'
      ).bind(reference_id).first();

      if (content && content.engagement_shares_remaining > 0) {
        // Award 1 engagement share for significant actions (comment, share)
        if (action_type === 'comment' || action_type === 'share') {
          // Check if user already got an engagement share for this content
          const existingShare = await c.env.DB.prepare(
            'SELECT id FROM user_engagement_shares WHERE user_id = ? AND content_id = ?'
          ).bind(user.id, reference_id).first();

          if (!existingShare) {
            // Award engagement share
            await c.env.DB.prepare(`
              INSERT INTO user_engagement_shares (user_id, content_id, shares_count, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?)
            `).bind(
              user.id,
              reference_id,
              1,
              new Date().toISOString(),
              new Date().toISOString()
            ).run();

            // Decrease engagement shares remaining
            await c.env.DB.prepare(
              'UPDATE content_pieces SET engagement_shares_remaining = engagement_shares_remaining - 1, updated_at = ? WHERE id = ?'
            ).bind(new Date().toISOString(), reference_id).run();
          }
        }
      }
    }

    return c.json({
      success: true,
      points_earned: pointsEarned,
      multiplier: multiplier,
      base_points: base
    });

  } catch (error) {
    console.error('Error recording social action:', error);
    return c.json({ error: 'Failed to record action' }, 500);
  }
});

// Record external move endpoint  
app.post('/api/users/external-move', async (c) => {
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

    const { move_type, content_id, content_platform, content_url, proof_url, proof_type } = await c.req.json();

    if (!move_type || !proof_url) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Calculate points for external moves (10x internal moves)
    const basePoints = {
      like: 10,
      comment: 30,
      save: 50,
      share: 100,
      repost: 120
    };

    const tierMultipliers = {
      free: 1.0,
      premium: 1.5,
      super: 2.0
    };

    const base = basePoints[move_type as keyof typeof basePoints] || 10;
    const multiplier = tierMultipliers[user.user_tier as keyof typeof tierMultipliers] || 1.0;
    const pointsEarned = Math.floor(base * multiplier);
    const keysEarned = Math.ceil(pointsEarned / 20); // 1 key per 20 points

    // Record the external move
    await c.env.DB.prepare(`
      INSERT INTO external_moves (
        user_id, move_type, content_id, content_platform, content_url,
        proof_url, proof_type, points_earned, keys_earned, verification_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      move_type,
      content_id || null,
      content_platform || null,
      content_url || null,
      proof_url,
      proof_type,
      pointsEarned,
      keysEarned,
      'verified', // Auto-verify for now
      new Date().toISOString()
    ).run();

    // Update user balances
    await c.env.DB.prepare(
      'UPDATE users SET points_balance = points_balance + ?, keys_balance = keys_balance + ?, updated_at = ? WHERE id = ?'
    ).bind(pointsEarned, keysEarned, new Date().toISOString(), user.id).run();

    return c.json({
      success: true,
      points_earned: pointsEarned,
      keys_earned: keysEarned,
      multiplier: multiplier
    });

  } catch (error) {
    console.error('Error recording external move:', error);
    return c.json({ error: 'Failed to record external move' }, 500);
  }
});

// Record content share endpoint
app.post('/api/users/share-content', async (c) => {
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

    const { content_id, platform, share_url } = await c.req.json();

    if (!content_id || !platform || !share_url) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Calculate points (10x base internal share)
    const basePoints = 10;
    const tierMultipliers = {
      free: 1.0,
      premium: 1.5,
      super: 2.0
    };

    const multiplier = tierMultipliers[user.user_tier as keyof typeof tierMultipliers] || 1.0;
    const pointsEarned = Math.floor(basePoints * multiplier);

    // Record the share
    await c.env.DB.prepare(`
      INSERT INTO content_shares (user_id, content_id, platform, share_url, verified_shares, points_earned, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      content_id,
      platform,
      share_url,
      1,
      pointsEarned,
      new Date().toISOString()
    ).run();

    // Update user's points balance
    await c.env.DB.prepare(
      'UPDATE users SET points_balance = points_balance + ?, updated_at = ? WHERE id = ?'
    ).bind(pointsEarned, new Date().toISOString(), user.id).run();

    return c.json({
      success: true,
      points_earned: pointsEarned,
      multiplier: multiplier
    });

  } catch (error) {
    console.error('Error recording content share:', error);
    return c.json({ error: 'Failed to record share' }, 500);
  }
});

// Buy shares endpoint
app.post('/api/content/buy-shares', async (c) => {
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

    const { content_id, shares_count } = await c.req.json();

    if (!content_id || !shares_count || shares_count < 1) {
      return c.json({ error: 'Invalid purchase data' }, 400);
    }

    // Get content details
    const content = await c.env.DB.prepare(
      'SELECT * FROM content_pieces WHERE id = ?'
    ).bind(content_id).first();

    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    if (content.available_shares < shares_count) {
      return c.json({ error: 'Not enough shares available' }, 400);
    }

    const totalCost = shares_count * content.share_price;

    // Get user's USD wallet (placeholder - in production you'd check actual balance)
    // For now, we'll assume they can afford it and create the investment record

    // Create investment record
    await c.env.DB.prepare(`
      INSERT INTO content_investments (
        content_id, investor_id, shares_owned, purchase_price, 
        purchase_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      content_id,
      user.id,
      shares_count,
      totalCost,
      new Date().toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    // Update content available shares
    await c.env.DB.prepare(
      'UPDATE content_pieces SET available_shares = available_shares - ?, updated_at = ? WHERE id = ?'
    ).bind(shares_count, new Date().toISOString(), content_id).run();

    return c.json({ success: true });

  } catch (error) {
    console.error('Error buying shares:', error);
    return c.json({ error: 'Failed to purchase shares' }, 500);
  }
});

// Update content endpoint
app.put('/api/content/:id', async (c) => {
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

    const contentId = c.req.param('id');
    
    // Check if content exists and user owns it
    const existingContent = await c.env.DB.prepare(
      'SELECT * FROM content_pieces WHERE id = ? AND creator_id = ?'
    ).bind(contentId, user.id).first();

    if (!existingContent) {
      return c.json({ error: 'Content not found or you do not have permission to edit it' }, 404);
    }

    const body = await c.req.json();
    
    // Validate the update data
    const validationResult = CreateContentRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({ 
        error: 'Invalid content data',
        details: validationResult.error.errors
      }, 400);
    }

    const contentData = validationResult.data;

    // Calculate engagement shares (50% of total shares)
    const engagementShares = Math.floor(contentData.total_shares * 0.5);
    const availableShares = contentData.total_shares - engagementShares;

    // Update content in database
    await c.env.DB.prepare(`
      UPDATE content_pieces SET
        platform = ?, platform_url = ?, title = ?, description = ?, 
        media_url = ?, total_shares = ?, available_shares = ?, 
        engagement_shares_total = ?, share_price = ?, updated_at = ?
      WHERE id = ? AND creator_id = ?
    `).bind(
      contentData.platform,
      contentData.platform_url,
      contentData.title,
      contentData.description || '',
      contentData.media_url || '',
      contentData.total_shares,
      availableShares,
      engagementShares,
      contentData.share_price,
      new Date().toISOString(),
      contentId,
      user.id
    ).run();

    // Get the updated content with creator info
    const updatedContent = await c.env.DB.prepare(`
      SELECT cp.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      WHERE cp.id = ?
    `).bind(contentId).first();

    return c.json({ 
      success: true, 
      content: updatedContent
    });

  } catch (error) {
    console.error('Error updating content:', error);
    return c.json({ error: 'Failed to update content' }, 500);
  }
});

// Delete content endpoint
app.delete('/api/content/:id', async (c) => {
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

    const contentId = c.req.param('id');
    
    // Check if content exists and user owns it
    const existingContent = await c.env.DB.prepare(
      'SELECT * FROM content_pieces WHERE id = ? AND creator_id = ?'
    ).bind(contentId, user.id).first();

    if (!existingContent) {
      return c.json({ error: 'Content not found or you do not have permission to delete it' }, 404);
    }

    // Check if there are any active investments or dependencies
    const hasInvestments = await c.env.DB.prepare(
      'SELECT id FROM content_investments WHERE content_id = ? LIMIT 1'
    ).bind(contentId).first();

    const hasShares = await c.env.DB.prepare(
      'SELECT id FROM content_shares WHERE content_id = ? LIMIT 1'
    ).bind(contentId).first();

    if (hasInvestments || hasShares) {
      return c.json({ 
        error: 'Cannot delete content with active investments or shares. Contact support if needed.' 
      }, 400);
    }

    // Delete related records first (to avoid foreign key issues)
    await c.env.DB.prepare('DELETE FROM content_tips WHERE content_id = ?').bind(contentId).run();
    await c.env.DB.prepare('DELETE FROM content_funding WHERE content_id = ?').bind(contentId).run();
    await c.env.DB.prepare('DELETE FROM user_engagement_shares WHERE content_id = ?').bind(contentId).run();
    await c.env.DB.prepare('DELETE FROM points_transactions WHERE reference_id = ? AND reference_type = ?').bind(contentId, 'content').run();
    
    // Delete the content
    await c.env.DB.prepare('DELETE FROM content_pieces WHERE id = ? AND creator_id = ?').bind(contentId, user.id).run();

    return c.json({ success: true });

  } catch (error) {
    console.error('Error deleting content:', error);
    return c.json({ error: 'Failed to delete content' }, 500);
  }
});



// Image upload endpoint with HostGator server upload
app.post('/api/content/upload-image', async (c) => {
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

    const { fileName, fileType, fileData } = await c.req.json();

    if (!fileName || !fileType || !fileData) {
      return c.json({ error: 'Missing file data' }, 400);
    }

    // Create a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '');
    const uniqueFileName = `promorang_${timestamp}_${randomId}_${cleanFileName}`;
    console.log('Processing upload for:', uniqueFileName, 'Type:', fileType);
    
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(fileType.toLowerCase())) {
        return c.json({ error: 'Invalid file type. Please upload JPG, PNG, GIF, or WEBP images.' }, 400);
      }

      // Check file size (base64 data size approximation) - increased limit
      const sizeInBytes = (fileData.length * 3) / 4;
      const maxSizeBytes = 15 * 1024 * 1024; // 15MB limit for better user experience
      
      if (sizeInBytes > maxSizeBytes) {
        return c.json({ 
          error: `File too large (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB). Maximum supported file size is 15MB. Please compress your image.` 
        }, 400);
      }

      const user = await getOrCreateUser(mochaUser, c.env.DB);
      if (!user) {
        return c.json({ error: 'Failed to get user data' }, 500);
      }

      // Try uploading to HostGator server first
      try {
        console.log('Uploading to HostGator server...');
        
        // Convert base64 to blob for FormData
        const binaryString = atob(fileData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create FormData for upload
        const formData = new FormData();
        const blob = new Blob([bytes], { type: fileType });
        formData.append('file', blob, uniqueFileName);
        formData.append('source', 'promorang');
        formData.append('user_id', user.id.toString());
        
        // Upload to HostGator server with timeout
        const uploadResponse = await fetch('https://www.edgeillusions.com/uploads/upload.php', {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        console.log('HostGator response status:', uploadResponse.status);
        console.log('HostGator response content-type:', uploadResponse.headers.get('content-type'));
        
        if (uploadResponse.ok) {
          // Get the response text first to see what we're getting
          const responseText = await uploadResponse.text();
          console.log('HostGator response text:', responseText);
          
          try {
            const uploadResult = JSON.parse(responseText);
            
            // HostGator upload successful
            if (uploadResult.success && uploadResult.url) {
              const imageUrl = uploadResult.url;
              
              // Store metadata in database
              const result = await c.env.DB.prepare(`
                INSERT INTO uploaded_images (user_id, filename, file_type, data_url, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
              `).bind(
                user.id,
                uniqueFileName,
                fileType,
                imageUrl, // Store HostGator URL
                new Date().toISOString(),
                new Date().toISOString()
              ).run();

              console.log('Image uploaded to HostGator and metadata stored:', result.meta.last_row_id);

              return c.json({
                success: true,
                imageUrl: imageUrl,
                imageId: result.meta.last_row_id,
                originalFileName: fileName,
                storage: 'hostgator'
              });
            } else {
              throw new Error(uploadResult.error || `HostGator upload failed: ${JSON.stringify(uploadResult)}`);
            }
          } catch (jsonError) {
            throw new Error(`HostGator returned invalid JSON: ${responseText.substring(0, 200)}...`);
          }
        } else {
          const errorText = await uploadResponse.text();
          console.log('HostGator error response:', errorText);
          throw new Error(`HostGator server returned ${uploadResponse.status}: ${errorText.substring(0, 200)}`);
        }
        
      } catch (hostgatorError) {
        console.error('HostGator upload failed, falling back to database storage:', hostgatorError);
        
        // If the error is about file size, don't try database fallback
        const errorMsg = hostgatorError instanceof Error ? hostgatorError.message : String(hostgatorError);
        if (errorMsg.toLowerCase().includes('too large') || errorMsg.toLowerCase().includes('size')) {
          throw hostgatorError;
        }
        // Fall through to database storage for other errors
      }
      
      // Fallback: Store in database (with increased size limit)
      console.log('Using database fallback storage...');
      
      if (sizeInBytes > 5 * 1024 * 1024) { // 5MB limit for database storage
        throw new Error('File too large for database storage (max 5MB). External server unavailable.');
      }

      const dataUrl = `data:${fileType};base64,${fileData}`;
      
      const result = await c.env.DB.prepare(`
        INSERT INTO uploaded_images (user_id, filename, file_type, data_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        uniqueFileName,
        fileType,
        dataUrl,
        new Date().toISOString(),
        new Date().toISOString()
      ).run();

      console.log('Image stored in database with ID:', result.meta.last_row_id);

      const imageUrl = `/api/images/${result.meta.last_row_id}`;
      
      return c.json({
        success: true,
        imageUrl: imageUrl,
        imageId: result.meta.last_row_id,
        originalFileName: fileName,
        storage: 'database',
        fallback: true,
        fallbackReason: 'HostGator server unavailable - using database storage'
      });
      
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Smart fallback based on file name and type
      const getPlatformImage = (filename: string) => {
        const name = filename.toLowerCase();
        if (name.includes('instagram') || name.includes('insta')) {
          return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=800&fit=crop&crop=center&auto=format&q=80';
        } else if (name.includes('tiktok') || name.includes('video')) {
          return 'https://images.unsplash.com/photo-1558403194-611308249627?w=600&h=800&fit=crop&crop=center&auto=format&q=80';
        } else if (name.includes('youtube') || name.includes('yt')) {
          return 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&h=450&fit=crop&crop=center&auto=format&q=80';
        } else if (name.includes('twitter') || name.includes('tweet')) {
          return 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop&crop=center&auto=format&q=80';
        } else if (name.includes('linkedin')) {
          return 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=600&fit=crop&crop=center&auto=format&q=80';
        } else {
          return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=center&auto=format&q=80';
        }
      };

      const fallbackUrl = getPlatformImage(fileName);
      
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Storage failed';
      
      console.log('Using final fallback placeholder due to error:', errorMessage);
      
      return c.json({
        success: true,
        imageUrl: fallbackUrl,
        originalFileName: fileName,
        fallback: true,
        fallbackReason: errorMessage.includes('too large') ? 'File too large - please use smaller image' : 'HostGator server unavailable - using placeholder'
      });
    }

  } catch (error) {
    console.error('Error in image upload:', error);
    return c.json({ error: 'Failed to process upload' }, 500);
  }
});

// Serve uploaded images endpoint
app.get('/api/images/:id', async (c) => {
  try {
    const imageId = c.req.param('id');
    
    if (!imageId || isNaN(parseInt(imageId))) {
      return c.json({ error: 'Invalid image ID' }, 400);
    }

    // Get image metadata from database
    const image = await c.env.DB.prepare(
      'SELECT data_url, file_type, filename FROM uploaded_images WHERE id = ?'
    ).bind(imageId).first();

    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    // Check if it's an R2 URL (starts with https://)
    if (image.data_url.startsWith('https://')) {
      // Redirect to R2 URL
      return Response.redirect(image.data_url, 302);
    }

    // Handle database-stored images (base64 data URLs)
    const base64Data = image.data_url.split(',')[1];
    if (!base64Data) {
      return c.json({ error: 'Invalid image data' }, 400);
    }

    // Convert base64 to binary
    const binaryData = atob(base64Data);
    const uint8Array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }

    // Return the image with proper headers
    return new Response(uint8Array, {
      headers: {
        'Content-Type': image.file_type,
        'Content-Disposition': `inline; filename="${image.filename}"`,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Length': uint8Array.length.toString()
      }
    });

  } catch (error) {
    console.error('Error serving image:', error);
    return c.json({ error: 'Failed to serve image' }, 500);
  }
});

// Generate placeholder image endpoint
app.post('/api/content/generate-placeholder', async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    
    if (!sessionToken) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const { description, platform } = await c.req.json();
    console.log('Generating placeholder for:', { description, platform });

    // Generate a contextual placeholder based on platform and description
    const platformImages = {
      instagram: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=800&fit=crop&crop=center&auto=format&q=80',
      tiktok: 'https://images.unsplash.com/photo-1558403194-611308249627?w=600&h=800&fit=crop&crop=center&auto=format&q=80', 
      youtube: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&h=450&fit=crop&crop=center&auto=format&q=80',
      twitter: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
      linkedin: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=600&fit=crop&crop=center&auto=format&q=80'
    };

    const imageUrl = platformImages[platform as keyof typeof platformImages] || platformImages.instagram;

    return c.json({
      success: true,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('Error generating placeholder:', error);
    return c.json({ error: 'Failed to generate placeholder' }, 500);
  }
});

// Create content endpoint
app.post('/api/content', async (c) => {
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

    // Get or create user in our database
    const user = await getOrCreateUser(mochaUser, c.env.DB);
    
    if (!user) {
      return c.json({ error: 'Failed to get user data' }, 500);
    }

    const body = await c.req.json();
    console.log('Content creation request received:', {
      platform: body.platform,
      title: body.title,
      hasMediaUrl: !!body.media_url,
      totalShares: body.total_shares,
      sharePrice: body.share_price
    });
    
    // Validate the request data with enhanced error logging
    const validationResult = CreateContentRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Content validation failed:', {
        errors: validationResult.error.errors,
        receivedData: body
      });
      return c.json({ 
        error: 'Invalid content data',
        details: validationResult.error.errors,
        field_errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      }, 400);
    }

    const contentData = validationResult.data;

    // Calculate engagement shares (50% of total shares)
    const engagementShares = Math.floor(contentData.total_shares * 0.5);
    const availableShares = contentData.total_shares - engagementShares;

    console.log('Inserting content into database:', {
      userId: user.id,
      username: user.username || user.display_name || 'Anonymous',
      platform: contentData.platform,
      title: contentData.title,
      totalShares: contentData.total_shares,
      engagementShares,
      availableShares
    });

    // Insert content into database with enhanced error handling
    let result;
    try {
      result = await c.env.DB.prepare(`
        INSERT INTO content_pieces (
          creator_id, creator_username, platform, platform_url, title, description, 
          media_url, total_shares, available_shares, engagement_shares_total, 
          engagement_shares_remaining, share_price, current_revenue, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        user.username || user.display_name || 'Anonymous',
        contentData.platform,
        contentData.platform_url,
        contentData.title,
        contentData.description || '',
        contentData.media_url || '',
        contentData.total_shares,
        availableShares,
        engagementShares,
        engagementShares,
        contentData.share_price,
        0.0, // initial revenue
        new Date().toISOString(),
        new Date().toISOString()
      ).run();

      console.log('Content insertion result:', {
        success: result.success,
        lastRowId: result.meta?.last_row_id,
        changes: result.meta?.changes
      });

      if (!result.success || !result.meta?.last_row_id) {
        throw new Error(`Database insertion failed: ${JSON.stringify(result)}`);
      }
    } catch (dbError) {
      console.error('Database insertion error:', dbError);
      console.error('Database error details:', {
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : 'No stack trace'
      });
      throw new Error(`Database operation failed: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`);
    }

    // Get the created content with creator info
    let newContent;
    try {
      newContent = await c.env.DB.prepare(`
        SELECT cp.*, u.username as creator_name, u.avatar_url as creator_avatar
        FROM content_pieces cp
        LEFT JOIN users u ON cp.creator_id = u.id
        WHERE cp.id = ?
      `).bind(result.meta.last_row_id).first();

      if (!newContent) {
        throw new Error('Failed to retrieve newly created content');
      }

      console.log('Content created successfully:', {
        id: newContent.id,
        title: newContent.title,
        creatorId: newContent.creator_id
      });
    } catch (retrieveError) {
      console.error('Error retrieving created content:', retrieveError);
      // Still return success since content was created
      newContent = {
        id: result.meta.last_row_id,
        title: contentData.title,
        platform: contentData.platform,
        creator_id: user.id
      };
    }

    return c.json({ 
      success: true, 
      content: newContent,
      contentId: result.meta.last_row_id
    }, 201);

  } catch (error) {
    console.error('Error creating content:', error);
    console.error('Content creation error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return more specific error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return c.json({ 
      error: 'Failed to create content', 
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Comments endpoints
app.get('/api/content/:id/comments', async (c) => {
  try {
    const contentId = c.req.param('id');
    
    // Get all comments with user info and like status
    const comments = await c.env.DB.prepare(`
      SELECT 
        cc.*,
        u.display_name as user_display_name,
        u.username as user_username,
        u.avatar_url as user_avatar
      FROM content_comments cc
      LEFT JOIN users u ON cc.user_id = u.id
      WHERE cc.content_id = ?
      ORDER BY cc.is_pinned DESC, cc.created_at DESC
    `).bind(contentId).all();

    // Organize comments with replies
    const commentMap = new Map();
    const topLevelComments = [];

    for (const comment of comments.results || []) {
      comment.replies = [];
      comment.has_liked = false; // We'll set this based on user session
      commentMap.set(comment.id, comment);
      
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    }

    // Check if current user has liked each comment
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    if (sessionToken) {
      try {
        const mochaUser = await getCurrentUser(sessionToken, {
          apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
          apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
        });

        if (mochaUser) {
          const user = await getOrCreateUser(mochaUser, c.env.DB);
          if (user) {
            // Check which comments this user has liked
            const likedComments = await c.env.DB.prepare(`
              SELECT comment_id FROM comment_likes WHERE user_id = ?
            `).bind(user.id).all();

            const likedSet = new Set((likedComments.results || []).map((like: any) => like.comment_id));
            
            // Update like status for all comments
            const updateLikeStatus = (comment: any) => {
              comment.has_liked = likedSet.has(comment.id);
              comment.replies?.forEach(updateLikeStatus);
            };
            
            topLevelComments.forEach(updateLikeStatus);
          }
        }
      } catch (authError) {
        // Continue without like status if auth fails
      }
    }

    return c.json(topLevelComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

app.post('/api/content/:id/comments', async (c) => {
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

    const contentId = c.req.param('id');
    const { comment_text, parent_comment_id } = await c.req.json();

    if (!comment_text?.trim()) {
      return c.json({ error: 'Comment text is required' }, 400);
    }

    // Insert comment
    const result = await c.env.DB.prepare(`
      INSERT INTO content_comments (content_id, user_id, comment_text, parent_comment_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      contentId,
      user.id,
      comment_text.trim(),
      parent_comment_id || null,
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    // Award points for commenting
    const basePoints = 0.3;
    const tierMultipliers = { free: 1.0, premium: 1.5, super: 2.0 };
    const multiplier = tierMultipliers[user.user_tier as keyof typeof tierMultipliers] || 1.0;
    const pointsEarned = Math.floor(basePoints * multiplier * 10) / 10;

    await c.env.DB.prepare(`
      INSERT INTO points_transactions (
        user_id, action_type, points_earned, reference_id, reference_type,
        base_points, multiplier, user_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      'comment',
      pointsEarned,
      contentId,
      'content',
      basePoints,
      multiplier,
      user.user_tier,
      new Date().toISOString()
    ).run();

    await c.env.DB.prepare(
      'UPDATE users SET points_balance = points_balance + ?, updated_at = ? WHERE id = ?'
    ).bind(pointsEarned, new Date().toISOString(), user.id).run();

    return c.json({ success: true, comment_id: result.meta.last_row_id });
  } catch (error) {
    console.error('Error posting comment:', error);
    return c.json({ error: 'Failed to post comment' }, 500);
  }
});

app.post('/api/content/comments/:id/like', async (c) => {
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

    const commentId = c.req.param('id');

    // Check if already liked
    const existingLike = await c.env.DB.prepare(
      'SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?'
    ).bind(user.id, commentId).first();

    if (existingLike) {
      // Unlike
      await c.env.DB.prepare(
        'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?'
      ).bind(user.id, commentId).run();
      
      await c.env.DB.prepare(
        'UPDATE content_comments SET likes_count = likes_count - 1 WHERE id = ?'
      ).bind(commentId).run();
    } else {
      // Like
      await c.env.DB.prepare(`
        INSERT INTO comment_likes (user_id, comment_id, created_at)
        VALUES (?, ?, ?)
      `).bind(user.id, commentId, new Date().toISOString()).run();
      
      await c.env.DB.prepare(
        'UPDATE content_comments SET likes_count = likes_count + 1 WHERE id = ?'
      ).bind(commentId).run();
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error liking comment:', error);
    return c.json({ error: 'Failed to like comment' }, 500);
  }
});

app.delete('/api/content/comments/:id', async (c) => {
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

    const commentId = c.req.param('id');

    // Check if user owns the comment or is content owner
    const comment = await c.env.DB.prepare(`
      SELECT cc.*, cp.creator_id as content_creator_id
      FROM content_comments cc
      LEFT JOIN content_pieces cp ON cc.content_id = cp.id
      WHERE cc.id = ?
    `).bind(commentId).first();

    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    if (comment.user_id !== user.id && comment.content_creator_id !== user.id) {
      return c.json({ error: 'Not authorized to delete this comment' }, 403);
    }

    // Delete comment and its replies
    await c.env.DB.prepare('DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM content_comments WHERE id = ? OR parent_comment_id = ?)').bind(commentId, commentId).run();
    await c.env.DB.prepare('DELETE FROM content_comments WHERE id = ? OR parent_comment_id = ?').bind(commentId, commentId).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return c.json({ error: 'Failed to delete comment' }, 500);
  }
});

app.post('/api/content/comments/:id/pin', async (c) => {
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

    const commentId = c.req.param('id');

    // Check if user is content owner
    const comment = await c.env.DB.prepare(`
      SELECT cc.*, cp.creator_id as content_creator_id
      FROM content_comments cc
      LEFT JOIN content_pieces cp ON cc.content_id = cp.id
      WHERE cc.id = ?
    `).bind(commentId).first();

    if (!comment || comment.content_creator_id !== user.id) {
      return c.json({ error: 'Not authorized to pin this comment' }, 403);
    }

    // Toggle pin status
    await c.env.DB.prepare(
      'UPDATE content_comments SET is_pinned = NOT is_pinned WHERE id = ?'
    ).bind(commentId).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error pinning comment:', error);
    return c.json({ error: 'Failed to pin comment' }, 500);
  }
});

// Saved content endpoints
app.get('/api/users/saved-content', async (c) => {
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

    const savedContent = await c.env.DB.prepare(`
      SELECT 
        usc.*,
        cp.title as content_title,
        cp.platform as content_platform,
        cp.platform_url as content_url,
        u.display_name as creator_name,
        u.avatar_url as creator_avatar
      FROM user_saved_content usc
      LEFT JOIN content_pieces cp ON usc.content_id = cp.id
      LEFT JOIN users u ON cp.creator_id = u.id
      WHERE usc.user_id = ?
      ORDER BY usc.created_at DESC
    `).bind(user.id).all();

    return c.json(savedContent.results || []);
  } catch (error) {
    console.error('Error fetching saved content:', error);
    return c.json({ error: 'Failed to fetch saved content' }, 500);
  }
});

app.delete('/api/users/saved-content/:id', async (c) => {
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

    const contentId = c.req.param('id');

    await c.env.DB.prepare(
      'DELETE FROM user_saved_content WHERE user_id = ? AND content_id = ?'
    ).bind(user.id, contentId).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing saved content:', error);
    return c.json({ error: 'Failed to remove saved content' }, 500);
  }
});

// Get public user profile by username
app.get('/api/users/public/:username', async (c) => {
  try {
    const username = c.req.param('username');
    
    if (!username) {
      return c.json({ error: 'Username required' }, 400);
    }

    // Get user by username
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get user's content
    const userContent = await c.env.DB.prepare(`
      SELECT cp.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      WHERE cp.creator_id = ?
      ORDER BY cp.created_at DESC
      LIMIT 20
    `).bind(user.id).all();

    // Get user's drops if they're an advertiser
    const userDrops = await c.env.DB.prepare(`
      SELECT d.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.creator_id = ?
      ORDER BY d.created_at DESC
      LIMIT 20
    `).bind(user.id).all();

    // Get leaderboard position
    const leaderboardPosition = await c.env.DB.prepare(`
      SELECT 
        rank_position as daily_rank, composite_score
      FROM leaderboard_scores 
      WHERE user_id = ? AND period_type = 'daily'
      ORDER BY created_at DESC 
      LIMIT 1
    `).bind(user.id).first();

    return c.json({
      user: user,
      content: userContent.results || [],
      drops: userDrops.results || [],
      leaderboard_position: leaderboardPosition
    });

  } catch (error) {
    console.error('Error fetching public profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Get suggested content for advertisers to sponsor
app.get('/api/advertisers/suggested-content', async (c) => {
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

    // Check if user is an advertiser
    if (user.user_type !== 'advertiser') {
      return c.json({ error: 'Only advertisers can view content suggestions' }, 403);
    }

    // Get content suggestions based on engagement metrics and recency
    // Exclude content already sponsored by this advertiser and content owned by this advertiser
    const suggestions = await c.env.DB.prepare(`
      SELECT 
        cp.*,
        u.username as creator_name,
        u.display_name as creator_display_name,
        u.avatar_url as creator_avatar,
        u.follower_count as creator_followers,
        COALESCE(likes.like_count, 0) as like_count,
        COALESCE(comments.comment_count, 0) as comment_count,
        COALESCE(shares.share_count, 0) as share_count,
        COALESCE(moves.move_count, 0) as move_count,
        (COALESCE(likes.like_count, 0) + COALESCE(comments.comment_count, 0) * 3 + COALESCE(shares.share_count, 0) * 5 + COALESCE(moves.move_count, 0) * 2) as engagement_score,
        julianday('now') - julianday(cp.created_at) as days_old,
        CASE 
          WHEN julianday('now') - julianday(cp.created_at) <= 1 THEN 1.5
          WHEN julianday('now') - julianday(cp.created_at) <= 3 THEN 1.2
          WHEN julianday('now') - julianday(cp.created_at) <= 7 THEN 1.0
          ELSE 0.8
        END as freshness_multiplier,
        COALESCE(active_sponsors.sponsor_count, 0) as current_sponsor_count,
        COALESCE(active_sponsors.total_boost, 0) as current_boost_multiplier
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      LEFT JOIN (
        SELECT reference_id, COUNT(*) as like_count
        FROM points_transactions 
        WHERE action_type = 'like' AND reference_type = 'content'
        GROUP BY reference_id
      ) likes ON cp.id = likes.reference_id
      LEFT JOIN (
        SELECT reference_id, COUNT(*) as comment_count
        FROM points_transactions 
        WHERE action_type = 'comment' AND reference_type = 'content'
        GROUP BY reference_id
      ) comments ON cp.id = comments.reference_id
      LEFT JOIN (
        SELECT content_id, COUNT(*) as share_count
        FROM content_shares
        GROUP BY content_id
      ) shares ON cp.id = shares.content_id
      LEFT JOIN (
        SELECT content_id, COUNT(*) as move_count
        FROM move_transactions
        WHERE content_id IS NOT NULL
        GROUP BY content_id
      ) moves ON cp.id = moves.content_id
      LEFT JOIN (
        SELECT 
          content_id, 
          COUNT(*) as sponsor_count,
          SUM(boost_multiplier) as total_boost
        FROM sponsored_content 
        WHERE status = 'active' AND expires_at > datetime('now')
        GROUP BY content_id
      ) active_sponsors ON cp.id = active_sponsors.content_id
      WHERE cp.creator_id != ? 
        AND cp.id NOT IN (
          SELECT content_id 
          FROM sponsored_content 
          WHERE advertiser_id = ? AND status = 'active' AND expires_at > datetime('now')
        )
        AND cp.created_at >= datetime('now', '-30 days')
      ORDER BY 
        (engagement_score * freshness_multiplier) DESC,
        cp.created_at DESC
      LIMIT 12
    `).bind(user.id, user.id).all();

    // Calculate ROI potential for each suggestion
    const enrichedSuggestions = (suggestions.results || []).map((content: any) => {
      // Calculate engagement rate as percentage
      const totalActions = content.like_count + content.comment_count + content.share_count + content.move_count;
      const estimatedViews = Math.max(totalActions * 20, 100); // Conservative view estimate
      const engagementRate = totalActions > 0 ? (totalActions / estimatedViews * 100) : 0;
      
      // Calculate ROI potential (higher engagement = better ROI)
      const roiPotential = Math.min(engagementRate * 10, 100); // Cap at 100%
      
      // Suggest optimal sponsorship package based on engagement
      let suggestedPackage = 'quick-boost';
      if (content.engagement_score > 50) suggestedPackage = 'viral-campaign';
      else if (content.engagement_score > 30) suggestedPackage = 'premium-spotlight';
      else if (content.engagement_score > 15) suggestedPackage = 'daily-featured';
      else if (content.engagement_score > 5) suggestedPackage = 'popular-boost';
      
      return {
        ...content,
        engagement_rate: Math.round(engagementRate * 10) / 10,
        roi_potential: Math.round(roiPotential),
        estimated_views: estimatedViews,
        suggested_package: suggestedPackage,
        total_engagement: totalActions,
        competition_level: content.current_sponsor_count > 0 ? 'High' : totalActions > 20 ? 'Medium' : 'Low'
      };
    });

    return c.json(enrichedSuggestions);

  } catch (error) {
    console.error('Error fetching suggested content:', error);
    return c.json({ error: 'Failed to fetch content suggestions' }, 500);
  }
});

// Get advertiser dashboard data
app.get('/api/advertisers/dashboard', async (c) => {
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

    // Check if user is an advertiser
    if (user.user_type !== 'advertiser') {
      return c.json({ error: 'Only advertisers can view dashboard' }, 403);
    }

    // Get advertiser's drops
    const drops = await c.env.DB.prepare(`
      SELECT d.*, 
             COUNT(da.id) as total_applications,
             SUM(CASE WHEN da.status = 'completed' THEN da.gems_earned ELSE 0 END) as gems_paid
      FROM drops d
      LEFT JOIN drop_applications da ON d.id = da.drop_id
      WHERE d.creator_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `).bind(user.id).all();

    // Get advertiser analytics (if any)
    const analytics = await c.env.DB.prepare(`
      SELECT * FROM advertiser_analytics
      WHERE advertiser_id = ?
      ORDER BY period_start DESC
      LIMIT 10
    `).bind(user.id).all();

    // Get current month inventory
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    const monthlyInventory = await c.env.DB.prepare(`
      SELECT * FROM advertiser_inventory 
      WHERE advertiser_id = ? AND period_type = 'monthly' AND period_start = ?
    `).bind(user.id, monthStart).first();

    // Get current week inventory (for premium/super users)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    const weeklyInventory = await c.env.DB.prepare(`
      SELECT * FROM advertiser_inventory 
      WHERE advertiser_id = ? AND period_type = 'weekly' AND period_start = ?
    `).bind(user.id, weekStartStr).first();

    return c.json({
      drops: drops.results || [],
      analytics: analytics.results || [],
      user_tier: user.user_tier,
      monthly_inventory: monthlyInventory,
      weekly_inventory: weeklyInventory
    });

  } catch (error) {
    console.error('Error fetching advertiser dashboard:', error);
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

// Get public user profile by ID
app.get('/api/users/public/id/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    
    if (!userId || isNaN(parseInt(userId))) {
      return c.json({ error: 'Valid user ID required' }, 400);
    }

    // Get user by ID
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get user's content
    const userContent = await c.env.DB.prepare(`
      SELECT cp.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM content_pieces cp
      LEFT JOIN users u ON cp.creator_id = u.id
      WHERE cp.creator_id = ?
      ORDER BY cp.created_at DESC
      LIMIT 20
    `).bind(user.id).all();

    // Get user's drops if they're an advertiser
    const userDrops = await c.env.DB.prepare(`
      SELECT d.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM drops d
      LEFT JOIN users u ON d.creator_id = u.id
      WHERE d.creator_id = ?
      ORDER BY d.created_at DESC
      LIMIT 20
    `).bind(user.id).all();

    // Get leaderboard position
    const leaderboardPosition = await c.env.DB.prepare(`
      SELECT 
        rank_position as daily_rank, composite_score
      FROM leaderboard_scores 
      WHERE user_id = ? AND period_type = 'daily'
      ORDER BY created_at DESC 
      LIMIT 1
    `).bind(user.id).first();

    return c.json({
      user: user,
      content: userContent.results || [],
      drops: userDrops.results || [],
      leaderboard_position: leaderboardPosition
    });

  } catch (error) {
    console.error('Error fetching public profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Get user interaction status for content
app.get('/api/content/:id/user-status', async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
    
    if (!sessionToken) {
      return c.json({ has_liked: false, has_saved: false });
    }

    const mochaUser = await getCurrentUser(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    if (!mochaUser) {
      return c.json({ has_liked: false, has_saved: false });
    }

    const user = await getOrCreateUser(mochaUser, c.env.DB);
    if (!user) {
      return c.json({ has_liked: false, has_saved: false });
    }

    const contentId = c.req.param('id');

    const [likeStatus, saveStatus] = await Promise.all([
      c.env.DB.prepare('SELECT id FROM user_content_likes WHERE user_id = ? AND content_id = ?').bind(user.id, contentId).first(),
      c.env.DB.prepare('SELECT id FROM user_saved_content WHERE user_id = ? AND content_id = ?').bind(user.id, contentId).first()
    ]);

    return c.json({
      has_liked: !!likeStatus,
      has_saved: !!saveStatus
    });
  } catch (error) {
    console.error('Error fetching user status:', error);
    return c.json({ has_liked: false, has_saved: false });
  }
});

export default {
  fetch: app.fetch.bind(app),
};
