-- docker/postgres/init.sql
-- Runs once on first container start

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search

-- Create app user if not exists (handled by docker env, but kept for clarity)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'payro_user') THEN
    CREATE ROLE payro_user WITH LOGIN PASSWORD 'payro_password';
  END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE payro_db TO payro_user;

-- Log
DO $$ BEGIN RAISE NOTICE 'Payro DB initialized.'; END $$;
