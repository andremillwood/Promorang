import { z } from 'zod';

// User profile update schema
export const UpdateProfileRequestSchema = z.object({
  username: z.string().optional(),
  display_name: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  banner_url: z.string().optional(),
  website_url: z.string().optional(),
  social_links: z.string().optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

// Drop creation schema (NEW ECONOMY)
export const CreateDropRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  drop_type: z.string(),
  difficulty: z.string(),
  key_cost: z.number().min(0),
  gem_reward_base: z.number().min(0),
  gem_pool_total: z.number().optional(),
  reward_logic: z.string().optional(),
  follower_threshold: z.number().min(0).default(0),
  time_commitment: z.string().optional(),
  requirements: z.string().optional(),
  deliverables: z.string().optional(),
  deadline_at: z.string().optional(),
  max_participants: z.number().optional(),
  platform: z.string().optional(),
  content_url: z.string().optional(),
  move_cost_points: z.number().min(0).default(0),
  key_reward_amount: z.number().min(0).default(0),
  is_proof_drop: z.boolean().default(false),
  is_paid_drop: z.boolean().default(false),
});

export type CreateDropRequest = z.infer<typeof CreateDropRequestSchema>;

// Drop application schema (NEW ECONOMY)
export const ApplyToDropRequestSchema = z.object({
  application_message: z.string(),
});

export type ApplyToDropRequest = z.infer<typeof ApplyToDropRequestSchema>;

// Social action schema
export const SocialActionRequestSchema = z.object({
  action_type: z.enum(['like', 'comment', 'save', 'share', 'repost']),
  reference_id: z.number().optional(),
  reference_type: z.string().optional(),
});

export type SocialActionRequest = z.infer<typeof SocialActionRequestSchema>;

// Currency conversion schema
export const ConvertCurrencyRequestSchema = z.object({
  from_currency: z.enum(['points', 'gems']),
  to_currency: z.enum(['keys']),
  amount: z.number().min(1),
});

export type ConvertCurrencyRequest = z.infer<typeof ConvertCurrencyRequestSchema>;

// Master key activation schema
export const ActivateMasterKeyRequestSchema = z.object({
  date: z.string().optional(),
});

export type ActivateMasterKeyRequest = z.infer<typeof ActivateMasterKeyRequestSchema>;

// Withdrawal request schema
export const CreateWithdrawalRequestSchema = z.object({
  amount: z.number().min(200),
  payment_method: z.string(),
  payment_details: z.record(z.any()),
});

export type CreateWithdrawalRequest = z.infer<typeof CreateWithdrawalRequestSchema>;

// Payment preference schema
export const SavePaymentPreferenceRequestSchema = z.object({
  payment_method: z.string(),
  preference_data: z.record(z.any()),
  is_default: z.boolean().optional(),
});

export type SavePaymentPreferenceRequest = z.infer<typeof SavePaymentPreferenceRequestSchema>;

// Gem purchase schema
export const CreateGemPurchaseRequestSchema = z.object({
  package_id: z.string(),
  gems: z.number().min(1),
  price: z.number().min(0.01),
});

export type CreateGemPurchaseRequest = z.infer<typeof CreateGemPurchaseRequestSchema>;

// Social forecast creation schema (NEW)
export const CreateSocialForecastRequestSchema = z.object({
  content_id: z.number().optional(),
  platform: z.string(),
  content_url: z.string(),
  forecast_type: z.enum(['views', 'likes', 'shares', 'comments']),
  target_value: z.number().min(1),
  odds: z.number().min(1),
  expires_at: z.string(),
  initial_amount: z.number().min(1),
  initial_side: z.enum(['over', 'under']),
});

export type CreateSocialForecastRequest = z.infer<typeof CreateSocialForecastRequestSchema>;

// Place forecast prediction schema (UPDATED)
export const PlaceForecastRequestSchema = z.object({
  prediction_amount: z.number().min(1),
  prediction_side: z.enum(['over', 'under']),
});

export type PlaceForecastRequest = z.infer<typeof PlaceForecastRequestSchema>;

// Social betting schemas (LEGACY - keeping for backward compatibility)
export const CreateSocialBetRequestSchema = z.object({
  platform: z.string(),
  content_url: z.string(),
  bet_type: z.enum(['views', 'likes', 'shares', 'comments']),
  target_value: z.number().min(1),
  odds: z.number().min(1),
  expires_at: z.string(),
});

export type CreateSocialBetRequest = z.infer<typeof CreateSocialBetRequestSchema>;

export const PlaceBetRequestSchema = z.object({
  bet_amount: z.number().min(1),
  bet_side: z.enum(['over', 'under']),
});

export type PlaceBetRequest = z.infer<typeof PlaceBetRequestSchema>;

// ===== TYPE DEFINITIONS FOR FRONTEND =====

