
-- Remove demo external moves
DELETE FROM external_moves WHERE proof_url LIKE '%demo%';

-- Remove demo currency conversions
DELETE FROM currency_conversions WHERE user_id = 1;

-- Remove demo master key activations
DELETE FROM master_key_activations WHERE user_id IN (1, 2, 3);

-- Remove demo user achievements
DELETE FROM user_achievements WHERE user_id = 1;

-- Remove demo achievements
DELETE FROM achievements WHERE name LIKE '%[Demo]%' OR name IN ('First Steps', 'Social Butterfly', 'Content Creator');

-- Remove demo points transactions
DELETE FROM points_transactions WHERE user_id = 1;

-- Remove demo transactions
DELETE FROM transactions WHERE description LIKE '%[Demo]%';

-- Remove demo wallets
DELETE FROM wallets WHERE user_id = 1;

-- Remove demo task applications
DELETE FROM task_applications WHERE task_id IN (SELECT id FROM tasks WHERE title LIKE '%[Demo]%');

-- Remove demo drop applications
DELETE FROM drop_applications WHERE drop_id IN (SELECT id FROM drops WHERE title LIKE '%[Demo]%');
