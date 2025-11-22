import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'

export const auth = createMiddleware(async (c, next) => {
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
