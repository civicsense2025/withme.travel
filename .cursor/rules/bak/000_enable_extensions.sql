-- supabase/migrations/000_enable_extensions.sql

-- Ensure essential schemas exist (like extensions)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Ensure pgsodium schema exists BEFORE trying to create the extension in it
CREATE SCHEMA IF NOT EXISTS pgsodium;

-- Enable other core extensions if necessary (example: uuid-ossp)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- NOTE: pgsodium might be handled specially by Supabase infra/local setup.
-- We still include the attempt in migration 001, but this ensures the schema exists first. 