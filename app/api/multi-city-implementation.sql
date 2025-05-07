-- Multi-City Implementation: SQL Migration for Steps 2-5 of Phase 1

-- Step 2: Create the canonical cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  region TEXT,
  continent TEXT,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  mapbox_id TEXT,
  population INTEGER,
  timezone TEXT,
  country_code CHAR(2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add appropriate indexes
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_country ON public.cities(country);
CREATE INDEX IF NOT EXISTS idx_cities_location ON public.cities USING gist (
  point(longitude, latitude)::geometry
);

-- Set RLS policies for cities table
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are viewable by everyone" ON public.cities
  FOR SELECT USING (true);
CREATE POLICY "Only admins can create/modify cities" ON public.cities
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Step 3: Create the trip_cities join table with ordering
CREATE TABLE IF NOT EXISTS public.trip_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL DEFAULT 0,  -- For ordering cities in a multi-city trip
  arrival_date DATE,
  departure_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Each city can only be added once to a trip
  UNIQUE(trip_id, city_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trip_cities_trip_id ON public.trip_cities(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_cities_city_id ON public.trip_cities(city_id);
CREATE INDEX IF NOT EXISTS idx_trip_cities_position ON public.trip_cities(trip_id, position);

-- Set RLS policies
ALTER TABLE public.trip_cities ENABLE ROW LEVEL SECURITY;

-- Anyone can view trip cities for public trips
CREATE POLICY "Trip cities are viewable for public trips" ON public.trip_cities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id
      AND (t.privacy_setting = 'public' OR t.privacy_setting = 'shared_with_link')
    )
  );

-- Trip members can view trip cities
CREATE POLICY "Trip members can view trip cities" ON public.trip_cities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = trip_id
      AND tm.user_id = auth.uid()
    )
  );

-- Trip admins and editors can modify trip cities
CREATE POLICY "Trip admins/editors can modify trip cities" ON public.trip_cities
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = trip_id
      AND tm.user_id = auth.uid()
      AND (tm.role = 'admin' OR tm.role = 'editor')
    )
  );

-- Step 4: Add city_id reference to destinations table
ALTER TABLE public.destinations 
  ADD COLUMN city_id UUID REFERENCES public.cities(id),
  ADD COLUMN is_city_deprecated BOOLEAN DEFAULT FALSE;

-- Step 5: Update itinerary_sections to work with trip_cities
ALTER TABLE public.itinerary_sections
  ADD COLUMN trip_city_id UUID REFERENCES public.trip_cities(id) ON DELETE CASCADE,
  -- Default position to 0 (for backward compatibility):
  ALTER COLUMN position SET DEFAULT 0;

-- Add index for the new trip_city_id column
CREATE INDEX IF NOT EXISTS idx_itinerary_sections_trip_city_id ON public.itinerary_sections(trip_city_id);

-- Create function to get the ordered cities for a trip
CREATE OR REPLACE FUNCTION public.get_trip_cities(p_trip_id UUID)
RETURNS TABLE (
  city_id UUID,
  city_name TEXT,
  country TEXT,
  position INTEGER,
  arrival_date DATE,
  departure_date DATE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.city_id,
    c.name AS city_name,
    c.country,
    tc.position,
    tc.arrival_date,
    tc.departure_date
  FROM 
    public.trip_cities tc
    JOIN public.cities c ON tc.city_id = c.id
  WHERE 
    tc.trip_id = p_trip_id
  ORDER BY 
    tc.position;
END;
$$;

-- Create function to add a city to a trip
CREATE OR REPLACE FUNCTION public.add_city_to_trip(
  p_trip_id UUID,
  p_city_id UUID,
  p_position INTEGER DEFAULT NULL,
  p_arrival_date DATE DEFAULT NULL,
  p_departure_date DATE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_position INTEGER;
  v_new_position INTEGER;
  v_trip_city_id UUID;
BEGIN
  -- If position not specified, add to the end
  IF p_position IS NULL THEN
    SELECT COALESCE(MAX(position) + 1, 0)
    INTO v_new_position
    FROM public.trip_cities
    WHERE trip_id = p_trip_id;
  ELSE
    -- If position specified, use it and adjust other positions
    v_new_position := p_position;
    
    -- Shift positions of existing cities to make room
    UPDATE public.trip_cities
    SET position = position + 1
    WHERE trip_id = p_trip_id AND position >= v_new_position;
  END IF;
  
  -- Insert the new city
  INSERT INTO public.trip_cities(
    trip_id,
    city_id,
    position,
    arrival_date,
    departure_date
  )
  VALUES (
    p_trip_id,
    p_city_id,
    v_new_position,
    p_arrival_date,
    p_departure_date
  )
  RETURNING id INTO v_trip_city_id;
  
  RETURN v_trip_city_id;
END;
$$;

-- Create function to update city order in a trip
CREATE OR REPLACE FUNCTION public.reorder_trip_cities(
  p_trip_id UUID,
  p_city_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_city_id UUID;
  v_position INTEGER;
BEGIN
  -- Update positions based on the array order
  v_position := 0;
  FOREACH v_city_id IN ARRAY p_city_ids LOOP
    UPDATE public.trip_cities
    SET position = v_position
    WHERE trip_id = p_trip_id AND city_id = v_city_id;
    
    v_position := v_position + 1;
  END LOOP;
END;
$$; 