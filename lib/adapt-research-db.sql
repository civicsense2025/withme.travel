-- Adaptation script for research mode to work with existing survey_definitions/survey_responses tables

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
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_research_participants_study_id ON research_participants(study_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_participant_id ON survey_responses(participant_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_study_id ON survey_responses(study_id);
CREATE INDEX IF NOT EXISTS idx_research_triggers_study_id ON research_triggers(study_id);
CREATE INDEX IF NOT EXISTS idx_research_triggers_trigger_event ON research_triggers(trigger_event);
CREATE INDEX IF NOT EXISTS idx_research_events_participant_id ON research_events(participant_id);
CREATE INDEX IF NOT EXISTS idx_research_events_study_id ON research_events(study_id);
CREATE INDEX IF NOT EXISTS idx_research_events_event_type ON research_events(event_type);

-- RLS Policies for research_studies
ALTER TABLE research_studies ENABLE ROW LEVEL SECURITY;

-- Only admin can manage research studies
CREATE POLICY "Admins can manage research studies"
  ON research_studies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
  
-- Anyone can view active research studies
CREATE POLICY "Anyone can view active research studies"
  ON research_studies
  FOR SELECT
  TO authenticated
  USING (active = TRUE);

-- RLS Policies for research_participants
ALTER TABLE research_participants ENABLE ROW LEVEL SECURITY;

-- Only admin can manage research participants
CREATE POLICY "Admins can manage research participants"
  ON research_participants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
  
-- Participants can view their own data
CREATE POLICY "Participants can view their own data"
  ON research_participants
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- RLS Policies for research_triggers
ALTER TABLE research_triggers ENABLE ROW LEVEL SECURITY;

-- Only admin can manage research triggers
CREATE POLICY "Admins can manage research triggers"
  ON research_triggers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
  
-- Anyone can view active research triggers
CREATE POLICY "Anyone can view active research triggers"
  ON research_triggers
  FOR SELECT
  TO authenticated
  USING (active = TRUE);

-- RLS Policies for research_events
ALTER TABLE research_events ENABLE ROW LEVEL SECURITY;

-- Only admin can view all research events
CREATE POLICY "Admins can view all research events"
  ON research_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
  
-- Anyone can insert research events
CREATE POLICY "Anyone can insert research events"
  ON research_events
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Add policy to allow research participants to insert survey responses
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'survey_responses' 
    AND policyname = 'Research participants can submit survey responses'
  ) THEN
    CREATE POLICY "Research participants can submit survey responses"
      ON survey_responses
      FOR INSERT
      TO authenticated
      WITH CHECK (
        participant_id IS NOT NULL AND 
        participant_id IN (
          SELECT id FROM research_participants 
          WHERE status IN ('active', 'invited')
        )
      );
  END IF;
END $$; 