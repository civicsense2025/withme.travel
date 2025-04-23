-- Update Destination Image URLs
-- Run this script in your Supabase SQL Editor or via psql.
-- Assumes the destinations table exists and has columns 'city', 'country', and 'image_url'.
-- Adjust WHERE clauses if city/country names in your DB differ from filenames.

-- International Destinations
UPDATE destinations SET image_url = '/destinations/amsterdam-canals.jpg' WHERE city = 'Amsterdam' AND country = 'Netherlands';
UPDATE destinations SET image_url = '/destinations/bangkok-grand-palace.jpg' WHERE city = 'Bangkok' AND country = 'Thailand';
UPDATE destinations SET image_url = '/destinations/berlin-brandenburg-gate.jpg' WHERE city = 'Berlin' AND country = 'Germany';
UPDATE destinations SET image_url = '/destinations/dubai-skyline.jpg' WHERE city = 'Dubai' AND country = 'UAE';
UPDATE destinations SET image_url = '/destinations/hong-kong-skyline.jpg' WHERE city = 'Hong Kong' AND country = 'China'; -- Assuming country is China
UPDATE destinations SET image_url = '/destinations/istanbul-blue-mosque.jpg' WHERE city = 'Istanbul' AND country = 'Turkey';
UPDATE destinations SET image_url = '/destinations/kyoto-bamboo-forest.jpg' WHERE city = 'Kyoto' AND country = 'Japan';
UPDATE destinations SET image_url = '/destinations/london-big-ben.jpg' WHERE city = 'London' AND country = 'UK';
UPDATE destinations SET image_url = '/destinations/marrakech-medina.jpg' WHERE city = 'Marrakech' AND country = 'Morocco';
UPDATE destinations SET image_url = '/destinations/prague-old-town.jpg' WHERE city = 'Prague' AND country = 'Czech Republic';
UPDATE destinations SET image_url = '/destinations/rio-christ-redeemer.jpg' WHERE city = 'Rio de Janeiro' AND country = 'Brazil';
UPDATE destinations SET image_url = '/destinations/rome-colosseum.jpg' WHERE city = 'Rome' AND country = 'Italy';
UPDATE destinations SET image_url = '/destinations/singapore-marina-bay.jpg' WHERE city = 'Singapore' AND country = 'Singapore';
UPDATE destinations SET image_url = '/destinations/sydney-opera-house.jpg' WHERE city = 'Sydney' AND country = 'Australia';
UPDATE destinations SET image_url = '/destinations/taipei-taiwan.jpg' WHERE city = 'Taipei' AND country = 'Taiwan';
UPDATE destinations SET image_url = '/destinations/venice-grand-canal.jpg' WHERE city = 'Venice' AND country = 'Italy';

