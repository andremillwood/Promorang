import { sign } from 'hono/jwt'

export async function issueSessionToken(secret: string, userId: string) {
  const payload = { sub: userId, iat: Math.floor(Date.now() / 1000) }
  return await sign(payload, secret)
}
