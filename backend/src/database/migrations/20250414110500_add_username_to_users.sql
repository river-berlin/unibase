-- migrate:up
-- Add username column to users table
ALTER TABLE users ADD COLUMN username TEXT;

-- Create a unique index on username
CREATE UNIQUE INDEX users_username_idx ON users (username);

-- migrate:down
-- Remove the unique index
DROP INDEX IF EXISTS users_username_idx;

-- Remove the username column
ALTER TABLE users DROP COLUMN username;
