
-- Revert media URLs to null
UPDATE content_pieces SET media_url = NULL WHERE id IN (1,2,3,4,5,6,7);
