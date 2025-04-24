import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
// Import from both services
import { getDestinationPhoto as getUnsplashPhoto, UnsplashPhoto, trackUnsplashDownload } from '@/lib/unsplashService'; 
import { getPexelsDestinationPhoto, PexelsPhoto } from '@/lib/pexelsService';
import { ImageMetadata, ImageType } from '@/lib/services/image-service'; 
import fs from 'fs/promises';
import path from 'path';

// Load environment variables (still needed for Supabase keys)
dotenv.config({ path: '.env.local' });

// --- DEBUG LINE --- 
console.log(`DEBUG: NEXT_PUBLIC_UNSPLASH_ACCESS_KEY = "${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}"`);
// ------------------

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase URL or Service Key is missing in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define the type for the object being upserted
type ImageMetadataUpsert = Partial<ImageMetadata> & Required<Pick<ImageMetadata, 
  'entity_id' | 'entity_type' | 'url' | 'source' | 'source_id'
>>;

// --- Argument Parsing ---
const args = process.argv.slice(2);
let targetCities: string[] | null = null;
let overwriteFlag = false; // Variable for the overwrite flag

const citiesFlagIndex = args.indexOf('--cities');
if (citiesFlagIndex !== -1) {
  targetCities = args.slice(citiesFlagIndex + 1).filter(arg => arg !== '--overwrite'); // Filter out overwrite flag
  if (targetCities.length === 0) {
    console.error(chalk.red("Error: --cities flag provided but no city names listed."));
    process.exit(1);
  }
  console.log(chalk.blue(`Targeting specific cities: ${targetCities.join(', ')}`));
}

// Check for the --overwrite flag anywhere in the arguments
if (args.includes('--overwrite')) {
  overwriteFlag = true;
  console.log(chalk.yellow('Overwrite flag set: Will update metadata even if it already exists.'));
}
// --- End Argument Parsing ---

// --- Env Var Checks ---
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!PEXELS_API_KEY && !UNSPLASH_ACCESS_KEY) {
    console.error(chalk.red("Error: Neither PEXELS_API_KEY nor UNSPLASH_ACCESS_KEY found in .env.local. At least one is required."));
    process.exit(1);
}
// --- End Env Var Checks ---

// Rate Limiting Configuration
const MAX_REQUESTS = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
let requestCount = 0;
let windowStart = Date.now();

async function waitIfNeeded() {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    // Reset window
    windowStart = now;
    requestCount = 0;
  }

  if (requestCount >= MAX_REQUESTS) {
    const timeToWait = WINDOW_MS - (now - windowStart);
    console.log(`Rate limit reached. Waiting for ${Math.ceil(timeToWait / 1000)} seconds...`);
    await new Promise(resolve => setTimeout(resolve, timeToWait));
    // Reset after waiting
    windowStart = Date.now();
    requestCount = 0;
  }
}

