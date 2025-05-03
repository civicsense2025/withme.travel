// import { PrismaClient } from '@prisma/client'; // Removed unused import
import { Command } from 'commander';
// Use the new service file via alias
import { getDestinationPhoto } from '@/lib/unsplashService';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Destination {
  city: string;
  country: string;
  state_province?: string | null;
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function processDestination(destination: Destination): Promise<void> {
  const { city, country, state_province } = destination;

  // Format filename the same way as existing files
  const filename = `${city.toLowerCase().replace(/\s+/g, '-')}-${country.toLowerCase().replace(/\s+/g, `-`)}.jpg`;
  const filepath = path.join(process.cwd(), 'public', 'destinations', filename);

  // Skip if file already exists
  if (fs.existsSync(filepath)) {
    console.log(`Skipping ${filename} - already exists`);
    return;
  }

  try {
    const locationString = state_province
      ? `${city}, ${state_province}, ${country}`
      : `${city}, ${country}`;
    console.log(`Processing ${locationString}...`);
    const result = await getDestinationPhoto(city, country, state_province ?? null);

    if (!result) {
      console.warn(`  ⚠️ No photo found for ${locationString} on Unsplash.`);
      return; // Skip if no photo found
    }

    const { photo } = result; // Destructure only if result is not null

    // Download the regular sized image
    await downloadImage(photo.urls.regular, filepath);
    console.log(`✓ Downloaded ${filename}`);

    // Wait a bit to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (error) {
    const locationString = state_province
      ? `${city}, ${state_province}, ${country}`
      : `${city}, ${country}`;
    console.error(`✗ Failed to process ${locationString}:`, error);
  }
}

async function main() {
  // NOTE: This list is hardcoded. For accurate state_province,
  // this script should fetch destinations from the database.
  // I've added state_province where unambiguous for US cities.
  const destinations: Destination[] = [
    { city: 'Newport Beach', country: 'United States', state_province: 'California' },
    { city: 'Laguna Beach', country: 'United States', state_province: 'California' },
    { city: 'San Luis Obispo', country: 'United States', state_province: 'California' },
    { city: 'Santa Cruz', country: 'United States', state_province: 'California' },
    { city: 'Reno', country: 'United States', state_province: 'Nevada' },
    { city: 'Lake Tahoe', country: 'United States', state_province: 'California' }, // CA side primarily
    { city: 'Sonoma', country: 'United States', state_province: 'California' },
    { city: 'Napa Valley', country: 'United States', state_province: 'California' },
    { city: 'Monterey', country: 'United States', state_province: 'California' },
    { city: 'Santa Barbara', country: 'United States', state_province: 'California' },
    { city: 'Venice', country: 'Italy', state_province: null },
    { city: 'Marrakech', country: 'Morocco', state_province: null },
    { city: 'Prague', country: 'Czech Republic', state_province: null },
    { city: 'Kyoto', country: 'Japan', state_province: null },
    { city: 'Rio de Janeiro', country: 'Brazil', state_province: null },
    { city: 'Istanbul', country: 'Turkey', state_province: null },
    { city: 'Hong Kong', country: 'China', state_province: null },
    { city: 'San Francisco', country: 'United States', state_province: 'California' },
    { city: 'Berlin', country: 'Germany', state_province: null },
    { city: 'Dubai', country: 'United Arab Emirates', state_province: null },
    { city: 'Singapore', country: 'Singapore', state_province: null },
    { city: 'Bangkok', country: 'Thailand', state_province: null },
    { city: 'Sydney', country: 'Australia', state_province: null },
    { city: 'Amsterdam', country: 'Netherlands', state_province: null },
    { city: 'Rome', country: 'Italy', state_province: null },
    { city: 'Taipei', country: 'Taiwan', state_province: null },
    { city: 'London', country: 'United Kingdom', state_province: null },
    { city: 'Washington D.C.', country: 'United States', state_province: 'District of Columbia' },
    { city: 'Daytona Beach', country: 'United States', state_province: 'Florida' },
    { city: 'Amelia Island', country: 'United States', state_province: 'Florida' },
    { city: 'Jacksonville', country: 'United States', state_province: 'Florida' },
    { city: 'St. Petersburg', country: 'United States', state_province: 'Florida' },
    { city: 'Sarasota', country: 'United States', state_province: 'Florida' },
    { city: 'Naples', country: 'United States', state_province: 'Florida' },
    { city: 'Destin', country: 'United States', state_province: 'Florida' },
    { city: 'Pensacola', country: 'United States', state_province: 'Florida' },
    { city: 'Corpus Christi', country: 'United States', state_province: 'Texas' },
    { city: 'Galveston', country: 'United States', state_province: 'Texas' },
    { city: 'Fort Worth', country: 'United States', state_province: 'Texas' },
    { city: 'San Antonio', country: 'United States', state_province: 'Texas' },
    { city: 'Palm Springs', country: 'United States', state_province: 'California' },
    { city: 'Fresno', country: 'United States', state_province: 'California' },
    { city: 'Bend', country: 'United States', state_province: 'Oregon' },
    { city: 'Eugene', country: 'United States', state_province: 'Oregon' },
    { city: 'Spokane', country: 'United States', state_province: 'Washington' },
    { city: 'Boise', country: 'United States', state_province: 'Idaho' },
    { city: 'Des Moines', country: 'United States', state_province: 'Iowa' },
    { city: 'Madison', country: 'United States', state_province: 'Wisconsin' },
    { city: 'Lexington', country: 'United States', state_province: 'Kentucky' },
    { city: 'Chattanooga', country: 'United States', state_province: 'Tennessee' },
    { city: 'Gatlinburg', country: 'United States', state_province: 'Tennessee' },
    { city: 'Hilton Head', country: 'United States', state_province: 'South Carolina' },
    { city: 'Myrtle Beach', country: 'United States', state_province: 'South Carolina' },
    { city: 'Williamsburg', country: 'United States', state_province: 'Virginia' },
    { city: 'Virginia Beach', country: 'United States', state_province: 'Virginia' },
    { city: 'Fort Collins', country: 'United States', state_province: 'Colorado' },
    { city: 'Colorado Springs', country: 'United States', state_province: 'Colorado' },
    { city: 'Boulder', country: 'United States', state_province: 'Colorado' },
    { city: 'Park City', country: 'United States', state_province: 'Utah' },
    { city: 'Moab', country: 'United States', state_province: 'Utah' },
    { city: 'Bozeman', country: 'United States', state_province: 'Montana' },
    { city: 'Jackson', country: 'United States', state_province: 'Wyoming' }, // Ambiguous, chose WY
    { city: 'Juneau', country: 'United States', state_province: 'Alaska' },
    { city: 'Anchorage', country: 'United States', state_province: 'Alaska' },
    { city: 'Key West', country: 'United States', state_province: 'Florida' },
    { city: 'Burlington', country: 'United States', state_province: 'Vermont' },
    { city: 'Providence', country: 'United States', state_province: 'Rhode Island' },
    { city: 'Sedona', country: 'United States', state_province: 'Arizona' },
    { city: 'Rochester', country: 'United States', state_province: 'New York' }, // Ambiguous, chose NY
    { city: 'Buffalo', country: 'United States', state_province: 'New York' },
    { city: 'Tulsa', country: 'United States', state_province: 'Oklahoma' },
    { city: 'Oklahoma City', country: 'United States', state_province: 'Oklahoma' },
    { city: 'Omaha', country: 'United States', state_province: 'Nebraska' },
    { city: 'Milwaukee', country: 'United States', state_province: 'Wisconsin' },
    { city: 'Louisville', country: 'United States', state_province: 'Kentucky' },
    { city: 'Raleigh', country: 'United States', state_province: 'North Carolina' },
    { city: 'Albuquerque', country: 'United States', state_province: 'New Mexico' },
    { city: 'Tucson', country: 'United States', state_province: 'Arizona' },
    { city: 'Richmond', country: 'United States', state_province: 'Virginia' },
    { city: 'Memphis', country: 'United States', state_province: 'Tennessee' },
    { city: 'Sacramento', country: 'United States', state_province: 'California' },
    { city: 'San Jose', country: 'United States', state_province: 'California' },
    { city: 'Pittsburgh', country: 'United States', state_province: 'Pennsylvania' },
    { city: 'Salt Lake City', country: 'United States', state_province: 'Utah' },
    { city: 'Columbus', country: 'United States', state_province: 'Ohio' },
    { city: 'Cincinnati', country: 'United States', state_province: 'Ohio' },
    { city: 'Cleveland', country: 'United States', state_province: 'Ohio' },
    { city: 'Baltimore', country: 'United States', state_province: 'Maryland' },
    { city: 'Indianapolis', country: 'United States', state_province: 'Indiana' },
    { city: 'Charlotte', country: 'United States', state_province: 'North Carolina' },
    { city: 'Asheville', country: 'United States', state_province: 'North Carolina' },
    { city: 'Tampa', country: 'United States', state_province: 'Florida' },
    { city: 'St. Louis', country: 'United States', state_province: 'Missouri' },
    { city: 'Kansas City', country: 'United States', state_province: 'Missouri' },
    { city: 'Minneapolis', country: 'United States', state_province: 'Minnesota' },
    { city: 'Phoenix', country: 'United States', state_province: 'Arizona' },
    { city: 'Dallas', country: 'United States', state_province: 'Texas' },
    { city: 'Houston', country: 'United States', state_province: 'Texas' },
    { city: 'Santa Fe', country: 'United States', state_province: 'New Mexico' },
    { city: 'Los Angeles', country: 'United States', state_province: 'California' },
  ];

  console.log(`Starting to download images for ${destinations.length} destinations...`);

  // Process destinations sequentially to avoid rate limiting
  for (const destination of destinations) {
    await processDestination(destination);
  }

  console.log('Finished downloading destination images!');
}

main().catch(console.error);
