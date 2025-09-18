
-- Remove new columns from social_bets
ALTER TABLE social_bets DROP COLUMN creator_initial_amount;
ALTER TABLE social_bets DROP COLUMN creator_side;
ALTER TABLE social_bets DROP COLUMN content_id;

-- Drop new tables
DROP TABLE forecast_participations;
DROP TABLE social_forecasts;
