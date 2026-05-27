-- Add user ownership column to pillars table for per-user scoping of custom pillars.
-- This ensures custom pillars are only visible to the user who created them.

ALTER TABLE pillars ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_pillars_user_id
  ON pillars(user_id);