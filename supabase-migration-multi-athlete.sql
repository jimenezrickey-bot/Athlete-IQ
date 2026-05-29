-- ============================================================================
-- ATHLETE IQ: Multi-Athlete Architecture Migration
-- Enables multiple athletes, parent linking, access codes, and guest mode
-- ============================================================================

-- ============================================================================
-- PART 1: Create new tables for multi-athlete system
-- ============================================================================

-- Athletes table: Each athlete (Max, daughter, etc) gets an entry
CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- user_id is NULL for athletes created by parents; not null for self-signup
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  -- email: if athlete has their own account
  access_code TEXT UNIQUE NOT NULL,
  -- auto-generated code, shared with anyone (parents, coaches, friends)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Athlete access codes: different levels of access (full access vs data entry only)
CREATE TABLE athlete_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('full_access', 'data_entry_only')),
  description TEXT,
  -- e.g., "Coach Jim - data entry only", "Mom - full access"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Parent-athlete relationships: explicit links between parents and their athletes
CREATE TABLE parent_athlete_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT FALSE,
  verification_code TEXT,
  verification_code_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_user_id, athlete_id)
);

-- Guest access tokens: temporary access for one-off data entry (friends at games)
CREATE TABLE guest_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  game_id UUID,
  -- game_id is optional; if set, guest can only log data for this specific game
  token TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pitching', 'hitting')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- PART 2: Create pitching game tables (mirroring hitting structure)
-- ============================================================================

-- Pitching games: game-level summary (one row per game pitched)
CREATE TABLE pitching_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  opponent TEXT,
  result TEXT CHECK (result IN ('W', 'L', 'ND', 'S')),
  -- W=win, L=loss, ND=no decision, S=save
  innings_pitched NUMERIC(3, 1),
  -- 6.1 = 6 and 1/3 innings
  total_pitches INTEGER,
  hits_allowed INTEGER DEFAULT 0,
  runs_allowed INTEGER DEFAULT 0,
  earned_runs INTEGER DEFAULT 0,
  strikeouts INTEGER DEFAULT 0,
  walks INTEGER DEFAULT 0,
  hbp INTEGER DEFAULT 0,
  -- hit batsmen
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pitching at-bats: each batter faced (not each pitch, each AB)
CREATE TABLE pitching_at_bats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES pitching_games(id) ON DELETE CASCADE,
  batter_num INTEGER NOT NULL,
  -- sequence in the game (1st batter, 2nd batter, etc)
  inning INTEGER NOT NULL,
  outs_before INTEGER CHECK (outs_before IN (0, 1, 2)),
  runners_on_base JSONB,
  -- {"1b": true, "2b": false, "3b": true} or similar
  batter_handedness TEXT CHECK (batter_handedness IN ('L', 'R')),
  pitch_count INTEGER DEFAULT 0,
  result TEXT,
  -- strikeout, hit, walk, hbp, sac, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, batter_num)
);

-- Pitching events: pitch-by-pitch detail
CREATE TABLE pitching_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  at_bat_id UUID NOT NULL REFERENCES pitching_at_bats(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES pitching_games(id) ON DELETE CASCADE,
  pitch_num INTEGER NOT NULL,
  -- sequence in the at-bat (1, 2, 3, ...)
  pitch_type TEXT,
  -- fastball, curveball, slider, changeup, cutter, etc
  velocity INTEGER,
  -- mph, optional
  strike_zone_location INTEGER CHECK (strike_zone_location >= 1 AND strike_zone_location <= 9),
  -- 1-9 grid (same as hitting)
  pitch_outcome TEXT NOT NULL CHECK (pitch_outcome IN (
    'strike_looking', 'strike_swinging', 'ball', 'foul', 'foul_tip', 'in_play', 'hbp'
  )),
  contact_quality TEXT CHECK (contact_quality IN ('soft', 'firm', 'hard')),
  -- if in_play
  contact_location TEXT CHECK (contact_location IN ('pull', 'middle', 'oppo')),
  -- if in_play
  contact_type TEXT CHECK (contact_type IN ('GB', 'LD', 'FB', 'PU')),
  -- if in_play
  notes TEXT,
  guest_token_used UUID REFERENCES guest_access_tokens(id),
  -- if entered by a guest
  entered_by UUID REFERENCES auth.users(id),
  -- tracks which user entered this (parent, athlete, or null for guest)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PART 3: Modify existing tables to add athlete_id
-- ============================================================================

-- Add athlete_id to hitting_sessions
ALTER TABLE hitting_sessions
ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'complete')),
ADD COLUMN IF NOT EXISTS guest_token_used UUID REFERENCES guest_access_tokens(id),
ADD COLUMN IF NOT EXISTS entered_by UUID REFERENCES auth.users(id);

