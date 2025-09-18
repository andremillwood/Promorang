
-- Remove all demo content and activities
DELETE FROM drop_applications WHERE drop_id IN (SELECT id FROM drops WHERE creator_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19));
DELETE FROM drops WHERE creator_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM content_pieces WHERE creator_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
DELETE FROM wallets WHERE user_id IN (1, 12, 13, 14, 15, 16, 17, 18, 19);
