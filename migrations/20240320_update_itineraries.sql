-- Update itinerary_templates table to better support copying to trips
ALTER TABLE itinerary_templates
ADD COLUMN IF NOT EXISTS template_type VARCHAR(50) CHECK (template_type IN ('official', 'user_created', 'trip_based')),
ADD COLUMN IF NOT EXISTS source_trip_id UUID REFERENCES trips(id),
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS copied_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_copied_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create a new table to track template usage in trips
CREATE TABLE IF NOT EXISTS trip_template_uses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    template_id UUID REFERENCES itinerary_templates(id) ON DELETE SET NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by UUID REFERENCES auth.users(id),
    version_used INTEGER,
    modifications JSONB DEFAULT '{}'::jsonb,
    UNIQUE(trip_id, template_id)
);

-- Create a new table for template sections (more structured than just days array)
CREATE TABLE IF NOT EXISTS template_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES itinerary_templates(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title VARCHAR(255),
    description TEXT,
    position INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(template_id, day_number)
);

-- Create a new table for template activities
CREATE TABLE IF NOT EXISTS template_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES template_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    duration_minutes INTEGER,
    start_time TIME,
    position INTEGER,
    category VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE trip_template_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_activities ENABLE ROW LEVEL SECURITY;

-- Policies for trip_template_uses
CREATE POLICY "Users can view their own trip template uses"
    ON trip_template_uses FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM trip_members WHERE trip_id = trip_template_uses.trip_id
        )
    );

CREATE POLICY "Users can create template uses for their trips"
    ON trip_template_uses FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM trip_members WHERE trip_id = trip_template_uses.trip_id
        )
    );

-- Policies for template sections and activities
CREATE POLICY "Everyone can view published template sections"
    ON template_sections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM itinerary_templates
            WHERE id = template_sections.template_id
            AND is_published = true
        )
    );

CREATE POLICY "Everyone can view published template activities"
    ON template_activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM template_sections
            JOIN itinerary_templates ON template_sections.template_id = itinerary_templates.id
            WHERE template_sections.id = template_activities.section_id
            AND itinerary_templates.is_published = true
        )
    );

-- Function to copy template to trip
CREATE OR REPLACE FUNCTION copy_template_to_trip(
    p_template_id UUID,
    p_trip_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_template_version INTEGER;
BEGIN
    -- Get template version
    SELECT version INTO v_template_version
    FROM itinerary_templates
    WHERE id = p_template_id;

    -- Insert usage record
    INSERT INTO trip_template_uses (
        trip_id,
        template_id,
        applied_by,
        version_used
    ) VALUES (
        p_trip_id,
        p_template_id,
        p_user_id,
        v_template_version
    );

    -- Copy template activities to trip itinerary items
    INSERT INTO itinerary_items (
        trip_id,
        title,
        description,
        location,
        start_time,
        category,
        created_by,
        position,
        metadata
    )
    SELECT 
        p_trip_id,
        ta.title,
        ta.description,
        ta.location,
        ta.start_time,
        ta.category,
        p_user_id,
        ta.position,
        jsonb_build_object(
            'template_activity_id', ta.id,
            'template_section_id', ts.id,
            'day_number', ts.day_number
        )
    FROM template_activities ta
    JOIN template_sections ts ON ta.section_id = ts.id
    WHERE ts.template_id = p_template_id
    ORDER BY ts.day_number, ta.position;

    -- Update template stats
    UPDATE itinerary_templates
    SET 
        copied_count = copied_count + 1,
        last_copied_at = NOW()
    WHERE id = p_template_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 