-- Add athlete_id to at_bats
ALTER TABLE at_bats
ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS guest_token_used UUID REFERENCES guest_access_tokens(id),
ADD COLUMN IF NOT EXISTS entered_by UUID REFERENCES auth.users(id);

-- Add athlete_id to hitting_events
ALTER TABLE hitting_events
ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS guest_token_used UUID REFERENCES guest_access_tokens(id),
ADD COLUMN IF NOT EXISTS entered_by UUID REFERENCES auth.users(id);

-- Add athlete_id to daily_sessions (pitching workouts)
ALTER TABLE daily_sessions
ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE;

-- Add athlete_id to old pitching_sessions (workouts)
ALTER TABLE pitching_sessions
ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE;

-- ============================================================================
-- PART 4: Enable RLS on new tables
-- ============================================================================

ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_athlete_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_at_bats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: RLS Policies
-- ============================================================================

-- Athletes table: Athletes can view their own, parents can view linked athletes
CREATE POLICY "Athletes can view their own entry"
  ON athletes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can view linked athletes"
  ON athletes FOR SELECT
  USING (
    id IN (
      SELECT athlete_id FROM parent_athlete_relationships
      WHERE parent_user_id = auth.uid() AND verified = TRUE
    )
  );

-- Athlete access codes: visible to athlete owner and parents with access
CREATE POLICY "Athlete can view their own codes"
  ON athlete_access_codes FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

-- Parent-athlete relationships: visible to both parties
CREATE POLICY "Users can view their relationships"
  ON parent_athlete_relationships FOR SELECT
  USING (
    auth.uid() = parent_user_id OR
    athlete_id IN (SELECT id FROM athletes WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can insert relationships"
  ON parent_athlete_relationships FOR INSERT
  WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Parents can update relationships"
  ON parent_athlete_relationships FOR UPDATE
  USING (auth.uid() = parent_user_id);

-- Guest access tokens: visible to athlete owner
CREATE POLICY "Athlete can view their guest tokens"
  ON guest_access_tokens FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

-- Pitching games: viewable/editable by athlete owner and linked parents
CREATE POLICY "Athlete can view own pitching games"
  ON pitching_games FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view linked athlete pitching games"
  ON pitching_games FOR SELECT
  USING (
    athlete_id IN (
      SELECT athlete_id FROM parent_athlete_relationships
      WHERE parent_user_id = auth.uid() AND verified = TRUE
    )
  );

CREATE POLICY "Athlete can insert own pitching games"
  ON pitching_games FOR INSERT
  WITH CHECK (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert pitching games for linked athletes"
  ON pitching_games FOR INSERT
  WITH CHECK (
    athlete_id IN (
      SELECT athlete_id FROM parent_athlete_relationships
      WHERE parent_user_id = auth.uid() AND verified = TRUE
    )
  );

CREATE POLICY "Athlete can update own pitching games"
  ON pitching_games FOR UPDATE
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update linked athlete pitching games"
  ON pitching_games FOR UPDATE
  USING (
    athlete_id IN (
      SELECT athlete_id FROM parent_athlete_relationships
      WHERE parent_user_id = auth.uid() AND verified = TRUE
    )
  );

-- Pitching at-bats: same as games
CREATE POLICY "View pitching at-bats for own games"
  ON pitching_at_bats FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM pitching_games
      WHERE athlete_id IN (
        SELECT id FROM athletes WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents view pitching at-bats for linked athletes"
  ON pitching_at_bats FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM pitching_games
      WHERE athlete_id IN (
        SELECT athlete_id FROM parent_athlete_relationships
        WHERE parent_user_id = auth.uid() AND verified = TRUE
      )
    )
  );

CREATE POLICY "Insert pitching at-bats for own games"
  ON pitching_at_bats FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM pitching_games
      WHERE athlete_id IN (
        SELECT id FROM athletes WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents insert pitching at-bats for linked athletes"
  ON pitching_at_bats FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM pitching_games
      WHERE athlete_id IN (
        SELECT athlete_id FROM parent_athlete_relationships
        WHERE parent_user_id = auth.uid() AND verified = TRUE
      )
    )
  );

-- Pitching events: same pattern
CREATE POLICY "View pitching events for own games"
  ON pitching_events FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM pitching_games
      WHERE athlete_id IN (
        SELECT id FROM athletes WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents view pitching events for linked athletes"
  ON pitching_events FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM pitching_games
      WHERE athlete_id IN (
        SELECT athlete_id FROM parent_athlete_relationships
        WHERE parent_user_id = auth.uid() AND verified = TRUE
      )
    )
  );

