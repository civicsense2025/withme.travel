-- Insert initial tags needed for onboarding test and personality defaults

-- Define tag categories if they don't exist or need standardization
-- Example categories: 'Activity', 'Interest', 'Cuisine', 'Atmosphere', 'Amenity', 'Logistics'

-- Function to safely insert a tag if it doesn't exist
CREATE OR REPLACE FUNCTION insert_tag_if_not_exists(
  p_name text,
  p_slug text,
  p_category text,
  p_emoji text DEFAULT NULL,
  p_description text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_tag_id uuid;
BEGIN
  -- Check if tag with the slug already exists
  SELECT id INTO v_tag_id FROM public.tags WHERE slug = p_slug;

  -- If tag doesn't exist, insert it
  IF v_tag_id IS NULL THEN
    INSERT INTO public.tags (name, slug, category, emoji, description, is_verified)
    VALUES (p_name, p_slug, p_category, p_emoji, p_description, true) -- Assume initial tags are verified
    RETURNING id INTO v_tag_id;
  END IF;

  RETURN v_tag_id;
END;
$$;

-- Insert tags needed for the 'adventurer' personality and test script
SELECT insert_tag_if_not_exists('Outdoor Activities', 'outdoor-activities', 'Activity', '🚵', 'Engaging in activities in nature');
SELECT insert_tag_if_not_exists('Hiking', 'hiking', 'Activity', '🥾', 'Walking long distances in natural environments');
SELECT insert_tag_if_not_exists('Local Experiences', 'local-experiences', 'Interest', '🤝', 'Immersing in the local culture and way of life');
SELECT insert_tag_if_not_exists('Off the Beaten Path', 'off-beaten-path', 'Interest', '🗺️', 'Exploring less touristy areas');
SELECT insert_tag_if_not_exists('Adventure Sports', 'adventure-sports', 'Activity', '🧗', 'Participating in high-adrenaline activities');

-- Insert tags for other personalities (add emojis and descriptions as needed)
-- Planner
SELECT insert_tag_if_not_exists('Organized Travel', 'organized-travel', 'Logistics');
SELECT insert_tag_if_not_exists('Itinerary Planning', 'itinerary-planning', 'Logistics');
SELECT insert_tag_if_not_exists('Cultural Sites', 'cultural-sites', 'Interest');
SELECT insert_tag_if_not_exists('Museums', 'museums', 'Interest');
SELECT insert_tag_if_not_exists('Guided Tours', 'guided-tours', 'Activity');

-- Foodie
SELECT insert_tag_if_not_exists('Local Cuisine', 'local-cuisine', 'Cuisine');
SELECT insert_tag_if_not_exists('Food Tours', 'food-tours', 'Activity');
SELECT insert_tag_if_not_exists('Cooking Classes', 'cooking-classes', 'Activity');
SELECT insert_tag_if_not_exists('Wine Tasting', 'wine-tasting', 'Activity');
SELECT insert_tag_if_not_exists('Street Food', 'street-food', 'Cuisine');

-- Sightseer
SELECT insert_tag_if_not_exists('Landmarks', 'landmarks', 'Interest');
SELECT insert_tag_if_not_exists('Photography', 'photography', 'Interest');
SELECT insert_tag_if_not_exists('Scenic Views', 'scenic-views', 'Interest');
SELECT insert_tag_if_not_exists('City Walks', 'city-walks', 'Activity');
SELECT insert_tag_if_not_exists('Architecture', 'architecture', 'Interest');

-- Relaxer
SELECT insert_tag_if_not_exists('Beaches', 'beaches', 'Interest');
SELECT insert_tag_if_not_exists('Spa & Wellness', 'spa-wellness', 'Activity');
SELECT insert_tag_if_not_exists('Luxury Hotels', 'luxury-hotels', 'Amenity');
SELECT insert_tag_if_not_exists('Peaceful Locations', 'peaceful-locations', 'Atmosphere');
SELECT insert_tag_if_not_exists('Nature', 'nature', 'Interest');

-- Culture Buff
SELECT insert_tag_if_not_exists('Local Culture', 'local-culture', 'Interest');
SELECT insert_tag_if_not_exists('History', 'history', 'Interest');
SELECT insert_tag_if_not_exists('Art Galleries', 'art-galleries', 'Interest');
SELECT insert_tag_if_not_exists('Traditional Events', 'traditional-events', 'Activity');
SELECT insert_tag_if_not_exists('Language Learning', 'language-learning', 'Interest');

-- Clean up the helper function (optional)
-- DROP FUNCTION IF EXISTS insert_tag_if_not_exists(text, text, text, text, text); 