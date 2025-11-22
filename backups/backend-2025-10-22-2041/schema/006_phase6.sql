-- Phase 6: AI, Partner SDK, Scalability & Data Warehouse
-- Safe to run multiple times

-- AI Sessions for tracking AI interactions
CREATE TABLE IF NOT EXISTS ai_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  session_type TEXT NOT NULL, -- recommendation | analysis | forecast | assistant
  prompt TEXT NOT NULL,
  response TEXT,
  context_data JSON,
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT, -- gpt-4 | claude-3 | gemini-pro
  accuracy_score REAL DEFAULT 0.0, -- User feedback 0-1
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Partner applications and integrations
CREATE TABLE IF NOT EXISTS partner_apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  app_description TEXT,
  app_url TEXT,
  webhook_url TEXT,
  api_key_hash TEXT,
  permissions TEXT, -- comma-separated: read_economy, write_content, etc.
  status TEXT DEFAULT 'pending', -- pending | approved | rejected | suspended
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,
  approved_by TEXT,
  FOREIGN KEY (partner_id) REFERENCES users(id)
);

-- Partner API usage tracking
CREATE TABLE IF NOT EXISTS partner_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  usage_date DATE DEFAULT CURRENT_DATE,
  response_time_ms INTEGER,
  status_code INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES users(id)
);

-- Regional data partitioning (users by region)
CREATE TABLE IF NOT EXISTS users_us (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  picture TEXT,
  tier TEXT DEFAULT 'free',
  level INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users_caribbean (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  picture TEXT,
  tier TEXT DEFAULT 'free',
  level INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analytics data warehouse (for BI export)
CREATE TABLE IF NOT EXISTS analytics_warehouse (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_date DATE NOT NULL,
  metric_type TEXT NOT NULL, -- dau | transactions | revenue | staking
  region TEXT DEFAULT 'global',
  value REAL NOT NULL,
  metadata JSON, -- Additional context
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Assistant chat sessions
CREATE TABLE IF NOT EXISTS assistant_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  messages JSON, -- Array of {role: "user" | "assistant", content: string, timestamp: string}
  context_memory JSON, -- Persistent context across sessions
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Webhook events for partner integrations
CREATE TABLE IF NOT EXISTS webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- content_created | drop_completed | staking_reward
  event_data JSON,
  webhook_url TEXT,
  delivery_status TEXT DEFAULT 'pending', -- pending | delivered | failed
  delivery_attempts INTEGER DEFAULT 0,
  last_delivery_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES users(id)
);

-- Content recommendations cache
CREATE TABLE IF NOT EXISTS content_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  recommendation_score REAL NOT NULL,
  recommendation_reason TEXT,
  ai_model_used TEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Performance indices for Phase 6 queries
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_type ON ai_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_created ON ai_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_apps_partner ON partner_apps(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_apps_status ON partner_apps(status);
CREATE INDEX IF NOT EXISTS idx_partner_apps_approved ON partner_apps(approved_at);

CREATE INDEX IF NOT EXISTS idx_partner_usage_partner ON partner_usage(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_usage_date ON partner_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_partner_usage_endpoint ON partner_usage(endpoint);

CREATE INDEX IF NOT EXISTS idx_analytics_warehouse_date ON analytics_warehouse(metric_date);
CREATE INDEX IF NOT EXISTS idx_analytics_warehouse_type ON analytics_warehouse(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_warehouse_region ON analytics_warehouse(region);

CREATE INDEX IF NOT EXISTS idx_assistant_sessions_user ON assistant_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_sessions_session ON assistant_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_assistant_sessions_updated ON assistant_sessions(updated_at);

CREATE INDEX IF NOT EXISTS idx_webhook_events_partner ON webhook_events(partner_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(delivery_status);

CREATE INDEX IF NOT EXISTS idx_content_recommendations_user ON content_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_recommendations_score ON content_recommendations(recommendation_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_recommendations_expires ON content_recommendations(expires_at);
