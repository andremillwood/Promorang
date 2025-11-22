
-- Remove demo transactions and applications
DELETE FROM currency_conversions WHERE user_id IN (SELECT id FROM users WHERE username IN ('sarahcreates', 'techguru', 'gamerpro'));
DELETE FROM points_transactions WHERE user_id IN (SELECT id FROM users WHERE username IN ('sarahcreates', 'techguru', 'foodielove', 'gamerpro', 'fashionista', 'mikeviral'));
DELETE FROM drop_applications WHERE user_id IN (SELECT id FROM users WHERE username IN ('sarahcreates', 'gamerpro', 'techguru', 'emmafitness'));
