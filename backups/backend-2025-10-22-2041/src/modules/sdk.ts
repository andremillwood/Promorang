import { Context } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { successResponse, errorResponse } from '../middleware/errors';

export async function getSDKDocumentation(c: Context): Promise<Response> {
  try {
    const documentation = {
      name: '@promorang/sdk',
      version: '1.0.0',
      description: 'Official Promorang SDK for developers',
      endpoints: {
        auth: {
          login: 'POST /api/auth/google',
          logout: 'POST /api/auth/logout',
          refresh: 'POST /api/auth/refresh'
        },
        economy: {
          profile: 'GET /api/economy/profile',
          convert: 'POST /api/economy/convert',
          history: 'GET /api/economy/history'
        },
        content: {
          list: 'GET /api/content',
          create: 'POST /api/content',
          buyShares: 'POST /api/content/buy-shares'
        },
        drops: {
          list: 'GET /api/drops',
          apply: 'POST /api/drops/:id/apply',
          applications: 'GET /api/users/drop-applications'
        },
        growth_hub: {
          stake: 'POST /api/users/stake',
          fundingProjects: 'GET /api/funding-projects',
          createProject: 'POST /api/funding-projects'
        },
        leaderboard: {
          rankings: 'GET /api/leaderboard',
          userRank: 'GET /api/leaderboard/rank'
        },
        notifications: {
          list: 'GET /api/notifications',
          markRead: 'POST /api/notifications/read'
        },
        analytics: {
          user: 'GET /api/analytics/user',
          global: 'GET /api/analytics/global'
        }
      },
      authentication: {
        type: 'JWT',
        header: 'Authorization: Bearer <token>',
        cookie: 'pr_token'
      },
      rate_limits: {
        authenticated: '100 requests/minute',
        unauthenticated: '20 requests/minute',
        ai_endpoints: '50 requests/minute'
      },
      examples: {
        javascript: `
import { PromorangSDK } from '@promorang/sdk';

const sdk = new PromorangSDK({
  baseUrl: 'https://api.promorang.co',
  apiKey: 'your_api_key' // For partner integrations
});

async function example() {
  // Get user profile
  const profile = await sdk.economy.getProfile();

  // Stake gems
  await sdk.growthHub.stake({
    amount: 100,
    channel: 'MediumRisk'
  });

  // Get recommendations
  const recommendations = await sdk.ai.getRecommendations({
    type: 'content',
    limit: 10
  });
}
        `,
        typescript: `
import { PromorangSDK, UserProfile, StakeParams } from '@promorang/sdk';

const sdk = new PromorangSDK({
  baseUrl: 'https://api.promorang.co'
});

interface CustomAnalytics extends UserProfile {
  customField: string;
}

async function getCustomAnalytics(): Promise<CustomAnalytics> {
  const response = await fetch('/api/analytics/user', {
    headers: {
      'Authorization': 'Bearer ' + sdk.getAuthToken()
    }
  });

  return response.json();
}
        `
      }
    };

    return successResponse(c, documentation);
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function generateSDKClient(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const { language = 'javascript', framework = 'vanilla' } = body;

    const sdkCode = generateSDKCode(language, framework);

    return successResponse(c, {
      language,
      framework,
      code: sdkCode,
      instructions: getSDKInstructions(language, framework)
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

export async function validateSDKUsage(c: Context): Promise<Response> {
  try {
    const apiKey = c.req.header('X-API-Key');

    if (!apiKey) {
      return errorResponse(c, new Error('API key required for SDK validation'), 401);
    }

    const db: D1Database = c.env.DB;

    // Validate API key and get partner info
    const partner = await db.prepare(
      `SELECT pa.*, u.name as partner_name
       FROM partner_apps pa
       JOIN users u ON pa.partner_id = u.id
       WHERE pa.api_key_hash = ? AND pa.status = 'approved'`
    ).bind(await hashApiKey(apiKey)).first();

    if (!partner) {
      return errorResponse(c, new Error('Invalid API key'), 401);
    }

    // Track SDK usage
    await db.prepare(
      `INSERT INTO partner_usage (partner_id, endpoint, request_count, status_code)
       VALUES (?, ?, ?, ?)`
    ).bind(partner.partner_id, 'sdk_validate', 1, 200).run();

    return successResponse(c, {
      valid: true,
      partner: {
        name: partner.partner_name,
        app_name: partner.app_name,
        permissions: JSON.parse(partner.permissions || '[]')
      }
    });
  } catch (error) {
    return errorResponse(c, error as Error);
  }
}

// Helper functions
function generateSDKCode(language: string, framework: string): string {
  const templates = {
    javascript: {
      vanilla: `
import { PromorangSDK } from '@promorang/sdk';

class PromorangClient {
  constructor(config) {
    this.sdk = new PromorangSDK(config);
  }

  async getProfile() {
    return await this.sdk.economy.getProfile();
  }

  async stakeGems(amount, channel) {
    return await this.sdk.growthHub.stake({ amount, channel });
  }

  async getLeaderboard() {
    return await this.sdk.leaderboard.getRankings();
  }
}

export { PromorangClient };
      `,
      react: `
import { usePromorangSDK } from '@promorang/react-sdk';
import { useEffect, useState } from 'react';

function PromorangComponent() {
  const { sdk, loading, error } = usePromorangSDK({
    apiKey: process.env.REACT_APP_PROMORANG_API_KEY
  });

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (sdk) {
      sdk.economy.getProfile().then(setProfile);
    }
  }, [sdk]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Welcome, {profile?.name}!</div>;
}
      `
    },
    typescript: {
      vanilla: `
import { PromorangSDK, EconomyAPI, GrowthHubAPI } from '@promorang/sdk';

interface PromorangConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

class PromorangService {
  private sdk: PromorangSDK;

  constructor(config: PromorangConfig) {
    this.sdk = new PromorangSDK(config);
  }

  async getUserProfile(): Promise<UserProfile> {
    return await this.sdk.economy.getProfile();
  }

  async createStaking(amount: number, channel: string): Promise<StakeResult> {
    return await this.sdk.growthHub.stake({ amount, channel });
  }
}

export { PromorangService };
      `
    }
  };

  return templates[language as keyof typeof templates]?.[framework as keyof typeof templates[typeof language]] || templates.javascript.vanilla;
}

function getSDKInstructions(language: string, framework: string): string {
  const instructions = {
    javascript: {
      vanilla: `
1. Install: npm install @promorang/sdk
2. Import: import { PromorangSDK } from '@promorang/sdk';
3. Initialize: const sdk = new PromorangSDK({ baseUrl: 'https://api.promorang.co' });
4. Authenticate: sdk.authenticate('your_jwt_token');
5. Use: await sdk.economy.getProfile();
      `,
      react: `
1. Install: npm install @promorang/react-sdk
2. Wrap app: import { PromorangProvider } from '@promorang/react-sdk';
3. Use hook: const { sdk } = usePromorangSDK({ apiKey: 'your_key' });
4. Access data: await sdk.economy.getProfile();
      `
    },
    typescript: {
      vanilla: `
1. Install: npm install @promorang/sdk
2. Import types: import { PromorangSDK, UserProfile } from '@promorang/sdk';
3. Use with types: const profile: UserProfile = await sdk.economy.getProfile();
4. Error handling: try/catch with typed errors
      `
    }
  };

  return instructions[language as keyof typeof instructions]?.[framework as keyof typeof instructions[typeof language]] || instructions.javascript.vanilla;
}

async function hashApiKey(apiKey: string): Promise<string> {
  // Simple hash for demo - use proper crypto in production
  return btoa(apiKey).slice(0, 32);
}
