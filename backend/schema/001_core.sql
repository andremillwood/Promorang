CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_sub TEXT UNIQUE,
  email TEXT,
  name TEXT,
  picture TEXT,
  tier TEXT DEFAULT 'free',
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS balances (
  user_id TEXT PRIMARY KEY,
  points INTEGER DEFAULT 0,
  keys   INTEGER DEFAULT 0,
  gems   INTEGER DEFAULT 0,
  gold   INTEGER DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  ts INTEGER NOT NULL,
  type TEXT NOT NULL,
  delta_points INTEGER DEFAULT 0,
  delta_keys   INTEGER DEFAULT 0,
  delta_gems   INTEGER DEFAULT 0,
  delta_gold   INTEGER DEFAULT 0,
  ref TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
