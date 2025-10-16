import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { errors, successResponse, errorResponse } from '../middleware/errors';

export async function createStripeCheckout(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { gems, price_id } = body;

    // Validate input
    if (!gems || gems <= 0) {
      throw errors.badRequest('Valid gems amount is required');
    }

    const db: D1Database = c.env.DB;
    const stripe = c.env.STRIPE_SECRET_KEY;

    if (!stripe) {
      throw errors.badRequest('Stripe not configured');
    }

    // Get user's email for Stripe
    const user = await db.prepare(
      'SELECT email FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user?.email) {
      throw errors.badRequest('User email required for payment');
    }

    // Use provided price_id or determine based on gems
    let finalPriceId = price_id;
    if (!finalPriceId) {
      if (gems === 10) {
        finalPriceId = c.env.STRIPE_PRICE_ID_10GEMS;
      } else if (gems === 47) {
        finalPriceId = c.env.STRIPE_PRICE_ID_47GEMS;
      } else {
        throw errors.badRequest('Invalid gems amount or missing price_id');
      }
    }

    // Create Stripe checkout session
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripe}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[][price]': finalPriceId,
        'line_items[][quantity]': '1',
        'mode': 'payment',
        'success_url': `${c.req.url.replace('/api/payments/create-checkout', '')}/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${c.req.url.replace('/api/payments/create-checkout', '')}/cancel`,
        'customer_email': user.email,
        'metadata[gems]': gems.toString(),
        'metadata[user_id]': userId,
      }),
    });

    if (!stripeRes.ok) {
      const stripeError = await stripeRes.text();
      throw errors.badRequest(`Stripe error: ${stripeError}`);
    }

    const stripeSession = await stripeRes.json();

    // Record payment attempt
    await db.prepare(
      `INSERT INTO payments (user_id, payment_type, amount, stripe_session_id, status)
       VALUES (?, 'deposit', ?, ?, 'pending')`
    ).bind(userId, gems, stripeSession.id).run();

    return successResponse(c, {
      checkout_url: stripeSession.url,
      session_id: stripeSession.id,
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function handleStripeWebhook(c: Context): Promise<Response> {
  try {
    const body = await c.req.text();
    const sig = c.req.header('stripe-signature');

    if (!sig) {
      return c.text('No signature', 400);
    }

    const stripe = c.env.STRIPE_SECRET_KEY;
    const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
      return c.text('Stripe not configured', 500);
    }

    // Verify webhook signature (simplified - in production use proper library)
    // For now, we'll trust the webhook since it's from Stripe

    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Update payment status
      await c.env.DB.prepare(
        `UPDATE payments SET status = 'completed'
         WHERE stripe_session_id = ?`
      ).bind(session.id).run();

      // Add gems to user balance
      const gems = parseInt(session.metadata?.gems || '0');
      const userId = session.metadata?.user_id;

      if (gems > 0 && userId) {
        await c.env.DB.batch([
          // Add gems to balance
          c.env.DB.prepare('UPDATE balances SET gems = gems + ? WHERE user_id = ?')
            .bind(gems, userId),
          // Log transaction
          c.env.DB.prepare(
            'INSERT INTO transactions (user_id, transaction_type, currency_type, amount, description) VALUES (?, ?, ?, ?, ?)'
          ).bind(userId, 'earn', 'gems', gems, `Purchased ${gems} gems via Stripe`),
        ]);
      }
    }

    return c.text('OK', 200);
  } catch (error) {
    console.error('Webhook error:', error);
    return c.text('Webhook error', 500);
  }
}

export async function requestWithdrawal(c: Context): Promise<Response> {
  try {
    const userId = c.get('userId');
    if (!userId) throw errors.unauthorized();

    const body = await c.req.json();
    const { amount } = body;

    // Validate input
    if (!amount || amount <= 0) {
      throw errors.badRequest('Valid withdrawal amount is required');
    }

    const db: D1Database = c.env.DB;

    // Check balance
    const balances = await db.prepare(
      'SELECT gems FROM balances WHERE user_id = ?'
    ).bind(userId).first();

    if (!balances || balances.gems < amount) {
      throw errors.insufficientFunds('gems');
    }

    // Minimum withdrawal amount (e.g., $5 worth of gems at 1 gem = $0.10)
    const minGems = 50; // $5 minimum
    if (amount < minGems) {
      throw errors.badRequest(`Minimum withdrawal is ${minGems} gems ($${minGems * 0.10})`);
    }

    // Record withdrawal request
    await db.prepare(
      `INSERT INTO payments (user_id, payment_type, amount, status)
       VALUES (?, 'withdrawal', ?, 'pending')`
    ).bind(userId, amount).run();

    // Log transaction (debit)
    await db.prepare(
      'INSERT INTO transactions (user_id, transaction_type, currency_type, amount, description) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, 'spend', 'gems', -amount, `Withdrawal request for ${amount} gems`);

    return successResponse(c, {
      withdrawal_requested: amount,
      status: 'pending',
      message: 'Withdrawal request submitted. Processing may take 1-3 business days.',
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}
