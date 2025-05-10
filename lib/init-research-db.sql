-- Research studies table
CREATE TABLE IF NOT EXISTS research_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research participants table
CREATE TABLE IF NOT EXISTS research_participants (
  id UUID PRIMARY KEY,
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('invited', 'active', 'completed', 'dropped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES research_participants(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  trigger_event TEXT,
  responses JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research triggers table
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

-- Research events table
CREATE TABLE IF NOT EXISTS research_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES research_participants(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
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
  
CREATE POLICY "Anyone can view active research studies"
  ON research_studies
  FOR SELECT
  TO authenticated
  USING (active = TRUE);

-- RLS Policies for research_participants
ALTER TABLE research_participants ENABLE ROW LEVEL SECURITY;

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
  
CREATE POLICY "Participants can view their own data"
  ON research_participants
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- RLS Policies for surveys
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage surveys"
  ON surveys
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
  
CREATE POLICY "Anyone can view surveys"
  ON surveys
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- RLS Policies for survey_responses
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all survey responses"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
  
CREATE POLICY "Anyone can insert survey responses"
  ON survey_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- RLS Policies for research_triggers
ALTER TABLE research_triggers ENABLE ROW LEVEL SECURITY;

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
  
CREATE POLICY "Anyone can view active research triggers"
  ON research_triggers
  FOR SELECT
  TO authenticated
  USING (active = TRUE);

-- RLS Policies for research_events
ALTER TABLE research_events ENABLE ROW LEVEL SECURITY;

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
  
CREATE POLICY "Anyone can insert research events"
  ON research_events
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE); 