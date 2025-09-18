
-- Remove demo social forecasts
DELETE FROM social_forecasts WHERE content_url LIKE '%demo%';

-- Remove demo tasks  
DELETE FROM tasks WHERE title LIKE '%[Demo]%';

-- Remove demo drops
DELETE FROM drops WHERE title LIKE '%[Demo]%';

-- Remove demo content pieces
DELETE FROM content_pieces WHERE title LIKE '%[Demo]%';
