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

  // Check authentication
  const token = req.cookies?.pr_token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: 'Not authenticated',
      message: 'Please log in to access economy data'
    });
  }

  if (req.method === 'GET') {
    // Return mock economy data based on user token
    const userId = token;
    const mockBalance = {
      user_id: userId,
      points: Math.floor(Math.random() * 10000),
      keys: Math.floor(Math.random() * 100),
      gems: Math.floor(Math.random() * 500),
      gold: Math.floor(Math.random() * 1000)
    };

    return res.status(200).json(mockBalance);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
