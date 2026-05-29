-- Fix: Add INSERT policy for athletes table so trigger can create athletes
-- The trigger that auto-creates athletes during player signup was failing
-- because there was no INSERT policy. This migration adds it.

-- Allow the database trigger to insert athletes when profiles are created
CREATE POLICY "Trigger can create athletes for new players"
  ON athletes FOR INSERT
  WITH CHECK (true);

-- Also add an INSERT policy to allow users to create their own athletes if needed
CREATE POLICY "Users can create their own athlete record"
  ON athletes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
