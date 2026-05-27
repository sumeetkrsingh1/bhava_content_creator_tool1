-- Clean up duplicate generation_sessions: keep only the first session per (user_id, business_id) pair.
-- This ensures the History sidebar shows one session per business with multiple generations.

-- Step 1: Delete duplicate sessions, keeping the earliest (oldest) one for each user+business combo
DELETE FROM generation_sessions
WHERE id NOT IN (
  SELECT MIN(id)
  FROM generation_sessions
  GROUP BY user_id, business_id
);

-- Step 2: Add a unique constraint to prevent future duplicates
-- (user_id, business_id) should be unique — one session per business per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_generation_sessions_user_business
  ON generation_sessions(user_id, business_id);