-- Add Quality At-Bat (QAB) tracking columns to at_bats table
ALTER TABLE at_bats
ADD COLUMN IF NOT EXISTS inning INTEGER,
ADD COLUMN IF NOT EXISTS outs INTEGER,
ADD COLUMN IF NOT EXISTS runners_1b BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS runners_2b BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS runners_3b BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS score_before TEXT,
ADD COLUMN IF NOT EXISTS rbis INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS runners_advanced TEXT,
ADD COLUMN IF NOT EXISTS hit_type TEXT,
ADD COLUMN IF NOT EXISTS sac_type TEXT,
ADD COLUMN IF NOT EXISTS is_qab BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS qab_criteria TEXT;

-- Create index for QAB queries
CREATE INDEX IF NOT EXISTS idx_at_bats_is_qab ON at_bats(session_id, is_qab);

-- Add check constraints for valid values
ALTER TABLE at_bats
ADD CONSTRAINT at_bats_outs_check CHECK (outs IS NULL OR outs IN (0, 1, 2)),
ADD CONSTRAINT at_bats_hit_type_check CHECK (hit_type IS NULL OR hit_type IN ('normal', 'bunt', 'hit_and_run')),
ADD CONSTRAINT at_bats_sac_type_check CHECK (sac_type IS NULL OR sac_type IN ('sac_bunt', 'sac_drag', 'squeeze'));
