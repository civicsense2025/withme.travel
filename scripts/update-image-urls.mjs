#!/usr/bin/env node
// scripts/update-image-urls.mjs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env.local'),
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL is not defined in .env.local');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local. Please add it.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Use the exact same sanitization function as the download script
const sanitize = (str) =>
  str
    ?.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '') || '';

async function main() {
  console.log('Starting script to update image_url to relative paths...');

  let page = 0;
  const pageSize = 100; // Process in batches
  let destinations = [];
  let updatedCount = 0;
  let failedCount = 0;
  let totalProcessed = 0;

  console.log('Fetching destination data from Supabase...');

  try {
    do {
      // Fetch destinations including id, city, country
      const { data, error, count } = await supabase
        .from('destinations')
        .select('id, city, country', { count: 'exact' })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error(`Error fetching page ${page + 1}:`, error.message);
        throw error;
      }

      destinations = data || [];
      totalProcessed += destinations.length;
      console.log(
        `Fetched page ${page + 1}, ${destinations.length} destinations... (Total estimated: ${count})`
      );

      // Process updates for the current batch
      const updatePromises = [];
      for (const dest of destinations) {
        const citySlug = sanitize(dest.city);

        // Ensure citySlug exists
        if (!citySlug) {
          console.warn(`Skipping update for ID ${dest.id}: Missing or invalid city information.`);
          failedCount++;
          continue; // Skip this destination
        }

        // *** ALWAYS construct filename as city.jpg ***
        const filename = `${citySlug}.jpg`;
        const newRelativePath = `/destinations/${filename}`;

        // Add the update promise to the batch
        updatePromises.push(
          supabase
            .from('destinations')
            .update({ image_url: newRelativePath })
            .eq('id', dest.id)
            .then(({ error: updateError }) => {
              if (updateError) {
                console.error(
                  `Failed to update ID ${dest.id} (${dest.city}):`,
                  updateError.message
                );
                failedCount++;
              } else {
                // console.log(`Updated ID ${dest.id} (${dest.city}) to ${newRelativePath}`); // Optional: Verbose logging
                updatedCount++;
              }
            })
        );
      }

      // Wait for all updates in the current batch to complete
      await Promise.all(updatePromises);
      console.log(`Finished processing batch on page ${page + 1}.`);

      page++;
    } while (destinations.length === pageSize);

    console.log('\n--- Update Summary ---');
    console.log(`Total Destinations Processed: ${totalProcessed}`);
    console.log(`Successfully Updated: ${updatedCount}`);
    console.log(`Failed/Skipped: ${failedCount}`);
    console.log('----------------------');
    console.log('Script finished.');
  } catch (error) {
    console.error('\n--- Script Failed ---');
    console.error('An unexpected error occurred during fetching:', error.message);
    console.error('---------------------');
    process.exit(1);
  }
}

main();
