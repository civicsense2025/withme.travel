-- Migration to fix itinerary_template_sections table
-- This adds necessary columns that are missing in the table structure

-- Check and add template_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'itinerary_template_sections' 
        AND column_name = 'template_id'
    ) THEN
        ALTER TABLE public.itinerary_template_sections
        ADD COLUMN template_id uuid REFERENCES public.itinerary_templates(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add day_number column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'itinerary_template_sections' 
        AND column_name = 'day_number'
    ) THEN
        ALTER TABLE public.itinerary_template_sections
        ADD COLUMN day_number integer NOT NULL DEFAULT 1;
    END IF;
END $$;

-- Check and add position column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'itinerary_template_sections' 
        AND column_name = 'position'
    ) THEN
        ALTER TABLE public.itinerary_template_sections
        ADD COLUMN position integer NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Check and add title column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'itinerary_template_sections' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE public.itinerary_template_sections
        ADD COLUMN title text;
    END IF;
END $$;

-- Check and add description column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'itinerary_template_sections' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.itinerary_template_sections
        ADD COLUMN description text;
    END IF;
END $$;

-- Check and add updated_at column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'itinerary_template_sections' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.itinerary_template_sections
        ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Create a trigger to update the updated_at timestamp
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'set_timestamp_itinerary_template_sections'
        AND tgrelid = 'public.itinerary_template_sections'::regclass
    ) THEN
        CREATE TRIGGER set_timestamp_itinerary_template_sections
        BEFORE UPDATE ON public.itinerary_template_sections
        FOR EACH ROW
        EXECUTE FUNCTION public.trigger_set_timestamp();
    END IF;
END $$;

-- Create index on template_id and day_number for efficient querying
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE tablename = 'itinerary_template_sections'
        AND indexname = 'idx_itinerary_template_sections_template_id'
    ) THEN
        CREATE INDEX idx_itinerary_template_sections_template_id
        ON public.itinerary_template_sections(template_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE tablename = 'itinerary_template_sections'
        AND indexname = 'idx_itinerary_template_sections_day_position'
    ) THEN
        CREATE INDEX idx_itinerary_template_sections_day_position
        ON public.itinerary_template_sections(template_id, day_number, position);
    END IF;
END $$; 