-- United States Destinations (Add state checks if needed for uniqueness)
UPDATE destinations SET image_url = '/destinations/albuquerque-united-states.jpg' WHERE city = 'Albuquerque' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/amelia-island-united-states.jpg' WHERE city = 'Amelia Island' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/anchorage-united-states.jpg' WHERE city = 'Anchorage' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/asheville-united-states.jpg' WHERE city = 'Asheville' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/baltimore-united-states.jpg' WHERE city = 'Baltimore' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/bend-united-states.jpg' WHERE city = 'Bend' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/boise-united-states.jpg' WHERE city = 'Boise' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/boulder-united-states.jpg' WHERE city = 'Boulder' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/bozeman-united-states.jpg' WHERE city = 'Bozeman' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/buffalo-united-states.jpg' WHERE city = 'Buffalo' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/burlington-united-states.jpg' WHERE city = 'Burlington' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/charlotte-united-states.jpg' WHERE city = 'Charlotte' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/chattanooga-united-states.jpg' WHERE city = 'Chattanooga' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/cincinnati-united-states.jpg' WHERE city = 'Cincinnati' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/cleveland-united-states.jpg' WHERE city = 'Cleveland' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/colorado-springs-united-states.jpg' WHERE city = 'Colorado Springs' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/columbus-united-states.jpg' WHERE city = 'Columbus' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/corpus-christi-united-states.jpg' WHERE city = 'Corpus Christi' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/dallas-united-states.jpg' WHERE city = 'Dallas' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/daytona-beach-united-states.jpg' WHERE city = 'Daytona Beach' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/des-moines-united-states.jpg' WHERE city = 'Des Moines' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/destin-united-states.jpg' WHERE city = 'Destin' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/eugene-united-states.jpg' WHERE city = 'Eugene' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/fort-collins-united-states.jpg' WHERE city = 'Fort Collins' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/fort-worth-united-states.jpg' WHERE city = 'Fort Worth' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/fresno-united-states.jpg' WHERE city = 'Fresno' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/galveston-united-states.jpg' WHERE city = 'Galveston' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/gatlinburg-united-states.jpg' WHERE city = 'Gatlinburg' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/hilton-head-united-states.jpg' WHERE city = 'Hilton Head' AND country = 'USA'; -- Or Hilton Head Island?
UPDATE destinations SET image_url = '/destinations/houston-united-states.jpg' WHERE city = 'Houston' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/indianapolis-united-states.jpg' WHERE city = 'Indianapolis' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/jackson-united-states.jpg' WHERE city = 'Jackson' AND country = 'USA'; -- Which Jackson? Add state if needed.
UPDATE destinations SET image_url = '/destinations/jacksonville-united-states.jpg' WHERE city = 'Jacksonville' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/juneau-united-states.jpg' WHERE city = 'Juneau' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/kansas-city-united-states.jpg' WHERE city = 'Kansas City' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/key-west-united-states.jpg' WHERE city = 'Key West' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/laguna-beach-united-states.jpg' WHERE city = 'Laguna Beach' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/lake-tahoe-united-states.jpg' WHERE city = 'Lake Tahoe' AND country = 'USA'; -- This might need refinement (e.g., state_province)
UPDATE destinations SET image_url = '/destinations/lexington-united-states.jpg' WHERE city = 'Lexington' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/los-angeles-united-states.jpg' WHERE city = 'Los Angeles' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/louisville-united-states.jpg' WHERE city = 'Louisville' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/madison-united-states.jpg' WHERE city = 'Madison' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/memphis-united-states.jpg' WHERE city = 'Memphis' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/milwaukee-united-states.jpg' WHERE city = 'Milwaukee' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/minneapolis-united-states.jpg' WHERE city = 'Minneapolis' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/moab-united-states.jpg' WHERE city = 'Moab' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/monterey-united-states.jpg' WHERE city = 'Monterey' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/myrtle-beach-united-states.jpg' WHERE city = 'Myrtle Beach' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/napa-valley-united-states.jpg' WHERE city = 'Napa Valley' AND country = 'USA'; -- Or just Napa?
UPDATE destinations SET image_url = '/destinations/naples-united-states.jpg' WHERE city = 'Naples' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/newport-beach-united-states.jpg' WHERE city = 'Newport Beach' AND country = 'USA';
-- UPDATE destinations SET image_url = '/destinations/new-york-skyline.jpg' WHERE city = 'New York' AND country = 'USA'; -- Assumed filename, needs verification or use specific borough if applicable
UPDATE destinations SET image_url = '/destinations/oklahoma-city-united-states.jpg' WHERE city = 'Oklahoma City' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/omaha-united-states.jpg' WHERE city = 'Omaha' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/palm-springs-united-states.jpg' WHERE city = 'Palm Springs' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/park-city-united-states.jpg' WHERE city = 'Park City' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/pensacola-united-states.jpg' WHERE city = 'Pensacola' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/phoenix-united-states.jpg' WHERE city = 'Phoenix' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/pittsburgh-united-states.jpg' WHERE city = 'Pittsburgh' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/providence-united-states.jpg' WHERE city = 'Providence' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/raleigh-united-states.jpg' WHERE city = 'Raleigh' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/reno-united-states.jpg' WHERE city = 'Reno' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/richmond-united-states.jpg' WHERE city = 'Richmond' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/rochester-united-states.jpg' WHERE city = 'Rochester' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/sacramento-united-states.jpg' WHERE city = 'Sacramento' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/salt-lake-city-united-states.jpg' WHERE city = 'Salt Lake City' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/san-antonio-united-states.jpg' WHERE city = 'San Antonio' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/san-francisco-golden-gate.jpg' WHERE city = 'San Francisco' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/san-jose-united-states.jpg' WHERE city = 'San Jose' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/san-luis-obispo-united-states.jpg' WHERE city = 'San Luis Obispo' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/santa-barbara-united-states.jpg' WHERE city = 'Santa Barbara' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/santa-cruz-united-states.jpg' WHERE city = 'Santa Cruz' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/santa-fe-united-states.jpg' WHERE city = 'Santa Fe' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/sarasota-united-states.jpg' WHERE city = 'Sarasota' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/sedona-united-states.jpg' WHERE city = 'Sedona' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/sonoma-united-states.jpg' WHERE city = 'Sonoma' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/spokane-united-states.jpg' WHERE city = 'Spokane' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/st--louis-united-states.jpg' WHERE city = 'St. Louis' AND country = 'USA'; -- Note potential name diff: St. Louis vs st--louis
UPDATE destinations SET image_url = '/destinations/st--petersburg-united-states.jpg' WHERE city = 'St. Petersburg' AND country = 'USA'; -- Note potential name diff: St. Petersburg vs st--petersburg
UPDATE destinations SET image_url = '/destinations/tampa-united-states.jpg' WHERE city = 'Tampa' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/tucson-united-states.jpg' WHERE city = 'Tucson' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/tulsa-united-states.jpg' WHERE city = 'Tulsa' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/virginia-beach-united-states.jpg' WHERE city = 'Virginia Beach' AND country = 'USA';
UPDATE destinations SET image_url = '/destinations/washington-d-c--united-states.jpg' WHERE city = 'Washington D.C.' AND country = 'USA'; -- Note potential name diff
UPDATE destinations SET image_url = '/destinations/williamsburg-united-states.jpg' WHERE city = 'Williamsburg' AND country = 'USA';

-- Add more UPDATE statements as needed for other destinations and images.

SELECT count(*) FROM destinations WHERE image_url IS NOT NULL; 