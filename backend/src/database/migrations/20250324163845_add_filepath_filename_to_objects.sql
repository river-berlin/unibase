-- migrate:up
ALTER TABLE objects ADD COLUMN filepath TEXT;
ALTER TABLE objects ADD COLUMN filename TEXT;

-- migrate:down
ALTER TABLE objects DROP COLUMN filepath;
ALTER TABLE objects DROP COLUMN filename;
