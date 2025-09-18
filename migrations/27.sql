
CREATE TABLE pending_gem_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  package_id TEXT NOT NULL,
  gems_amount INTEGER NOT NULL,
  price_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pending_gem_purchases_user_id ON pending_gem_purchases(user_id);
CREATE INDEX idx_pending_gem_purchases_stripe_session_id ON pending_gem_purchases(stripe_session_id);
