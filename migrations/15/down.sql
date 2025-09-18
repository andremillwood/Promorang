
-- Remove all demo activity data
DELETE FROM external_moves WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM advertiser_inventory WHERE advertiser_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM content_shares WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM move_transactions WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM currency_conversions WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM master_key_activations WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM points_transactions WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
