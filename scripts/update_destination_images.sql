-- Update Destination Image URLs
-- Run this script in your Supabase SQL Editor or via psql.
-- Assumes the destinations table exists and has columns 'city', 'country', and 'image_url'.
-- Adjust WHERE clauses if city/country names in your DB differ from filenames.

-- International Destinations
UPDATE destinations SET image_url = '/destinations/amsterdam.jpg' WHERE city = 'Amsterdam' AND country = 'Netherlands';
UPDATE destinations SET image_url = '/destinations/bangkok.jpg' WHERE city = 'Bangkok' AND country = 'Thailand';
UPDATE destinations SET image_url = '/destinations/barcelona.jpg' WHERE city = 'Barcelona' AND country = 'Spain';
UPDATE destinations SET image_url = '/destinations/berlin.jpg' WHERE city = 'Berlin' AND country = 'Germany';
UPDATE destinations SET image_url = '/destinations/cape-town.jpg' WHERE city = 'Cape Town' AND country = 'South Africa';
UPDATE destinations SET image_url = '/destinations/dubai.jpg' WHERE city = 'Dubai' AND country = 'UAE';
UPDATE destinations SET image_url = '/destinations/hong-kong.jpg' WHERE city = 'Hong Kong' AND country = 'China'; -- Assuming country is China
UPDATE destinations SET image_url = '/destinations/istanbul.jpg' WHERE city = 'Istanbul' AND country = 'Turkey';
UPDATE destinations SET image_url = '/destinations/kyoto.jpg' WHERE city = 'Kyoto' AND country = 'Japan';
UPDATE destinations SET image_url = '/destinations/london.jpg' WHERE city = 'London' AND country = 'UK';
UPDATE destinations SET image_url = '/destinations/los-angeles.jpg' WHERE city = 'Los Angeles' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/madrid.jpg' WHERE city = 'Madrid' AND country = 'Spain';
UPDATE destinations SET image_url = '/destinations/melbourne.jpg' WHERE city = 'Melbourne' AND country = 'Australia';
UPDATE destinations SET image_url = '/destinations/new-york.jpg' WHERE city = 'New York' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/paris.jpg' WHERE city = 'Paris' AND country = 'France';
UPDATE destinations SET image_url = '/destinations/rio-de-janeiro.jpg' WHERE city = 'Rio de Janeiro' AND country = 'Brazil';
UPDATE destinations SET image_url = '/destinations/rome.jpg' WHERE city = 'Rome' AND country = 'Italy';
UPDATE destinations SET image_url = '/destinations/san-francisco.jpg' WHERE city = 'San Francisco' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/sydney.jpg' WHERE city = 'Sydney' AND country = 'Australia';
UPDATE destinations SET image_url = '/destinations/tokyo.jpg' WHERE city = 'Tokyo' AND country = 'Japan';
UPDATE destinations SET image_url = '/destinations/vancouver.jpg' WHERE city = 'Vancouver' AND country = 'Canada';

-- Ensure consistent image paths for any destinations in the database that might use the landmark-based paths
UPDATE destinations SET image_url = '/destinations/bangkok.jpg' WHERE image_url = '/destinations/bangkok-grand-palace.jpg';
UPDATE destinations SET image_url = '/destinations/cape-town.jpg' WHERE image_url = '/destinations/cape-town-table-mountain.jpg';
UPDATE destinations SET image_url = '/destinations/sydney.jpg' WHERE image_url = '/destinations/sydney-opera-house.jpg';
UPDATE destinations SET image_url = '/destinations/los-angeles.jpg' WHERE image_url = '/destinations/los-angeles-united-states.jpg';
UPDATE destinations SET image_url = '/destinations/barcelona.jpg' WHERE image_url = '/destinations/barcelona-park-guell.jpg';
UPDATE destinations SET image_url = '/destinations/dubai.jpg' WHERE image_url = '/destinations/dubai-skyline.jpg';
UPDATE destinations SET image_url = '/destinations/san-francisco.jpg' WHERE image_url = '/destinations/san-francisco-golden-gate.jpg';
UPDATE destinations SET image_url = '/destinations/rio-de-janeiro.jpg' WHERE image_url = '/destinations/rio-christ-redeemer.jpg';

