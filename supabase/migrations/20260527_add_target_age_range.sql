-- Add target_age_range column to customisation_answers table
-- This stores the age demographic of the target audience (e.g., "25-40 years", "18-24", "40-60")
ALTER TABLE customisation_answers ADD COLUMN IF NOT EXISTS target_age_range TEXT;