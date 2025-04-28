-- Migration to enhance itinerary_items with content layering and personalization
-- Date: 2025-05-26

-- Documentation:
-- This migration adds fields to support layered content and personalization of itinerary items
-- It allows users to copy items while maintaining attribution and adding their own customizations
-- Key concepts:
--   1. Content Layering - Core content vs personal annotations
--   2. Content Attribution - Track original sources and give credit
--   3. Quality Control - Verify high-quality content
--   4. Personal Customizations - Allow user-specific modifications

-- Update itinerary_items table with new fields
ALTER TABLE public.itinerary_items
    -- Content layering
    ADD COLUMN IF NOT EXISTS original_description TEXT, -- Original description (preserved for reference)
    ADD COLUMN IF NOT EXISTS personal_notes TEXT,       -- User's personal notes (private to creator)
    
    -- Content attribution and tracking
    ADD COLUMN IF NOT EXISTS source_item_id UUID REFERENCES public.itinerary_items(id), -- Original item this was copied from
    ADD COLUMN IF NOT EXISTS original_creator_id UUID REFERENCES public.profiles(id),    -- Creator of the original content
    ADD COLUMN IF NOT EXISTS attribution_text TEXT,                                      -- Text crediting original creator
    
    -- Quality control
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,       -- Verified high-quality content
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id), -- Who verified this content
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,                 -- When content was verified
    ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0,      -- How often item is copied/used
    
    -- Personal customizations
    ADD COLUMN IF NOT EXISTS custom_metadata JSONB DEFAULT '{}'::JSONB, -- Extensible field for custom data
    ADD COLUMN IF NOT EXISTS reminders TEXT[],                          -- Personal reminders
    ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::JSONB,    -- Custom links added by user
    
    -- Additional metadata
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[]; -- Tags for discovery and recommendations

-- Function to copy an itinerary item with proper attribution
CREATE OR REPLACE FUNCTION public.copy_itinerary_item(
    source_item_id UUID,       -- Item being copied
    destination_trip_id UUID,   -- Trip to copy to
    user_id UUID,               -- User performing the copy
    custom_date DATE DEFAULT NULL, -- Optional custom date
    custom_day_number INTEGER DEFAULT NULL -- Optional custom day number
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_item_id UUID;
    v_source_creator UUID;
    v_source_title TEXT;
    v_root_creator TEXT;
BEGIN
    -- Get source item creator info
    SELECT created_by, title, 
           COALESCE((SELECT username FROM public.profiles WHERE id = COALESCE(original_creator_id, created_by)), 'Unknown')
    INTO v_source_creator, v_source_title, v_root_creator
    FROM public.itinerary_items
    WHERE id = source_item_id;
    
    -- Create the new item as a copy
    INSERT INTO public.itinerary_items (
        trip_id,
        created_by,
        title,
        description,
        status,
        start_time,
        end_time,
        date,
        day_number,
        address,
        latitude,
        longitude,
        place_id,
        category,
        is_custom,
        original_description,
        source_item_id,
        original_creator_id,
        attribution_text,
        tags
    )
    SELECT 
        destination_trip_id,  -- New trip
        user_id,              -- New creator
        title,                -- Same title
        description,          -- Same description initially
        'suggested',          -- Reset to suggested status
        start_time,           -- Same time
        end_time,             -- Same end time
        COALESCE(custom_date, date),  -- Use custom date if provided
        COALESCE(custom_day_number, day_number), -- Use custom day if provided
        address,              -- Same address
        latitude,             -- Same coordinates
        longitude,
        place_id,             -- Same place reference
        category,             -- Same category
        TRUE,                 -- Mark as custom
        description,          -- Store original description
        source_item_id,       -- Reference to source
        COALESCE(original_creator_id, created_by), -- Maintain original attribution chain
        CASE 
            WHEN attribution_text IS NOT NULL THEN 
                attribution_text 
            ELSE 
                'Based on activity originally created by ' || v_root_creator
        END,
        tags                  -- Copy tags
    FROM public.itinerary_items
    WHERE id = source_item_id
    RETURNING id INTO v_new_item_id;
    
    -- Update popularity score of source item
    UPDATE public.itinerary_items
    SET popularity_score = popularity_score + 1
    WHERE id = source_item_id;
    
    RETURN v_new_item_id;
END;
$$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_itinerary_items_source ON public.itinerary_items(source_item_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_tags ON public.itinerary_items USING GIN(tags);

-- Comments explaining usage
COMMENT ON COLUMN public.itinerary_items.personal_notes IS 
    'User-specific notes that are private to the item creator';
    
COMMENT ON COLUMN public.itinerary_items.source_item_id IS 
    'Reference to the original item this was copied from, enabling attribution tracking';
    
COMMENT ON COLUMN public.itinerary_items.custom_metadata IS 
    'Flexible JSON field for storing user-specific customizations';

COMMENT ON COLUMN public.itinerary_items.is_verified IS 
    'Indicates high-quality content that has been reviewed and approved';

COMMENT ON FUNCTION public.copy_itinerary_item IS 
    'Creates a copy of an itinerary item while maintaining proper attribution and allowing customization';

