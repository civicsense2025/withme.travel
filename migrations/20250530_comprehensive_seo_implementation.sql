-- Migration: Comprehensive SEO Implementation
-- Date: 2025-05-30
-- Implements the withme.travel SEO Master Documentation v1.0

/*
This migration implements a comprehensive SEO framework aligned with the
withme.travel SEO Master Documentation v1.0, including:

1. URL Structure & Architecture
2. Canonical Tag Strategy
3. Content Organization
4. Technical SEO Requirements
5. User-Generated Content SEO
6. Schema Markup Strategy
7. Performance & Core Web Vitals tracking
8. International SEO support
9. Analytics integration

The implementation includes:
- Content type-based URL structure enforcement
- Schema.org markup generation
- Canonical tag management
- Content quality metrics
- SEO metadata management
- UGC handling with quality controls
- Performance metrics tracking
- International SEO support
*/

-- =============================================
-- TYPES AND ENUMS
-- =============================================

-- Content types determine URL structure and SEO handling
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

-- Content quality tiers for ranking and filtering
CREATE TYPE public.quality_tier AS ENUM (
    'premium',         -- Verified high-quality content
    'standard',        -- Normal quality content
    'basic'            -- Minimal quality content
);

-- Moderation status for UGC
CREATE TYPE public.moderation_status AS ENUM (
    'pending_review',  -- Awaiting moderation
    'approved',        -- Verified content
    'flagged',         -- Potentially problematic
    'rejected'         -- Removed from public view
);

-- =============================================
-- TABLE MODIFICATIONS
-- =============================================

-- Enhance itinerary_items with comprehensive SEO support
ALTER TABLE public.itinerary_items
    -- URL Structure & Organization
    ADD COLUMN IF NOT EXISTS content_type public.content_type,
    ADD COLUMN IF NOT EXISTS url_format public.url_format DEFAULT 'hybrid',
    ADD COLUMN IF NOT EXISTS public_slug TEXT,
    
    -- SEO Metadata
    ADD COLUMN IF NOT EXISTS meta_title TEXT,
    ADD COLUMN IF NOT EXISTS meta_description TEXT,
    ADD COLUMN IF NOT EXISTS meta_robots TEXT DEFAULT 'index,follow',
    
    -- Open Graph & Social
    ADD COLUMN IF NOT EXISTS og_title TEXT,
    ADD COLUMN IF NOT EXISTS og_description TEXT,
    ADD COLUMN IF NOT EXISTS og_image_url TEXT,
    ADD COLUMN IF NOT EXISTS twitter_card_type TEXT DEFAULT 'summary_large_image',
    
    -- Schema Markup
    ADD COLUMN IF NOT EXISTS schema_markup JSONB DEFAULT '{}'::JSONB,
    
    -- Content Quality Metrics
    ADD COLUMN IF NOT EXISTS quality_tier public.quality_tier DEFAULT 'standard',
    ADD COLUMN IF NOT EXISTS moderation_status public.moderation_status DEFAULT 'pending_review',
    ADD COLUMN IF NOT EXISTS content_word_count INTEGER,
    ADD COLUMN IF NOT EXISTS has_images BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_videos BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0, -- 0-100 score
    
    -- Core Web Vitals & Performance
    ADD COLUMN IF NOT EXISTS performance_metrics JSONB DEFAULT '{
        "lcp": null,
        "fid": null,
        "cls": null,
        "ttfb": null
    }'::JSONB,
    
    -- Analytics & Engagement
    ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS avg_time_on_page INTEGER, -- in seconds
    ADD COLUMN IF NOT EXISTS bounce_rate NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS search_impressions INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS search_clicks INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS click_through_rate NUMERIC(5,2) DEFAULT 0.0,
    
    -- International SEO
    ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
    ADD COLUMN IF NOT EXISTS country_code TEXT,
    ADD COLUMN IF NOT EXISTS hreflang_references JSONB DEFAULT '{}'::JSONB,
    
    -- Constraint to ensure slugs follow SEO best practices
    ADD CONSTRAINT slugs_seo_friendly CHECK (
        public_slug IS NULL OR 
        public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    );

