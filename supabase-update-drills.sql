-- Update workout descriptions with cleaned up, properly formatted drills

UPDATE workout_templates SET description =
'40-50 throws total. Build up to 75% effort for last 20-25 throws at 105-120 feet.'
WHERE day_of_week = 0;

UPDATE workout_templates SET description =
'Reverse throws x10. Constraint picks x10 blue. 20-30 throws max. Smooth, relaxed, low effort. Focus on arm timing and scapular positioning.'
WHERE day_of_week = 1;

UPDATE workout_templates SET description =
'Reverse throws x10. Constraint picks x10 blue. Short split rockers with constraint: 3 rounds red, 3 rounds yellow, 3 rounds grey. 50-65 throws total. Build up to 90-95% effort for last 10-15 throws. One pulldown every 5-10 feet, working back to 60 feet. Light bullpen: 15-20 pitches.'
WHERE day_of_week = 2;

UPDATE workout_templates SET description =
'Rest and recovery. Focus on stretching and mobility work.'
WHERE day_of_week = 3;

UPDATE workout_templates SET description =
'Light stretch-out day to prepare for heavy session. Plyos: reverse throws x10, constraint picks x8 blue, short split rockers with constraint: 3 rounds red, 3 rounds yellow. 40-50 throws total. Build up to 75% effort for last 20-25 throws at 90-105 feet.'
WHERE day_of_week = 4;

UPDATE workout_templates SET description =
'Heavy bullpen session: 30+ pitches. Focus on maintaining arm strength and velocity.'
WHERE day_of_week = 5;

UPDATE workout_templates SET description =
'Heavy bullpen session: 30+ pitches. Focus on maintaining arm strength and velocity.'
WHERE day_of_week = 6;
