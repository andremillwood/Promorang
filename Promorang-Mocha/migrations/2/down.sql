
-- Remove demo task applications
DELETE FROM task_applications WHERE task_id IN (SELECT id FROM tasks WHERE creator_id IN (1, 2, 3, 4, 5));

-- Remove demo transactions
DELETE FROM transactions WHERE user_id IN (1, 2, 3, 4, 5);

-- Remove demo bet participations
DELETE FROM bet_participations WHERE user_id IN (1, 2, 3, 4, 5);

-- Remove demo investments
DELETE FROM content_investments WHERE investor_id IN (1, 2, 3, 4, 5);

-- Remove demo tasks
DELETE FROM tasks WHERE creator_id IN (1, 2, 3, 4, 5);

-- Remove demo social bets
DELETE FROM social_bets WHERE creator_id IN (1, 2, 3, 4, 5);

-- Remove demo content pieces
DELETE FROM content_pieces WHERE creator_id IN (1, 2, 3, 4, 5);

-- Remove demo wallets
DELETE FROM wallets WHERE user_id IN (1, 2, 3, 4, 5);

-- Remove demo users
DELETE FROM users WHERE mocha_user_id IN ('demo_user_1', 'demo_user_2', 'demo_user_3', 'demo_user_4', 'demo_user_5');
