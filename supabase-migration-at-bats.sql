-- Create at_bats table for tracking individual at-bats within a game
CREATE TABLE at_bats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES hitting_sessions(id) ON DELETE CASCADE,
  at_bat_num INTEGER NOT NULL,
  result TEXT,  -- 'strikeout', 'hit', 'out', 'walk', 'hbp', 'sac_fly', 'reached_on_error', NULL for in-progress
  status TEXT DEFAULT 'draft',  -- 'draft' (in-progress) or 'complete'
  pitch_count INTEGER DEFAULT 0,  -- Auto-calculated from pitches
  notes TEXT,  -- Optional notes for the at-bat
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, at_bat_num)
);

-- Modify hitting_events table to link to at_bats instead of sessions directly
-- and add pitch_outcome field
ALTER TABLE hitting_events
ADD COLUMN at_bat_id UUID REFERENCES at_bats(id) ON DELETE CASCADE,
ADD COLUMN pitch_outcome TEXT NOT NULL DEFAULT 'unknown';
-- pitch_outcome values: 'strike_looking', 'strike_swinging', 'ball', 'foul', 'foul_tip', 'in_play', 'hbp'

-- Create indexes for faster queries
CREATE INDEX idx_at_bats_session_id ON at_bats(session_id);
CREATE INDEX idx_hitting_events_at_bat_id ON hitting_events(at_bat_id);

-- RLS Policies for at_bats table
ALTER TABLE at_bats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own game at-bats"
  ON at_bats FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM hitting_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert at-bats for their own games"
  ON at_bats FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM hitting_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own game at-bats"
  ON at_bats FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM hitting_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own game at-bats"
  ON at_bats FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM hitting_sessions WHERE user_id = auth.uid()
    )
  );
