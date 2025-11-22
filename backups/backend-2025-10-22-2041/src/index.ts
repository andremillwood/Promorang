// ===========================
// Promorang API Worker (Hono)
// ===========================
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { verify } from 'hono/jwt'
import { getCookie, setCookie } from 'hono/cookie'
import { issueSessionToken } from './utils/session'
import { ensureUser } from './utils/user'

type Env = {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string
  DB: D1Database
}

const app = new Hono<{ Bindings: Env; Variables: { user?: { id: string } } }>()

// ✅ DIAGNOSTIC ENDPOINT - FIRST (before any middleware)
app.get('/api/debug/env', (c) => {
  return c.json({
    db_bound: !!c.env.DB,
    available_bindings: Object.keys(c.env),
    db_type: typeof c.env.DB,
    database_name: c.env.DB ? 'accessible' : 'undefined'
  })
})

// ✅ Global CORS — supports cross-domain cookies
app.use(
  '*',
  cors({
    origin: ['https://promorang.co', 'https://www.promorang.co'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  })
)

// ✅ Domain Normalization — redirect all www → root domain
app.use('*', async (c, next) => {
  const host = c.req.header('host') || ''
  if (host === 'www.promorang.co') {
    const url = new URL(c.req.url)
    url.hostname = 'promorang.co'
    return c.redirect(url.toString(), 301)
  }
  return next()
})

// Health check
app.get('/api/health', (c) => c.text('✅ Promorang API Active'))

// OAuth URL endpoint
app.get('/api/auth/google/url', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return c.json({ error: 'Google OAuth not configured' }, 500)
  }
  const redirectUri = 'https://www.promorang.co/api/auth/google/callback'
  const scope = encodeURIComponent('openid email profile')
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`
  return c.json({ url: authUrl })
})

// ✅ OAuth callback - inline to ensure env access
app.get('/api/auth/google/callback', async (c) => {
  try {
    const code = c.req.query('code')
    if (!code) return c.text('Missing code', 400)

    // Check if OAuth credentials are configured
    if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET) {
      return c.json({ error: 'Google OAuth not configured' }, 500)
    }

    const params = new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'https://www.promorang.co/api/auth/google/callback',
      grant_type: 'authorization_code'
    })

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Token exchange failed:', errText)
      return c.text('Token exchange failed', 500)
    }

    const tokenData = await tokenRes.json()
    const { access_token } = tokenData

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    })

    if (!userRes.ok) {
      return c.text('Failed to fetch user info', 500)
    }

    const googleUser = await userRes.json()

    // Check if database is available for user creation
    let user
    if (c.env.DB) {
      user = await ensureUser(c.env.DB, {
        google_id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture
      })
    } else {
      // Create mock user when database is not available
      user = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture
      }
    }

    // Generate session token if JWT_SECRET is available
    if (!c.env.JWT_SECRET) {
      return c.json({ error: 'Authentication not configured' }, 500)
    }

    const token = await issueSessionToken(c.env.JWT_SECRET, user.id)

    setCookie(c, 'pr_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      domain: '.promorang.co',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    console.log('✅ User logged in:', user.email || user.id)

    const currentHost = new URL(c.req.url).hostname
    const baseUrl = currentHost === 'www.promorang.co' ? 'https://promorang.co' : `https://${currentHost}`

    return c.redirect(`${baseUrl}/auth/success?session=true`, 302)
  } catch (err: any) {
    console.error('💥 OAuth Callback Error:', err)
    return c.json({ error: 'Internal Error', message: err?.message || String(err) }, 500)
  }
})

// ✅ Auth middleware for protected routes
app.use('/api/economy/*', async (c, next) => {
  const token = getCookie(c, 'pr_token')
  if (!token) return next()
  try {
    const secret = c.env.JWT_SECRET
    if (!secret) return next()
    const payload = await verify(token, secret)
    if (payload && typeof payload.sub === 'string') {
      c.set('user', { id: payload.sub })
    }
  } catch (_) {
    // silently ignore invalid token
  }
  await next()
})

// ✅ Economy /me endpoint - inline to ensure env access
app.get('/api/economy/me', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  // Check if database is available
  if (!c.env.DB) {
    console.log('🔍 DEBUG: Database not available, returning mock data')
    return c.json({ user_id: user.id, points: 0, keys: 0, gems: 0, gold: 0 })
  }

  const db = c.env.DB
  const row = await db.prepare('SELECT * FROM balances WHERE user_id=?').bind(user.id).first()

  if (!row) {
    await db.prepare('INSERT INTO balances (user_id) VALUES (?)').bind(user.id).run()
    return c.json({ user_id: user.id, points: 0, keys: 0, gems: 0, gold: 0 })
  }

  return c.json(row)
})

// ✅ Content routes (public content feed)
app.get('/api/content', async (c) => {
  console.log('🔍 DEBUG /api/content called')
  // Return empty array for now - implement content fetching logic
  return c.json([])
})

app.get('/api/content/sponsored', async (c) => {
  console.log('🔍 DEBUG /api/content/sponsored called')
  // Return empty array for now - implement sponsored content logic
  return c.json([])
})

// ✅ Drops/Tasks routes
app.get('/api/drops', async (c) => {
  console.log('🔍 DEBUG /api/drops called')
  const limit = c.req.query('limit') || '10'
  // Return empty array for now - implement drops fetching logic
  return c.json([])
})

// ✅ Wallet routes
app.get('/api/users/wallets', async (c) => {
  console.log('🔍 DEBUG /api/users/wallets called')

  // Check authentication using the same pattern as economy routes
  const token = getCookie(c, 'pr_token')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  let user: { id: string } | null = null
  try {
    const secret = c.env.JWT_SECRET
    if (!secret) return c.json({ error: 'Server configuration error' }, 500)
    const payload = await verify(token, secret)
    if (payload && typeof payload.sub === 'string') {
      user = { id: payload.sub }
    }
  } catch (_) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  // Return wallet data - implement wallet fetching logic
  return c.json({
    user_id: user.id,
    points: 0,
    keys: 0,
    gems: 0,
    gold: 0
  })
})