-- Add URL-related generated columns
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
CREATE OR REPLACE FUNCTION public.generate_seo_slug(
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

-- Function to generate Schema.org markup based on content type
CREATE OR REPLACE FUNCTION public.generate_schema_markup(
    item_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    item_record public.itinerary_items;
    trip_record public.trips;
    place_record public.places;
    schema_data JSONB;
BEGIN
    -- Get item data
    SELECT * INTO item_record
    FROM public.itinerary_items
    WHERE id = item_id;
    
    -- Get related trip data if available
    SELECT * INTO trip_record
    FROM public.trips
    WHERE id = item_record.trip_id;
    
    -- Get related place data if available
    SELECT * INTO place_record
    FROM public.places
    WHERE id = item_record.place_id;
    
    -- Build schema markup based on content type
    CASE item_record.content_type
        WHEN 'destination' THEN
            schema_data := jsonb_build_object(
                '@context', 'https://schema.org',
                '@type', 'Place',
                'name', item_record.title,
                'description', item_record.description
            );
            
            -- Add geo coordinates if available
            IF item_record.latitude IS NOT NULL AND item_record.longitude IS NOT NULL THEN
                schema_data := schema_data || jsonb_build_object(
                    'geo', jsonb_build_object(
                        '@type', 'GeoCoordinates',
                        'latitude', item_record.latitude,
                        'longitude', item_record.longitude
                    )
                );
            END IF;
        
        WHEN 'itinerary' THEN
            schema_data := jsonb_build_object(
                '@context', 'https://schema.org',
                '@type', 'TouristTrip',
                'name', item_record.title,
                'description', item_record.description
            );
            
        WHEN 'public_trip' THEN
            schema_data := jsonb_build_object(
                '@context', 'https://schema.org',
                '@type', 'TouristTrip',
                'name', COALESCE(trip_record.name, item_record.title),
                'description', item_record.description
            );
            
            -- Add trip dates if available
            IF trip_record.start_date IS NOT NULL AND trip_record.end_date IS NOT NULL THEN
                schema_data := schema_data || jsonb_build_object(
                    'startDate', trip_record.start_date,
                    'endDate', trip_record.end_date
                );
            END IF;
            
        WHEN 'blog_post' THEN
            schema_data := jsonb_build_object(
                '@context', 'https://schema.org',
                '@type', 'BlogPosting',
                'headline', item_record.title,
                'description', item_record.description,
                'datePublished', item_record.created_at,
                'dateModified', item_record.updated_at
            );
            
        ELSE
            schema_data := jsonb_build_object(
                '@context', 'https://schema.org',
                '@type', 'WebPage',
                'name', item_record.title,
                'description', item_record.description
            );
    END CASE;
    
    -- Add common properties
    schema_data := schema_data || jsonb_build_object(
        'url', 'https://withme.travel' || item_record.full_url_path,
        'inLanguage', item_record.language
    );
    
    RETURN schema_data;
END;
$$;

-- Function to calculate content quality score
CREATE OR REPLACE FUNCTION public.calculate_quality_score(
    item_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    item_record public.itinerary_items;
    score INTEGER := 0;
BEGIN
    -- Get item data
    SELECT * INTO item_record
    FROM public.itinerary_items
    WHERE id = item_id;
    
    -- Base content quality factors (50%)
    IF item_record.content_word_count >= 300 THEN score := score + 10; END IF;
    IF item_record.content_word_count >= 600 THEN score := score + 10; END IF;
    IF item_record.has_images THEN score := score + 10; END IF;
    IF item_record.has_videos THEN score := score + 5; END IF;
    IF item_record.place_id IS NOT NULL THEN score := score + 5; END IF;
    IF array_length(item_record.tags, 1) > 3 THEN score := score + 5; END IF;
    IF item_record.meta_title IS NOT NULL AND length(item_record.meta_title) BETWEEN 30 AND 60 THEN score := score + 5; END IF;
    
    -- Engagement factors (30%)
    score := score + LEAST(item_record.page_views / 100, 10);
    score := score + LEAST(item_record.popularity_score, 10);
    IF item_record.avg_time_on_page > 120 THEN score := score + 10; END IF;
    
    -- Authority factors (20%)
    IF item_record.is_verified THEN score := score + 10; END IF;
    IF item_record.moderation_status = 'approved' THEN score := score + 10; END IF;
    
    -- Ensure score is within 0-100 range
    RETURN GREATEST(LEAST(score, 100), 0);
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
        default_desc := 'Explore ' || item_record.title || ' with withme.travel - your collaborative travel planning platform.';
    END IF;
    
    -- Update metadata
    UPDATE public.itinerary_items
    SET
        meta_title = COALESCE(p_meta_title, default_title),
        meta_description = COALESCE(p_meta_description, default_desc),
        og_title = COALESCE(p_meta_title, item_record.title),
        og_description = COALESCE(p_meta_description, default_desc)
    WHERE id = item_id;
END;
$$;

-- Function to update schema markup
CREATE OR REPLACE FUNCTION public.update_schema_markup(
    item_id UUID
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.itinerary_items
    SET schema_markup = public.generate_schema_markup(item_id)
    WHERE id = item_id;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for auto-generating slug and SEO metadata
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
            NEW.public_slug := public.generate_seo_slug(NEW.title);
            
            -- Ensure uniqueness within content type
            NEW.public_slug := public.ensure_unique_slug(
                NEW.public_slug, 
                NEW.content_type,
                CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
            );
        END IF;
        
        -- Auto-generate meta title if not set
        IF NEW.meta_title IS NULL THEN
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
    END IF;
    
    -- Auto-generate meta description if not set
    IF NEW.meta_description IS NULL AND NEW.description IS NOT NULL THEN
        NEW.meta_description := substring(
            regexp_replace(NEW.description, '\s+', ' ', 'g'),
            1, 
            160
        );
    END IF;
    
    -- Set Open Graph properties if not set
    IF NEW.og_title IS NULL THEN
        NEW.og_title := COALESCE(NEW.meta_title, NEW.title);
    END IF;
    
    IF NEW.og_description IS NULL THEN
        NEW.og_description := COALESCE(NEW.meta_description, substring(NEW.description, 1, 160));
    END IF;
    
    -- Calculate word count for quality metrics
    IF NEW.description IS NOT NULL THEN
        NEW.content_word_count := array_length(regexp_split_to_array(NEW.description, '\s+'), 1);
    END IF;
    
    -- Update quality tier based on score and verification
    IF NEW.is_verified = TRUE AND NEW.quality_score >= 70 THEN
        NEW.quality_tier := 'premium';
    ELSIF NEW.quality_score >= 40 THEN
        NEW.quality_tier := 'standard';
    ELSE
        NEW.quality_tier := 'basic';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for handling canonical relationships
CREATE OR REPLACE FUNCTION public.handle_canonical_relations()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- If this is a copy of another item
    IF NEW.source_item_id IS NOT NULL THEN
        -- If the source item is verified, maintain canonical relation
        DECLARE
            source_is_verified BOOLEAN;
            source_canonical_id UUID;
        BEGIN
            SELECT 
                is_verified,
                canonical_id
            INTO 
                source_is_verified,
                source_canonical_id
            FROM public.itinerary_items
            WHERE id = NEW.source_item_id;
            
            IF source_is_verified = TRUE THEN
                -- Use source's canonical if it has one
                NEW.canonical_id := COALESCE(source_canonical_id, NEW.source_item_id);
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trg_before_item_save ON public.itinerary_items;
CREATE TRIGGER trg_before_item_save
    BEFORE INSERT OR UPDATE
    ON public.itinerary_items
    FOR EACH ROW
    EXECUTE FUNCTION public.before_item_save();

DROP TRIGGER IF EXISTS trg_handle_canonical_relations ON public.itinerary_items;
CREATE TRIGGER trg_handle_canonical_relations
    BEFORE INSERT
    ON public.itinerary_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_canonical_relations();

-- After-save trigger to update schema markup
CREATE OR REPLACE FUNCTION public.after_item_save()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update schema markup
    NEW.schema_markup := public.generate_schema_markup(NEW.id);
    
    -- Calculate quality score
    NEW.quality_score := public.calculate_quality_score(NEW.id);
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_after_item_save ON public.itinerary_items;
CREATE TRIGGER trg_after_item_save
    AFTER INSERT OR UPDATE
    ON public.itinerary_items
    FOR EACH ROW
    EXECUTE FUNCTION public.after_item_save();

-- =============================================
-- INDEXES
-- =============================================

-- Indexes for SEO-specific queries
CREATE INDEX IF NOT EXISTS idx_items_seo_content_type ON public.itinerary_items(content_type);
CREATE INDEX IF NOT EXISTS idx_items_seo_slug ON public.itinerary_items(public_slug);
CREATE INDEX IF NOT EXISTS idx_items_seo_canonical ON public.itinerary_items(canonical_id);
CREATE INDEX IF NOT EXISTS idx_items_seo_quality ON public.itinerary_items(quality_tier, quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_items_seo_language ON public.itinerary_items(language, country_code);

-- Create full-text search index for content
CREATE INDEX IF NOT EXISTS idx_items_seo_fts ON public.itinerary_items 
USING gin(to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(meta_title, '') || ' ' || 
    COALESCE(meta_description, '')
));

-- =============================================
-- SAMPLE USAGE DOCUMENTATION
-- =============================================

COMMENT ON FUNCTION public.generate_seo_slug IS $$
Example:
SELECT public.generate_seo_slug('Visit the Louvre Museum in Paris!');
-- Returns: "visit-the-louvre-museum-in-paris"
$$;

COMMENT ON FUNCTION public.generate_schema_markup IS $$
Example:
SELECT public.generate_schema_markup('3f7b2a1c-9d8e-4f0a-b6c5-1d2e3f4a5b6c'::uuid);
-- Returns schema.org JSON for the specified item
$$;

COMMENT ON FUNCTION public.update_seo_metadata IS $$
Example:
SELECT public.update_seo_metadata(
    '3f7b2a1c-9d8e-4f0a-b6c5-1d2e3f4a5b6c'::uuid,
    'Custom SEO Title | withme.travel',
    'This is a custom meta description optimized for search engines.'
);
$$;

COMMENT ON TABLE public.itinerary_items IS $$
Items now support comprehensive SEO features:

1. Creating a new item with SEO support:
INSERT INTO public.itinerary_items (
    trip_id,
    title,
    description,
    content_type,
    url_format,
    language,
    country_code
) VALUES (
    '123e4567-e89b-12d3-a456-426614174000'::uuid,
    'Weekend in Paris',
    'A perfect weekend itinerary for exploring Paris...',
    'itinerary',
    'slug_only',
    'en',
    'fr'
);

2. The system automatically:
   - Generates SEO-friendly slug: "weekend-in-paris"
   - Creates meta title: "Weekend in Paris | Itinerary Template | withme.travel"
   - Generates meta description from content
   - Sets up schema.org markup
   - Establishes canonical URL
   - Calculates quality score
$$;
