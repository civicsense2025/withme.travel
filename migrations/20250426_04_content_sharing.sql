-- Migration: Content Sharing Implementation
-- Date: 2025-04-26
-- Description: Implements content sharing, attribution tracking, and popularity metrics

-- Add sharing-specific fields to itinerary_items
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS share_status TEXT
    CHECK (share_status IN ('private', 'shared', 'public'));

ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create content sharing history table
CREATE TABLE IF NOT EXISTS content_sharing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES itinerary_items(id) ON DELETE CASCADE,
    source_trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    target_trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES auth.users(id),
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customizations JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create item popularity metrics table
CREATE TABLE IF NOT EXISTS item_popularity_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES itinerary_items(id) ON DELETE CASCADE,
    views_last_24h INTEGER DEFAULT 0,
    views_last_7d INTEGER DEFAULT 0,
    views_last_30d INTEGER DEFAULT 0,
    shares_last_24h INTEGER DEFAULT 0,
    shares_last_7d INTEGER DEFAULT 0,
    shares_last_30d INTEGER DEFAULT 0,
    likes_last_24h INTEGER DEFAULT 0,
    likes_last_7d INTEGER DEFAULT 0,
    likes_last_30d INTEGER DEFAULT 0,
    trending_score FLOAT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id)
);

-- Add RLS to new tables
ALTER TABLE content_sharing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_popularity_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_sharing_history
CREATE POLICY "Users can view sharing history for their trips"
    ON content_sharing_history FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM trip_members WHERE trip_id = source_trip_id
            UNION
            SELECT user_id FROM trip_members WHERE trip_id = target_trip_id
        )
    );

CREATE POLICY "Users can create sharing history for their trips"
    ON content_sharing_history FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM trip_members WHERE trip_id = source_trip_id
        )
    );

-- RLS policies for item_popularity_metrics
CREATE POLICY "Everyone can view popularity metrics"
    ON item_popularity_metrics FOR SELECT
    USING (true);

