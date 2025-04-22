-- Add privacy fields to trips table
ALTER TABLE trips 
ADD COLUMN is_public BOOLEAN DEFAULT false,
ADD COLUMN public_slug TEXT UNIQUE;

-- Create function to generate a random slug
CREATE OR REPLACE FUNCTION generate_random_slug(length INTEGER) RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to generate a slug for public trips
CREATE OR REPLACE FUNCTION generate_public_slug() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_public = true AND (NEW.public_slug IS NULL OR NEW.public_slug = '') THEN
    -- Try to generate a unique slug (retry up to 5 times if collision)
    FOR i IN 1..5 LOOP
      NEW.public_slug := generate_random_slug(10);
      
      -- Check if slug exists
      IF NOT EXISTS (SELECT 1 FROM trips WHERE public_slug = NEW.public_slug) THEN
        RETURN NEW;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slug for public trips
CREATE TRIGGER trips_generate_public_slug
BEFORE INSERT OR UPDATE ON trips
FOR EACH ROW
EXECUTE FUNCTION generate_public_slug();
