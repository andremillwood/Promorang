import { Hono } from 'hono'
import { nanoid } from 'nanoid'

type Env = {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string
  DB: any
}

type Ctx = {
  Bindings: Env
  Variables: { user?: { id: string } }
}

export const economy = new Hono<Ctx>()

// Helper to ensure a balance row exists
async function ensureBalance(c: any, userId: string) {
  const db = c.env.DB
  const row = await db.prepare('SELECT * FROM balances WHERE user_id=?').bind(userId).first()
  if (!row) {
    await db.prepare('INSERT INTO balances (user_id) VALUES (?)').bind(userId).run()
    return { user_id: userId, points: 0, keys: 0, gems: 0, gold: 0 }
  }
  return row
}

// NOTE: expects an auth middleware upstream that sets c.set('user', { id })
economy.get('/me', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const bal = await ensureBalance(c, user.id)
  return c.json(bal)
})

/**
 * POST /api/economy/convert
 * Body: { from: 'points', to: 'keys', amount: number }
 * Rule (PRD): 500 Points -> 1 Key (integer division)
 */
economy.post('/convert', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  const body = await c.req.json().catch(() => ({}))
  const from = body?.from
  const to = body?.to
  const amount = Number(body?.amount ?? 0)
  if (!from || !to || !Number.isFinite(amount) || amount <= 0) {
    return c.json({ error: 'Invalid payload' }, 400)
  }

  const db = c.env.DB
  const bal = await ensureBalance(c, user.id)

  // Current supported conversion: Points -> Keys
  const ratePointsToKey = 500
  if (from === 'points' && to === 'keys') {
    if (bal.points < amount) return c.json({ error: 'Insufficient points' }, 400)
    const keysGained = Math.floor(amount / ratePointsToKey)
    if (keysGained <= 0) return c.json({ error: `Amount must be >= ${ratePointsToKey}` }, 400)

    const id = nanoid()
    const ts = Date.now()
    await db.batch([
      db.prepare('UPDATE balances SET points = points - ?, keys = keys + ? WHERE user_id = ?')
        .bind(keysGained * ratePointsToKey, keysGained, user.id),
      db.prepare(`INSERT INTO ledger 
        (id, user_id, ts, type, delta_points, delta_keys, delta_gems, delta_gold, ref)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, user.id, ts, 'convert.points_to_keys', -(keysGained * ratePointsToKey), keysGained, 0, 0, 'points_to_keys')
    ])

    const updated = await db.prepare('SELECT * FROM balances WHERE user_id=?').bind(user.id).first()
    return c.json({ success: true, keysGained, balance: updated })
  }

  return c.json({ error: 'Unsupported conversion' }, 400)
})

/**
 * POST /api/economy/refill
 * Admin/test helper to set balances.
 * Body: { userId, points?, keys?, gems?, gold? }
 */
economy.post('/refill', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const userId = body?.userId
  if (!userId) return c.json({ error: 'userId required' }, 400)
  const points = Number(body?.points ?? 0)
  const keys   = Number(body?.keys ?? 0)
  const gems   = Number(body?.gems ?? 0)
  const gold   = Number(body?.gold ?? 0)
  await c.env.DB.prepare(`
    INSERT INTO balances (user_id, points, keys, gems, gold)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      points=excluded.points,
      keys=excluded.keys,
      gems=excluded.gems,
      gold=excluded.gold
  `).bind(userId, points, keys, gems, gold).run()
  const id = nanoid()
  const ts = Date.now()
  await c.env.DB.prepare(`
    INSERT INTO ledger (id, user_id, ts, type, delta_points, delta_keys, delta_gems, delta_gold, ref)
    VALUES (?, ?, ?, 'admin.refill', ?, ?, ?, ?, 'refill')
  `).bind(id, userId, ts, points, keys, gems, gold).run()
  return c.json({ success: true })
})
