
DROP INDEX idx_sponsored_content_content_id;
DROP INDEX idx_sponsored_content_expires_at;
ALTER TABLE sponsored_content DROP COLUMN advertiser_name;
ALTER TABLE sponsored_content DROP COLUMN duration_hours;
ALTER TABLE sponsored_content DROP COLUMN expires_at;
