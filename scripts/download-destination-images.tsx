import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: false }); // Don't override .env.local

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { createApi } from 'unsplash-js';
import nodeFetch from 'node-fetch'; // Use node-fetch for Unsplash API

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Destination image mapping - popular destinations with specific images
const destinationImageMap: Record<string, string> = {
  Barcelona: '/destinations/barcelona-sagrada-familia.png',
  Tokyo: '/destinations/tokyo-skyline-night.png',
  Paris: '/destinations/paris-eiffel-tower.png',
  'New York': '/destinations/new-york-manhattan-skyline.png',
  London: '/destinations/london-big-ben.jpg',
  Rome: '/destinations/rome-colosseum.jpg',
  Bangkok: '/destinations/bangkok-grand-palace.jpg',
  Sydney: '/destinations/sydney-opera-house.jpg',
  Amsterdam: '/destinations/amsterdam-canals.jpg',
  Kyoto: '/destinations/kyoto-bamboo-forest.jpg',
  Istanbul: '/destinations/istanbul-blue-mosque.jpg',
  Venice: '/destinations/venice-grand-canal.jpg',
  'San Francisco': '/destinations/san-francisco-golden-gate.jpg',
  Dubai: '/destinations/dubai-skyline.jpg',
  Prague: '/destinations/prague-old-town.jpg',
  'Rio de Janeiro': '/destinations/rio-christ-redeemer.jpg',
  Berlin: '/destinations/berlin-brandenburg-gate.jpg',
  Vienna: '/destinations/vienna-schonbrunn-palace.jpg',
  Singapore: '/destinations/singapore-marina-bay.jpg',
  'Hong Kong': '/destinations/hong-kong-skyline.jpg',
  Seoul: '/destinations/seoul-gyeongbokgung-palace.jpg',
  Marrakech: '/destinations/marrakech-medina.jpg',
  Athens: '/destinations/athens-acropolis.jpg',
  Budapest: '/destinations/budapest-parliament.jpg',
  Florence: '/destinations/florence-duomo.jpg',
  Lisbon: '/destinations/lisbon-tram.jpg',
  Edinburgh: '/destinations/edinburgh-castle.jpg',
  Santorini: '/destinations/santorini-blue-domes.jpg',
  Bali: '/destinations/bali-rice-terraces.jpg',
  Havana: '/destinations/havana-vintage-cars.jpg',
};

// Function to download an image
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create directory if it doesn't exist
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there's an error
        reject(err);
      });
  });
}

// Function to generate a placeholder image URL for a destination
function getPlaceholderImageUrl(destination: string): string {
  const query = encodeURIComponent(`${destination} landmark travel destination`);
  return `https://source.unsplash.com/800x600/?${query}`;
}

// Function to sanitize a filename
function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

// Main function to process all destinations
async function processDestinations() {
  console.log('Starting destination image processing...');

  try {
    // Fetch all destinations from the database
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('id, city, country, image_url');

    if (error) {
      throw error;
    }

    console.log(`Found ${destinations.length} destinations to process`);

    // Process each destination
    for (const destination of destinations) {
      try {
        const destinationName = destination.city;
        const destinationKey = destinationName;

        // Skip if the destination already has an image_url that's not a placeholder
        if (
          destination.image_url &&
          !destination.image_url.includes('placeholder') &&
          !destination.image_url.includes('source.unsplash.com')
        ) {
          console.log(`Skipping ${destinationName} - already has image: ${destination.image_url}`);
          continue;
        }

        // Determine image path - use mapping or generate one
        let imagePath: string;

        if (destinationImageMap[destinationKey]) {
          imagePath = destinationImageMap[destinationKey];
          console.log(`Using mapped image for ${destinationName}: ${imagePath}`);
        } else {
          // Generate a filename based on the destination
          const filename = sanitizeFilename(`${destination.city}-${destination.country}`);
          imagePath = `/destinations/${filename}.jpg`;
          console.log(`Generated image path for ${destinationName}: ${imagePath}`);
        }

        // Full path in the public directory
        const fullPath = path.join(process.cwd(), 'public', imagePath);

        // Check if the image already exists in our public directory
        if (!fs.existsSync(fullPath)) {
          // Download the image from Unsplash
          const imageUrl = getPlaceholderImageUrl(`${destination.city} ${destination.country}`);
          console.log(`Downloading image for ${destinationName} from ${imageUrl}`);
          await downloadImage(imageUrl, fullPath);
          console.log(`Downloaded image for ${destinationName} to ${fullPath}`);
        } else {
          console.log(`Image for ${destinationName} already exists at ${fullPath}`);
        }

        // Update the destination record with the image path
        const { error: updateError } = await supabase
          .from('destinations')
          .update({ image_url: imagePath })
          .eq('id', destination.id);

        if (updateError) {
          console.error(`Error updating ${destinationName}:`, updateError);
        } else {
          console.log(`Updated ${destinationName} with image path: ${imagePath}`);
        }
      } catch (destError) {
        console.error(`Error processing destination ${destination.city}:`, destError);
      }
    }

    console.log('Destination image processing complete!');
  } catch (err) {
    console.error('Error processing destinations:', err);
  }
}

// Run the script
processDestinations();
