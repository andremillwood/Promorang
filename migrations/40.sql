
ALTER TABLE users ADD COLUMN brand_name TEXT;
ALTER TABLE users ADD COLUMN brand_logo_url TEXT;
ALTER TABLE users ADD COLUMN brand_description TEXT;
ALTER TABLE users ADD COLUMN brand_website TEXT;
ALTER TABLE users ADD COLUMN brand_email TEXT;
ALTER TABLE users ADD COLUMN brand_phone TEXT;

-- Wallet balances for in-app currencies
CREATE TABLE IF NOT EXISTS wallets_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  keys INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallets_balances_user_id ON wallets_balances(user_id);
