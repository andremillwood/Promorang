CREATE TABLE external_moves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  move_type TEXT NOT NULL,
  content_id INTEGER,
  content_platform TEXT,
  content_url TEXT,
  proof_url TEXT NOT NULL,
  proof_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  keys_earned INTEGER DEFAULT 0,
  verified_at DATETIME,
  verification_status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);