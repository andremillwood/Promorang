
-- Drop new indexes
DROP INDEX IF EXISTS idx_master_key_user_date;
DROP INDEX IF EXISTS idx_currency_conversions_user;
DROP INDEX IF EXISTS idx_points_transactions_user;
DROP INDEX IF EXISTS idx_drops_status;
DROP INDEX IF EXISTS idx_drops_type;
DROP INDEX IF EXISTS idx_leaderboard_period;

-- Drop new tables
DROP TABLE IF EXISTS master_key_activations;
DROP TABLE IF EXISTS currency_conversions;
DROP TABLE IF EXISTS points_transactions;
DROP TABLE IF EXISTS drop_applications;
DROP TABLE IF EXISTS drops;
DROP TABLE IF EXISTS leaderboard_scores;

-- Remove new columns from users table
ALTER TABLE users DROP COLUMN last_activity_date;
ALTER TABLE users DROP COLUMN points_streak_days;
ALTER TABLE users DROP COLUMN user_tier;
ALTER TABLE users DROP COLUMN gold_collected;
ALTER TABLE users DROP COLUMN master_key_activated_at;
ALTER TABLE users DROP COLUMN keys_balance;
ALTER TABLE users DROP COLUMN points_balance;
ALTER TABLE users DROP COLUMN gems_balance;
