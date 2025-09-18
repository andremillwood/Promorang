
-- Remove all additional demo data
DELETE FROM content_investments WHERE investor_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM user_level_upgrades WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM transactions WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19) AND reference_type NOT IN ('bank_transfer', 'investment');
DELETE FROM bet_participations WHERE bet_id IN (SELECT id FROM social_bets WHERE creator_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19));
DELETE FROM social_bets WHERE creator_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM instagram_registrations WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM social_connections WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
