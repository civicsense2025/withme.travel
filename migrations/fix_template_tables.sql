-- Fix table naming mismatches by creating proper views if needed

-- First check if itinerary_template_sections exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'itinerary_template_sections') THEN
        -- Create a view that maps to the original table
        EXECUTE 'CREATE OR REPLACE VIEW template_sections AS SELECT * FROM itinerary_template_sections';
    ELSE
        -- Create template_sections table as originally planned
        CREATE TABLE IF NOT EXISTS template_sections (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            template_id UUID REFERENCES itinerary_templates(id) ON DELETE CASCADE,
            day_number INTEGER NOT NULL,
            title VARCHAR(255),
            description TEXT,
            position INTEGER,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Now check if itinerary_template_activities exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'itinerary_template_activities') THEN
        -- Create a view that maps to the original table
        EXECUTE 'CREATE OR REPLACE VIEW template_activities AS SELECT * FROM itinerary_template_activities';
    ELSE
        -- Create template_activities table as originally planned
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
    END IF;
END $$;

-- Create manual_expenses table to fix the other error
CREATE TABLE IF NOT EXISTS manual_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    date DATE,
    category VARCHAR(50),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test creation of example data for a template
DO $$
DECLARE
    template_record RECORD;
    section_id UUID;
BEGIN
    -- Find a template with no sections
    SELECT id, title, duration_days INTO template_record
    FROM itinerary_templates
    WHERE id = 'f8d9e0c1-2b3a-4c5d-6e7f-8a9b0c1d2e3f' -- Madrid family adventure
    LIMIT 1;
    
    IF FOUND THEN
        -- Create a section
        INSERT INTO template_sections (
            template_id, 
            day_number, 
            title, 
            position
        ) VALUES (
            template_record.id,
            1,
            'Day 1 - Madrid Arrival',
            1
        ) RETURNING id INTO section_id;
        
        -- Create an activity
        INSERT INTO template_activities (
            section_id,
            title,
            description,
            position,
            category
        ) VALUES (
            section_id,
            'Check in to hotel',
            'Get settled in your Madrid accommodation',
            1,
            'accommodation'
        );
    END IF;
END $$; 