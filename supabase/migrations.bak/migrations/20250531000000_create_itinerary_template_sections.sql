-- Create itinerary_template_sections table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.itinerary_template_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL, -- Assuming FK to an itinerary_templates table
    day_number INT NOT NULL,
    title TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    -- Add FOREIGN KEY constraint if itinerary_templates table exists
    -- FOREIGN KEY (template_id) REFERENCES public.itinerary_templates(id) ON DELETE CASCADE
);

ALTER TABLE public.itinerary_template_sections ENABLE ROW LEVEL SECURITY;

-- Add RLS policies if needed 