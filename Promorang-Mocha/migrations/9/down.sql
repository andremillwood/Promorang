
-- Remove the new demo users
DELETE FROM users WHERE mocha_user_id IN ('demo_user_6', 'demo_user_7', 'demo_user_8', 'demo_user_9', 'demo_user_10');

-- Revert original demo user data
UPDATE users SET 
  points_balance = 2847,
  keys_balance = 23,
  gems_balance = 156.0,
  gold_collected = 0,
  last_activity_date = null,
  points_streak_days = 18,
  user_tier = 'premium'
WHERE username = 'sarahcreates';

UPDATE users SET 
  points_balance = 3562,
  keys_balance = 45,
  gems_balance = 234.0,
  gold_collected = 0,
  last_activity_date = null,
  points_streak_days = 25,
  user_tier = 'super'
WHERE username = 'mikeviral';

UPDATE users SET 
  points_balance = 2134,
  keys_balance = 28,
  gems_balance = 112.0,
  gold_collected = 0,
  last_activity_date = null,
  points_streak_days = 15,
  user_tier = 'premium'
WHERE username = 'emmafitness';

UPDATE users SET 
  points_balance = 1923,
  keys_balance = 31,
  gems_balance = 89.0,
  gold_collected = 0,
  last_activity_date = null,
  points_streak_days = 12,
  user_tier = 'free'
WHERE username = 'alexbrands';

UPDATE users SET 
  points_balance = 2789,
  keys_balance = 35,
  gems_balance = 178.0,
  gold_collected = 0,
  last_activity_date = null,
  points_streak_days = 22,
  user_tier = 'premium'
WHERE username = 'zoedance';