CREATE POLICY "Insert pitching events for own games"
  ON pitching_events FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM pitching_games
      WHERE athlete_id IN (
        SELECT id FROM athletes WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents insert pitching events for linked athletes"
  ON pitching_events FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM pitching_games
      WHERE athlete_id IN (
        SELECT athlete_id FROM parent_athlete_relationships
        WHERE parent_user_id = auth.uid() AND verified = TRUE
      )
    )
  );

-- ============================================================================
-- PART 6: Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_athletes_user_id ON athletes(user_id);
CREATE INDEX IF NOT EXISTS idx_athletes_email ON athletes(email);
CREATE INDEX IF NOT EXISTS idx_athlete_access_codes_athlete_id ON athlete_access_codes(athlete_id);
CREATE INDEX IF NOT EXISTS idx_parent_athlete_relationships_parent_user_id ON parent_athlete_relationships(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_athlete_relationships_athlete_id ON parent_athlete_relationships(athlete_id);
CREATE INDEX IF NOT EXISTS idx_guest_access_tokens_athlete_id ON guest_access_tokens(athlete_id);
CREATE INDEX IF NOT EXISTS idx_guest_access_tokens_game_id ON guest_access_tokens(game_id);
CREATE INDEX IF NOT EXISTS idx_pitching_games_athlete_id ON pitching_games(athlete_id);
CREATE INDEX IF NOT EXISTS idx_pitching_games_athlete_date ON pitching_games(athlete_id, date);
CREATE INDEX IF NOT EXISTS idx_pitching_at_bats_game_id ON pitching_at_bats(game_id);
CREATE INDEX IF NOT EXISTS idx_pitching_events_at_bat_id ON pitching_events(at_bat_id);
CREATE INDEX IF NOT EXISTS idx_pitching_events_game_id ON pitching_events(game_id);
CREATE INDEX IF NOT EXISTS idx_hitting_sessions_athlete_id ON hitting_sessions(athlete_id);
CREATE INDEX IF NOT EXISTS idx_at_bats_athlete_id ON at_bats(athlete_id);
CREATE INDEX IF NOT EXISTS idx_hitting_events_athlete_id ON hitting_events(athlete_id);
CREATE INDEX IF NOT EXISTS idx_daily_sessions_athlete_id ON daily_sessions(athlete_id);
CREATE INDEX IF NOT EXISTS idx_pitching_sessions_athlete_id ON pitching_sessions(athlete_id);

-- ============================================================================
-- PART 7: Database triggers and functions
-- ============================================================================

-- Function to generate a unique access code for new athletes
CREATE OR REPLACE FUNCTION generate_athlete_access_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INT;
BEGIN
  -- Generate a random 12-character alphanumeric code
  LOOP
    code := upper(substr(md5(random()::text), 1, 12));
    SELECT COUNT(*) INTO exists_count FROM athletes WHERE access_code = code;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create athlete when user signs up as player
CREATE OR REPLACE FUNCTION create_athlete_on_player_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'player' THEN
    INSERT INTO athletes (user_id, name, email, access_code)
    VALUES (
      NEW.user_id,
      NEW.name,
      (SELECT email FROM auth.users WHERE id = NEW.user_id),
      generate_athlete_access_code()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_athlete_on_signup ON profiles;

CREATE TRIGGER trigger_create_athlete_on_signup
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_athlete_on_player_signup();

-- ============================================================================
-- PART 8: Migration script for existing data
-- ============================================================================
-- NOTE: After running this migration, you'll need to manually associate
-- existing hitting/pitching data with athletes. For now, Max's data
-- should be linked to his athlete ID once his athlete account is created.
-- See the follow-up script: supabase-migration-link-existing-data.sql
