-- migrate:up
ALTER TABLE projects ADD COLUMN use_for_training INTEGER NOT NULL DEFAULT 0;

-- migrate:down
ALTER TABLE projects DROP COLUMN use_for_training;