// Use a simple delay between ALL API calls now
const API_CALL_DELAY = 300; // ms
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateDestinationImageMetadata() {
  try {
    let query = supabase
      .from('destinations')
      .select('id, city, country, state_province, image_metadata, image_url'); // Select all needed

    if (targetCities) {
      console.log(`Fetching specified cities (${targetCities.join(', ')}) from Supabase...`);
      query = query.in('city', targetCities);
    } else {
      console.log('No specific cities provided via --cities flag. Fetching all destinations from Supabase...');
      // If no cities specified, fetch all - user can filter later if needed
    }

    const { data: destinations, error } = await query;

    if (error) {
        console.error(chalk.red("Error fetching destinations:"), error);
        throw error;
    }
    if (!destinations || destinations.length === 0) {
      console.log(chalk.yellow('No destinations found matching the criteria.'));
      return;
    }
    console.log(chalk.cyan(`Found ${destinations.length} destinations to process`));

    let processedCount = 0;
    for (const [index, destination] of destinations.entries()) {
      const locationString = `${destination.city}${destination.state_province ? ', ' + destination.state_province : ''}${destination.country ? ', ' + destination.country : ''}`;
      
      try {
        console.log(`\n[${index + 1}/${destinations.length}] Processing ${locationString}...`);

        // Skip if already has valid metadata and image_url, UNLESS overwrite flag is set
        const hasExistingData = destination.image_url && 
            destination.image_metadata?.alt_text && 
            destination.image_metadata?.attribution && 
            // Check for either source if overwrite is not forced
            (destination.image_metadata?.source === 'unsplash' || destination.image_metadata?.source === 'pexels') && 
            destination.image_metadata?.source_id;

        if (hasExistingData && !overwriteFlag) { 
          console.log(chalk.gray('  Already has image metadata, skipping (use --overwrite to force update).'));
          continue;
        }

        let result: { photo: UnsplashPhoto | PexelsPhoto, attribution: string, sourceQuery: string, source: 'unsplash' | 'pexels' } | null = null;

        // Alternate between Unsplash and Pexels
        // Use modulo operator on the index to alternate
        const useUnsplash = (index % 2 === 0) && UNSPLASH_ACCESS_KEY; 
        const usePexels = (index % 2 !== 0) && PEXELS_API_KEY;

        console.log(chalk.dim(`  Attempting image search via ${useUnsplash ? 'Unsplash' : (usePexels ? 'Pexels' : 'No Service Available')}...`));
        await delay(API_CALL_DELAY); // Add delay before ANY API call

        if (useUnsplash) {
            const unsplashResult = await getUnsplashPhoto(
              destination.city,
              destination.country ?? '',
              destination.state_province || null
            );
            if (unsplashResult) {
                result = { ...unsplashResult, source: 'unsplash' };
            }
        }
        
        // If Unsplash wasn't used or didn't find anything, try Pexels (if available)
        if (!result && usePexels) { 
            console.log(chalk.dim(`  Unsplash failed or not used, trying Pexels...`));
            await delay(API_CALL_DELAY); // Delay before Pexels call too
            const pexelsResult = await getPexelsDestinationPhoto(
                destination.city,
                destination.country ?? '',
                destination.state_province || null
            );
             if (pexelsResult) {
                result = { ...pexelsResult, source: 'pexels' };
            }
        }

        // Process Result and Update DB
        if (result) {
          let photo: UnsplashPhoto | PexelsPhoto = result.photo;
          let metadata: ImageMetadataUpsert;

          console.log(chalk.green(`  Found image via ${result.source}! ID: ${photo.id} (Query: "${result.sourceQuery}")`));

          // Prepare metadata based on the source
          if (result.source === 'unsplash') {
            const unsplashPhoto = photo as UnsplashPhoto;
            const altText = unsplashPhoto.alt_description || unsplashPhoto.description || `${locationString} - landmark view`;
            metadata = {
              entity_type: 'destination',
              entity_id: destination.id,  
              url: unsplashPhoto.urls.regular, // Use regular Unsplash URL    
              source: 'unsplash',       
              source_id: unsplashPhoto.id.toString(), // Ensure source_id is string       
              alt_text: altText,
              attribution: result.attribution, 
              attributionHtml: (result as any).attributionHtml, // Add HTML attribution
              photographer_name: unsplashPhoto.user.name,
              photographer_url: unsplashPhoto.user.links.html,
              width: unsplashPhoto.width,
              height: unsplashPhoto.height,
            };
          } else { // Pexels
            const pexelsPhoto = photo as PexelsPhoto;
            const altText = pexelsPhoto.alt || `${locationString} - scenic view`;
             metadata = {
              entity_type: 'destination',
              entity_id: destination.id,  
              url: pexelsPhoto.src.large, // Use large Pexels URL (or medium/large2x)    
              source: 'pexels',       
              source_id: pexelsPhoto.id.toString(), // Ensure source_id is string      
              alt_text: altText,
              attribution: result.attribution,
              attributionHtml: (result as any).attributionHtml, // Add HTML attribution
              photographer_name: pexelsPhoto.photographer,
              photographer_url: pexelsPhoto.photographer_url,
              width: pexelsPhoto.width,
              height: pexelsPhoto.height,
            };
          }

          // Database Update
          console.log(`  Updating Supabase for ${locationString} with ${result.source} image...`);
          const { error: updateError } = await supabase
            .from('destinations') 
            .update({
              image_metadata: metadata as any, 
              image_url: metadata.url 
            })
            .eq('id', destination.id);

          if (updateError) {
            console.error(chalk.red(`    Failed to update Supabase for ${locationString}:`), updateError.message);
          } else {
            console.log(chalk.green(`    Successfully updated metadata and image for ${locationString}.`));
            processedCount++;
          }

        } else {
             console.warn(chalk.yellow(`  Could not find any suitable image for ${locationString} from any source.`));
        }

      } catch (err) {
          // Global Error Handling
          const error = err as Error;
          console.error(chalk.red(`  Error processing ${locationString}: ${error.message}`), error.stack);
          // Continue to the next destination
      }
    }

    console.log(chalk.magenta(`\nFinished update script. Processed ${processedCount} destinations.`));

  } catch (err) {
      // Global Error Handling
      const error = err as Error;
      console.error(chalk.red('Fatal error during script execution:'), error.message);
      process.exitCode = 1;
  }
}

console.log("Starting image metadata update script (with Unsplash & Pexels)..." + 
            (overwriteFlag ? chalk.yellow(" [Overwrite Mode Enabled]") : ""));
updateDestinationImageMetadata().catch(console.error);
