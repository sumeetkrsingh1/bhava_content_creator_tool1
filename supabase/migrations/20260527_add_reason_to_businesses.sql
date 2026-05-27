-- Store why the user is creating LinkedIn content for this business.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS reason TEXT;
