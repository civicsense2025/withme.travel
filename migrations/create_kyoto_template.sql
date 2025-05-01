-- WITHME.TRAVEL COMPLETE ITINERARY TEMPLATE SCRIPT
-- Destination: Kyoto, Japan
-- Template: Traditional Kyoto: 4-Day Cultural Immersion
-- ================================================================
-- This script creates the destination if it doesn't exist,
-- then creates the itinerary template, its sections (days),
-- and associated items, ensuring correct foreign key relationships
-- based on the provided schemas.

DO $$
DECLARE
  v_template_id uuid;
  v_destination_id uuid;
  v_created_by_user_id uuid := 'b9cb6b57-c189-468a-a544-c31bf40f98d1'; -- Example User ID, replace if needed

  -- Section IDs (bigint type as per schema)
  v_day1_section_id bigint;
  v_day2_section_id bigint;
  v_day3_section_id bigint;
  v_day4_section_id bigint;

  destination_exists boolean;
BEGIN

  -- STEP 1: Check if destination 'Kyoto, Japan' exists, create if not.
  SELECT EXISTS (
    SELECT 1 FROM public.destinations WHERE name = 'Kyoto' AND country = 'Japan'
  ) INTO destination_exists;

  IF NOT destination_exists THEN
    v_destination_id := gen_random_uuid();
    INSERT INTO public.destinations (
      id, name, country, continent, description,
      latitude, longitude, timezone, currency, created_at, updated_at
    ) VALUES (
      v_destination_id,
      'Kyoto',
      'Japan',
      'Asia',
      'Ancient capital of Japan known for its temples, shrines, traditional wooden architecture, gardens, and geisha district. A living museum of Japan''s cultural heritage blending centuries-old traditions with modern city life.',
      35.0116,
      135.7681,
      'Asia/Tokyo',
      'JPY',
      now(),
      now()
    );
    RAISE NOTICE 'Created new destination: Kyoto, Japan with ID %', v_destination_id;
  ELSE
    SELECT id INTO v_destination_id FROM public.destinations WHERE name = 'Kyoto' AND country = 'Japan' LIMIT 1;
    RAISE NOTICE 'Using existing destination: Kyoto, Japan with ID %', v_destination_id;
  END IF;

  -- STEP 2: Create the main template record.
  INSERT INTO public.itinerary_templates (
    title, slug, description, destination_id, duration_days,
    category, created_by, is_published, groupsize,
    tags, template_type, featured, metadata, source_trip_id
  ) VALUES (
    'Traditional Kyoto: 4-Day Cultural Immersion',
    'traditional-kyoto-4-day-cultural-immersion',
    'Experience the heart and soul of traditional Japan in Kyoto, where centuries-old temples neighbor quaint machiya houses and geiko still hurry along narrow stone streets at dusk. This thoughtfully paced itinerary balances iconic landmarks with hidden neighborhood gems, allowing you to experience both the postcard views and the authentic everyday rhythm of Japan''s cultural capital.',
    v_destination_id,
    4,
    'Cultural',
    v_created_by_user_id,
    TRUE,
    'Small Group (3-5)',
    ARRAY['temples', 'gardens', 'traditional', 'walking', 'food', 'history'],
    'official',
    TRUE,
    '{ "best_seasons": ["Spring", "Fall"], "avoid_seasons": ["Summer"], "best_for": ["Culture enthusiasts", "History buffs", "Photography lovers"], "accessibility_level": "Moderate", "pace": "Relaxed to moderate", "morning_start": "8:00 AM", "highlights": ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Gion District", "Kinkaku-ji"], "local_tips": "Purchase a one-day bus pass (¥600) for unlimited travel on Kyoto city buses. The early morning (before 9 AM) is the best time to visit popular sites like the Bamboo Grove without crowds.", "estimated_budget_usd_per_day": 120, "languages": ["Japanese", "Limited English in tourist areas"], "sustainability_aspects": ["Walking-focused itinerary", "Public transportation", "Local businesses"] }'::jsonb,
    NULL
  ) RETURNING id INTO v_template_id;

  RAISE NOTICE 'Created itinerary template with ID %', v_template_id;

  -- STEP 3: Create the template sections (days).
  INSERT INTO public.itinerary_template_sections (
     template_id, day_number, title, position
  ) VALUES
  (v_template_id, 1, 'Day 1: Arrival & Eastern Kyoto Highlights', 1),
  (v_template_id, 2, 'Day 2: Arashiyama & Western Kyoto', 2),
  (v_template_id, 3, 'Day 3: Northern Temples & Tea Culture', 3),
  (v_template_id, 4, 'Day 4: Fushimi Inari & Departure', 4);

  -- Re-query to get section IDs reliably
  SELECT id INTO v_day1_section_id FROM public.itinerary_template_sections WHERE template_id = v_template_id AND day_number = 1;
  SELECT id INTO v_day2_section_id FROM public.itinerary_template_sections WHERE template_id = v_template_id AND day_number = 2;
  SELECT id INTO v_day3_section_id FROM public.itinerary_template_sections WHERE template_id = v_template_id AND day_number = 3;
  SELECT id INTO v_day4_section_id FROM public.itinerary_template_sections WHERE template_id = v_template_id AND day_number = 4;

  RAISE NOTICE 'Created sections with IDs: Day1=% Day2=% Day3=% Day4=%', v_day1_section_id, v_day2_section_id, v_day3_section_id, v_day4_section_id;

  -- STEP 4: Create the template items, linking to template_id, section_id, and adding the day column.
  -- Day 1 Items
  INSERT INTO public.itinerary_template_items (
    template_id, section_id, item_order, title, description, start_time, end_time, location, day_number, created_by, day
  ) VALUES
  (v_template_id, v_day1_section_id, 1, 'Arrive at Kyoto Station', 'Welcome to Kyoto! If arriving from Tokyo, the Shinkansen takes approximately 2.5 hours. The impressive modern architecture of Kyoto Station offers a striking contrast to the ancient city you''ll explore.', '10:00:00', '10:30:00', 'Kyoto Station', 1, v_created_by_user_id, 1),
  (v_template_id, v_day1_section_id, 2, 'Check in to Accommodation', 'Settle into your ryokan or hotel. Traditional ryokans offer an authentic Japanese experience with tatami floors and futon bedding, though modern hotels are also plentiful throughout Kyoto.', '11:00:00', '12:00:00', 'Higashiyama District', 1, v_created_by_user_id, 1),
  (v_template_id, v_day1_section_id, 3, 'Lunch at Nishiki Market', 'Often called "Kyoto''s Kitchen," this covered shopping street stretches five blocks with over 100 vendors selling local specialties. Try samples as you stroll, or sit down for a proper meal at one of the small restaurants.', '12:30:00', '14:00:00', 'Nishiki Market, Central Kyoto', 1, v_created_by_user_id, 1),
  (v_template_id, v_day1_section_id, 4, 'Explore Higashiyama District', 'Wander through this atmospheric area filled with narrow lanes, wooden buildings, and traditional shops. The preserved historic district offers a glimpse into pre-modern Japan, with plenty of opportunities to purchase local crafts.', '14:30:00', '16:30:00', 'Higashiyama District', 1, v_created_by_user_id, 1),
  (v_template_id, v_day1_section_id, 5, 'Visit Kiyomizu-dera Temple', 'This UNESCO World Heritage site offers spectacular views over Kyoto from its famous wooden terrace. Built without a single nail, the temple is particularly beautiful in cherry blossom or fall foliage seasons. Don''t miss the Otowa Waterfall, where visitors drink for health, longevity, and success.', '16:30:00', '18:00:00', 'Kiyomizu-dera, Eastern Kyoto', 1, v_created_by_user_id, 1),
  (v_template_id, v_day1_section_id, 6, 'Dinner in Gion', 'Experience kaiseki (traditional multi-course meal) at a restaurant in Gion. For a more budget-friendly option, try an izakaya where you can sample various small dishes. After dinner, stroll through Gion, keeping an eye out for geiko (Kyoto''s geishas) hurrying to appointments.', '18:30:00', '20:30:00', 'Gion District', 1, v_created_by_user_id, 1);

  -- Day 2 Items
  INSERT INTO public.itinerary_template_items (
    template_id, section_id, item_order, title, description, start_time, end_time, location, day_number, created_by, day
  ) VALUES
  (v_template_id, v_day2_section_id, 1, 'Early Breakfast', 'Start your day with a traditional Japanese breakfast at your accommodation or try a local breakfast spot. Consider picking up onigiri (rice balls) for a portable snack later.', '07:00:00', '08:00:00', 'Accommodation or nearby cafe', 2, v_created_by_user_id, 2),
  (v_template_id, v_day2_section_id, 2, 'Arashiyama Bamboo Grove', 'Arrive early to experience the magical bamboo forest before the crowds. The towering green stalks create an otherworldly atmosphere, especially when the morning light filters through. The gentle rustling of bamboo leaves is considered one of Japan''s most beautiful sounds.', '08:30:00', '09:30:00', 'Arashiyama District, Western Kyoto', 2, v_created_by_user_id, 2),
  (v_template_id, v_day2_section_id, 3, 'Visit Tenryu-ji Temple', 'Adjacent to the bamboo grove, this UNESCO World Heritage temple features stunning gardens designed by Zen master Muso Soseki. The careful landscaping creates beautiful scenery in any season, with the garden designed to be viewed from the temple building''s veranda.', '09:30:00', '11:00:00', 'Tenryu-ji, Arashiyama', 2, v_created_by_user_id, 2),
  (v_template_id, v_day2_section_id, 4, 'Lunch in Arashiyama', 'Try yudofu (tofu hot pot), a local Kyoto specialty, at one of the restaurants near the river. The area is known for its tofu dishes, as the quality of Kyoto''s water is said to make superior tofu.', '11:30:00', '13:00:00', 'Arashiyama riverfront', 2, v_created_by_user_id, 2),
  (v_template_id, v_day2_section_id, 5, 'Monkey Park Iwatayama', 'Hike up to this hilltop park (about 30 minutes) where you can observe Japanese macaques in their natural habitat. The monkeys roam freely while humans stay in a designated area. The viewpoint also offers panoramic vistas of Kyoto.', '13:30:00', '15:00:00', 'Iwatayama Monkey Park, Arashiyama', 2, v_created_by_user_id, 2);

  -- Day 3 Items
  INSERT INTO public.itinerary_template_items (
    template_id, section_id, item_order, title, description, start_time, end_time, location, day_number, created_by, day
  ) VALUES
  (v_template_id, v_day3_section_id, 1, 'Visit Kinkaku-ji (Golden Pavilion)', 'Start the day at one of Kyoto''s most iconic sites. This Zen Buddhist temple is covered in gold leaf, reflecting beautifully in the surrounding pond. Arrive early to avoid the largest crowds.', '09:00:00', '10:30:00', 'Kinkaku-ji, Northern Kyoto', 3, v_created_by_user_id, 3),
  (v_template_id, v_day3_section_id, 2, 'Explore Ryoan-ji Temple', 'Nearby Kinkaku-ji, Ryoan-ji is famous for its mysterious Zen rock garden. Fifteen stones are arranged so that you can never see all of them at once from any vantage point.', '10:45:00', '12:00:00', 'Ryoan-ji, Northern Kyoto', 3, v_created_by_user_id, 3),
  (v_template_id, v_day3_section_id, 3, 'Lunch near Ryoan-ji', 'Enjoy a simple lunch like udon or soba noodles at a local restaurant near the temple complex.', '12:15:00', '13:15:00', 'Near Ryoan-ji', 3, v_created_by_user_id, 3),
  (v_template_id, v_day3_section_id, 4, 'Traditional Tea Ceremony Experience', 'Participate in an authentic Japanese tea ceremony (chanoyu). Several tea houses in Kyoto offer experiences for visitors, providing insight into this meditative ritual.', '14:00:00', '15:30:00', 'Kyoto Tea House (e.g., Camellia Flower)', 3, v_created_by_user_id, 3),
  (v_template_id, v_day3_section_id, 5, 'Dinner and Evening in Pontocho Alley', 'Explore this narrow, atmospheric alley running parallel to the Kamogawa River. It''s lined with traditional restaurants and bars. Many offer riverside dining in the warmer months.', '18:00:00', '20:00:00', 'Pontocho Alley', 3, v_created_by_user_id, 3);


  -- Day 4 Items
  INSERT INTO public.itinerary_template_items (
    template_id, section_id, item_order, title, description, start_time, end_time, location, day_number, created_by, day
  ) VALUES
  (v_template_id, v_day4_section_id, 1, 'Early Visit to Fushimi Inari Shrine', 'Hike through thousands of vibrant red torii gates winding up the mountainside. Go early (before 8 AM) for the most atmospheric experience and fewer crowds. The full hike takes 2-3 hours, but you can turn back at any point.', '07:00:00', '09:30:00', 'Fushimi Inari Shrine, Southern Kyoto', 4, v_created_by_user_id, 4),
  (v_template_id, v_day4_section_id, 2, 'Explore Sake Breweries in Fushimi', 'After the shrine, visit the nearby Fushimi Sake District. Several breweries offer tours and tastings, such as the Gekkeikan Okura Sake Museum.', '10:00:00', '11:30:00', 'Fushimi Sake District', 4, v_created_by_user_id, 4),
  (v_template_id, v_day4_section_id, 3, 'Final Lunch in Kyoto', 'Enjoy a farewell meal. Consider trying obanzai (Kyoto-style home cooking) or revisiting a favorite spot.', '12:00:00', '13:30:00', 'Downtown Kyoto or near Kyoto Station', 4, v_created_by_user_id, 4),
  (v_template_id, v_day4_section_id, 4, 'Last-minute Shopping', 'Pick up souvenirs at Kyoto Station or explore the nearby department stores like Isetan.', '14:00:00', '15:30:00', 'Kyoto Station Shopping Area', 4, v_created_by_user_id, 4),
  (v_template_id, v_day4_section_id, 5, 'Depart from Kyoto', 'Head to Kansai International Airport (KIX) or your next destination via train from Kyoto Station.', '16:00:00', NULL, 'Kyoto Station', 4, v_created_by_user_id, 4);


  RAISE NOTICE 'Successfully created itinerary template items for Kyoto template ID %', v_template_id;

END;
$$; 