export interface UserType {
  id: number;
  mocha_user_id: string;
  email: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  website_url?: string;
  social_links?: string;
  user_type: string;
  xp_points: number;
  level: number;
  referral_code: string;
  referred_by?: string;
  follower_count: number;
  following_count: number;
  total_earnings_usd: number;
  promogem_balance: number;
  points_balance: number;
  keys_balance: number;
  gems_balance: number;
  gold_collected: number;
  user_tier: string;
  points_streak_days: number;
  last_activity_date?: string;
  master_key_activated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletType {
  id: number;
  user_id: number;
  currency_type: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionType {
  id: number;
  user_id: number;
  transaction_type: string;
  amount: number;
  currency_type: string;
  status: string;
  reference_id?: number;
  reference_type?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskType {
  id: number;
  creator_id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  reward_amount: number;
  currency_type: string;
  follower_threshold: number;
  time_commitment?: string;
  requirements?: string;
  deliverables?: string;
  deadline_at?: string;
  max_participants?: number;
  current_participants: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DropType {
  id: number;
  creator_id: number;
  creator_name?: string;
  creator_avatar?: string;
  title: string;
  description: string;
  drop_type: string;
  difficulty: string;
  key_cost: number;
  gem_reward_base: number;
  gem_pool_total: number;
  gem_pool_remaining: number;
  reward_logic?: string;
  follower_threshold: number;
  time_commitment?: string;
  requirements?: string;
  deliverables?: string;
  deadline_at?: string;
  max_participants?: number;
  current_participants: number;
  status: string;
  platform?: string;
  content_url?: string;
  move_cost_points: number;
  key_reward_amount: number;
  is_proof_drop: boolean;
  is_paid_drop: boolean;
  created_at: string;
  updated_at: string;
}

export interface DropApplicationType {
  id: number;
  drop_id: number;
  user_id: number;
  status: string;
  application_message?: string;
  submission_url?: string;
  submission_notes?: string;
  review_score?: number;
  gems_earned: number;
  applied_at: string;
  completed_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPieceType {
  id: number;
  creator_id: number;
  creator_username?: string;
  creator_name?: string;
  creator_avatar?: string;
  platform: string;
  platform_url: string;
  title: string;
  description?: string;
  media_url?: string;
  total_shares: number;
  available_shares: number;
  engagement_shares_total: number;
  engagement_shares_remaining: number;
  share_price: number;
  current_revenue: number;
  performance_metrics?: string;
  created_at: string;
  updated_at: string;
}

export interface MasterKeyActivationType {
  id: number;
  user_id: number;
  activation_date: string;
  proof_drops_required: number;
  proof_drops_completed: number;
  is_activated: boolean;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalMethodType {
  id: number;
  method_name: string;
  display_name: string;
  min_amount: number;
  fee_percentage: number;
  processing_time: string;
  is_active: boolean;
  required_fields: string;
  created_at: string;
}

export interface UserPaymentPreferenceType {
  id: number;
  user_id: number;
  payment_method: string;
  is_default: boolean;
  preference_data: string;
  created_at: string;
  updated_at: string;
}

export interface AdvertiserAnalyticsType {
  id: number;
  advertiser_id: number;
  period_start: string;
  period_end: string;
  drops_created: number;
  total_participants: number;
  gems_spent: number;
  conversions: number;
  impressions: number;
  engagement_rate: number;
  created_at: string;
}

// Schema enums for form validation
export const PlatformSchema = z.enum(['instagram', 'tiktok', 'youtube', 'twitter']);
export const DropTypeSchema = z.enum(['content_clipping', 'reviews', 'ugc_creation', 'affiliate_referral', 'surveys', 'challenges_events', 'engagement']);
export const DropDifficultySchema = z.enum(['easy', 'medium', 'hard']);
export const TaskCategorySchema = z.enum(['social_media', 'content_creation', 'marketing', 'review', 'survey']);
export const TaskDifficultySchema = z.enum(['easy', 'medium', 'hard']);

// Legacy type aliases for backward compatibility
export type CreateDropRequestType = CreateDropRequest;
export type CreateTaskRequestType = CreateTaskRequest;
export type UpdateProfileRequestType = UpdateProfileRequest;

// Content creation schema
export const CreateContentRequestSchema = z.object({
  platform: z.enum(['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin']),
  title: z.string().min(1),
  description: z.string().optional(),
  platform_url: z.string().url(),
  media_url: z.string().optional(),
  total_shares: z.number().min(1).max(1000),
  share_price: z.number().min(0),
});

export type CreateContentRequest = z.infer<typeof CreateContentRequestSchema>;

// Content investment schema
export const BuySharesRequestSchema = z.object({
  content_id: z.number(),
  shares_count: z.number().min(1),
});

export type BuySharesRequest = z.infer<typeof BuySharesRequestSchema>;

// Legacy task schemas (for backward compatibility)
export const CreateTaskRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  reward_amount: z.number().min(0),
  currency_type: z.string().default('USD'),
  follower_threshold: z.number().min(0).default(0),
  time_commitment: z.string().optional(),
  requirements: z.string().optional(),
  deliverables: z.string().optional(),
  deadline_at: z.string().optional(),
  max_participants: z.number().optional(),
});

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

export const ApplyToTaskRequestSchema = z.object({
  application_message: z.string(),
});

export type ApplyToTaskRequest = z.infer<typeof ApplyToTaskRequestSchema>;
