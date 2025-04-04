-- migrate:up
ALTER TABLE messages ADD COLUMN already_trained BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN trained_at TEXT DEFAULT NULL;

-- Create an index on already_trained for efficient querying
CREATE INDEX idx_messages_already_trained ON messages(already_trained);

-- migrate:down
DROP INDEX IF EXISTS idx_messages_already_trained;
ALTER TABLE messages DROP COLUMN trained_at;
ALTER TABLE messages DROP COLUMN already_trained;
