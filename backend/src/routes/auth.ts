import { Hono } from 'hono'
import { issueSessionToken } from '../utils/session'
import { ensureUser } from '../utils/user'
import { setCookie } from 'hono/cookie'

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

export const authRoutes = new Hono<Ctx>()

authRoutes.get('/google/callback', async (c) => {
  try {
    const code = c.req.query('code')
    if (!code) return c.text('Missing code', 400)

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
    const user = await ensureUser(c.env.DB, {
      google_id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture
    })

    // Create session token
    const token = await issueSessionToken(c.env.JWT_SECRET, user.id)
    
    // Set cookie with cross-domain support
    setCookie(c, 'pr_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      domain: '.promorang.co',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    console.log('✅ User logged in:', user.email || user.id)
    
    // Determine redirect URL based on current host
    const currentHost = new URL(c.req.url).hostname
    const baseUrl = currentHost === 'www.promorang.co' ? 'https://promorang.co' : `https://${currentHost}`
    
    return c.redirect(`${baseUrl}/auth/success?session=true`, 302)
  } catch (err: any) {
    console.error('💥 OAuth Callback Error:', err)
    return c.json({ error: 'Internal Error', message: err?.message || String(err) }, 500)
  }
})
