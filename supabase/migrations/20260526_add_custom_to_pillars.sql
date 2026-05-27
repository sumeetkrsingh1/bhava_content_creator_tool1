-- Track whether a pillar was created by the user through the custom pillar flow.

ALTER TABLE pillars ADD COLUMN IF NOT EXISTS custom BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_pillars_custom_icp
  ON pillars(icp_id, custom);

CREATE INDEX IF NOT EXISTS idx_pillars_custom_business
  ON pillars(business_id, custom);