-- United States Destinations (Add state checks if needed for uniqueness)
UPDATE destinations SET image_url = '/destinations/albuquerque.jpg' WHERE city = 'Albuquerque' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/amelia-island.jpg' WHERE city = 'Amelia Island' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/anchorage.jpg' WHERE city = 'Anchorage' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/asheville.jpg' WHERE city = 'Asheville' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/baltimore.jpg' WHERE city = 'Baltimore' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/bend.jpg' WHERE city = 'Bend' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/boise.jpg' WHERE city = 'Boise' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/boulder.jpg' WHERE city = 'Boulder' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/bozeman.jpg' WHERE city = 'Bozeman' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/buffalo.jpg' WHERE city = 'Buffalo' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/burlington.jpg' WHERE city = 'Burlington' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/charlotte.jpg' WHERE city = 'Charlotte' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/chattanooga.jpg' WHERE city = 'Chattanooga' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/cincinnati.jpg' WHERE city = 'Cincinnati' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/cleveland.jpg' WHERE city = 'Cleveland' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/colorado-springs.jpg' WHERE city = 'Colorado Springs' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/columbus.jpg' WHERE city = 'Columbus' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/corpus-christi.jpg' WHERE city = 'Corpus Christi' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/dallas.jpg' WHERE city = 'Dallas' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/daytona-beach.jpg' WHERE city = 'Daytona Beach' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/des-moines.jpg' WHERE city = 'Des Moines' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/destin.jpg' WHERE city = 'Destin' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/eugene.jpg' WHERE city = 'Eugene' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/fort-collins.jpg' WHERE city = 'Fort Collins' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/fort-worth.jpg' WHERE city = 'Fort Worth' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/fresno.jpg' WHERE city = 'Fresno' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/galveston.jpg' WHERE city = 'Galveston' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/gatlinburg.jpg' WHERE city = 'Gatlinburg' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/hilton-head.jpg' WHERE city = 'Hilton Head' AND country = 'USA'; -- Or Hilton Head Island?
UPDATE destinations SET image_url = '/destinations/houston.jpg' WHERE city = 'Houston' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/indianapolis.jpg' WHERE city = 'Indianapolis' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/jackson.jpg' WHERE city = 'Jackson' AND country = 'USA'; -- Which Jackson? Add state if needed.
UPDATE destinations SET image_url = '/destinations/jacksonville.jpg' WHERE city = 'Jacksonville' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/juneau.jpg' WHERE city = 'Juneau' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/kansas-city.jpg' WHERE city = 'Kansas City' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/key-west.jpg' WHERE city = 'Key West' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/laguna-beach.jpg' WHERE city = 'Laguna Beach' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/lake-tahoe.jpg' WHERE city = 'Lake Tahoe' AND country = 'USA'; -- This might need refinement (e.g., state_province)
UPDATE destinations SET image_url = '/destinations/lexington.jpg' WHERE city = 'Lexington' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/louisville.jpg' WHERE city = 'Louisville' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/madison.jpg' WHERE city = 'Madison' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/memphis.jpg' WHERE city = 'Memphis' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/milwaukee.jpg' WHERE city = 'Milwaukee' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/minneapolis.jpg' WHERE city = 'Minneapolis' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/moab.jpg' WHERE city = 'Moab' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/monterey.jpg' WHERE city = 'Monterey' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/myrtle-beach.jpg' WHERE city = 'Myrtle Beach' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/napa-valley.jpg' WHERE city = 'Napa Valley' AND country = 'USA'; -- Or just Napa?
UPDATE destinations SET image_url = '/destinations/naples.jpg' WHERE city = 'Naples' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/newport-beach.jpg' WHERE city = 'Newport Beach' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/oklahoma-city.jpg' WHERE city = 'Oklahoma City' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/omaha.jpg' WHERE city = 'Omaha' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/palm-springs.jpg' WHERE city = 'Palm Springs' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/park-city.jpg' WHERE city = 'Park City' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/pensacola.jpg' WHERE city = 'Pensacola' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/phoenix.jpg' WHERE city = 'Phoenix' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/pittsburgh.jpg' WHERE city = 'Pittsburgh' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/providence.jpg' WHERE city = 'Providence' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/raleigh.jpg' WHERE city = 'Raleigh' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/reno.jpg' WHERE city = 'Reno' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/richmond.jpg' WHERE city = 'Richmond' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/rochester.jpg' WHERE city = 'Rochester' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/sacramento.jpg' WHERE city = 'Sacramento' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/salt-lake-city.jpg' WHERE city = 'Salt Lake City' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/san-antonio.jpg' WHERE city = 'San Antonio' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/san-jose.jpg' WHERE city = 'San Jose' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/san-luis-obispo.jpg' WHERE city = 'San Luis Obispo' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/santa-barbara.jpg' WHERE city = 'Santa Barbara' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/santa-cruz.jpg' WHERE city = 'Santa Cruz' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/santa-fe.jpg' WHERE city = 'Santa Fe' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/sarasota.jpg' WHERE city = 'Sarasota' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/sedona.jpg' WHERE city = 'Sedona' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/sonoma.jpg' WHERE city = 'Sonoma' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/spokane.jpg' WHERE city = 'Spokane' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/st-louis.jpg' WHERE city = 'St. Louis' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/st-petersburg.jpg' WHERE city = 'St. Petersburg' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/tampa.jpg' WHERE city = 'Tampa' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/tucson.jpg' WHERE city = 'Tucson' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/tulsa.jpg' WHERE city = 'Tulsa' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/virginia-beach.jpg' WHERE city = 'Virginia Beach' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/washington.jpg' WHERE city = 'Washington D.C.' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/williamsburg.jpg' WHERE city = 'Williamsburg' AND country = 'USA';

-- Update Other Cities
UPDATE destinations SET image_url = '/destinations/rio.jpg' WHERE city = 'Rio de Janeiro' AND country = 'Brazil';
UPDATE destinations SET image_url = '/destinations/sydney.jpg' WHERE city = 'Sydney' AND country = 'Australia';
UPDATE destinations SET image_url = '/destinations/cape-town.jpg' WHERE city = 'Cape Town' AND country = 'South Africa';

-- Add more UPDATE statements as needed for other destinations and images.

-- Domestic USA Destinations
UPDATE destinations SET image_url = '/destinations/atlanta.jpg' WHERE city = 'Atlanta' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/austin.jpg' WHERE city = 'Austin' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/boston.jpg' WHERE city = 'Boston' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/chicago.jpg' WHERE city = 'Chicago' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/denver.jpg' WHERE city = 'Denver' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/miami.jpg' WHERE city = 'Miami' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/nashville.jpg' WHERE city = 'Nashville' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/new-orleans.jpg' WHERE city = 'New Orleans' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/seattle.jpg' WHERE city = 'Seattle' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/washington.jpg' WHERE city = 'Washington' AND country = 'USA';

-- Check how many image URLs were updated
SELECT COUNT(*) as updated_destinations FROM destinations WHERE image_url LIKE '/destinations/%.jpg'; 