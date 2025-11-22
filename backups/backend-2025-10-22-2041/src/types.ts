// Backend types for Phase 2

export interface User {
  id: string;
  google_sub: string;
  email: string;
  name: string;
  picture?: string;
  tier: 'free' | 'premium' | 'super';
  user_type: 'creator' | 'advertiser';
  level: number;
  points_streak_days: number;
  daily_keys_converted: number;
  last_conversion_date?: string;
  created_at: number;
  updated_at: number;
}

export interface Balances {
  user_id: string;
  points: number;
  keys: number;
  gems: number;
  gold: number;
}

export interface EconomyProfile {
  points: number;
  keys: number;
  gems: number;
  gold: number;
  level: number;
  tier: 'free' | 'premium' | 'super';
  streak: number;
  multiplier: number;
}

export interface Transaction {
  id: number;
  user_id: string;
  transaction_type: 'earn' | 'spend' | 'convert' | 'withdraw';
  currency_type: 'points' | 'keys' | 'gems' | 'gold';
  amount: number;
  description: string;
  created_at: string;
}

export interface Content {
  id: number;
  creator_id: string;
  title: string;
  description?: string;
  platform: string;
  platform_url?: string;
  image_url?: string;
  share_price: number;
  total_shares: number;
  available_shares: number;
  current_revenue: number;
  created_at: string;
}

export interface ContentShare {
  id: number;
  content_id: number;
  buyer_id: string;
  shares_count: number;
  price_each: number;
  created_at: string;
}

export interface Drop {
  id: number;
  creator_id: string;
  title: string;
  description?: string;
  drop_type: 'proof_of_work' | 'paid_promotion';
  difficulty?: 'easy' | 'medium' | 'hard';
  platform?: string;
  content_url?: string;
  reward_points: number;
  reward_keys: number;
  reward_gems: number;
  max_participants?: number;
  deadline_at?: string;
  status: 'active' | 'completed' | 'expired';
  created_at: string;
}

export interface DropApplication {
  id: number;
  drop_id: number;
  user_id: string;
  submission_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

// API Response shapes
export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Request payloads
export interface ConvertCurrencyRequest {
  from: 'points' | 'keys' | 'gems';
  to: 'points' | 'keys' | 'gems';
  amount: number;
}

export interface CreateContentRequest {
  title: string;
  description?: string;
  platform: string;
  platform_url?: string;
  image_url?: string;
  total_shares?: number;
  share_price?: number;
}

export interface BuySharesRequest {
  content_id: number;
  shares_count: number;
}

export interface ApplyToDropRequest {
  submission_url?: string;
}

// Tier multipliers
export const TIER_MULTIPLIERS: Record<string, number> = {
  free: 1.0,
  premium: 1.5,
  super: 2.0,
};

// Conversion rates
export const CONVERSION_RATES = {
  POINTS_TO_KEYS: 500, // 500 points = 1 key
  DAILY_KEY_LIMIT: 3,  // Max 3 keys per day
};
