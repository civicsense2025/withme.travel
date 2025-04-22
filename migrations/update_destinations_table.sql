-- Add new columns to destinations table
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS state_province TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS lgbtq_friendliness INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS accessibility INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS continent TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS best_season TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS avg_cost_per_day DECIMAL(10, 2);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS local_language TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS time_zone TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS cuisine_rating INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS cultural_attractions INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS nightlife_rating INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS family_friendly BOOLEAN;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS outdoor_activities INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS beach_quality INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS shopping_rating INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS safety_rating INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS wifi_connectivity INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS public_transportation INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS eco_friendly_options INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS walkability INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS instagram_worthy_spots INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS off_peak_appeal INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS digital_nomad_friendly INTEGER;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS highlights TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tourism_website TEXT;

-- Update existing cities and add new ones
-- We'll use ON CONFLICT to update existing cities and insert new ones

-- Washington D.C.
INSERT INTO destinations (
  name, city, state_province, country, continent, popularity, 
  description, best_season, avg_cost_per_day, local_language, time_zone,
  highlights, tourism_website
) VALUES (
  'Washington D.C., USA', 'Washington D.C.', NULL, 'USA', 'North America', 85,
  'The capital of the United States, known for its monuments, museums, and political significance.',
  'Spring (March-May)', 200.00, 'English', 'Eastern Time (ET)',
  '<ul><li>Visit the National Mall and iconic monuments</li><li>Explore the Smithsonian museums</li><li>Tour the White House and Capitol Building</li><li>Cherry blossom festival in spring</li></ul>',
  'https://washington.org/'
) ON CONFLICT (name) DO UPDATE SET
  popularity = 85,
  description = 'The capital of the United States, known for its monuments, museums, and political significance.',
  best_season = 'Spring (March-May)',
  avg_cost_per_day = 200.00,
  local_language = 'English',
  time_zone = 'Eastern Time (ET)',
  highlights = '<ul><li>Visit the National Mall and iconic monuments</li><li>Explore the Smithsonian museums</li><li>Tour the White House and Capitol Building</li><li>Cherry blossom festival in spring</li></ul>',
  tourism_website = 'https://washington.org/';

-- Paris
INSERT INTO destinations (
  name, city, country, continent, popularity, 
  description, best_season, avg_cost_per_day, local_language, time_zone,
  highlights, tourism_website
) VALUES (
  'Paris, France', 'Paris', 'France', 'Europe', 95,
  'The City of Light, known for its art, cuisine, culture, and iconic landmarks like the Eiffel Tower.',
  'Spring (April-June) or Fall (September-October)', 220.00, 'French', 'Central European Time (CET)',
  '<ul><li>Visit the Eiffel Tower and Arc de Triomphe</li><li>Explore the Louvre and Musée d''Orsay</li><li>Stroll through Montmartre and along the Seine</li><li>Experience French cuisine and café culture</li></ul>',
  'https://en.parisinfo.com/'
) ON CONFLICT (name) DO UPDATE SET
  popularity = 95,
  description = 'The City of Light, known for its art, cuisine, culture, and iconic landmarks like the Eiffel Tower.',
  best_season = 'Spring (April-June) or Fall (September-October)',
  avg_cost_per_day = 220.00,
  local_language = 'French',
  time_zone = 'Central European Time (CET)',
  highlights = '<ul><li>Visit the Eiffel Tower and Arc de Triomphe</li><li>Explore the Louvre and Musée d''Orsay</li><li>Stroll through Montmartre and along the Seine</li><li>Experience French cuisine and café culture</li></ul>',
  tourism_website = 'https://en.parisinfo.com/';

-- London
INSERT INTO destinations (
  name, city, country, continent, popularity, 
  description, best_season, avg_cost_per_day, local_language, time_zone,
  highlights, tourism_website
) VALUES (
  'London, UK', 'London', 'United Kingdom', 'Europe', 90,
  'A global city blending history and modernity, with iconic landmarks, world-class museums, and diverse neighborhoods.',
  'Late Spring (May-June) or Early Fall (September)', 250.00, 'English', 'Greenwich Mean Time (GMT)',
  '<ul><li>Visit Buckingham Palace and the Tower of London</li><li>Explore the British Museum and Tate Modern</li><li>Experience the West End theater district</li><li>Stroll through Hyde Park and along the Thames</li></ul>',
  'https://visitlondon.com/'
) ON CONFLICT (name) DO UPDATE SET
  popularity = 90,
  description = 'A global city blending history and modernity, with iconic landmarks, world-class museums, and diverse neighborhoods.',
  best_season = 'Late Spring (May-June) or Early Fall (September)',
  avg_cost_per_day = 250.00,
  local_language = 'English',
  time_zone = 'Greenwich Mean Time (GMT)',
  highlights = '<ul><li>Visit Buckingham Palace and the Tower of London</li><li>Explore the British Museum and Tate Modern</li><li>Experience the West End theater district</li><li>Stroll through Hyde Park and along the Thames</li></ul>',
  tourism_website = 'https://visitlondon.com/';

