
-- Add points transactions for activity history
INSERT INTO points_transactions (user_id, action_type, points_earned, base_points, multiplier, user_level, reference_type) VALUES
-- Andre Millwood transactions
(1, 'registration', 100, 100, 1.0, 'premium', 'signup'),
(1, 'share', 45, 30, 1.5, 'premium', 'content_share'),
(1, 'external_move', 150, 100, 1.5, 'premium', 'external_action'),
(1, 'drop_completion', 125, 125, 1.0, 'premium', 'drop_reward'),

-- David Tech transactions
(12, 'registration', 100, 100, 1.0, 'super', 'signup'),
(12, 'share', 60, 30, 2.0, 'super', 'content_share'),
(12, 'external_move', 200, 100, 2.0, 'super', 'external_action'),
(12, 'drop_completion', 150, 150, 1.0, 'super', 'drop_reward'),
(12, 'content_shared', 22, 22, 1.0, 'super', 'content_creator_reward'),

-- Luna Style transactions
(13, 'registration', 100, 100, 1.0, 'premium', 'signup'),
(13, 'share', 45, 30, 1.5, 'premium', 'content_share'),
(13, 'external_move', 180, 120, 1.5, 'premium', 'external_action'),
(13, 'drop_completion', 75, 75, 1.0, 'premium', 'drop_reward'),

-- Jake Gaming transactions
(14, 'registration', 100, 100, 1.0, 'super', 'signup'),
(14, 'share', 80, 40, 2.0, 'super', 'content_share'),
(14, 'external_move', 240, 120, 2.0, 'super', 'external_action'),
(14, 'advertiser_bonus', 500, 500, 1.0, 'super', 'advertiser_reward'),

-- Emma Wilson transactions
(15, 'registration', 100, 100, 1.0, 'premium', 'signup'),
(15, 'share', 45, 30, 1.5, 'premium', 'content_share'),
(15, 'external_move', 150, 100, 1.5, 'premium', 'external_action'),
(15, 'drop_completion', 200, 200, 1.0, 'premium', 'drop_reward'),

-- Robert Enterprise transactions
(16, 'registration', 100, 100, 1.0, 'super', 'signup'),
(16, 'share', 60, 30, 2.0, 'super', 'content_share'),
(16, 'external_move', 200, 100, 2.0, 'super', 'external_action'),
(16, 'advertiser_bonus', 400, 400, 1.0, 'super', 'advertiser_reward'),

-- Sarah Chen transactions
(17, 'registration', 100, 100, 1.0, 'premium', 'signup'),
(17, 'share', 45, 30, 1.5, 'premium', 'content_share'),
(17, 'external_move', 165, 110, 1.5, 'premium', 'external_action'),
(17, 'drop_completion', 100, 100, 1.0, 'premium', 'drop_reward'),

-- Mike Rodriguez transactions
(18, 'registration', 100, 100, 1.0, 'premium', 'signup'),
(18, 'share', 45, 30, 1.5, 'premium', 'content_share'),
(18, 'external_move', 180, 120, 1.5, 'premium', 'external_action'),
(18, 'advertiser_bonus', 300, 300, 1.0, 'premium', 'advertiser_reward'),

-- Zoe Williams transactions
(19, 'registration', 100, 100, 1.0, 'free', 'signup'),
(19, 'share', 30, 30, 1.0, 'free', 'content_share'),
(19, 'external_move', 100, 100, 1.0, 'free', 'external_action');

-- Add master key activations for active users
INSERT INTO master_key_activations (user_id, activation_date, proof_drops_required, proof_drops_completed, is_activated) VALUES
-- Andre Millwood - activated today
(1, date('now'), 5, 5, true),
-- David Tech - activated today
(12, date('now'), 3, 3, true),
-- Luna Style - activated yesterday
(13, date('now', '-1 day'), 5, 5, true),
-- Jake Gaming - activated today  
(14, date('now'), 3, 3, true),
-- Emma Wilson - activated today
(15, date('now'), 5, 5, true),
-- Robert Enterprise - activated today
(16, date('now'), 3, 3, true),
-- Sarah Chen - working on activation
(17, date('now'), 5, 3, false),
-- Mike Rodriguez - activated today
(18, date('now'), 5, 5, true);

