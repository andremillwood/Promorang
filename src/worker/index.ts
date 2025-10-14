import { Hono } from "hono";
import { cors } from "hono/cors";
// import { serveStatic } from "hono/cloudflare-workers";
import type { D1Database, ExecutionContext } from '@cloudflare/workers-types';
import { googleAuthUrlHandler, googleAuthCallbackHandler } from './handlers/googleAuth';

export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  // Optional Mocha service (for backward compatibility)
  MOCHA_USERS_SERVICE_API_URL?: string;
  MOCHA_USERS_SERVICE_API_KEY?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Add CORS middleware
app.use('*', cors({
  origin: ['https://promorang.co', 'https://www.promorang.co'],
  allowHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// ✅ Root route - simple test to confirm routing works (FIRST!)
app.get('/', async (c) => {
  console.log("✅ Root handler executed at", new Date().toISOString());
  return c.text("✅ Promorang Worker root handler confirmed");
});

// Temporary debug handler - shows environment variables
app.get("/api/debug/env", (c) => {
  return c.json({
    GOOGLE_CLIENT_ID: c.env?.GOOGLE_CLIENT_ID ? true : false,
    GOOGLE_CLIENT_SECRET: c.env?.GOOGLE_CLIENT_SECRET ? true : false,
    JWT_SECRET: c.env?.JWT_SECRET ? true : false,
  });
});

// Health check endpoint
app.get('/api/health', (c) => c.text('Hello from Promorang!'));

// Google OAuth URL endpoint
app.get('/api/auth/google/url', googleAuthUrlHandler);

// Google OAuth callback endpoint
app.get('/api/auth/google/callback', googleAuthCallbackHandler);

// ✅ Asset handling (must come after all API + root routes)
// For now, we'll handle static assets manually to ensure root route precedence
app.get('/assets/*', async (c) => {
  // This would serve static assets if we had them
  return c.text('Asset serving would go here', 404);
});

// API routes only - no SPA fallback needed since Pages handles frontend routes
console.log("🚀 Worker initialized and Hono app loaded");

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    console.log("🔥 FETCH HANDLER - Incoming request URL:", request.url);
    console.log("🔥 FETCH HANDLER - Request method:", request.method);
    console.log("🔥 FETCH HANDLER - Request path:", new URL(request.url).pathname);
    return app.fetch(request, env, ctx);
  },
};
