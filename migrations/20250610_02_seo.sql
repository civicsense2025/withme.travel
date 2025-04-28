-- Migration: SEO Implementation for Content Sharing
-- Description: Implements SEO best practices and canonical URL management
-- Created: 2025-06-10

/*
This migration implements SEO features for content sharing:
1. Content type and URL format enums
2. SEO fields (canonical IDs, URLs, meta data)
3. Slug generation
4. URL path computation

These changes enable proper SEO management for shared content with
canonical references and search-engine friendly URLs.
*/

-- =============================================
-- TYPES
-- =============================================

-- Create content type enum
CREATE TYPE content_type_enum AS ENUM (
  'trip',
  'itinerary_item',
  'destination',
  'template'
);

-- Create URL format enum
CREATE TYPE url_format_enum AS ENUM (
  'slug',      -- Human-readable slugs (e.g., /trip/summer-in-paris)
  'uuid',      -- UUID-based URLs (e.g., /trip/123e4567-e89b...)
  'custom'     -- Custom format URLs (e.g., /t/summer-paris-2025)
);

-- =============================================
-- ITINERARY ITEMS SEO ENHANCEMENTS
-- =============================================

-- Add SEO fields to itinerary_items
ALTER TABLE itinerary_items
  ADD COLUMN IF NOT EXISTS content_type content_type_enum DEFAULT 'itinerary_item',
  ADD COLUMN IF NOT EXISTS url_format url_format_enum DEFAULT 'slug',
  ADD COLUMN IF NOT EXISTS canonical_id UUID REFERENCES itinerary_items(id),
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS public_slug TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add unique constraint on public_slug (with exclusion for NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_itinerary_items_public_slug ON itinerary_items (public_slug) 
WHERE public_slug IS NOT NULL;

-- =============================================
-- TRIPS SEO ENHANCEMENTS
-- =============================================

-- Add SEO fields to trips
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS content_type content_type_enum DEFAULT 'trip',
  ADD COLUMN IF NOT EXISTS url_format url_format_enum DEFAULT 'slug',
  ADD COLUMN IF NOT EXISTS canonical_id UUID REFERENCES trips(id),
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- =============================================
-- SLUG GENERATION
-- =============================================

-- Function to sanitize text for slug creation
CREATE OR REPLACE FUNCTION sanitize_for_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  sanitized TEXT;
BEGIN
  -- Convert to lowercase
  sanitized := lower(input_text);
  
  -- Replace non-alphanumeric characters with hyphens
  sanitized := regexp_replace(sanitized, '[^a-z0-9]+', '-', 'g');
  
  -- Remove leading and trailing hyphens
  sanitized := trim(both '-' from sanitized);
  
  -- Limit to 100 characters
  sanitized := substring(sanitized, 1, 100);
  
  RETURN sanitized;
END;
$$;

-- Function to generate a unique slug for itinerary items
CREATE OR REPLACE FUNCTION generate_unique_item_slug(
  item_id UUID,
  title TEXT,
  attempt INTEGER DEFAULT 0
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  -- Generate base slug from title or use 'item' if title is empty
  IF title IS NULL OR title = '' THEN
    base_slug := 'item';
  ELSE
    base_slug := sanitize_for_slug(title);
  END IF;
  
  -- Add attempt number for subsequent tries
  IF attempt > 0 THEN
    final_slug := base_slug || '-' || attempt;
  ELSE
    final_slug := base_slug;
  END IF;
  
  -- Check if slug already exists
  SELECT EXISTS (
    SELECT 1 FROM itinerary_items
    WHERE public_slug = final_slug
    AND id != item_id
  ) INTO slug_exists;
  
  -- Recursively try again with incremented attempt if slug exists
  IF slug_exists THEN
    RETURN generate_unique_item_slug(item_id, title, attempt + 1);
  END IF;
  
  RETURN final_slug;
END;
$$;

-- Function to generate a unique slug for trips
CREATE OR REPLACE FUNCTION generate_unique_trip_slug(
  trip_id UUID,
  name TEXT,
  attempt INTEGER DEFAULT 0
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  -- Generate base slug from name or use 'trip' if name is empty
  IF name IS NULL OR name = '' THEN
    base_slug := 'trip';
  ELSE
    base_slug := sanitize_for_slug(name);
  END IF;
  
  -- Add attempt number for subsequent tries
  IF attempt > 0 THEN
    final_slug := base_slug || '-' || attempt;
  ELSE
    final_slug := base_slug;
  END IF;
  
  -- Check if slug already exists
  SELECT EXISTS (
    SELECT 1 FROM trips
    WHERE public_slug = final_slug
    AND id != trip_id
  ) INTO slug_exists;
  
  -- Recursively try again with incremented attempt if slug exists
  IF slug_exists THEN
    RETURN generate_unique_trip_slug(trip_id, name, attempt + 1);
  END IF;
  
  RETURN final_slug;
END;
$$;

-- =============================================
-- URL PATH COMPUTATION
-- =============================================

-- Function to compute a canonical URL for an itinerary item
CREATE OR REPLACE FUNCTION compute_item_canonical_url(
  item_id UUID,
  format url_format_enum DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  item_record RECORD;
  trip_record RECORD;
  result_url TEXT;
  item_slug TEXT;
  trip_slug TEXT;
  base_url TEXT := 'https://withme.travel';
BEGIN
  -- Get item data
  SELECT * INTO item_record FROM itinerary_items WHERE id = item_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Get trip data
  SELECT * INTO trip_record FROM trips WHERE id = item_record.trip_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Use provided format or fall back to item's format
  IF format IS NULL THEN
    format := item_record.url_format;
  END IF;
  
  -- Handle different URL formats
  CASE format
    WHEN 'slug' THEN
      -- Ensure item has a slug
      IF item_record.public_slug IS NULL THEN
        item_slug := generate_unique_item_slug(item_id, item_record.title);
        UPDATE itinerary_items SET public_slug = item_slug WHERE id = item_id;
      ELSE
        item_slug := item_record.public_slug;
      END IF;
      
      -- Ensure trip has a slug
      IF trip_record.public_slug IS NULL THEN
        trip_slug := generate_unique_trip_slug(trip_record.id, trip_record.name);
        UPDATE trips SET public_slug = trip_slug WHERE id = trip_record.id;
      ELSE
        trip_slug := trip_record.public_slug;
      END IF;
      
      result_url := base_url || '/trip/' || trip_slug || '/item/' || item_slug;
      
    WHEN 'uuid' THEN
      result_url := base_url || '/trip/' || trip_record.id || '/item/' || item_id;
      
    WHEN 'custom' THEN
      -- For custom, we combine trip and item in a shorter format
      IF item_record.public_slug IS NULL THEN
        item_slug := generate_unique_item_slug(item_id, item_record.title);
        UPDATE itinerary_items SET public_slug = item_slug WHERE id = item_id;
      ELSE
        item_slug := item_record.public_slug;
      END IF;
      
      result_url := base_url || '/i/' || item_slug;
      
    ELSE
      result_url := base_url || '/trip/' || trip_record.id || '/item/' || item_id;
  END CASE;
  
  RETURN result_url;
END;
$$;

-- Function to compute a canonical URL for a trip
CREATE OR REPLACE FUNCTION compute_trip_canonical_url(
  trip_id UUID,
  format url_format_enum DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  trip_record RECORD;
  result_url TEXT;
  trip_slug TEXT;
  base_url TEXT := 'https://withme.travel';
BEGIN
  -- Get trip data
  SELECT * INTO trip_record FROM trips WHERE id = trip_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Use provided format or fall back to trip's format
  IF format IS NULL THEN
    format := trip_record.url_format;
  END IF;
  
  -- Handle different URL formats
  CASE format
    WHEN 'slug' THEN
      -- Ensure trip has a slug
      IF trip_record.public_slug IS NULL THEN
        trip_slug := generate_unique_trip_slug(trip_id, trip_record.name);
        UPDATE trips SET public_slug = trip_slug WHERE id = trip_id;
      ELSE
        trip_slug := trip_record.public_slug;
      END IF;
      
      result_url := base_url || '/trip/' || trip_slug;
      
    WHEN 'uuid' THEN
      result_url := base_url || '/trip/' || trip_id;
      
    WHEN 'custom' THEN
      -- For custom, we use a shorter format
      IF trip_record.public_slug IS NULL THEN
        trip_slug := generate_unique_trip_slug(trip_id, trip_record.name);
        UPDATE trips SET public_slug = trip_slug WHERE id = trip_id;
      ELSE
        trip_slug := trip_record.public_slug;
      END IF;
      
      result_url := base_url || '/t/' || trip_slug;
      
    ELSE
      result_url := base_url || '/trip/' || trip_id;
  END CASE;
  
  RETURN result_url;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger function to update canonical URLs when content changes
CREATE OR REPLACE FUNCTION update_item_canonical_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if it's not a derivative work (i.e., it's an original or it is its own canonical)
  IF NEW.canonical_id IS NULL OR NEW.canonical_id = NEW.id THEN
    NEW.canonical_url := compute_item_canonical_url(NEW.id, NEW.url_format);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for item canonical URL updates
CREATE TRIGGER trg_update_item_canonical_url
BEFORE INSERT OR UPDATE OF title, url_format, public_slug, canonical_id
ON itinerary_items
FOR EACH ROW
EXECUTE FUNCTION update_item_canonical_url();

-- Trigger function to update trip canonical URLs when content changes
CREATE OR REPLACE FUNCTION update_trip_canonical_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if it's not a derivative work
  IF NEW.canonical_id IS NULL OR NEW.canonical_id = NEW.id THEN
    NEW.canonical_url := compute_trip_canonical_url(NEW.id, NEW.url_format);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trip canonical URL updates
CREATE TRIGGER trg_update_trip_canonical_url
BEFORE INSERT OR UPDATE OF name, url_format, public_slug, canonical_id
ON trips
FOR EACH ROW
EXECUTE FUNCTION update_trip_canonical_url();

-- =============================================
-- META DESCRIPTION GENERATION
-- =============================================

-- Function to generate meta description for items
CREATE OR REPLACE FUNCTION generate_item_meta_description(
  item_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  item_record RECORD;
  trip_record RECORD;
  description TEXT;
BEGIN
  -- Get item data
  SELECT * INTO item_record FROM itinerary_items WHERE id = item_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Get trip data
  SELECT * INTO trip_record FROM trips WHERE id = item_record.trip_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Generate meta description
  IF item_record.description IS NOT NULL AND LENGTH(item_record.description) > 0 THEN
    -- Use item description if available
    description := substring(item_record.description, 1, 150);
    IF LENGTH(item_record.description) > 150 THEN
      description := description || '...';
    END IF;
  ELSE
    -- Fall back to generic description
    description := item_record.title || ' in ' || trip_record.name;
    
    -- Add location if available
    IF item_record.location IS NOT NULL AND item_record.location != '' THEN
      description := description || ' - ' || item_record.location;
    END IF;
  END IF;
  
  RETURN description;
END;
$$;

-- =============================================
-- INDEXES
-- =============================================

-- Create indexes for SEO fields
CREATE INDEX IF NOT EXISTS idx_itinerary_items_canonical_id ON itinerary_items(canonical_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_content_type ON itinerary_items(content_type);
CREATE INDEX IF NOT EXISTS idx_trips_canonical_id ON trips(canonical_id);
CREATE INDEX IF NOT EXISTS idx_trips_public_slug ON trips(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trips_content_type ON trips(content_type);

-- =============================================
-- COMMENTS
-- =============================================

-- Add helpful comments
COMMENT ON COLUMN itinerary_items.content_type IS 'Type of content for SEO purposes';
COMMENT ON COLUMN itinerary_items.url_format IS 'Format of URL to use for this item';
COMMENT ON COLUMN itinerary_items.canonical_id IS 'Reference to the canonical version of this content';
COMMENT ON COLUMN itinerary_items.canonical_url IS 'Full canonical URL for this item';
COMMENT ON COLUMN itinerary_items.public_slug IS 'SEO-friendly slug for use in URLs';
COMMENT ON COLUMN itinerary_items.meta_title IS 'Custom title for SEO purposes';
COMMENT ON COLUMN itinerary_items.meta_description IS 'Description for search engine results';

COMMENT ON COLUMN trips.content_type IS 'Type of content for SEO purposes';
COMMENT ON COLUMN trips.url_format IS 'Format of URL to use for this trip';
COMMENT ON COLUMN trips.canonical_id IS 'Reference to the canonical

-- Migration: SEO Implementation for Content Sharing
-- Date: 2025-06-10

/*
This migration implements SEO functionality for the content sharing system:
1. Content type classification
2. URL structure and formats
3. Canonical references
4. Meta tags and descriptions

The implementation follows the withme.travel SEO Master Documentation v1.0
to ensure consistent URL structures and proper SEO practices.
*/

-- =============================================
-- TYPES
-- =============================================

-- Content type determines URL structure and SEO handling
CREATE TYPE public.content_type AS ENUM (
    'destination',     -- /destinations/[city-slug]
    'itinerary',       -- /itineraries/[template-slug]
    'public_trip',     -- /trips/[trip-id]/[trip-slug]
    'private_trip',    -- /trips/[unique-trip-id]
    'blog_post',       -- /blog/[post-slug]
    'static_page'      -- /[page-slug]
);

-- URL format determines how URLs are structured
CREATE TYPE public.url_format AS ENUM (
    'slug_only',       -- SEO-friendly URLs for static content
    'id_only',         -- System/transactional content
    'hybrid'           -- Combination for UGC
);

-- =============================================
-- SCHEMA UPDATES
-- =============================================

-- Add SEO fields to itinerary_items
ALTER TABLE public.itinerary_items
    -- Content classification
    ADD COLUMN IF NOT EXISTS content_type public.content_type,
    ADD COLUMN IF NOT EXISTS url_format public.url_format DEFAULT 'hybrid',
    
    -- URL structure
    ADD COLUMN IF NOT EXISTS public_slug TEXT,
    ADD COLUMN IF NOT EXISTS canonical_id UUID REFERENCES public.itinerary_items(id),
    
    -- Meta tags
    ADD COLUMN IF NOT EXISTS meta_title TEXT,
    ADD COLUMN IF NOT EXISTS meta_description TEXT,
    ADD COLUMN IF NOT EXISTS meta_robots TEXT DEFAULT 'index,follow',
    
    -- Open Graph metadata
    ADD COLUMN IF NOT EXISTS og_title TEXT,
    ADD COLUMN IF NOT EXISTS og_description TEXT,
    ADD COLUMN IF NOT EXISTS og_image_url TEXT,
    
    -- Schema.org support
    ADD COLUMN IF NOT EXISTS schema_markup JSONB DEFAULT '{}'::JSONB,
    
    -- Indexing control
    ADD COLUMN IF NOT EXISTS is_indexable BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMPTZ,
    
    -- International SEO
    ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
    ADD COLUMN IF NOT EXISTS hreflang_references JSONB DEFAULT '{}'::JSONB,
    
    -- SEO tracking
    ADD COLUMN IF NOT EXISTS last_meaningful_update TIMESTAMPTZ DEFAULT NOW();

-- Add computed URL columns
ALTER TABLE public.itinerary_items
    -- Full URL path based on content type and format
    ADD COLUMN IF NOT EXISTS full_url_path TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN content_type = 'destination' THEN '/destinations/' || public_slug
            WHEN content_type = 'itinerary' THEN '/itineraries/' || public_slug
            WHEN content_type = 'public_trip' THEN '/trips/' || trip_id::text || '/' || public_slug
            WHEN content_type = 'private_trip' THEN '/trips/' || trip_id::text
            WHEN content_type = 'blog_post' THEN '/blog/' || public_slug
            WHEN content_type = 'static_page' THEN '/' || public_slug
            ELSE NULL
        END
    ) STORED,
    
    -- Canonical URL (absolute)
    ADD COLUMN IF NOT EXISTS canonical_url TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN canonical_id IS NOT NULL THEN
                -- Using canonical reference if available
                (SELECT 'https://withme.travel' || i.full_url_path 
                FROM public.itinerary_items i 
                WHERE i.id = canonical_id)
            ELSE
                -- Self-referencing canonical
                'https://withme.travel' || full_url_path
        END
    ) STORED;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate SEO-friendly slugs
CREATE OR REPLACE FUNCTION public.generate_slug(
    input_text TEXT,
    max_length INTEGER DEFAULT 80
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    slug TEXT;
BEGIN
    -- Follow SEO best practices for slugs
    -- 1. Convert to lowercase
    slug := lower(input_text);
    
    -- 2. Remove special characters
    slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
    
    -- 3. Replace spaces with hyphens
    slug := regexp_replace(slug, '\s+', '-', 'g');
    
    -- 4. Remove consecutive hyphens
    slug := regexp_replace(slug, '-+', '-', 'g');
    
    -- 5. Trim hyphens from both ends
    slug := trim(both '-' from slug);
    
    -- 6. Limit length (SEO best practice)
    IF length(slug) > max_length THEN
        slug := substring(slug, 1, max_length);
        -- Ensure we don't cut in the middle of a word
        slug := regexp_replace(slug, '-[^-]*$', '');
    END IF;
    
    RETURN slug;
END;
$$;

-- Function to ensure slug uniqueness within content type
CREATE OR REPLACE FUNCTION public.ensure_unique_slug(
    base_slug TEXT,
    content_type_val public.content_type,
    existing_id UUID DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    unique_slug TEXT := base_slug;
    counter INTEGER := 1;
BEGIN
    -- Check if slug exists for this content type
    WHILE EXISTS (
        SELECT 1 FROM public.itinerary_items
        WHERE content_type = content_type_val
          AND public_slug = unique_slug
          AND (existing_id IS NULL OR id != existing_id)
    ) LOOP
        -- Add incremental number if slug exists
        unique_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN unique_slug;
END;
$$;

-- Function to update SEO metadata
CREATE OR REPLACE FUNCTION public.update_seo_metadata(
    item_id UUID,
    p_meta_title TEXT DEFAULT NULL,
    p_meta_description TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    item_record public.itinerary_items;
    default_title TEXT;
    default_desc TEXT;
BEGIN
    -- Get item data
    SELECT * INTO item_record
    FROM public.itinerary_items
    WHERE id = item_id;
    
    -- Create default SEO title based on item type
    CASE item_record.content_type
        WHEN 'destination' THEN
            default_title := item_record.title || ' Travel Guide | withme.travel';
        WHEN 'itinerary' THEN
            default_title := item_record.title || ' | Itinerary Template | withme.travel';
        WHEN 'public_trip' THEN
            default_title := item_record.title || ' | Travel Plan | withme.travel';
        WHEN 'blog_post' THEN
            default_title := item_record.title || ' | Travel Blog | withme.travel';
        ELSE
            default_title := item_record.title || ' | withme.travel';
    END CASE;
    
    -- Create default meta description
    IF item_record.description IS NOT NULL THEN
        default_desc := substring(
            regexp_replace(
                item_record.description,
                '\s+',
                ' ',
                'g'
            ),
            1,
            160
        );
    ELSE
        default_desc := 'Plan your trip to ' || coalesce(item_record.title, 'your destination') || ' with withme.travel - the collaborative travel planning platform.';
    END IF;
    
    -- Update metadata
    UPDATE public.itinerary_items
    SET
        meta_title = COALESCE(p_meta_title, default_title),
        meta_description = COALESCE(p_meta_description, default_desc),
        og_title = COALESCE(p_meta_title, item_record.title),
        og_description = COALESCE(p_meta_description, default_desc),
        last_meaningful_update = NOW()
    WHERE id = item_id;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-generate slug on insert or title update
CREATE OR REPLACE FUNCTION public.before_item_save()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- For new items or items with changed titles
    IF TG_OP = 'INSERT' OR NEW.title <> OLD.title OR NEW.public_slug IS NULL THEN
        -- Generate slug if not provided
        IF NEW.public_slug IS NULL AND NEW.title IS NOT NULL THEN
            -- Generate base slug
            NEW.public_slug := public.generate_slug(NEW.title);
            
            -- Ensure uniqueness within content type
            IF NEW.content_type IS NOT NULL THEN
                NEW.public_slug := public.ensure_unique_slug(
                    NEW.public_slug, 
                    NEW.content_type,
                    CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
                );
            END IF;
        END IF;
    END IF;
    
    -- Set default meta title if not provided
    IF NEW.meta_title IS NULL AND NEW.title IS NOT NULL THEN
        CASE NEW.content_type
            WHEN 'destination' THEN
                NEW.meta_title := NEW.title || ' Travel Guide | withme.travel';
            WHEN 'itinerary' THEN
                NEW.meta_title := NEW.title || ' | Itinerary Template | withme.travel';
            WHEN 'public_trip' THEN
                NEW.meta_title := NEW.title || ' | Travel Plan | withme.travel';
            WHEN 'blog_post' THEN
                NEW.meta_title := NEW.title || ' | Travel Blog | withme.travel';
            ELSE
                NEW.meta_title := NEW.title || ' | withme.travel';
        END CASE;
    END IF;
    
    -- Set default meta description if not provided
    IF NEW.meta_description IS NULL AND NEW.description IS NOT NULL THEN
        NEW.meta_description := substring(regexp_replace(NEW.description, '\s+', ' ', 'g'), 1, 160);
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_before_item_save
    BEFORE INSERT OR UPDATE ON public.itinerary_items
    FOR EACH ROW
    EXECUTE FUNCTION public.before_item_save();

-- =============================================
-- INDEXES
-- =============================================

-- Create SEO-specific indexes
CREATE INDEX IF NOT EXISTS idx_items_content_type ON public.itinerary_items(content_type);
CREATE INDEX IF NOT EXISTS idx_items_slug ON public.itinerary_items(public_slug);
CREATE INDEX IF NOT EXISTS idx_items_canonical ON public.itinerary_items(canonical_id);

-- Full text search for content
CREATE INDEX IF NOT EXISTS idx_items_fts ON public.itinerary_items 
USING gin(to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(meta_title, '') || ' ' || 
    COALESCE(meta_description, '')
));

-- =============================================
-- COMMENTS
-- =============================================

-- Add descriptive comments
COMMENT ON COLUMN public.itinerary_items.content_type IS 
    'Type of content that determines URL structure and SEO handling';

COMMENT ON COLUMN public.itinerary_items.canonical_id IS 
    'Reference to the original, authoritative version of this content for SEO purposes';

COMMENT ON COLUMN public.itinerary_items.canonical_url IS 
    'Complete canonical URL for this content, generated automatically';

COMMENT ON COLUMN public.itinerary_items.public_slug IS 
    'SEO-friendly URL slug used in public URLs';

COMMENT ON COLUMN public.itinerary_items.meta_title IS 
    'SEO title for search engines, ideally 50-60 characters';

COMMENT ON COLUMN public.itinerary_items.meta_description IS 
    'SEO description for search results, ideally 150-160 characters';

COMMENT ON COLUMN public.itinerary_items.schema_markup IS 
    'JSON-LD Schema.org markup for enhanced search results';

COMMENT ON FUNCTION public.generate_slug IS 
    'Creates SEO-friendly slugs from text by removing special characters and using hyphens';

COMMENT ON FUNCTION public.ensure_unique_slug IS 
    'Ensures slugs are unique within a content type by adding incremental numbers if needed';

COMMENT ON FUNCTION public.update_seo_metadata IS 
    'Updates SEO metadata with custom values or generates appropriate defaults';

