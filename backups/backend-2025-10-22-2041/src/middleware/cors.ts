import { Context, Next } from 'hono';

const ALLOWED_ORIGINS = [
  'https://promorang.co',
  'https://www.promorang.co',
  'http://localhost:5173', // Local dev
];

export async function corsMiddleware(c: Context, next: Next) {
  const origin = c.req.header('Origin') || '';
  
  // Determine allowed origin
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0];

  // Set CORS headers
  c.header('Access-Control-Allow-Origin', allowedOrigin);
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
}
