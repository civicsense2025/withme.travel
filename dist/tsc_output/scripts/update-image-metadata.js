import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { searchUnsplashPhotos, trackUnsplashDownload, formatUnsplashAttribution, UnsplashError } from '../utils/unsplash';
// Load environment variables (still needed for Supabase keys)
dotenv.config({ path: '.env.local' });
// --- DEBUG LINE --- 
console.log(`DEBUG: NEXT_PUBLIC_UNSPLASH_ACCESS_KEY = "${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}"`);
// ------------------
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase URL or Service Key is missing in environment variables.");
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
async function updateDestinationImageMetadata() {
    var _a, _b;
    try {
        console.log('Fetching destinations from Supabase...');
        // Fetch all destinations
        const { data: destinations, error } = await supabase
            .from('destinations')
            .select('*');
        if (error) {
            console.error("Error fetching destinations:", error);
            throw error;
        }
        if (!destinations) {
            console.log('No destinations found');
            return;
        }
        console.log(`Found ${destinations.length} destinations to process`);
        for (const destination of destinations) {
            try {
                // --- Rate Limiting Check ---
                await waitIfNeeded();
                // ---------------------------
                console.log(`Processing ${destination.city}${destination.country ? `, ${destination.country}` : ''}...`);
                // Skip if already has metadata and image_url
                if (((_a = destination.image_metadata) === null || _a === void 0 ? void 0 : _a.alt_text) &&
                    ((_b = destination.image_metadata) === null || _b === void 0 ? void 0 : _b.attribution) &&
                    destination.image_url) {
                    console.log('Already has metadata and image, skipping...');
                    continue;
                }
                // Prepare search query, handle null country
                const searchQuery = destination.country
                    ? `${destination.city} ${destination.country} landmark`
                    : `${destination.city} landmark`;
                console.log(`Searching Unsplash for: "${searchQuery}"`);
                // Increment request count *before* the API call
                requestCount++;
                const searchResponse = await searchUnsplashPhotos(searchQuery, 1, 1, true // Use server auth if available/needed
                );
                if (searchResponse.total > 0) {
                    const photo = searchResponse.results[0];
                    console.log(`Found Unsplash photo ID: ${photo.id} for ${destination.city}`);
                    // --- Rate Limiting Check (for trackDownload) ---
                    await waitIfNeeded();
                    // -------------------------------------------------
                    // Increment before the call
                    requestCount++;
                    // Track the download (important for Unsplash TOS)
                    try {
                        await trackUnsplashDownload(photo);
                        console.log(`Tracked download for photo ID: ${photo.id}`);
                    }
                    catch (trackError) {
                        console.error(`Failed to track download for photo ${photo.id}:`, trackError);
                        // Continue even if tracking fails, but log it
                    }
                    // Prepare metadata
                    const altText = photo.alt_description || `${destination.city}${destination.country ? `, ${destination.country}` : ''} - landmark view`;
                    const metadata = {
                        alt_text: altText,
                        attribution: formatUnsplashAttribution(photo),
                        unsplash_id: photo.id
                    };
                    // Update the destination with metadata and image
                    console.log(`Updating Supabase for ${destination.city}...`);
                    const { error: updateError } = await supabase
                        .from('destinations')
                        .update({
                        image_metadata: metadata,
                        image_url: photo.urls.regular // Update to high-quality Unsplash image
                    })
                        .eq('id', destination.id);
                    if (updateError) {
                        console.error(`Failed to update Supabase for ${destination.city}:`, updateError);
                        continue; // Skip to next destination on update failure
                    }
                    console.log(`Successfully updated metadata and image for ${destination.city}`);
                }
                else {
                    console.log(`No Unsplash photos found for "${searchQuery}"`);
                    // Only update metadata if image_url is also missing
                    if (!destination.image_url) {
                        const defaultAlt = `${destination.city}${destination.country ? `, ${destination.country}` : ''} - scenic view`;
                        const metadata = {
                            alt_text: defaultAlt,
                            attribution: 'Image source unknown'
                        };
                        console.log(`Updating Supabase with default metadata for ${destination.city}...`);
                        const { error: updateError } = await supabase
                            .from('destinations')
                            .update({ image_metadata: metadata })
                            .eq('id', destination.id);
                        if (updateError) {
                            console.error(`Failed to update default metadata for ${destination.city}:`, updateError);
                        }
                    }
                    else {
                        console.log(`Skipping metadata update for ${destination.city} as image_url already exists.`);
                    }
                }
                // Add a small delay between processing each destination (independent of rate limit window)
                // This is polite to your own DB and helps visualize progress.
                await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
            }
            catch (err) {
                if (err instanceof UnsplashError) {
                    console.error(`Unsplash API Error processing ${destination.city}: ${err.message} (Status: ${err.statusCode || 'N/A'})`);
                    // Potentially handle specific Unsplash errors, e.g., 401 Unauthorized might mean key is bad
                    if (err.statusCode === 401) {
                        console.error("Got Unsplash 401 Unauthorized. Check your NEXT_PUBLIC_UNSPLASH_ACCESS_KEY.");
                        // Optionally exit if the key is definitely bad
                        // process.exit(1);
                    }
                }
                else {
                    console.error(`General Error processing ${destination.city}:`, err);
                }
                // Continue to the next destination even if one fails
            }
        }
        console.log('Finished updating destination image metadata');
    }
    catch (err) {
        console.error('Fatal error during script execution:', err);
    }
}
console.log("Starting image metadata update script...");
// Run the update function
updateDestinationImageMetadata().catch(console.error);
