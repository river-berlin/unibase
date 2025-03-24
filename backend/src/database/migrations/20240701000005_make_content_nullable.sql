-- migrate:up
-- Create a new table with content as nullable
CREATE TABLE messages_new (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT, -- Removed NOT NULL constraint
  tool_calls TEXT,
  tool_call_id TEXT,
  tool_output TEXT,
  input_tokens_used INTEGER,
  output_tokens_used INTEGER,
  error TEXT,
  object_id TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Copy data from the old table to the new one
INSERT INTO messages_new
SELECT * FROM messages;

-- Drop the old table
DROP TABLE messages;

-- Rename the new table to messages
ALTER TABLE messages_new RENAME TO messages;

-- Recreate indexes
CREATE INDEX messages_conversation_id_idx ON messages (conversation_id);
CREATE INDEX messages_role_idx ON messages (role);
CREATE INDEX messages_created_by_idx ON messages (created_by);
CREATE INDEX messages_object_id_idx ON messages (object_id);

-- migrate:down
-- Create a new table with content as NOT NULL
CREATE TABLE messages_new (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL, -- Added back NOT NULL constraint
  tool_calls TEXT,
  tool_call_id TEXT,
  tool_output TEXT,
  input_tokens_used INTEGER,
  output_tokens_used INTEGER,
  error TEXT,
  object_id TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Copy data from the old table to the new one
INSERT INTO messages_new
SELECT * FROM messages;

-- Drop the old table
DROP TABLE messages;

-- Rename the new table to messages
ALTER TABLE messages_new RENAME TO messages;

-- Recreate indexes
CREATE INDEX messages_conversation_id_idx ON messages (conversation_id);
CREATE INDEX messages_role_idx ON messages (role);
CREATE INDEX messages_created_by_idx ON messages (created_by);
CREATE INDEX messages_object_id_idx ON messages (object_id); 