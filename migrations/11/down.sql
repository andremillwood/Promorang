
-- Remove demo content and drops
DELETE FROM drops WHERE creator_id IN (SELECT id FROM users WHERE username IN ('mikeviral', 'bizboss'));
DELETE FROM content_pieces WHERE creator_id IN (SELECT id FROM users WHERE username IN ('techguru', 'fashionista', 'gamerpro', 'emmafitness', 'bizboss'));
