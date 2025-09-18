
-- Revert Andre Millwood's profile to original state
UPDATE users SET 
  username = null,
  bio = null,
  user_tier = 'free',
  user_type = 'regular',
  points_balance = 7,
  keys_balance = 0,
  gems_balance = 0.0,
  gold_collected = 0,
  level = 1,
  xp_points = 0,
  follower_count = 0,
  following_count = 0,
  total_earnings_usd = 0.0,
  points_streak_days = 1,
  last_activity_date = '2025-09-11',
  website_url = null,
  social_links = null,
  banner_url = null
WHERE id = 1;

-- Remove all demo users
DELETE FROM users WHERE mocha_user_id LIKE 'demo_%';
