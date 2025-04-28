-- Migration: Core Schema Updates for Content Sharing and Personalization
-- Date: 2025-04-26
-- Description: Implements content layering, attribution, quality metrics, and customization

-- Content Layer Enhancements
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS content_layer TEXT 
    CHECK (content_layer IN ('original', 'shared', 'generated', 'customized'));

ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS original_id UUID 
    REFERENCES itinerary_items(id) ON DELETE SET NULL;

ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS source_trip_id UUID 
    REFERENCES trips(id) ON DELETE SET NULL;

-- Attribution Fields
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS attribution_type TEXT
    CHECK (attribution_type IN ('original', 'copied', 'inspired_by', 'generated'));

ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS attribution_metadata JSONB 
    DEFAULT '{}'::jsonb;

-- Quality Metrics
CREATE TABLE IF NOT EXISTS content_quality_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES itinerary_items(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    quality_score FLOAT CHECK (quality_score BETWEEN 0 AND 1),
    engagement_score FLOAT CHECK (engagement_score BETWEEN 0 AND 1),
    popularity_score FLOAT CHECK (popularity_score BETWEEN 0 AND 1),
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(item_id)
);

-- Customization System
CREATE TABLE IF NOT EXISTS content_customizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES itinerary_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customization_type TEXT NOT NULL,
    original_value JSONB,
    customized_value JSONB,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(item_id, user_id, customization_type)
);

-- Add RLS to new tables
ALTER TABLE content_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_customizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_quality_metrics
CREATE POLICY "Public read access to content quality metrics"
    ON content_quality_metrics FOR SELECT
    USING (true);  -- Everyone can view quality metrics

CREATE POLICY "Editors can update content quality metrics"
    ON content_quality_metrics FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM trip_members 
            WHERE trip_id = content_quality_metrics.trip_id 
            AND role IN ('admin', 'editor')
        )
    );

-- RLS Policies for content_customizations
CREATE POLICY "Users can view their own customizations"
    ON content_customizations FOR SELECT
    USING (
        auth.uid() = user_id OR 
        (NOT is_private AND 
         auth.uid() IN (
             SELECT user_id FROM trip_members 
             WHERE trip_id = (
                 SELECT trip_id FROM itinerary_items 
                 WHERE id = content_customizations.item_id
             )
         ))
    );

CREATE POLICY "Users can create their own customizations"
    ON content_customizations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customizations"
    ON content_customizations FOR UPDATE
    USING (auth.uid() = user_id);

-- Functions for quality metric updates
CREATE OR REPLACE FUNCTION update_quality_metrics() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO content_quality_metrics (
        item_id,
        trip_id,
        quality_score,
        engagement_score,
        popularity_score
    ) VALUES (
        NEW.id,
        NEW.trip_id,
        0.5,  -- Default initial quality score
        0.0,  -- Default initial engagement score
        0.0   -- Default initial popularity score
    )
    ON CONFLICT (item_id) 
    DO UPDATE SET
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic quality metric creation
CREATE TRIGGER create_quality_metrics
    AFTER INSERT ON itinerary_items
    FOR EACH ROW
    EXECUTE FUNCTION update_quality_metrics();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_itinerary_items_content_layer ON itinerary_items(content_layer);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_original_id ON itinerary_items(original_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_scores ON content_quality_metrics(quality_score, engagement_score, popularity_score);
CREATE INDEX IF NOT EXISTS idx_customizations_lookup ON content_customizations(item_id, user_id);

COMMENT ON TABLE content_quality_metrics IS 'Tracks quality and engagement metrics for itinerary content';
COMMENT ON TABLE content_customizations IS 'Stores user-specific customizations for itinerary items';