-- Tokyo
INSERT INTO destinations (
  name, city, country, continent, popularity, 
  description, best_season, avg_cost_per_day, local_language, time_zone,
  highlights, tourism_website
) VALUES (
  'Tokyo, Japan', 'Tokyo', 'Japan', 'Asia', 92,
  'A fascinating blend of ultramodern and traditional, from neon-lit skyscrapers to historic temples.',
  'Spring (March-May) or Fall (September-November)', 180.00, 'Japanese', 'Japan Standard Time (JST)',
  '<ul><li>Visit Senso-ji Temple and the Imperial Palace</li><li>Experience the Shibuya Crossing and Tokyo Skytree</li><li>Explore Akihabara and Harajuku districts</li><li>Enjoy authentic Japanese cuisine</li></ul>',
  'https://www.gotokyo.org/en/'
) ON CONFLICT (name) DO UPDATE SET
  popularity = 92,
  description = 'A fascinating blend of ultramodern and traditional, from neon-lit skyscrapers to historic temples.',
  best_season = 'Spring (March-May) or Fall (September-November)',
  avg_cost_per_day = 180.00,
  local_language = 'Japanese',
  time_zone = 'Japan Standard Time (JST)',
  highlights = '<ul><li>Visit Senso-ji Temple and the Imperial Palace</li><li>Experience the Shibuya Crossing and Tokyo Skytree</li><li>Explore Akihabara and Harajuku districts</li><li>Enjoy authentic Japanese cuisine</li></ul>',
  tourism_website = 'https://www.gotokyo.org/en/';

-- New York
INSERT INTO destinations (
  name, city, state_province, country, continent, popularity, 
  description, best_season, avg_cost_per_day, local_language, time_zone,
  highlights, tourism_website
) VALUES (
  'New York, USA', 'New York', 'New York', 'USA', 'North America', 95,
  'The city that never sleeps, known for its iconic skyline, Broadway shows, diverse neighborhoods, and cultural institutions.',
  'Spring (April-June) or Fall (September-November)', 300.00, 'English', 'Eastern Time (ET)',
  '<ul><li>Visit Times Square and Central Park</li><li>Explore the Metropolitan Museum of Art and MoMA</li><li>See a Broadway show</li><li>Experience diverse neighborhoods like SoHo, Greenwich Village, and Chinatown</li></ul>',
  'https://www.nycgo.com/'
) ON CONFLICT (name) DO UPDATE SET
  popularity = 95,
  description = 'The city that never sleeps, known for its iconic skyline, Broadway shows, diverse neighborhoods, and cultural institutions.',
  best_season = 'Spring (April-June) or Fall (September-November)',
  avg_cost_per_day = 300.00,
  local_language = 'English',
  time_zone = 'Eastern Time (ET)',
  highlights = '<ul><li>Visit Times Square and Central Park</li><li>Explore the Metropolitan Museum of Art and MoMA</li><li>See a Broadway show</li><li>Experience diverse neighborhoods like SoHo, Greenwich Village, and Chinatown</li></ul>',
  tourism_website = 'https://www.nycgo.com/';

-- Add 5 more cities as examples (we would continue with the rest of the list)
-- Rome
INSERT INTO destinations (
  name, city, country, continent, popularity, 
  description, best_season, avg_cost_per_day, local_language, time_zone,
  highlights, tourism_website
) VALUES (
  'Rome, Italy', 'Rome', 'Italy', 'Europe', 88,
  'The Eternal City, with ancient ruins, Renaissance art, and vibrant street life.',
  'Spring (April-May) or Fall (September-October)', 190.00, 'Italian', 'Central European Time (CET)',
  '<ul><li>Visit the Colosseum and Roman Forum</li><li>Explore Vatican City and St. Peter''s Basilica</li><li>Throw a coin in the Trevi Fountain</li><li>Enjoy authentic Italian cuisine</li></ul>',
  'https://www.turismoroma.it/'
) ON CONFLICT (name) DO UPDATE SET
  popularity = 88,
  description = 'The Eternal City, with ancient ruins, Renaissance art, and vibrant street life.',
  best_season = 'Spring (April-May) or Fall (September-October)',
  avg_cost_per_day = 190.00,
  local_language = 'Italian',
  time_zone = 'Central European Time (CET)',
  highlights = '<ul><li>Visit the Colosseum and Roman Forum</li><li>Explore Vatican City and St. Peter''s Basilica</li><li>Throw a coin in the Trevi Fountain</li><li>Enjoy authentic Italian cuisine</li></ul>',
  tourism_website = 'https://www.turismoroma.it/';
