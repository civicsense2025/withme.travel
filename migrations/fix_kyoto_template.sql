-- Fix for "Traditional Kyoto: 4-Day Cultural Immersion" template (ID: 8c30b76d-ee52-4b3f-bee6-74ac489d6b84)
-- This script adds the missing sections for the 4-day template

-- Template ID constant
DO $$
DECLARE
    p_template_id UUID := '8c30b76d-ee52-4b3f-bee6-74ac489d6b84';
    section_id_1 UUID;
    section_id_2 UUID;
    section_id_3 UUID;
    section_id_4 UUID;
BEGIN
    -- Check if template exists
    IF NOT EXISTS (SELECT 1 FROM itinerary_templates WHERE id = p_template_id) THEN
        RAISE EXCEPTION 'Template with ID % does not exist', p_template_id;
    END IF;

    -- First delete any existing sections (to avoid duplicates)
    DELETE FROM itinerary_template_items WHERE template_id = p_template_id;
    DELETE FROM itinerary_template_sections WHERE template_id = p_template_id;

    -- Create Day 1 section
    INSERT INTO itinerary_template_sections 
        (template_id, day_number, title, position, created_at, updated_at)
    VALUES 
        (p_template_id, 1, 'Day 1: Arrival & Eastern Kyoto', 0, NOW(), NOW())
    RETURNING id INTO section_id_1;

    -- Create Day 2 section
    INSERT INTO itinerary_template_sections 
        (template_id, day_number, title, position, created_at, updated_at)
    VALUES 
        (p_template_id, 2, 'Day 2: Central Kyoto Exploration', 1, NOW(), NOW())
    RETURNING id INTO section_id_2;

    -- Create Day 3 section
    INSERT INTO itinerary_template_sections 
        (template_id, day_number, title, position, created_at, updated_at)
    VALUES 
        (p_template_id, 3, 'Day 3: Arashiyama & Western Kyoto', 2, NOW(), NOW())
    RETURNING id INTO section_id_3;

    -- Create Day 4 section
    INSERT INTO itinerary_template_sections 
        (template_id, day_number, title, position, created_at, updated_at)
    VALUES 
        (p_template_id, 4, 'Day 4: Fushimi Inari & Departure', 3, NOW(), NOW())
    RETURNING id INTO section_id_4;

    -- Add Day 1 items
    INSERT INTO itinerary_template_items 
        (section_id, template_id, title, description, location, item_order, created_at, updated_at, start_time, end_time, day_number, day)
    VALUES
        (section_id_1, p_template_id, 'Arrive at Kansai International Airport', 'Arrival and transfer to Kyoto', 'Kansai International Airport', 0, NOW(), NOW(), '08:00:00', '10:00:00', 1, 1),
        (section_id_1, p_template_id, 'Check-in at Accommodation', 'Drop off luggage and freshen up', 'Kyoto Station Area', 1, NOW(), NOW(), '11:00:00', '12:00:00', 1, 1),
        (section_id_1, p_template_id, 'Lunch at Kyoto Station', 'Try the local Kyoto-style ramen or udon', 'Kyoto Station Ramen Street', 2, NOW(), NOW(), '12:00:00', '13:00:00', 1, 1),
        (section_id_1, p_template_id, 'Visit Kiyomizu-dera Temple', 'Famous wooden temple with panoramic views of Kyoto', 'Kiyomizu-dera Temple', 3, NOW(), NOW(), '14:00:00', '16:00:00', 1, 1),
        (section_id_1, p_template_id, 'Stroll through Higashiyama District', 'Traditional preserved streets with shops and cafes', 'Higashiyama District', 4, NOW(), NOW(), '16:00:00', '18:00:00', 1, 1),
        (section_id_1, p_template_id, 'Dinner in Gion', 'Traditional Kyoto cuisine (Kaiseki)', 'Gion District', 5, NOW(), NOW(), '18:30:00', '20:30:00', 1, 1);

    -- Add Day 2 items
    INSERT INTO itinerary_template_items 
        (section_id, template_id, title, description, location, item_order, created_at, updated_at, start_time, end_time, day_number, day)
    VALUES
        (section_id_2, p_template_id, 'Breakfast at Local Cafe', 'Try traditional Japanese breakfast', 'Near Accommodation', 0, NOW(), NOW(), '08:00:00', '09:00:00', 2, 2),
        (section_id_2, p_template_id, 'Visit Nijo Castle', 'Former residence of the Tokugawa shoguns with nightingale floors', 'Nijo Castle', 1, NOW(), NOW(), '09:30:00', '11:30:00', 2, 2),
        (section_id_2, p_template_id, 'Explore Nishiki Market', 'Known as "Kyoto''s Kitchen" - great for street food and souvenirs', 'Nishiki Market', 2, NOW(), NOW(), '12:00:00', '13:30:00', 2, 2),
        (section_id_2, p_template_id, 'Visit Kinkaku-ji (Golden Pavilion)', 'Iconic Zen temple covered in gold leaf', 'Kinkaku-ji Temple', 3, NOW(), NOW(), '14:30:00', '16:00:00', 2, 2),
        (section_id_2, p_template_id, 'Dinner and Evening in Pontocho Alley', 'Atmospheric dining district along the Kamogawa River', 'Pontocho Alley', 4, NOW(), NOW(), '18:00:00', '20:00:00', 2, 2);

    -- Add Day 3 items
    INSERT INTO itinerary_template_items 
        (section_id, template_id, title, description, location, item_order, created_at, updated_at, start_time, end_time, day_number, day)
    VALUES
        (section_id_3, p_template_id, 'Travel to Arashiyama', 'Take JR train to Saga-Arashiyama Station', 'Kyoto Station', 0, NOW(), NOW(), '08:30:00', '09:15:00', 3, 3),
        (section_id_3, p_template_id, 'Explore Arashiyama Bamboo Grove', 'Famous bamboo forest path', 'Arashiyama Bamboo Grove', 1, NOW(), NOW(), '09:30:00', '10:30:00', 3, 3),
        (section_id_3, p_template_id, 'Visit Tenryu-ji Temple', 'UNESCO World Heritage Zen temple with beautiful garden', 'Tenryu-ji Temple', 2, NOW(), NOW(), '10:45:00', '12:00:00', 3, 3),
        (section_id_3, p_template_id, 'Lunch in Arashiyama', 'Try yudofu (tofu hot pot) - a local specialty', 'Arashiyama Restaurant Area', 3, NOW(), NOW(), '12:15:00', '13:30:00', 3, 3),
        (section_id_3, p_template_id, 'Visit Monkey Park Iwatayama', 'See Japanese macaques with panoramic views of Kyoto', 'Iwatayama Monkey Park', 4, NOW(), NOW(), '14:00:00', '15:30:00', 3, 3),
        (section_id_3, p_template_id, 'Kimono Experience', 'Rent a kimono and walk around traditional Kyoto', 'Kyoto Kimono Rental', 5, NOW(), NOW(), '16:30:00', '18:30:00', 3, 3),
        (section_id_3, p_template_id, 'Traditional Tea Ceremony', 'Authentic Japanese tea ceremony experience', 'Traditional Tea House', 6, NOW(), NOW(), '19:00:00', '20:00:00', 3, 3);

    -- Add Day 4 items
    INSERT INTO itinerary_template_items 
        (section_id, template_id, title, description, location, item_order, created_at, updated_at, start_time, end_time, day_number, day)
    VALUES
        (section_id_4, p_template_id, 'Early Visit to Fushimi Inari Shrine', 'Famous for thousands of orange torii gates', 'Fushimi Inari Shrine', 0, NOW(), NOW(), '07:00:00', '09:30:00', 4, 4),
        (section_id_4, p_template_id, 'Explore Sake Breweries in Fushimi', 'Learn about sake production and tasting', 'Fushimi Sake District', 1, NOW(), NOW(), '10:00:00', '11:30:00', 4, 4),
        (section_id_4, p_template_id, 'Final Lunch in Kyoto', 'Enjoy a farewell meal of Kyoto specialties', 'Downtown Kyoto', 2, NOW(), NOW(), '12:00:00', '13:30:00', 4, 4),
        (section_id_4, p_template_id, 'Last-minute Shopping', 'Pick up souvenirs and gifts', 'Kyoto Station Shopping Area', 3, NOW(), NOW(), '14:00:00', '15:30:00', 4, 4),
        (section_id_4, p_template_id, 'Depart from Kyoto', 'Head to Kansai International Airport for departure', 'Kyoto Station', 4, NOW(), NOW(), '16:00:00', '18:00:00', 4, 4);

    -- Log completion
    RAISE NOTICE 'Successfully added 4 sections with items to the Kyoto itinerary template';
END $$; 