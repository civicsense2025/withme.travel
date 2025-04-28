-- Simplified database schema for unifying trip itineraries and templates

-- Core trips table that handles both regular trips and templates
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Template flag and metadata
    is_template BOOLEAN DEFAULT false,
    template_category TEXT,
    template_duration_days INTEGER,
    
    -- Common trip fields
    destination_id UUID REFERENCES destinations(id),
    destination_name TEXT,
    start_date DATE,
    end_date DATE,
    duration_days INTEGER,
    
    -- Publishing/visibility
    is_public BOOLEAN DEFAULT false,
    slug TEXT,
    cover_image_url TEXT,
    
    -- Template usage statistics
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    copies_count INTEGER DEFAULT 0,
    
    -- Standard timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Template specific fields stored in JSONB for flexibility
    template_metadata JSONB
);

-- Single table for all itinerary sections (days)
CREATE TABLE itinerary_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title TEXT,
    position INTEGER,
    date DATE, -- For actual trips
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Single table for all itinerary items
CREATE TABLE itinerary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES itinerary_sections(id) ON DELETE CASCADE,
    
    -- Basic item details
    title TEXT NOT NULL,
    description TEXT,
    
    -- Categorization
    category itinerary_category, -- flight, accommodation, activity, etc.
    
    -- Timing
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    
    -- Location
    place_id UUID REFERENCES places(id),
    address TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    
    -- Other metadata
    status item_status DEFAULT 'suggested',
    created_by UUID REFERENCES profiles(id),
    estimated_cost NUMERIC,
    currency TEXT DEFAULT 'USD',
    position INTEGER, -- Order within section
    
    -- Standard timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Additional metadata
    item_metadata JSONB
);

-- Track template applications
CREATE TABLE template_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES trips(id),
    destination_trip_id UUID REFERENCES trips(id),
    applied_by UUID REFERENCES profiles(id),
    applied_at TIMESTAMPTZ DEFAULT now(),
    
    -- Track any customizations or changes made during application
    modifications JSONB,
    
    -- Version control
    template_version TEXT,
    
    CONSTRAINT template_uses_unique UNIQUE (template_id, destination_trip_id)
);

-- Functions for template management

-- Function to copy a template to a new trip
CREATE OR REPLACE FUNCTION copy_template_to_trip(
    p_template_id UUID,
    p_trip_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_section_id UUID;
    v_old_section_id UUID;
    v_section_mapping JSONB = '{}';
BEGIN
    -- Verify template exists and is a template
    IF NOT EXISTS (SELECT 1 FROM trips WHERE id = p_template_id AND is_template = true) THEN
        RAISE EXCEPTION 'Invalid template ID or not a template';
    END IF;
    
    -- Verify destination trip exists and is not a template
    IF NOT EXISTS (SELECT 1 FROM trips WHERE id = p_trip_id AND is_template = false) THEN
        RAISE EXCEPTION 'Invalid trip ID or is a template';
    END IF;

    -- Copy sections
    FOR v_old_section_id IN 
        SELECT id FROM itinerary_sections 
        WHERE trip_id = p_template_id
        ORDER BY day_number, position
    LOOP
        -- Insert new section
        INSERT INTO itinerary_sections (
            trip_id, day_number, title, position, notes
        )
        SELECT 
            p_trip_id,
            day_number,
            title,
            position,
            notes
        FROM 
            itinerary_sections
        WHERE 
            id = v_old_section_id
        RETURNING id INTO v_section_id;
        
        -- Store mapping of old to new section IDs
        v_section_mapping = v_section_mapping || jsonb_build_object(v_old_section_id::text, v_section_id::text);
        
        -- Copy items for this section
        INSERT INTO itinerary_items (
            section_id, title, description, category, start_time, end_time,
            duration_minutes, place_id, address, latitude, longitude,
            status, created_by, estimated_cost, currency, position, item_metadata
        )
        SELECT 
            v_section_id,
            title,
            description,
            category,
            start_time,
            end_time,
            duration_minutes,
            place_id,
            address,
            latitude,
            longitude,
            'suggested', -- Always start as suggested
            p_user_id, -- Set current user as creator
            estimated_cost,
            currency,
            position,
            item_metadata
        FROM 
            itinerary_items
        WHERE 
            section_id = v_old_section_id
        ORDER BY
            position;
    END LOOP;
    
    -- Record this template use
    INSERT INTO template_uses (
        template_id, 
        destination_trip_id, 
        applied_by,
        modifications
    )
    VALUES (
        p_template_id,
        p_trip_id,
        p_user_id,
        jsonb_build_object('section_mapping', v_section_mapping)
    );
    
    -- Increment template copy counter
    UPDATE trips 
    SET copies_count = COALESCE(copies_count, 0) + 1,
        updated_at = now()
    WHERE id = p_template_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert a trip to a template
CREATE OR REPLACE FUNCTION convert_trip_to_template(
    p_trip_id UUID,
    p_template_name TEXT DEFAULT NULL,
    p_template_category TEXT DEFAULT NULL,
    p_is_public BOOLEAN DEFAULT true
) RETURNS UUID AS $$
DECLARE
    v_template_id UUID;
    v_trip_name TEXT;
    v_template_category TEXT = p_template_category;
BEGIN
    -- Get trip information
    SELECT name, COALESCE(duration_days, 
        CASE WHEN start_date IS NOT NULL AND end_date IS NOT NULL 
        THEN (end_date - start_date)::INTEGER + 1
        ELSE NULL END)
    INTO v_trip_name, v_template_category
    FROM trips
    WHERE id = p_trip_id;
    
    -- Create new template
    INSERT INTO trips (
        created_by,
        name,
        description,
        is_template,
        template_category,
        template_duration_days,
        destination_id,
        destination_name,
        cover_image_url,
        is_public,
        template_metadata
    )
    SELECT
        created_by,
        COALESCE(p_template_name, v_trip_name || ' Template'),
        description,
        true,
        COALESCE(p_template_category, v_template_category),
        duration_days,
        destination_id,
        destination_name,
        cover_image_url,
        p_is_public,
        jsonb_build_object(
            'source_trip_id', p_trip_id,
            'converted_at', now()
        )
    FROM trips
    WHERE id = p_trip_id
    RETURNING id INTO v_template_id;
    
    -- Copy sections and items
    PERFORM copy_template_to_trip(v_template_id, p_trip_id, NULL);
    
    RETURN v_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments explaining the unified approach
COMMENT ON TABLE trips IS 
'Unified table for both regular trips and templates. Templates are identified by is_template=true';

COMMENT ON COLUMN trips.template_metadata IS
'JSONB field to store flexible template-specific metadata without requiring additional columns';

COMMENT ON TABLE template_uses IS
'Tracks when a template is applied to a trip, for analytics and relationship maintenance';

COMMENT ON FUNCTION copy_template_to_trip IS
'Copies template structure (sections and items) to a destination trip, tracking the relationship';

