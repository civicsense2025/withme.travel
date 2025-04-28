-- Migration: Core Schema Updates for Content Sharing & Personalization
-- Description: Establishes foundation for content layering and personalization
-- Created: 2025-06-10

/*
This migration implements the core schema changes needed for content sharing and personalization:
1. Content layering columns
2. Attribution fields
3. Quality metrics
4. Personalization table

These changes enable users to share and personalize itinerary items while maintaining
proper attribution and content quality tracking.
*/

-- =============================================
-- EXTENSIONS
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TYPES
-- =============================================

-- Create an enum for quality tiers
CREATE TYPE quality_tier_enum AS ENUM (
  'premium',    -- Verified high-quality content
  'verified',   -- Verified content
  'standard',   -- Normal quality content
  'community'   -- Community contributed content
);

-- =============================================
-- ITINERARY ITEMS ENHANCEMENTS
-- =============================================

-- Add content layering columns to itinerary_items
ALTER TABLE itinerary_items
  ADD COLUMN IF NOT EXISTS original_description TEXT,
  ADD COLUMN IF NOT EXISTS personal_notes TEXT;

-- Add content attribution fields
ALTER TABLE itinerary_items
  ADD COLUMN IF NOT EXISTS source_item_id UUID REFERENCES itinerary_items(id),
  ADD COLUMN IF NOT EXISTS original_creator_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS attribution_text TEXT,
  ADD COLUMN IF NOT EXISTS copy_count INTEGER DEFAULT 0;

-- Add quality metrics
ALTER TABLE itinerary_items
  ADD COLUMN IF NOT EXISTS quality_tier quality_tier_enum DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS quality_score SMALLINT DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  ADD COLUMN IF NOT EXISTS popularity_score SMALLINT DEFAULT 0 CHECK (popularity_score >= 0 AND popularity_score <= 100),
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- =============================================
-- ITEM CUSTOMIZATIONS TABLE
-- =============================================

-- Create item_customizations table for personal modifications
CREATE TABLE IF NOT EXISTS item_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES itinerary_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content customizations
  personal_notes TEXT,
  custom_title TEXT,
  
  -- Time customizations
  custom_time TIME,
  custom_date DATE,
  custom_duration INTEGER CHECK (custom_duration > 0),
  custom_day_number INTEGER,
  
  -- Additional customizations
  custom_links JSONB DEFAULT '[]'::JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'private',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one customization per item per user
  UNIQUE (item_id, user_id)
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at field
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON item_customizations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Function to calculate quality score based on content and popularity
CREATE OR REPLACE FUNCTION calculate_quality_score(
  item_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  score INTEGER := 0;
  item_record RECORD;
BEGIN
  -- Get item data
  SELECT * INTO item_record
  FROM itinerary_items
  WHERE id = item_id;
  
  -- Base content quality (60%)
  IF item_record.description IS NOT NULL AND LENGTH(item_record.description) > 100 THEN
    score := score + 15;
  END IF;
  
  IF item_record.place_id IS NOT NULL THEN 
    score := score + 15;
  END IF;
  
  -- Additional quality factors
  IF item_record.cover_image_url IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  IF item_record.address IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  IF item_record.duration_minutes IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  -- Verification factor (20%)
  IF item_record.is_verified THEN 
    score := score + 20;
  END IF;
  
  -- Popularity metrics (20%)
  score := score + LEAST(item_record.copy_count * 2, 10);
  score := score + LEAST(item_record.popularity_score / 10, 10);
  
  -- Ensure score is between 0-100
  RETURN GREATEST(LEAST(score, 100), 0);
END;
$$;

-- Trigger to recalculate quality score on item modification
CREATE OR REPLACE FUNCTION update_quality_score_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Update quality score
  NEW.quality_score := calculate_quality_score(NEW.id);
  
  -- Set quality tier based on score
  IF NEW.quality_score >= 80 THEN
    NEW.quality_tier := 'premium';
  ELSIF NEW.quality_score >= 60 THEN
    NEW.quality_tier := 'verified';
  ELSIF NEW.quality_score >= 40 THEN
    NEW.quality_tier := 'standard';
  ELSE
    NEW.quality_tier := 'community';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_quality_score
BEFORE INSERT OR UPDATE OF description, cover_image_url, address, duration_minutes, is_verified
ON itinerary_items
FOR EACH ROW
EXECUTE FUNCTION update_quality_score_trigger();

-- Function and trigger to update popularity score when an item is copied
CREATE OR REPLACE FUNCTION update_popularity_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source_item_id IS NOT NULL THEN
    -- Increment copy count on the source item
    UPDATE itinerary_items
    SET 
      copy_count = copy_count + 1,
      popularity_score = LEAST(popularity_score + 1, 100)
    WHERE id = NEW.source_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_popularity_on_copy
AFTER INSERT ON itinerary_items
FOR EACH ROW
WHEN (NEW.source_item_id IS NOT NULL)
EXECUTE FUNCTION update_popularity_score();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Add RLS policies for item_customizations table
ALTER TABLE item_customizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own customizations
CREATE POLICY "Users can view their own customizations"
  ON item_customizations
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own customizations
CREATE POLICY "Users can insert their own customizations"
  ON item_customizations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own customizations
CREATE POLICY "Users can update their own customizations"
  ON item_customizations
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own customizations
CREATE POLICY "Users can delete their own customizations"
  ON item_customizations
  FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- INDEXES
-- =============================================

-- Add indexes to itinerary_items for new fields
CREATE INDEX IF NOT EXISTS idx_itinerary_items_source_item_id ON itinerary_items(source_item_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_original_creator_id ON itinerary_items(original_creator_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_quality_tier ON itinerary_items(quality_tier);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_quality_score ON itinerary_items(quality_score);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_popularity_score ON itinerary_items(popularity_score);

-- Add indexes for faster lookup on item_customizations
CREATE INDEX IF NOT EXISTS idx_item_customizations_item_id ON item_customizations(item_id);
CREATE INDEX IF NOT EXISTS idx_item_customizations_user_id ON item_customizations(user_id);

-- =============================================
-- COMMENTS
-- =============================================

-- Add helpful comments
COMMENT ON COLUMN itinerary_items.original_description IS 'The original description before any modifications';
COMMENT ON COLUMN itinerary_items.personal_notes IS 'Personal notes visible only to the creator';
COMMENT ON COLUMN itinerary_items.source_item_id IS 'Reference to the original item this was copied from';
COMMENT ON COLUMN itinerary_items.original_creator_id IS 'The user who created the original content';
COMMENT ON COLUMN itinerary_items.attribution_text IS 'Text crediting the original creator';
COMMENT ON COLUMN itinerary_items.quality_score IS 'Computed quality score (0-100) based on content, verification and popularity';
COMMENT ON COLUMN itinerary_items.quality_tier IS 'Tier classification based on quality score';
COMMENT ON COLUMN itinerary_items.popularity_score IS 'Score based on how often this item has been copied';

COMMENT ON TABLE item_customizations IS 'Stores user-specific customizations for itinerary items';
COMMENT ON COLUMN item_customizations.personal_notes IS 'User-specific private notes';
COMMENT ON COLUMN item_customizations.custom_title IS 'User-specific custom title that overrides the original';
COMMENT ON COLUMN item_customizations.custom_links IS 'User-added links related to this item';
COMMENT ON COLUMN item_customizations.visibility IS 'Controls who can see this customization (private, friends, public)';
