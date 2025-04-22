-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  place_id TEXT,
  country TEXT,
  city TEXT,
  description TEXT,
  latitude FLOAT,
  longitude FLOAT,
  image_url TEXT,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS destinations_name_idx ON destinations USING gin (name gin_trgm_ops);

-- Add extension for text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add some initial popular destinations
INSERT INTO destinations (name, country, city, description, popularity, image_url) 
VALUES 
('Barcelona, Spain', 'Spain', 'Barcelona', 'City in Catalonia, Spain', 100, '/barceloneta-sand-and-sea.png'),
('Tokyo, Japan', 'Japan', 'Tokyo', 'Capital city of Japan', 95, '/tokyo-twilight.png'),
('New York, USA', 'USA', 'New York', 'City in New York State, USA', 90, '/manhattan-twilight.png'),
('Paris, France', 'France', 'Paris', 'Capital city of France', 85, '/Parisian-Cafe-Scene.png'),
('London, UK', 'UK', 'London', 'Capital city of the United Kingdom', 80, '/london-cityscape.png'),
('Rome, Italy', 'Italy', 'Rome', 'Capital city of Italy', 75, '/ancient-heart-modern-life.png'),
('Bangkok, Thailand', 'Thailand', 'Bangkok', 'Capital city of Thailand', 70, '/bustling-bangkok-street.png'),
('California Coast, USA', 'USA', 'California', 'Coastal region in California', 65, '/california-highway-one.png')
ON CONFLICT (id) DO NOTHING;
