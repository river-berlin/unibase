-- migrate:up
-- Add stripe_customer_id column to users table
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;

-- migrate:down
-- Create a new table without the stripe_customer_id column
CREATE TABLE users_old (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  avatar BLOB,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Copy data from users to users_old
INSERT INTO users_old 
SELECT id, email, name, password_hash, salt, is_admin, avatar, last_login_at, created_at, updated_at 
FROM users;

-- Drop the users table
DROP TABLE users;

-- Rename users_old to users
ALTER TABLE users_old RENAME TO users;

-- Recreate the index
CREATE INDEX users_is_admin_idx ON users (is_admin); 