import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://promorang.co',
    'https://promorang-alt.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // For now, return a mock URL since we don't have Google OAuth configured
    // In production, this would integrate with actual Google OAuth
    return res.status(200).json({
      url: `${origin}/api/auth/mock`,
      provider: 'mock',
      message: 'Mock OAuth URL - replace with actual Google OAuth in production'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