-- Add some currency conversions to show system usage
INSERT INTO currency_conversions (user_id, from_currency, to_currency, from_amount, to_amount, conversion_rate) VALUES
-- Some users converting points to keys
(12, 'points', 'keys', 1500, 3, 500),
(13, 'points', 'keys', 1000, 2, 500),
(14, 'points', 'keys', 2000, 4, 500),
(15, 'gems', 'keys', 6, 3, 2),
(17, 'points', 'keys', 500, 1, 500),
(18, 'gems', 'keys', 4, 2, 2);

-- Add some move transactions to show key earning activity
INSERT INTO move_transactions (user_id, move_type, points_cost, keys_earned, reference_type) VALUES
-- Users performing moves (social actions)
(1, 'share', 8, 3, 'external_content'),
(1, 'comment', 5, 2, 'drop_content'),
(12, 'like', 2, 1, 'user_content'),
(12, 'share', 6, 2, 'external_content'),  -- Super tier discount
(13, 'comment', 4, 2, 'drop_content'),    -- Premium tier discount  
(14, 'repost', 6, 4, 'external_content'), -- Super tier discount
(15, 'save', 2, 1, 'user_content'),       -- Premium tier discount
(17, 'like', 2, 1, 'drop_content'),       -- Premium tier discount
(18, 'share', 6, 3, 'external_content'),  -- Premium tier discount
(19, 'comment', 5, 2, 'user_content');    -- Free tier full cost

-- Add some content shares for engagement
INSERT INTO content_shares (user_id, content_id, platform, share_url, verified_shares, points_earned) VALUES
(12, 1, 'Twitter', 'https://twitter.com/davidtech/status/reshare123', 25, 45),
(13, 2, 'Instagram', 'https://instagram.com/p/lunarepost456', 18, 38),
(15, 3, 'LinkedIn', 'https://linkedin.com/posts/emmawellness-share789', 12, 28),
(17, 4, 'TikTok', 'https://tiktok.com/@sarahcooks/video/duet101', 32, 52),
(19, 1, 'Pinterest', 'https://pinterest.com/pin/zoetech234', 8, 15);

-- Add advertiser inventory for current periods
INSERT INTO advertiser_inventory (advertiser_id, period_type, period_start, period_end, moves_allocated, moves_used, proof_drops_allocated, proof_drops_used, paid_drops_allocated, paid_drops_used) VALUES
-- Current month inventory
(1, 'monthly_sample', date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day'), 50, 8, 5, 1, 0, 0),
(14, 'monthly_sample', date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day'), 50, 12, 5, 2, 0, 0),
(16, 'monthly_sample', date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day'), 50, 15, 5, 2, 0, 0),
(18, 'monthly_sample', date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day'), 50, 10, 5, 2, 0, 0),

-- Current week inventory for premium/super users
(1, 'weekly', date('now', 'weekday 0', '-7 days'), date('now', 'weekday 0', '-1 day'), 200, 45, 15, 3, 8, 1),
(14, 'weekly', date('now', 'weekday 0', '-7 days'), date('now', 'weekday 0', '-1 day'), 500, 120, 25, 8, 15, 2),
(16, 'weekly', date('now', 'weekday 0', '-7 days'), date('now', 'weekday 0', '-1 day'), 500, 95, 25, 6, 15, 2),
(18, 'weekly', date('now', 'weekday 0', '-7 days'), date('now', 'weekday 0', '-1 day'), 200, 68, 15, 5, 8, 2);

-- Add some external moves to show proof system
INSERT INTO external_moves (user_id, move_type, content_platform, content_url, proof_url, proof_type, points_earned, keys_earned, verification_status) VALUES
(12, 'share', 'Twitter', 'https://twitter.com/originalposter/status/123', 'https://twitter.com/davidtech/status/reshare123', 'screenshot', 150, 8, 'verified'),
(13, 'comment', 'Instagram', 'https://instagram.com/p/fashionpost456', 'https://instagram.com/p/fashionpost456/comment789', 'screenshot', 45, 2, 'verified'),
(14, 'repost', 'TikTok', 'https://tiktok.com/@originalgamer/video/123', 'https://tiktok.com/@jakegaming/video/duet456', 'video_link', 240, 12, 'verified'),
(15, 'save', 'Instagram', 'https://instagram.com/p/wellnesspost789', 'https://instagram.com/emmawellness/saved/collections/', 'screenshot', 75, 4, 'verified'),
(17, 'like', 'YouTube', 'https://youtube.com/watch?v=cookingvideo123', 'https://youtube.com/watch?v=cookingvideo123/liked', 'screenshot', 15, 1, 'verified');
