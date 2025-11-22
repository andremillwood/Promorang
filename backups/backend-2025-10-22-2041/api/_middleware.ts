import type { VercelRequest, VercelResponse } from '@vercel/node';

const allowedOrigins = [
  'https://promorang.co',
  'https://promorang-alt.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

export default function middleware(req: VercelRequest, res: VercelResponse, next: any) {
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
}
