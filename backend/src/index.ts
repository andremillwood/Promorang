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

// 🔍 GLOBAL LOGGING MIDDLEWARE - Track all requests
app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  console.log('🔍 DEBUG: route incoming —', {
    path: url.pathname,
    method: c.req.method,
    env_keys: Object.keys(c.env || {}),
    db_exists: !!c.env?.DB
  })
  await next()
})

// ✅ DIAGNOSTIC ENDPOINT - FIRST (before any middleware)
app.get('/api/debug/env', (c) => {
  console.log('🔍 DEBUG /api/debug/env — env keys:', Object.keys(c.env || {}))
  return c.json({
    db_bound: !!c.env.DB,
    available_bindings: Object.keys(c.env),
    db_type: typeof c.env.DB,
    database_name: c.env.DB ? 'accessible' : 'undefined'
  })
})

// ✅ CORS Middleware - Hono's built-in cors with secure configuration
const allowedOrigins = [
  'https://promorang.co',
  'https://www.promorang.co',
];

app.use('*', cors({
  origin: (origin) => allowedOrigins.includes(origin) ? origin : '',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

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
  const redirectUri = 'https://api.promorang.co/api/auth/google/callback'
  const scope = encodeURIComponent('openid email profile')
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`
  return c.json({ url: authUrl })
})

// ✅ OAuth callback - inline to ensure env access
app.get('/api/auth/google/callback', async (c) => {
  console.log('🔍 DEBUG auth callback — env keys:', Object.keys(c.env || {}))
  if (!c.env.DB) {
    console.error('❌ DEBUG: DB undefined in auth callback!')
  } else {
    console.log('✅ DEBUG: DB exists in auth callback')
  }
  
  try {
    const code = c.req.query('code')
    if (!code) return c.text('Missing code', 400)

    const params = new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'https://api.promorang.co/api/auth/google/callback',
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
    
    // ✅ Defensive check: Ensure DB is available before calling ensureUser
    if (!c.env.DB) {
      console.error('❌ CRITICAL: c.env.DB is undefined before ensureUser call')
      return c.json({ error: 'Database unavailable' }, 500)
    }
    console.log('✅ DB available before ensureUser:', !!c.env.DB)
    
    const user = await ensureUser(c.env.DB, {
      sub: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture
    })

    const token = await issueSessionToken(c.env.JWT_SECRET, user.id)
    
    // ✅ Proper Hono cookie setter (cross-domain safe)
    setCookie(c, 'pr_token', token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      path: '/',
      domain: '.promorang.co',  // ensures cookie works on both promorang.co and www.promorang.co
      maxAge: 60 * 60 * 24 * 7  // 7 days
    })

    console.log('✅ User logged in:', user.email || user.id)
    console.log('✅ Cookie set with domain: .promorang.co')
    
    // ✅ Redirect to auth/success page to allow cookie propagation
    return c.redirect('https://promorang.co/auth/success', 302)
  } catch (err: any) {
    console.error('💥 OAuth Callback Error:', err)
    return c.json({ error: 'Internal Error', message: err?.message || String(err) }, 500)
  }
})

// 🧪 MOCK LOGIN ENDPOINT - For testing without Google OAuth
app.post('/api/auth/mock', async (c) => {
  console.log('🧪 Mock login initiated')
  
  if (!c.env.DB) {
    console.error('❌ DB unavailable in mock login')
    return c.json({ error: 'Database unavailable' }, 500)
  }
  
  try {
    // Create or get mock test user
    const mockUserId = 'mock-test-user-' + Date.now()
    const mockUser = {
      sub: mockUserId,
      email: 'test@promorang.co',
      name: 'Test User',
      picture: 'https://via.placeholder.com/150'
    }
    
    // Ensure user exists in DB
    const user = await ensureUser(c.env.DB, mockUser)
    
    // Issue JWT token (same as real OAuth flow)
    const token = await issueSessionToken(c.env.JWT_SECRET, user.id)
    
    // Set cookie with same settings as OAuth flow
    setCookie(c, 'pr_token', token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      path: '/',
      domain: '.promorang.co',
      maxAge: 60 * 60 * 24 * 7  // 7 days
    })
    
    console.log('✅ Mock user logged in:', user.id)
    console.log('✅ Mock cookie set with domain: .promorang.co')
    
    return c.json({ 
      success: true, 
      user_id: user.id,
      message: 'Mock login successful. Cookie set.',
      next_step: 'Navigate to /auth/success to verify session'
    })
  } catch (err: any) {
    console.error('💥 Mock login error:', err)
    return c.json({ error: 'Mock login failed', message: err?.message || String(err) }, 500)
  }
})

// ✅ Auth middleware for protected routes
app.use('/api/economy/*', async (c, next) => {
  const token = getCookie(c, 'pr_token')
  if (!token) {
    console.warn('❌ Auth middleware: no pr_token cookie found')
    return c.json({ error: 'Unauthorized' }, 401)
  }
  try {
    const secret = c.env.JWT_SECRET
    if (!secret) {
      console.error('❌ Auth middleware: JWT_SECRET not configured')
      return c.json({ error: 'Server configuration error' }, 500)
    }
    const payload = await verify(token, secret)
    if (payload && typeof payload.sub === 'string') {
      c.set('user', { id: payload.sub })
      console.log('✅ Auth middleware: user authenticated:', payload.sub)
    } else {
      console.warn('❌ Auth middleware: invalid token payload')
      return c.json({ error: 'Invalid token' }, 401)
    }
  } catch (err) {
    console.warn('❌ Auth middleware: token verification failed:', err)
    return c.json({ error: 'Invalid token' }, 401)
  }
  await next()
})

// ✅ Economy /me endpoint - inline to ensure env access
app.get('/api/economy/me', async (c) => {
  console.log('🔍 DEBUG economy me — env keys:', Object.keys(c.env || {}))
  
  // ✅ Defensive check: Ensure DB is available
  if (!c.env.DB) {
    console.error('❌ CRITICAL: DB undefined in /api/economy/me!')
    return c.json({ error: 'Database unavailable' }, 500)
  }
  console.log('✅ DB available in /api/economy/me:', !!c.env.DB, 'typeof:', typeof c.env.DB)
  
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  
  const db = c.env.DB
  
  try {
    const row = await db.prepare('SELECT * FROM balances WHERE user_id=?')
      .bind(user.id)
      .first()
    
    if (!row) {
      console.log('📝 Creating balance record for user:', user.id)
      await db.prepare('INSERT INTO balances (user_id) VALUES (?)')
        .bind(user.id)
        .run()
      return c.json({ user_id: user.id, points: 0, keys: 0, gems: 0, gold: 0 })
    }
    
    console.log('✅ Balance retrieved for user:', user.id)
    return c.json(row)
  } catch (err: any) {
    console.error('💥 Database error in /api/economy/me:', err)
    return c.json({ error: 'Database error', message: err?.message || String(err) }, 500)
  }
})

app.get('/', (c) => c.text('✅ Promorang API Root Active'))

// ✅ OPTIONS Handler for CORS Preflight (fallback)
// Hono's cors() middleware handles most cases, but this ensures all OPTIONS requests return 204
app.options('*', (c) => c.text('', 204 as any))

export default app
