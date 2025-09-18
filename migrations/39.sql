
-- Add time-based sponsorship support and multiple sponsors
ALTER TABLE sponsored_content ADD COLUMN expires_at DATETIME;
ALTER TABLE sponsored_content ADD COLUMN duration_hours INTEGER DEFAULT 24;
ALTER TABLE sponsored_content ADD COLUMN advertiser_name TEXT;

-- Update existing sponsorships to have default expiration
UPDATE sponsored_content 
SET expires_at = datetime(created_at, '+24 hours'),
    duration_hours = 24
WHERE expires_at IS NULL;

-- Create index for efficient sponsor lookup
CREATE INDEX idx_sponsored_content_expires_at ON sponsored_content(expires_at);
CREATE INDEX idx_sponsored_content_content_id ON sponsored_content(content_id);
