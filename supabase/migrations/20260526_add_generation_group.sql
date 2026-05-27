-- Add generation_group column to generated_contents table
-- This tracks which "generation" (1st, 2nd, 3rd, etc.) a set of 3 content versions belongs to.
-- Each time a user regenerates content, all 3 versions get the same incremented generation_group.

ALTER TABLE generated_contents ADD COLUMN IF NOT EXISTS generation_group INTEGER NOT NULL DEFAULT 1;

-- Add an index for faster lookups when determining the max generation_group
CREATE INDEX IF NOT EXISTS idx_generated_contents_business_group 
  ON generated_contents(business_id, generation_group DESC);