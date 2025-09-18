
-- Remove additional demo data
DELETE FROM content_shares WHERE user_id IN (SELECT id FROM users WHERE username IN ('fashionista', 'bizboss', 'emmafitness'));
DELETE FROM external_moves WHERE user_id IN (SELECT id FROM users WHERE username IN ('sarahcreates', 'techguru', 'gamerpro'));
DELETE FROM advertiser_inventory WHERE advertiser_id IN (SELECT id FROM users WHERE username IN ('mikeviral', 'bizboss', 'alexbrands'));

-- Reset drop participation counts
UPDATE drops SET current_participants = 0;
