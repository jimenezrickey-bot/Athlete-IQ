-- Migration: Add workout_templates and daily_sessions tables

-- Create workout_templates table (pre-defined workouts for each day)
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  effort_level TEXT NOT NULL CHECK (effort_level IN ('Light', 'Medium', 'Heavy', 'Off')),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_sessions table (user's logged sessions per day)
CREATE TABLE daily_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  effort_level TEXT CHECK (effort_level IN ('Light', 'Medium', 'Heavy', 'Off')),
  selected_drills JSONB,
  throw_count_total INTEGER NOT NULL,
  peak_effort_percent INTEGER CHECK (peak_effort_percent >= 0 AND peak_effort_percent <= 100),
  max_distance_ft INTEGER,
  bullpen_pitches INTEGER,
  arm_feel TEXT CHECK (arm_feel IN ('great', 'good', 'okay', 'tight', 'sore')),
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'saved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, session_date)
);

-- Enable RLS
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_templates (world-readable)
CREATE POLICY "Workout templates are viewable by all"
  ON workout_templates FOR SELECT
  USING (true);

-- RLS Policies for daily_sessions (user-specific)
CREATE POLICY "Users can view their own daily sessions"
  ON daily_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily sessions"
  ON daily_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily sessions"
  ON daily_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_workout_templates_day ON workout_templates(day_of_week);
CREATE INDEX idx_daily_sessions_user_id ON daily_sessions(user_id);
CREATE INDEX idx_daily_sessions_user_date ON daily_sessions(user_id, session_date);

-- Seed workout_templates with Max's program
INSERT INTO workout_templates (day_of_week, effort_level, name, description) VALUES
(0, 'Medium', 'Monday Medium', '40-50 throws TOTAL building up to 75% effort for last 20-25 throws at 105-120 feet'),
(1, 'Light', 'Tuesday Light', 'reverse throws x 10, Constraint Picks x 10 blue, 20-30 throws max. Smooth. Relaxed. Low effort. Feel good, arm on time. Into the scap'),
(2, 'Heavy', 'Wednesday Heavy + lighter bullpen 15-20 pitches', 'reverse throws x 10, Constraint Picks x 10 blue, Short split rockers w constraint 3 R,3Y,3Grey, 50-65 throws TOTAL building up to 90-95% effort for the last 10-15 throws, 1 pulldown every 5-10 feet back in to 60 feet'),
(3, 'Off', 'Thursday Off/stretch recovery', 'Off/stretch recovery'),
(4, 'Medium', 'Friday Medium - lighter stretch it out day', 'Plyos: reverse throws x 10, Constraint Picks x 8 blue, Short split rockers w constraint 3 R,3Y, 40-50 throws TOTAL building up to 75% effort for last 20-25 throws at 90-105 feet'),
(5, 'Heavy', 'Saturday Heavy bullpen', 'Heavy bullpen 30+ pitches'),
(6, 'Heavy', 'Sunday Heavy bullpen', 'Heavy bullpen 30+ pitches');
