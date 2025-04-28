-- Migration to add SEO optimization and canonical support to itinerary items
-- Date: 2025-05-27

-- Documentation:
-- This migration enhances the itinerary_items table with SEO optimizations and canonical support:
-- 1. Canonical references - Establish relationships between original and copied content
-- 2. SEO metadata - Support proper indexing and search engine visibility
-- 3. Content quality tracking - Monitor and promote high-quality content
-- 4. URL structure support - Enable SEO-friendly URLs for public content

-- Add SEO and canonical fields to itinerary_items
ALTER TABLE public.itinerary_items
    -- Canonical references
    ADD COLUMN IF NOT EXISTS canonical_id UUID REFERENCES public.itinerary_items(id),
    ADD COLUMN IF NOT EXISTS canonical_url TEXT,
    
    -- SEO metadata
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS seo_title TEXT,
    ADD COLUMN IF NOT EXISTS seo_description TEXT,
    ADD COLUMN IF NOT EXISTS meta_keywords TEXT[],
    ADD COLUMN IF NOT EXISTS is_indexable BOOLEAN DEFAULT TRUE,
    
    -- Content quality tracking
    ADD COLUMN IF NOT EXISTS content_quality_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_content_review TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS review_notes TEXT,
    
    -- URL structure support
    ADD COLUMN IF NOT EXISTS public_url TEXT,
    ADD COLUMN IF NOT EXISTS url_path TEXT,
    
    -- Additional metadata
    ADD COLUMN IF NOT EXISTS last_meaningful_update TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique slugs within a trip
    ADD CONSTRAINT IF NOT EXISTS unique_trip_item_slug UNIQUE NULLS NOT DISTINCT (trip_id, slug);

-- Function to generate SEO-friendly slugs
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    slug TEXT;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special characters
    slug := lower(input_text);
    slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
    slug := regexp_replace(slug, '\s+', '-', 'g');
    slug := regexp_replace(slug, '-+', '-', 'g');
    slug := trim(both '-' from slug);
    
    -- Ensure slug is not too long (max 80 chars)
    IF length(slug) > 80 THEN
        slug := substring(slug, 1, 80);
        -- Make sure we don't cut in the middle of a multi-byte character
        slug := regexp_replace(slug, '[-]+$', '');
    END IF;
    
    RETURN slug;
END;
$$;

