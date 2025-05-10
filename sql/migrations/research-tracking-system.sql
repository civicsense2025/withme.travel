-- SQL migration for research tracking system

-- Create research_studies table (if not exists)
CREATE TABLE IF NOT EXISTS research_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create research_participants table (if not exists)
CREATE TABLE IF NOT EXISTS research_participants (
  id UUID PRIMARY KEY,
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('invited', 'active', 'completed', 'dropped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create research_triggers table (if not exists)
CREATE TABLE IF NOT EXISTS research_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  trigger_event TEXT NOT NULL,
  survey_id TEXT NOT NULL, -- Stores survey_id from survey_definitions, not UUID of survey
  min_delay_ms INTEGER DEFAULT 2000,
  max_triggers INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create research_events table (if not exists)
CREATE TABLE IF NOT EXISTS research_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES research_participants(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add research related fields to survey_responses (if not already present)
DO $$ 
BEGIN
  -- Add participant_id field if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'survey_responses' 
                 AND column_name = 'participant_id') THEN
    ALTER TABLE survey_responses ADD COLUMN participant_id UUID REFERENCES research_participants(id) ON DELETE SET NULL;
  END IF;

  -- Add study_id field if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'survey_responses' 
                 AND column_name = 'study_id') THEN
    ALTER TABLE survey_responses ADD COLUMN study_id UUID REFERENCES research_studies(id) ON DELETE SET NULL;
  END IF;

  -- Add trigger_event field if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'survey_responses' 
                 AND column_name = 'trigger_event') THEN
    ALTER TABLE survey_responses ADD COLUMN trigger_event TEXT;
  END IF;
END $$;

-- Create RLS policies for research tables
ALTER TABLE research_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_events ENABLE ROW LEVEL SECURITY;

-- Policy for admin access to all research tables
DROP POLICY IF EXISTS "Admin users can do everything" ON research_studies;
CREATE POLICY "Admin users can do everything" 
ON research_studies FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admin users can do everything" ON research_participants;
CREATE POLICY "Admin users can do everything" 
ON research_participants FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admin users can do everything" ON research_triggers;
CREATE POLICY "Admin users can do everything" 
ON research_triggers FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admin users can do everything" ON research_events;
CREATE POLICY "Admin users can do everything" 
ON research_events FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Policy for participants to submit responses via the API
DROP POLICY IF EXISTS "Participants can track their events" ON research_events;
CREATE POLICY "Participants can track their events"
ON research_events FOR INSERT
WITH CHECK (participant_id IN (
  SELECT id FROM research_participants WHERE user_id = auth.uid() OR user_id IS NULL
));

-- Create index for performance
CREATE INDEX IF NOT EXISTS research_participants_study_id_idx ON research_participants(study_id);
CREATE INDEX IF NOT EXISTS research_events_participant_id_idx ON research_events(participant_id);
CREATE INDEX IF NOT EXISTS research_events_study_id_idx ON research_events(study_id);
CREATE INDEX IF NOT EXISTS research_triggers_study_id_idx ON research_triggers(study_id);
CREATE INDEX IF NOT EXISTS research_triggers_survey_id_idx ON research_triggers(survey_id);
CREATE INDEX IF NOT EXISTS survey_responses_participant_id_idx ON survey_responses(participant_id); 