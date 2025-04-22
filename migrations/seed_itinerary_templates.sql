-- Ensure the itinerary_templates table exists
CREATE TABLE IF NOT EXISTS public.itinerary_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  destination_id UUID REFERENCES public.destinations(id), -- Assuming destinations is in public schema
  duration_days INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  days JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id), -- Assuming reference to auth schema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  use_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT, -- Added based on INSERT statement
  groupSize TEXT, -- Added based on INSERT statement (consider better type?)
  tags TEXT[] -- Added based on INSERT statement (assuming text array)
);

-- Combined block for FKs and seeding
DO $$
DECLARE
  -- Placeholder UUIDs (REPLACE THESE)
  paris_uuid UUID := '00000000-0000-0000-0000-000000000001';
  tokyo_uuid UUID := '00000000-0000-0000-0000-000000000002';
  barcelona_uuid UUID := '00000000-0000-0000-0000-000000000003';
  california_uuid UUID := '00000000-0000-0000-0000-000000000004'; -- Or representative city
  bangkok_uuid UUID := '00000000-0000-0000-0000-000000000005';
  placeholder_user_uuid UUID := '11111111-1111-1111-1111-111111111111'; 
BEGIN

  -- Add foreign key constraints if they don't exist (optional, adjust names/schemas as needed)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'itinerary_templates_destination_id_fkey' AND conrelid = 'public.itinerary_templates'::regclass
  ) THEN
    ALTER TABLE public.itinerary_templates 
    ADD CONSTRAINT itinerary_templates_destination_id_fkey 
    FOREIGN KEY (destination_id) REFERENCES public.destinations(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'itinerary_templates_created_by_fkey' AND conrelid = 'public.itinerary_templates'::regclass
  ) THEN
    ALTER TABLE public.itinerary_templates 
    ADD CONSTRAINT itinerary_templates_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id);
  END IF;

  -- Seed data for itinerary_templates table
  -- NOTE: Replace placeholder UUIDs for destination_id and created_by with actual UUIDs from your database.
  INSERT INTO public.itinerary_templates (
    title, slug, description, destination_id, duration_days, category, days, created_by, is_published, cover_image_url
  ) VALUES (
    'Weekend in Paris',
    'weekend-in-paris',
    'A perfect 3-day itinerary for first-time visitors to the City of Light',
    paris_uuid, -- Replace with actual Paris destination UUID
    3,
    'city',
    '[{"day": 1, "title": "Iconic Paris", "activities": [{"time": "09:00", "title": "Eiffel Tower", "description": "Start your day with stunning views from Paris''s most iconic landmark", "location": "Champ de Mars, 5 Avenue Anatole France"}, {"time": "12:30", "title": "Lunch at Café de Flore", "description": "Enjoy a classic Parisian lunch at this historic café", "location": "172 Boulevard Saint-Germain"}, {"time": "14:30", "title": "Louvre Museum", "description": "Explore one of the world''s greatest art museums", "location": "Rue de Rivoli"}, {"time": "19:00", "title": "Seine River Cruise", "description": "See Paris illuminated from the water on an evening cruise", "location": "Pont de l''Alma"}]}, {"day": 2, "title": "Artistic Paris", "activities": [{"time": "10:00", "title": "Montmartre & Sacré-Cœur", "description": "Explore the artistic neighborhood and visit the beautiful basilica", "location": "35 Rue du Chevalier de la Barre"}, {"time": "13:00", "title": "Lunch at Le Consulat", "description": "Dine at this quintessential Montmartre restaurant", "location": "18 Rue Norvins"}, {"time": "15:00", "title": "Musée d''Orsay", "description": "Visit the impressive Impressionist collection in this former train station", "location": "1 Rue de la Légion d''Honneur"}, {"time": "20:00", "title": "Dinner in Le Marais", "description": "Enjoy dinner in one of Paris''s trendiest neighborhoods", "location": "Le Marais district"}]}, {"day": 3, "title": "Royal Paris", "activities": [{"time": "09:30", "title": "Palace of Versailles", "description": "Take a day trip to the magnificent royal palace", "location": "Place d''Armes, Versailles"}, {"time": "16:00", "title": "Champs-Élysées & Arc de Triomphe", "description": "Stroll down Paris''s most famous avenue", "location": "Champs-Élysées"}, {"time": "19:30", "title": "Farewell dinner at Le Petit Prince", "description": "Enjoy your last evening with classic French cuisine", "location": "12 Rue de Lanneau"}]}]'::jsonb,
    placeholder_user_uuid, -- Replace with actual user UUID
    true,
    '/Parisian-Cafe-Scene.png'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    destination_id = EXCLUDED.destination_id,
    duration_days = EXCLUDED.duration_days,
    category = EXCLUDED.category,
    days = EXCLUDED.days,
    is_published = EXCLUDED.is_published,
    cover_image_url = EXCLUDED.cover_image_url,
    updated_at = NOW();

  INSERT INTO public.itinerary_templates (
    title, slug, description, destination_id, duration_days, category, days, created_by, is_published, cover_image_url
  ) VALUES (
    'Tokyo Adventure',
    'tokyo-adventure',
    'Explore the best of Tokyo in 5 days, from traditional temples to futuristic districts',
    tokyo_uuid, -- Replace with actual Tokyo destination UUID
    5,
    'city',
    '[{"day": 1, "title": "Traditional Tokyo", "activities": [{"time": "09:00", "title": "Meiji Shrine", "description": "Start with a peaceful visit to this beautiful Shinto shrine", "location": "1-1 Yoyogikamizonocho, Shibuya City"}, {"time": "12:00", "title": "Lunch at Tsukiji Outer Market", "description": "Enjoy fresh seafood at the famous market area", "location": "Tsukiji, Chuo City"}, {"time": "14:00", "title": "Asakusa & Senso-ji Temple", "description": "Visit Tokyo''s oldest temple and shop on Nakamise Street", "location": "2 Chome-3-1 Asakusa, Taito City"}, {"time": "18:00", "title": "Dinner in Asakusa", "description": "Try traditional Japanese cuisine in a local restaurant", "location": "Asakusa area"}]}, {"day": 2, "title": "Modern Tokyo", "activities": [{"time": "10:00", "title": "Shibuya Crossing & Hachiko Statue", "description": "Experience the world''s busiest pedestrian crossing", "location": "Shibuya, Tokyo"}, {"time": "13:00", "title": "Lunch at Shibuya Stream", "description": "Modern dining in this new development", "location": "3 Chome-21-3 Shibuya, Shibuya City"}, {"time": "15:00", "title": "Harajuku & Takeshita Street", "description": "Explore Japan''s youth fashion center", "location": "Takeshita Street, Harajuku"}, {"time": "19:00", "title": "Dinner in Shinjuku", "description": "Experience izakaya dining in this vibrant district", "location": "Shinjuku, Tokyo"}]}]'::jsonb,
    placeholder_user_uuid, -- Replace with actual user UUID
    true,
    '/tokyo-twilight.png'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    destination_id = EXCLUDED.destination_id,
    duration_days = EXCLUDED.duration_days,
    category = EXCLUDED.category,
    days = EXCLUDED.days,
    is_published = EXCLUDED.is_published,
    cover_image_url = EXCLUDED.cover_image_url,
    updated_at = NOW();

  INSERT INTO public.itinerary_templates (
    title, slug, description, destination_id, duration_days, category, days, created_by, is_published, cover_image_url
  ) VALUES (
    'Barcelona Weekend',
    'barcelona-weekend',
    'Beach, tapas, and architecture in this perfect weekend getaway',
    barcelona_uuid, -- Replace with actual Barcelona destination UUID
    3,
    'beach',
    '[{"day": 1, "title": "Gaudí''s Barcelona", "activities": [{"time": "09:00", "title": "Sagrada Familia", "description": "Marvel at Gaudí''s unfinished masterpiece", "location": "Carrer de Mallorca, 401"}, {"time": "12:30", "title": "Lunch at El Nacional", "description": "Multi-space culinary experience in a historic building", "location": "Passeig de Gràcia, 24 Bis"}, {"time": "14:30", "title": "Park Güell", "description": "Explore this colorful park with amazing city views", "location": "Carrer d''Olot, 5"}, {"time": "19:00", "title": "Tapas dinner in El Born", "description": "Sample Spanish tapas in this trendy neighborhood", "location": "El Born district"}]}]'::jsonb,
    placeholder_user_uuid, -- Replace with actual user UUID
    true,
    '/barceloneta-sand-and-sea.png'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    destination_id = EXCLUDED.destination_id,
    duration_days = EXCLUDED.duration_days,
    category = EXCLUDED.category,
    days = EXCLUDED.days,
    is_published = EXCLUDED.is_published,
    cover_image_url = EXCLUDED.cover_image_url,
    updated_at = NOW();
    
  INSERT INTO public.itinerary_templates (
    title, slug, description, destination_id, duration_days, category, days, created_by, is_published, cover_image_url
  ) VALUES (
    'California Road Trip',
    'california-road-trip',
    'The ultimate coastal drive from San Francisco to Los Angeles',
    california_uuid, -- Replace with actual California destination UUID
    7,
    'road-trip',
    '[{"day": 1, "title": "San Francisco", "activities": [{"time": "09:00", "title": "Golden Gate Bridge", "description": "Walk or bike across this iconic landmark", "location": "Golden Gate Bridge, San Francisco"}, {"time": "12:00", "title": "Lunch at Fisherman''s Wharf", "description": "Enjoy seafood with views of the bay", "location": "Fisherman''s Wharf, San Francisco"}]}]'::jsonb,
    placeholder_user_uuid, -- Replace with actual user UUID
    true,
    '/california-highway-one.png'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    destination_id = EXCLUDED.destination_id,
    duration_days = EXCLUDED.duration_days,
    category = EXCLUDED.category,
    days = EXCLUDED.days,
    is_published = EXCLUDED.is_published,
    cover_image_url = EXCLUDED.cover_image_url,
    updated_at = NOW();

  INSERT INTO public.itinerary_templates (
    title, slug, description, destination_id, duration_days, category, days, created_by, is_published, cover_image_url
  ) VALUES (
    'Bangkok Explorer',
    'bangkok-explorer',
    'Temples, markets, and street food in the vibrant Thai capital',
    bangkok_uuid, -- Replace with actual Bangkok destination UUID
    4,
    'city',
    '[{"day": 1, "title": "Historic Bangkok", "activities": [{"time": "09:00", "title": "Grand Palace & Wat Phra Kaew", "description": "Visit the former royal residence and Temple of the Emerald Buddha", "location": "Na Phra Lan Road, Bangkok"}, {"time": "12:30", "title": "Lunch at Tha Tien Market", "description": "Try authentic Thai street food near the river", "location": "Tha Tien Market, Bangkok"}, {"time": "14:00", "title": "Wat Pho", "description": "See the famous Reclining Buddha and get a traditional Thai massage", "location": "2 Sanamchai Road, Bangkok"}, {"time": "17:00", "title": "Chao Phraya River Cruise", "description": "Evening boat ride with dinner along Bangkok''s main river", "location": "Chao Phraya River, Bangkok"}]}, {"day": 3, "title": "Local Life", "activities": [{"time": "09:00", "title": "Chatuchak Weekend Market", "description": "Explore one of the world''s largest weekend markets", "location": "Chatuchak Park, Bangkok"}, {"time": "13:00", "title": "Lunch at Or Tor Kor Market", "description": "Premium fresh market with excellent food stalls", "location": "Or Tor Kor Market, Bangkok"}, {"time": "15:00", "title": "Lumpini Park", "description": "Relax in Bangkok''s central park and watch monitor lizards", "location": "Lumpini Park, Bangkok"}, {"time": "18:00", "title": "Dinner at Chinatown (Yaowarat)", "description": "Experience the bustling food scene of Bangkok''s Chinatown", "location": "Yaowarat Road, Bangkok"}]}, {"day": 4, "title": "Cultural Immersion", "activities": [{"time": "09:00", "title": "Thai Cooking Class", "description": "Learn to make authentic Thai dishes", "location": "Silom Thai Cooking School, Bangkok"}, {"time": "13:00", "title": "Lunch at your cooking class", "description": "Enjoy the fruits of your labor", "location": "Silom Thai Cooking School, Bangkok"}, {"time": "15:00", "title": "Bangkok Art and Culture Centre", "description": "Explore contemporary Thai art and exhibitions", "location": "939 Rama I Road, Bangkok"}, {"time": "19:00", "title": "Farewell dinner at Thipsamai", "description": "Try the famous Pad Thai at this legendary restaurant", "location": "313-315 Maha Chai Road, Bangkok"}]}]'::jsonb,
    placeholder_user_uuid, -- Replace with actual user UUID
    true,
    '/bustling-bangkok-street.png'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    destination_id = EXCLUDED.destination_id,
    duration_days = EXCLUDED.duration_days,
    category = EXCLUDED.category,
    days = EXCLUDED.days,
    is_published = EXCLUDED.is_published,
    cover_image_url = EXCLUDED.cover_image_url,
    updated_at = NOW();

END $$;
 