-- Function to build canonical URL path
CREATE OR REPLACE FUNCTION public.build_item_url_path(trip_id UUID, item_slug TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    trip_slug TEXT;
BEGIN
    -- Get trip slug
    SELECT generate_slug(name) INTO trip_slug
    FROM public.trips
    WHERE id = trip_id;
    
    RETURN '/trips/' || trip_slug || '/items/' || item_slug;
END;
$$;

-- Function to enhance copy_itinerary_item with SEO support
CREATE OR REPLACE FUNCTION public.copy_itinerary_item(
    source_item_id UUID,
    destination_trip_id UUID,
    user_id UUID,
    custom_date DATE DEFAULT NULL,
    custom_day_number INTEGER DEFAULT NULL,
    preserve_seo BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_item_id UUID;
    v_original_creator_id UUID;
    v_original_creator_name TEXT;
    v_source_canonical_id UUID;
    v_source_is_verified BOOLEAN;
    v_base_slug TEXT;
    v_unique_slug TEXT;
    v_url_path TEXT;
    v_counter INTEGER := 1;
BEGIN
    -- Get source item details
    SELECT 
        COALESCE(original_creator_id, created_by),
        COALESCE((SELECT username FROM public.profiles WHERE id = COALESCE(original_creator_id, created_by)), 'Unknown'),
        COALESCE(canonical_id, id),
        is_verified,
        COALESCE(slug, generate_slug(title))
    INTO 
        v_original_creator_id,
        v_original_creator_name,
        v_source_canonical_id,
        v_source_is_verified,
        v_base_slug
    FROM public.itinerary_items
    WHERE id = source_item_id;

    -- Generate unique slug
    v_unique_slug := v_base_slug;
    
    -- Ensure slug uniqueness within the destination trip
    WHILE EXISTS (
        SELECT 1 FROM public.itinerary_items
        WHERE trip_id = destination_trip_id AND slug = v_unique_slug
    ) LOOP
        v_unique_slug := v_base_slug || '-' || v_counter;
        v_counter := v_counter + 1;
    END LOOP;
    
    -- Generate URL path
    v_url_path := build_item_url_path(destination_trip_id, v_unique_slug);

    -- Create the new item as a copy with SEO handling
    INSERT INTO public.itinerary_items (
        -- Basic fields
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
        
        -- Content layering fields
        original_description,
        personal_notes,
        
        -- Attribution fields
        source_item_id,
        original_creator_id,
        attribution_text,
        
        -- Existing fields from previous migration
        tags,
        popularity_score,
        
        -- SEO fields
        canonical_id,
        canonical_url,
        slug,
        seo_title,
        seo_description,
        meta_keywords,
        is_indexable,
        
        -- URL structure
        url_path,
        public_url,
        
        -- Quality tracking
        content_quality_score,
        
        -- Timestamps
        last_meaningful_update
    )
    SELECT 
        -- Basic fields
        destination_trip_id,
        user_id,
        title,
        description,
        'suggested',
        start_time,
        end_time,
        COALESCE(custom_date, date),
        COALESCE(custom_day_number, day_number),
        address,
        latitude,
        longitude,
        place_id,
        category,
        TRUE,
        
        -- Content layering fields
        description,
        NULL,
        
        -- Attribution fields
        source_item_id,
        v_original_creator_id,
        COALESCE(
            attribution_text, 
            'Based on an activity originally created by ' || v_original_creator_name
        ),
        
        -- Existing fields
        tags,
        0,
        
        -- SEO fields
        CASE 
            WHEN preserve_seo AND v_source_is_verified THEN v_source_canonical_id
            ELSE NULL
        END,
        CASE 
            WHEN preserve_seo AND v_source_is_verified THEN canonical_url
            ELSE NULL
        END,
        v_unique_slug,
        COALESCE(seo_title, title),
        COALESCE(seo_description, substring(description, 1, 160)),
        meta_keywords,
        CASE 
            WHEN preserve_seo THEN is_indexable
            ELSE FALSE  -- Default new copies to non-indexable
        END,
        
        -- URL structure
        v_url_path,
        NULL,  -- Public URL will be set if/when trip is made public
        
        -- Quality tracking
        CASE
            WHEN v_source_is_verified THEN content_quality_score - 1 -- Slight reduction for copies
            ELSE 0
        END,
        
        -- Timestamps
        NOW()
        
    FROM public.itinerary_items
    WHERE id = source_item_id
    RETURNING id INTO v_new_item_id;
    
    -- Update source item metrics
    UPDATE public.itinerary_items
    SET 
        popularity_score = popularity_score + 1
    WHERE id = source_item_id;
    
    RETURN v_new_item_id;
END;
$$;

-- Function to update public URLs when a trip becomes public
CREATE OR REPLACE FUNCTION public.update_item_public_urls()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only proceed if trip is being made public
    IF NEW.is_public = TRUE AND (OLD.is_public = FALSE OR OLD.is_public IS NULL) THEN
        -- Update public URL for all items in this trip
        UPDATE public.itinerary_items
        SET 
            public_url = 
                CASE 
                    WHEN url_path IS NOT NULL THEN 'https://withme.travel' || url_path
                    ELSE NULL
                END,
            is_indexable = TRUE
        WHERE trip_id = NEW.id;
    
    -- If trip is being made private
    ELSIF NEW.is_public = FALSE AND OLD.is_public = TRUE THEN
        -- Remove public URLs
        UPDATE public.itinerary_items
        SET 
            public_url = NULL,
            is_indexable = FALSE
        WHERE trip_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for public URL updates
DROP TRIGGER IF EXISTS update_public_urls_trigger ON public.trips;
CREATE TRIGGER update_public_urls_trigger
AFTER UPDATE OF is_public ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_item_public_urls();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_itinerary_items_canonical_id ON public.itinerary_items(canonical_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_slug ON public.itinerary_items(trip_id, slug);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_quality ON public.itinerary_items(content_quality_score DESC);

-- Add documentation comments
COMMENT ON COLUMN public.itinerary_items.canonical_id IS 
    'Reference to the original, authoritative version of this content for SEO purposes';

COMMENT ON COLUMN public.itinerary_items.is_indexable IS 
    'Whether this item should be indexed by search engines';

COMMENT ON COLUMN public.itinerary_items.content_quality_score IS 
    'Score from 0-10 representing content quality for search ranking purposes';

COMMENT ON FUNCTION public.copy_itinerary_item IS 
    'Creates a copy of an itinerary item with proper SEO handling, maintaining canonical references';

