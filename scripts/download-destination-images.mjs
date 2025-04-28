#!/usr/bin/env node
// scripts/download-destination-images.mjs
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch'; // Using node-fetch v2 for easier require compatibility if needed elsewhere, or use built-in fetch in Node 18+
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// IMPORTANT: Use the Service Role Key for server-side/script operations
// Keep this key secure and DO NOT commit it to version control.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const targetImageDir = path.join(publicDir, 'destinations');

if (!supabaseUrl) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL is not defined in .env.local');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local. Please add it.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Creating directory: ${dirPath}`);
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw error; // Re-throw other errors
    }
  }
}

async function downloadImage(sourceUrl, targetPath) {
  try {
    // Check if file already exists
    try {
      await fs.access(targetPath);
      console.log(`Skipping: ${path.basename(targetPath)} already exists.`);
      return false; // Indicate skipped
    } catch (err) {
       // File doesn't exist, proceed
    }

    console.log(`Downloading: ${sourceUrl} -> ${path.basename(targetPath)}`);
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${sourceUrl}: ${response.statusText} (${response.status})`);
    }

    const buffer = await response.buffer();
    await fs.writeFile(targetPath, buffer);
    console.log(`Saved: ${path.basename(targetPath)}`);
    return true; // Indicate downloaded
  } catch (error) {
    console.error(`Error downloading ${sourceUrl}:`, error.message);
    return false; // Indicate failed
  }
}

async function main() {
  console.log('Starting destination image download script...');
  await ensureDirectoryExists(targetImageDir);

  let page = 0;
  const pageSize = 100; // Adjust page size as needed
  let destinations = [];
  let downloadedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let totalProcessed = 0;

  console.log('Fetching destination data from Supabase...');

  try {
    do {
      const { data, error, count } = await supabase
        .from('destinations')
        // Select image_metadata as a top-level column, not a related table
        .select('id, city, image_url, image_metadata', { count: 'exact' }) 
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        throw error;
      }

      destinations = data || [];
      totalProcessed += destinations.length;
      console.log(`Fetched page ${page + 1}, ${destinations.length} destinations... (Total: ${count})`);


      for (const dest of destinations) {
        // Sanitize city and country for filename
        const sanitize = (str) => str?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') || '';
        const citySlug = sanitize(dest.city);
        const countrySlug = sanitize(dest.country); 
        
        // Construct the filename, using only city if country is missing
        let filename = '';
        if (citySlug && countrySlug) {
            filename = `${citySlug}-${countrySlug}.jpg`;
        } else if (citySlug) {
            filename = `${citySlug}.jpg`;
            console.warn(`Warning: Missing country for ${dest.city}. Using filename: ${filename}`);
        } else {
            // Skip if city is also missing (unlikely but possible)
            console.error(`Skipping download for ID ${dest.id}: Missing city information.`);
            failedCount++;
            continue; // Move to the next destination
        }

        // Get the source URL directly from image_url
        const sourceUrl = dest.image_url;

        // Construct the target path using the fixed filename format
        const targetPath = path.join(targetImageDir, filename);

        // Check if we have a valid source URL (looks like http/https)
        if (sourceUrl && (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://'))) {
          
          const success = await downloadImage(sourceUrl, targetPath); // Use targetPath directly
           if (success === true) downloadedCount++;
           else if (success === false && await fs.access(targetPath).then(() => true).catch(() => false)) skippedCount++; // Count as skipped only if it exists
           else failedCount++;

        } else {
           console.warn(`Skipping ${dest.city} (ID: ${dest.id}): Invalid or missing source image_url (${sourceUrl})`);
           failedCount++; // Count as failed if skipped due to missing data
        }
      }

      page++;
    } while (destinations.length === pageSize);

    console.log('\n--- Download Summary ---');
    console.log(`Total Destinations Processed: ${totalProcessed}`);
    console.log(`Images Downloaded: ${downloadedCount}`);
    console.log(`Images Skipped (Already Exist): ${skippedCount}`);
    console.log(`Images Failed/Skipped (Missing Data/Error): ${failedCount}`);
    console.log('------------------------');
    console.log('Script finished.');

  } catch (error) {
    console.error('\n--- Script Failed ---');
    console.error('An error occurred:', error.message);
    console.error('---------------------');
    process.exit(1);
  }
}

main(); 