-- Milestone Research DB Schema Updates
-- Idempotent script for research milestone tracking

-- 1. Add milestone_triggers table for specific milestone configurations
CREATE TABLE IF NOT EXISTS milestone_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  threshold_value INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  survey_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster milestone lookup
CREATE INDEX IF NOT EXISTS idx_milestone_triggers_study_id ON milestone_triggers(study_id);
CREATE INDEX IF NOT EXISTS idx_milestone_triggers_milestone_type ON milestone_triggers(milestone_type);

-- 2. Add milestone_completions table to track when participants hit milestones
CREATE TABLE IF NOT EXISTS milestone_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES research_participants(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  completion_data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster milestone completion queries
CREATE INDEX IF NOT EXISTS idx_milestone_completions_participant ON milestone_completions(participant_id);
CREATE INDEX IF NOT EXISTS idx_milestone_completions_study ON milestone_completions(study_id);
CREATE INDEX IF NOT EXISTS idx_milestone_completions_type ON milestone_completions(milestone_type);

-- 3. Add A/B testing support tables
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 50, -- percentage weight for assignment
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(study_id, name)
);

CREATE TABLE IF NOT EXISTS participant_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES research_participants(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ab_test_variants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, variant_id)
);

-- 4. Add status_history table to track participant status changes
CREATE TABLE IF NOT EXISTS participant_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES research_participants(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Add milestone types to research_events if they don't exist yet
DO $$ 
BEGIN
  -- Make sure the research_events table has an event_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'research_events' 
                 AND column_name = 'event_type') THEN
    ALTER TABLE research_events ADD COLUMN event_type TEXT NOT NULL DEFAULT 'generic';
  END IF;
END $$;

-- 6. Add analytics aggregation table for dashboard metrics
CREATE TABLE IF NOT EXISTS research_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  dimension TEXT, -- optional dimension for slicing (e.g., "day", "milestone", "variant")
  dimension_value TEXT, -- value for the dimension
  calculation_time TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(study_id, metric_type, metric_name, dimension, dimension_value)
);

-- Add research status constants
CREATE TYPE IF NOT EXISTS milestone_type AS ENUM (
  'COMPLETE_ONBOARDING',
  'ITINERARY_MILESTONE_3_ITEMS',
  'GROUP_FORMATION_COMPLETE',
  'VOTE_PROCESS_USED',
  'TRIP_FROM_TEMPLATE_CREATED'
);

-- Add research events indexes
CREATE INDEX IF NOT EXISTS idx_research_events_participant ON research_events(participant_id);
CREATE INDEX IF NOT EXISTS idx_research_events_study ON research_events(study_id);
CREATE INDEX IF NOT EXISTS idx_research_events_type ON research_events(event_type);
CREATE INDEX IF NOT EXISTS idx_research_events_timestamp ON research_events(created_at);

-- Functions for milestone detection

-- Function to check and record when a participant completes 3+ itinerary items
CREATE OR REPLACE FUNCTION check_itinerary_milestone()
RETURNS TRIGGER AS $$
DECLARE
  item_count INTEGER;
BEGIN
  -- Only proceed if this is an add itinerary item event
  IF NEW.event_type = 'add_itinerary_item' THEN
    -- Count existing items for this participant
    SELECT COUNT(*) INTO item_count
    FROM research_events
    WHERE participant_id = NEW.participant_id
    AND event_type = 'add_itinerary_item';
    
    -- If they just reached exactly 3 items
    IF item_count = 3 THEN
      -- Create a milestone completion record
      INSERT INTO milestone_completions (
        participant_id, 
        study_id, 
        milestone_type,
        completion_data
      ) VALUES (
        NEW.participant_id,
        NEW.study_id,
        'ITINERARY_MILESTONE_3_ITEMS',
        jsonb_build_object('item_count', 3)
      );
      
      -- Also record as a research event
      INSERT INTO research_events (
        participant_id,
        study_id,
        event_type,
        event_data
      ) VALUES (
        NEW.participant_id,
        NEW.study_id,
        'ITINERARY_MILESTONE_3_ITEMS',
        jsonb_build_object('milestone_reached', true, 'item_count', 3)
      );
    END IF;
  END IF;
  
  RETURN NULL; -- for AFTER triggers
END;
$$ LANGUAGE plpgsql;

-- Create trigger for itinerary milestone
DROP TRIGGER IF EXISTS check_itinerary_milestone_trigger ON research_events;
CREATE TRIGGER check_itinerary_milestone_trigger
AFTER INSERT ON research_events
FOR EACH ROW
EXECUTE FUNCTION check_itinerary_milestone();

-- Create RLS policies for the new tables
ALTER TABLE milestone_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY milestone_triggers_select ON milestone_triggers FOR SELECT USING (true);
CREATE POLICY milestone_triggers_insert ON milestone_triggers FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY milestone_triggers_update ON milestone_triggers FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY milestone_triggers_delete ON milestone_triggers FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE milestone_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY milestone_completions_select ON milestone_completions FOR SELECT USING (true);
CREATE POLICY milestone_completions_insert ON milestone_completions FOR INSERT WITH CHECK (true);

ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY ab_test_variants_select ON ab_test_variants FOR SELECT USING (true);
CREATE POLICY ab_test_variants_insert ON ab_test_variants FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY ab_test_variants_update ON ab_test_variants FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY ab_test_variants_delete ON ab_test_variants FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE participant_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY participant_variants_select ON participant_variants FOR SELECT USING (true);
CREATE POLICY participant_variants_insert ON participant_variants FOR INSERT WITH CHECK (true);

ALTER TABLE participant_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY participant_status_history_select ON participant_status_history FOR SELECT USING (true);
CREATE POLICY participant_status_history_insert ON participant_status_history FOR INSERT WITH CHECK (true);

ALTER TABLE research_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY research_analytics_select ON research_analytics FOR SELECT USING (true);
CREATE POLICY research_analytics_insert ON research_analytics FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY research_analytics_update ON research_analytics FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY research_analytics_delete ON research_analytics FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
); 