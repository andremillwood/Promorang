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
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
};

const payments = new Hono<{ Bindings: Env }>();

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

    // Create new user with unique username
    const baseUsername = mochaUser.email ? mochaUser.email.split('@')[0] : 'user';
    let username = baseUsername;
    let usernameAttempts = 0;
    
    // Ensure unique username
    while (usernameAttempts < 10) {
      const existingUsername = await db.prepare(
        'SELECT id FROM users WHERE username = ?'
      ).bind(username).first();
      
      if (!existingUsername) {
        break; // Username is unique
      }
      
      usernameAttempts++;
      username = `${baseUsername}${usernameAttempts}`;
    }
    
    const displayName = mochaUser.google_user_data?.name || mochaUser.google_user_data?.given_name || username;
    
    // Ensure unique referral code
    let referralCode;
    let referralAttempts = 0;
    do {
      const baseCode = username.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
      referralCode = `${baseCode || 'USER'}${Math.floor(Math.random() * 9000) + 1000}`;
      
      const existingReferral = await db.prepare(
        'SELECT id FROM users WHERE referral_code = ?'
      ).bind(referralCode).first();
      
      if (!existingReferral) {
        break; // Referral code is unique
      }
      
      referralAttempts++;
    } while (referralAttempts < 10);

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
      0.0, // Starting gems
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

// Create Stripe checkout session for gem purchases
payments.post('/create-checkout-session', async (c) => {
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

    const { package_id, gems, price } = await c.req.json();

    if (!package_id || !gems || !price) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Import Stripe dynamically to avoid bundling issues
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${gems} Gems Package`,
              description: `${package_id.charAt(0).toUpperCase() + package_id.slice(1)} gem package - ${gems} gems at $1.10 per gem`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${new URL(c.req.url).origin}/wallet?payment=success`,
      cancel_url: `${new URL(c.req.url).origin}/wallet?payment=cancelled`,
      metadata: {
        user_id: user.id.toString(),
        package_id,
        gems_amount: gems.toString(),
      },
    });

    // Store pending purchase in database
    await c.env.DB.prepare(`
      INSERT INTO pending_gem_purchases (
        user_id, stripe_session_id, package_id, gems_amount, price_amount, 
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      session.id,
      package_id,
      gems,
      price,
      'pending',
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    return c.json({
      checkout_url: session.url,
      session_id: session.id
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return c.json({ error: 'Failed to create payment session' }, 500);
  }
});

// Stripe webhook handler
payments.post('/stripe-webhook', async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      return c.json({ error: 'No signature provided' }, 400);
    }

    // Import Stripe dynamically
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, c.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return c.json({ error: 'Webhook signature verification failed' }, 400);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Get the pending purchase
        const pendingPurchase = await c.env.DB.prepare(
          'SELECT * FROM pending_gem_purchases WHERE stripe_session_id = ?'
        ).bind(session.id).first();

        if (!pendingPurchase) {
          console.error('No pending purchase found for session:', session.id);
          break;
        }

        // Update user's gem balance
        await c.env.DB.prepare(
          'UPDATE users SET gems_balance = gems_balance + ?, updated_at = ? WHERE id = ?'
        ).bind(
          pendingPurchase.gems_amount,
          new Date().toISOString(),
          pendingPurchase.user_id
        ).run();

        // Mark purchase as completed
        await c.env.DB.prepare(
          'UPDATE pending_gem_purchases SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?'
        ).bind(
          'completed',
          new Date().toISOString(),
          new Date().toISOString(),
          pendingPurchase.id
        ).run();

        // Create transaction record
        await c.env.DB.prepare(`
          INSERT INTO transactions (
            user_id, transaction_type, amount, currency_type, status, 
            reference_id, reference_type, description, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          pendingPurchase.user_id,
          'gem_purchase',
          pendingPurchase.gems_amount,
          'GEMS',
          'completed',
          pendingPurchase.id,
          'gem_purchase',
          `Purchased ${pendingPurchase.gems_amount} gems (${pendingPurchase.package_id} package)`,
          new Date().toISOString(),
          new Date().toISOString()
        ).run();

        console.log('Successfully processed gem purchase:', {
          user_id: pendingPurchase.user_id,
          gems_amount: pendingPurchase.gems_amount,
          package_id: pendingPurchase.package_id
        });

        break;

      case 'checkout.session.expired':
        // Mark as expired
        const expiredSession = event.data.object;
        await c.env.DB.prepare(
          'UPDATE pending_gem_purchases SET status = ?, updated_at = ? WHERE stripe_session_id = ?'
        ).bind(
          'expired',
          new Date().toISOString(),
          expiredSession.id
        ).run();
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

export default payments;
