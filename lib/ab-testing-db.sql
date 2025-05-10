-- A/B Testing Database Schema
-- Idempotent script for setting up A/B testing tables

-- 1. A/B Test Variants Table
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 50, -- Weight for random distribution (higher = more likely)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_study_id ON ab_test_variants(study_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_active ON ab_test_variants(is_active);

-- 2. Participant Assignment to Variants
CREATE TABLE IF NOT EXISTS participant_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES research_participants(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ab_test_variants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, variant_id)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_participant_variants_participant_id ON participant_variants(participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_variants_variant_id ON participant_variants(variant_id);

-- 3. Add variant_data column to research_events if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'research_events' AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE research_events ADD COLUMN variant_id UUID REFERENCES ab_test_variants(id);
  END IF;
END $$;

-- Add index for variant_id column
CREATE INDEX IF NOT EXISTS idx_research_events_variant_id ON research_events(variant_id);

-- 4. Create conversion goals table
CREATE TABLE IF NOT EXISTS conversion_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- The event that represents this conversion
  is_primary BOOLEAN DEFAULT FALSE, -- Is this the primary conversion goal?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversion_goals_study_id ON conversion_goals(study_id);
CREATE INDEX IF NOT EXISTS idx_conversion_goals_event_type ON conversion_goals(event_type);

-- 5. Create participant status history table
CREATE TABLE IF NOT EXISTS participant_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES research_participants(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for participant_id
CREATE INDEX IF NOT EXISTS idx_participant_status_history_participant_id ON participant_status_history(participant_id);

-- 6. Create milestone completions table
CREATE TABLE IF NOT EXISTS milestone_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES research_participants(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES research_studies(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  completion_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, milestone_type)
);

-- Add indexes for milestone lookups
CREATE INDEX IF NOT EXISTS idx_milestone_completions_participant_id ON milestone_completions(participant_id);
CREATE INDEX IF NOT EXISTS idx_milestone_completions_study_id ON milestone_completions(study_id);
CREATE INDEX IF NOT EXISTS idx_milestone_completions_milestone_type ON milestone_completions(milestone_type);

-- 7. Create research analytics materialized view
-- This helps with analytics queries
CREATE MATERIALIZED VIEW IF NOT EXISTS research_analytics_summary AS
SELECT
  rs.id AS study_id,
  rs.name AS study_name,
  COUNT(DISTINCT rp.id) AS participant_count,
  COUNT(DISTINCT se.id) AS total_events,
  COUNT(DISTINCT sr.id) AS survey_responses,
  COUNT(DISTINCT mc.id) AS milestone_completions,
  COUNT(DISTINCT pv.id) AS variant_assignments,
  MAX(se.created_at) AS last_event_time
FROM
  research_studies rs
  LEFT JOIN research_participants rp ON rs.id = rp.study_id
  LEFT JOIN research_events se ON rs.id = se.study_id
  LEFT JOIN survey_responses sr ON rs.id = sr.study_id
  LEFT JOIN milestone_completions mc ON rs.id = mc.study_id
  LEFT JOIN participant_variants pv ON pv.participant_id = rp.id
GROUP BY
  rs.id, rs.name;

-- Create a refresh function for the materialized view
CREATE OR REPLACE FUNCTION refresh_research_analytics_summary()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY research_analytics_summary;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh the view when data changes
DO $$
BEGIN
  -- Only create trigger if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'refresh_research_analytics_summary_trigger') THEN
    CREATE TRIGGER refresh_research_analytics_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON research_events
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_research_analytics_summary();
  END IF;
END $$; 