-- Function to copy and customize an itinerary item
CREATE OR REPLACE FUNCTION copy_and_customize_item(
    p_source_item_id UUID,
    p_target_trip_id UUID,
    p_user_id UUID,
    p_customizations JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_source_item itinerary_items%ROWTYPE;
    v_new_item_id UUID;
    v_customization_record JSONB;
BEGIN
    -- Get source item
    SELECT * INTO v_source_item
    FROM itinerary_items
    WHERE id = p_source_item_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Source item not found';
    END IF;
    
    -- Create new item as a copy
    INSERT INTO itinerary_items (
        trip_id,
        title,
        description,
        start_time,
        end_time,
        location,
        duration_minutes,
        day_number,
        category,
        position,
        content_layer,
        original_id,
        source_trip_id,
        attribution_type,
        attribution_metadata,
        created_by,
        metadata
    ) VALUES (
        p_target_trip_id,
        COALESCE((p_customizations->>'title'), v_source_item.title),
        COALESCE((p_customizations->>'description'), v_source_item.description),
        v_source_item.start_time,
        v_source_item.end_time,
        COALESCE((p_customizations->>'location'), v_source_item.location),
        COALESCE((p_customizations->>'duration_minutes')::integer, v_source_item.duration_minutes),
        COALESCE((p_customizations->>'day_number')::integer, v_source_item.day_number),
        v_source_item.category,
        COALESCE((p_customizations->>'position')::integer, v_source_item.position),
        'shared',
        COALESCE(v_source_item.original_id, v_source_item.id),
        v_source_item.trip_id,
        'copied',
        jsonb_build_object(
            'copied_from', v_source_item.id,
            'copied_at', NOW(),
            'copied_by', p_user_id
        ),
        p_user_id,
        v_source_item.metadata
    )
    RETURNING id INTO v_new_item_id;
    
    -- Record sharing history
    INSERT INTO content_sharing_history (
        item_id,
        source_trip_id,
        target_trip_id,
        shared_by,
        customizations
    ) VALUES (
        v_source_item.id,
        v_source_item.trip_id,
        p_target_trip_id,
        p_user_id,
        p_customizations
    );
    
    -- Update share count on original item
    UPDATE itinerary_items
    SET share_count = share_count + 1
    WHERE id = v_source_item.id;
    
    -- Store customizations if any
    IF p_customizations IS NOT NULL THEN
        FOR v_customization_record IN 
            SELECT * FROM jsonb_each(p_customizations)
        LOOP
            INSERT INTO content_customizations (
                item_id,
                user_id,
                customization_type,
                original_value,
                customized_value
            ) VALUES (
                v_new_item_id,
                p_user_id,
                v_customization_record.key,
                jsonb_build_object(
                    'value', 
                    CASE v_customization_record.key
                        WHEN 'title' THEN v_source_item.title
                        WHEN 'description' THEN v_source_item.description
                        WHEN 'location' THEN v_source_item.location
                        WHEN 'duration_minutes' THEN v_source_item.duration_minutes
                        WHEN 'day_number' THEN v_source_item.day_number
                        WHEN 'position' THEN v_source_item.position
                    END
                ),
                v_customization_record.value
            );
        END LOOP;
    END IF;
    
    RETURN v_new_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update popularity metrics
CREATE OR REPLACE FUNCTION update_popularity_metrics(
    p_item_id UUID,
    p_action TEXT
) RETURNS VOID AS $$
DECLARE
    v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Create or update metrics record
    INSERT INTO item_popularity_metrics (
        item_id,
        views_last_24h,
        views_last_7d,
        views_last_30d,
        shares_last_24h,
        shares_last_7d,
        shares_last_30d,
        likes_last_24h,
        likes_last_7d,
        likes_last_30d,
        last_updated
    ) VALUES (
        p_item_id,
        CASE WHEN p_action = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'share' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'share' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'share' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'like' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'like' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'like' THEN 1 ELSE 0 END,
        v_now
    )
    ON CONFLICT (item_id) DO UPDATE SET
        views_last_24h = CASE 
            WHEN p_action = 'view' THEN item_popularity_metrics.views_last_24h + 1
            ELSE item_popularity_metrics.views_last_24h
        END,
        views_last_7d = CASE 
            WHEN p_action = 'view' THEN item_popularity_metrics.views_last_7d + 1
            ELSE item_popularity_metrics.views_last_7d
        END,
        views_last_30d = CASE 
            WHEN p_action = 'view' THEN item_popularity_metrics.views_last_30d + 1
            ELSE item_popularity_metrics.views_last_30d
        END,
        shares_last_24h = CASE 
            WHEN p_action = 'share' THEN item_popularity_metrics.shares_last_24h + 1
            ELSE item_popularity_metrics.shares_last_24h
        END,
        shares_last_7d = CASE 
            WHEN p_action = 'share' THEN item_popularity_metrics.shares_last_7d + 1
            ELSE item_popularity_metrics.shares_last_7d
        END,
        shares_last_30d = CASE 
            WHEN p_action = 'share' THEN item_popularity_metrics.shares_last_30d + 1
            ELSE item_popularity_metrics.shares_last_30d
        END,
        likes_last_24h = CASE 
            WHEN p_action = 'like' THEN item_popularity_metrics.likes_last_24h + 1
            ELSE item_popularity_metrics.likes_last_24h
        END,
        likes_last_7d = CASE 
            WHEN p_action = 'like' THEN item_popularity_metrics.likes_last_7d + 1
            ELSE item_popularity_metrics.likes_last_7d
        END,
        likes_last_30d = CASE 
            WHEN p_action = 'like' THEN item_popularity_metrics.likes_last_30d + 1
            ELSE item_popularity_metrics.likes_last_30d
        END,
        -- Calculate trending score (simplified version)
        trending_score = (
            CASE WHEN p_action = 'view' THEN item_popularity_metrics.views_last_24h + 1 ELSE item_popularity_metrics.views_last_24h END * 1 +
            CASE WHEN p_action = 'share' THEN item_popularity_metrics.shares_last_24h + 1 ELSE item_popularity_metrics.shares_last_24h END * 5 +
            CASE WHEN p_action = 'like' THEN item_popularity_metrics.likes_last_24h + 1 ELSE item_popularity_metrics.likes_last_24h END * 3
        ) / 9.0,
        last_updated = v_now;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create maintenance function to clean up old metrics
CREATE OR REPLACE FUNCTION cleanup_old_metrics() RETURNS void AS $$
BEGIN
    -- Update metrics older than 24 hours
    UPDATE item_popularity_metrics
    SET 
        views_last_24h = 0,
        shares_last_24h = 0,
        likes_last_24h = 0
    WHERE last_updated < NOW() - INTERVAL '24 hours';
    
    -- Update metrics older than 7 days
    UPDATE item_popularity_metrics
    SET 
        views_last_7d = 0,
        shares_last_7d = 0,
        likes_last_7d = 0
    WHERE last_updated < NOW() - INTERVAL '7 days';
    
    -- Update metrics older than 30 days
    UPDATE item_popularity_metrics
    SET 
        views_last_30d = 0,
        shares_last_30d = 0,
        likes_last_30d = 0
    WHERE last_updated < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sharing_history_trips 
    ON content_sharing_history(source_trip_id, target_trip_id);
CREATE INDEX IF NOT EXISTS idx_popularity_metrics_trending 
    ON item_popularity_metrics(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_items_share_status 
    ON itinerary_items(share_status);

-- Add comments
COMMENT ON TABLE content_sharing_history IS 'Tracks history of content sharing between trips';
COMMENT ON TABLE item_popularity_metrics IS 'Stores and tracks item popularity metrics';
COMMENT ON FUNCTION copy_and_customize_item IS 'Copies an item to another trip with optional customizations';
COMMENT ON FUNCTION update_popularity_metrics IS 'Updates popularity metrics for an item based on user actions';
COMMENT ON FUNCTION cleanup_old_metrics IS 'Maintenance function to clean up expired metrics';

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION copy_and_customize_item(UUID, UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_popularity_metrics(UUID, TEXT) TO authenticated;

