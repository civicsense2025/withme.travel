-- Migration: SEO Implementation
-- Date: 2025-04-26
-- Description: Implements SEO functionality including content types, URL formats, and slug generation

-- Create ENUMs for content types and URL formats
CREATE TYPE content_type AS ENUM (
    'trip',
    'itinerary_item',
    'destination',
    'collection',
    'template'
);

CREATE TYPE url_format AS ENUM (
    'canonical',
    'short',
    'social',
    'tracking'
);

-- Add SEO fields to itinerary_items
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS structured_data JSONB DEFAULT '{}'::jsonb;

-- Create slugs table to track and ensure uniqueness
CREATE TABLE IF NOT EXISTS content_slugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type content_type NOT NULL,
    content_id UUID NOT NULL,
    slug TEXT NOT NULL,
    is_canonical BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(content_type, slug)
);

-- Add RLS to slugs table
ALTER TABLE content_slugs ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_slugs
CREATE POLICY "Public read access to content slugs"
    ON content_slugs FOR SELECT
    USING (true);

CREATE POLICY "Content owners can manage slugs"
    ON content_slugs 
    USING (
        CASE content_type
            WHEN 'trip' THEN
                auth.uid() IN (
                    SELECT user_id FROM trip_members 
                    WHERE trip_id = content_id AND role IN ('admin', 'editor')
                )
            WHEN 'itinerary_item' THEN
                auth.uid() IN (
                    SELECT user_id FROM trip_members 
                    WHERE trip_id = (
                        SELECT trip_id FROM itinerary_items WHERE id = content_id
                    ) AND role IN ('admin', 'editor')
                )
            ELSE auth.uid() = created_by
        END
    );

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
    normalized_text TEXT;
BEGIN
    -- Convert to lowercase and remove special characters
    normalized_text := lower(input_text);
    normalized_text := regexp_replace(normalized_text, '[^a-zA-Z0-9\s-]', '', 'g');
    -- Replace spaces with hyphens
    normalized_text := regexp_replace(normalized_text, '\s+', '-', 'g');
    -- Remove multiple consecutive hyphens
    normalized_text := regexp_replace(normalized_text, '-+', '-', 'g');
    -- Trim hyphens from start and end
    normalized_text := trim(both '-' from normalized_text);
    
    RETURN normalized_text;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(
    input_text TEXT,
    content_type_val content_type,
    content_id_val UUID
) RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generate base slug
    base_slug := generate_slug(input_text);
    final_slug := base_slug;
    
    -- Keep trying until we find a unique slug
    WHILE EXISTS (
        SELECT 1 FROM content_slugs 
        WHERE content_type = content_type_val 
        AND slug = final_slug 
        AND content_id != content_id_val
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter::TEXT;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to maintain canonical URLs
CREATE OR REPLACE FUNCTION update_canonical_url()
RETURNS TRIGGER AS $$
DECLARE
    v_base_url TEXT := 'https://withme.travel';  -- Configurable base URL
    v_trip_slug TEXT;
BEGIN
    -- Get trip slug
    SELECT slug INTO v_trip_slug
    FROM content_slugs
    WHERE content_type = 'trip'
    AND content_id = NEW.trip_id
    AND is_canonical = true;
    
    -- Generate item slug if not exists
    IF NEW.slug IS NULL THEN
        NEW.slug := generate_unique_slug(NEW.title, 'itinerary_item', NEW.id);
        
        -- Insert into content_slugs
        INSERT INTO content_slugs (
            content_type,
            content_id,
            slug,
            is_canonical,
            created_by
        ) VALUES (
            'itinerary_item',
            NEW.id,
            NEW.slug,
            true,
            auth.uid()
        );
    END IF;
    
    -- Update canonical URL
    NEW.canonical_url := v_base_url || '/trips/' || 
        COALESCE(v_trip_slug, 'default') || 
        '/items/' || NEW.slug;
    
    -- Generate SEO title if not set
    IF NEW.seo_title IS NULL THEN
        NEW.seo_title := NEW.title || ' - WithMe Travel';
    END IF;
    
    -- Generate SEO description if not set
    IF NEW.seo_description IS NULL THEN
        NEW.seo_description := COALESCE(NEW.description, NEW.title) || 
            ' - Plan your perfect trip with WithMe Travel';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for maintaining canonical URLs
CREATE TRIGGER maintain_seo_fields
    BEFORE INSERT OR UPDATE ON itinerary_items
    FOR EACH ROW
    EXECUTE FUNCTION update_canonical_url();

-- Add indexes for SEO fields
CREATE INDEX IF NOT EXISTS idx_itinerary_items_slug ON itinerary_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_slugs_lookup ON content_slugs(content_type, slug);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_seo ON itinerary_items(seo_title, canonical_url);

-- Add comments
COMMENT ON TABLE content_slugs IS 'Tracks unique slugs for all content types';
COMMENT ON FUNCTION generate_slug IS 'Generates a URL-friendly slug from input text';
COMMENT ON FUNCTION generate_unique_slug IS 'Generates a unique slug for a given content type and ID';
COMMENT ON FUNCTION update_canonical_url IS 'Maintains canonical URLs and SEO fields for itinerary items';

