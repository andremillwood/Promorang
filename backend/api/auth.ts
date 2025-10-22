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

  if (req.method === 'POST') {
    // Mock authentication - set a session cookie
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: 'user@example.com',
      name: 'Test User'
    };

    res.setHeader('Set-Cookie', `pr_token=${mockUser.id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);

    return res.status(200).json({
      success: true,
      user: mockUser,
      message: 'Mock login successful'
    });
  }

  if (req.method === 'GET') {
    // Check for existing session
    const token = req.cookies?.pr_token || req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      return res.status(200).json({
        authenticated: true,
        user: {
          id: token,
          email: 'user@example.com',
          name: 'Test User'
        }
      });
    }

    return res.status(401).json({
      authenticated: false,
      message: 'Not authenticated'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
