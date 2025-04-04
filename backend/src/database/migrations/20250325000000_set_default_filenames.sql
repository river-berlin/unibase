-- migrate:up
-- Update objects that have no filename to use 'untitled.js' as default
UPDATE objects 
SET filename = 'untitled.js' 
WHERE filename IS NULL;

-- migrate:down
-- No down migration needed as this is a data update 