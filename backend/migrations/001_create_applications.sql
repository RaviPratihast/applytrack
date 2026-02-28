-- Run this once to create the applications table.
-- Example: psql $DATABASE_URL -f migrations/001_create_applications.sql

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied',
  applied_date TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  resume_version TEXT NOT NULL DEFAULT '',
  follow_up_date TEXT
);
