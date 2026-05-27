-- Create profiles table
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('player', 'coach', 'parent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pitching_sessions table
CREATE TABLE pitching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  drills TEXT,
  throw_count_total INTEGER,
  effort_percent INTEGER CHECK (effort_percent >= 0 AND effort_percent <= 100),
  bullpen_pitches INTEGER,
  arm_feel TEXT CHECK (arm_feel IN ('great', 'good', 'okay', 'tight', 'sore')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hitting_sessions table (for Phase 2/3)
CREATE TABLE hitting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  opponent TEXT,
  mode TEXT CHECK (mode IN ('live_manual', 'gamechanger_import')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hitting_events table (for Phase 2/3)
CREATE TABLE hitting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES hitting_sessions(id) ON DELETE CASCADE,
  pitch_num INTEGER,
  strike_zone_location INTEGER CHECK (strike_zone_location >= 1 AND strike_zone_location <= 9),
  contact_quality TEXT CHECK (contact_quality IN ('soft', 'firm', 'hard')),
  contact_location TEXT CHECK (contact_location IN ('pull', 'middle', 'oppo')),
  contact_type TEXT CHECK (contact_type IN ('GB', 'LD', 'FB', 'PU')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitting_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pitching_sessions
CREATE POLICY "Users can view their own pitching sessions"
  ON pitching_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pitching sessions"
  ON pitching_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pitching sessions"
  ON pitching_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for hitting_sessions
CREATE POLICY "Users can view their own hitting sessions"
  ON hitting_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hitting sessions"
  ON hitting_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hitting sessions"
  ON hitting_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for hitting_events
CREATE POLICY "Users can view hitting events from their own sessions"
  ON hitting_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hitting_sessions
      WHERE hitting_sessions.id = hitting_events.session_id
      AND hitting_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert hitting events into their own sessions"
  ON hitting_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hitting_sessions
      WHERE hitting_sessions.id = hitting_events.session_id
      AND hitting_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_pitching_sessions_user_id ON pitching_sessions(user_id);
CREATE INDEX idx_pitching_sessions_date ON pitching_sessions(date);
CREATE INDEX idx_hitting_sessions_user_id ON hitting_sessions(user_id);
CREATE INDEX idx_hitting_sessions_date ON hitting_sessions(date);
CREATE INDEX idx_hitting_events_session_id ON hitting_events(session_id);
