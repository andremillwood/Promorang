
-- Remove the test data we added
DELETE FROM drops WHERE id IN (1, 2, 3, 4);
DELETE FROM users WHERE mocha_user_id IN ('user1_mocha', 'user2_mocha', 'user3_mocha', 'user4_mocha', 'user5_mocha');
