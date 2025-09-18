
-- Create comments table for content pieces
CREATE TABLE content_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  comment_text TEXT NOT NULL,
  parent_comment_id INTEGER,
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user likes tracking table
CREATE TABLE user_content_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

-- Create user saves/bookmarks table
CREATE TABLE user_saved_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_id)
);

-- Create indexes for performance
CREATE INDEX idx_content_comments_content_id ON content_comments(content_id);
CREATE INDEX idx_content_comments_user_id ON content_comments(user_id);
CREATE INDEX idx_content_comments_parent ON content_comments(parent_comment_id);
CREATE INDEX idx_user_content_likes_content ON user_content_likes(content_id);
CREATE INDEX idx_user_saved_content_user ON user_saved_content(user_id);
