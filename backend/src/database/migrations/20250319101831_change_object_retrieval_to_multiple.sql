-- migrate:up
ALTER TABLE objects ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE CASCADE;

-- Create new table without object_id
CREATE TABLE messages_new (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT,
    content TEXT,
    tool_calls TEXT,
    tool_call_id TEXT,
    tool_output TEXT,
    input_tokens_used INTEGER,
    output_tokens_used INTEGER,
    error TEXT,
    created_by TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT,
    updated_at TEXT
);

-- Copy data from old messages table to new one (excluding object_id)
INSERT INTO messages_new (
    id, conversation_id, role, content, tool_calls, tool_call_id, tool_output, 
    input_tokens_used, output_tokens_used, error, created_by, created_at, updated_at
)
SELECT id, conversation_id, role, content, tool_calls, tool_call_id, tool_output, 
       input_tokens_used, output_tokens_used, error, created_by, created_at, updated_at
FROM messages;

-- Drop the old table and rename the new table
DROP TABLE messages;
ALTER TABLE messages_new RENAME TO messages;

-- migrate:down
ALTER TABLE objects DROP COLUMN project_id;

-- Recreate old messages table with object_id
CREATE TABLE messages_old (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT,
    content TEXT,
    tool_calls TEXT,
    tool_call_id TEXT,
    tool_output TEXT,
    input_tokens_used INTEGER,
    output_tokens_used INTEGER,
    error TEXT,
    object_id TEXT REFERENCES objects(id) ON DELETE CASCADE,
    created_by TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT,
    updated_at TEXT
);

-- Restore data from messages
INSERT INTO messages_old (
    id, conversation_id, role, content, tool_calls, tool_call_id, tool_output, 
    input_tokens_used, output_tokens_used, error, object_id, created_by, created_at, updated_at
)
SELECT id, conversation_id, role, content, tool_calls, tool_call_id, tool_output, 
       input_tokens_used, output_tokens_used, error, NULL, created_by, created_at, updated_at
FROM messages;

DROP TABLE messages;
ALTER TABLE messages_old RENAME TO messages;
