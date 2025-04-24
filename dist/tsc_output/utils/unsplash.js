#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import fetch from 'node-fetch';
// --- End Types / Interfaces ---
// Load environment variables
dotenv.config();
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!UNSPLASH_ACCESS_KEY) {
    console.error(chalk.red('Error: UNSPLASH_ACCESS_KEY not found in environment variables. Please add it to your .env file.'));
    process.exit(1);
}
const PACKAGE_VERSION = '1.0.0';
const DEFAULT_OUTPUT_DIR = './images';
const DEFAULT_RATE_LIMIT = 50; // Unsplash default limit per hour for non-enterprise apps
const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000;
let requestCount = 0;
let rateLimit = DEFAULT_RATE_LIMIT;
let lastRequestTime = Date.now(); // Track start of current hour window
const program = new Command();
program
    .name('unsplash-cli')
    .description('Command-line utility for Unsplash image operations')
    .version(PACKAGE_VERSION);
// Helper for rate limiting (simplified for per-hour checks)
const applyRateLimit = async () => {
    const now = Date.now();
    // Reset count if more than an hour has passed since the window started
    if (now - lastRequestTime > 3600000) {
        requestCount = 0;
        lastRequestTime = now; // Start new window
    }
    if (requestCount >= rateLimit) {
        const waitTime = (lastRequestTime + 3600000) - now; // Time until the hour window ends
        if (waitTime > 0) {
            console.log(chalk.yellow(`Unsplash API rate limit reached (${rateLimit}/hour). Waiting ${(waitTime / 1000 / 60).toFixed(1)} minutes...`));
            await new Promise(resolve => setTimeout(resolve, waitTime));
            requestCount = 0; // Reset count after waiting
            lastRequestTime = Date.now(); // Start new window immediately
        }
        else {
            // If waitTime is negative, the hour has already passed, just reset
            requestCount = 0;
            lastRequestTime = now;
        }
    }
    requestCount++;
    // console.log(chalk.dim(`API Request ${requestCount}/${rateLimit} for this hour.`)); // Optional: log request count
};
// --- Unsplash API Functions ---
/**
 * Searches Unsplash for photos based on a query.
 */
async function searchUnsplashPhotos(query, page = 1, perPage = 10) {
    var _a;
    await applyRateLimit();
    const apiSpinner = createSpinner(`Searching Unsplash API for "${query}"...`).start();
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('per_page', perPage.toString());
    // Add orientation, content filter if needed
    url.searchParams.append('orientation', 'landscape');
    // url.searchParams.append('content_filter', 'high'); 
    try {
        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                'Accept-Version': 'v1'
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            apiSpinner.error({ text: `Unsplash API Error: ${response.status} ${response.statusText}` });
            throw new Error(`API Error (${response.status}): ${((_a = errorData === null || errorData === void 0 ? void 0 : errorData.errors) === null || _a === void 0 ? void 0 : _a[0]) || response.statusText}`);
        }
        const data = await response.json();
        apiSpinner.success({ text: `Found ${data.total} results for "${query}"` });
        return data;
    }
    catch (error) {
        apiSpinner.error({ text: `Failed to search Unsplash: ${error.message}` });
        throw error; // Re-throw the error
    }
}
/**
 * Gets the best photo for a destination, trying city, state, then country.
 */
async function getDestinationPhoto(city, country, state) {
    const queries = [
        `${city} ${state ? state + ' ' : ''}${country} landmark cityscape`, // Specific city+state/province
        `${city} ${country} landmark`, // City + country
        `${state ? state + ' ' : ''}${country} landmark scenic`, // State/province + country
        `${country} landmark scenic`, // Country only
    ];
    for (const query of queries) {
        const spinner = createSpinner(`Attempting search with query: "${query}"`).start();
        try {
            const response = await searchUnsplashPhotos(query, 1, 5); // Fetch a few results
            if (response.results.length > 0) {
                // Basic selection: pick the first result for now
                // TODO: Add better logic? (e.g., check tags, relevance)
                const photo = response.results[0];
                spinner.success({ text: `Found image using query: "${query}"` });
                return {
                    photo,
                    attribution: `Photo by ${photo.user.name} on Unsplash`,
                    sourceQuery: query,
                };
            }
            spinner.warn({ text: `No results for query: "${query}"` });
        }
        catch (error) {
            spinner.error({ text: `Error during search for "${query}": ${error.message}` });
            // Don't stop, try the next query
        }
    }
    throw new Error(`Could not find any suitable image for ${city}, ${country} after trying multiple queries.`);
}
// --- End Unsplash API Functions ---
// Download image helper
const downloadImage = async (photo, filename, outputDir) => {
    // We might need to call the download_location URL to trigger the download count on Unsplash side
    // Let's skip that for simplicity now, but keep it in mind.
    await applyRateLimit(); // Apply rate limit before the actual download fetch
    const downloadSpinner = createSpinner(`Downloading image ${photo.id}...`).start();
    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // Use 'regular' size for consistency, consider 'full' if needed
        const imageUrl = photo.urls.regular;
        const response = await fetch(imageUrl); // Fetch the image URL directly
        if (!response.ok) {
            downloadSpinner.error({ text: `Failed to download image: ${response.statusText}` });
            throw new Error(`Failed to download image (${response.status}): ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        const outputPath = path.join(outputDir, filename);
        fs.writeFileSync(outputPath, Buffer.from(buffer));
        downloadSpinner.success({ text: `Downloaded to ${outputPath}` });
        return outputPath;
    }
    catch (error) {
        // Ensure spinner stops on error
        if (!downloadSpinner.isSpinning)
            downloadSpinner.start();
        downloadSpinner.error({ text: `Download failed: ${error.message}` });
        throw error;
    }
};
// Function to handle retries
const withRetry = async (fn, retries = DEFAULT_RETRY_COUNT, delay = DEFAULT_RETRY_DELAY) => {
    try {
        return await fn();
    }
    catch (error) {
        if (retries <= 0)
            throw error;
        console.log(chalk.yellow(`Operation failed, retrying in ${delay / 1000}s... (${retries} attempts left)`));
        await new Promise(resolve => setTimeout(resolve, delay));
        // Implement exponential backoff or jitter if needed
        return withRetry(fn, retries - 1, delay * 1.5);
    }
};
// Create attribution file
const createAttributionFile = (photo, outputPath, format = 'text') => {
    var _a;
    const basePath = outputPath.replace(/\\.[^.]+$/, '');
    let content = '';
    const attributionLink = (url) => `${url}?utm_source=withme.travel&utm_medium=referral`;
    if (format === 'html') {
        content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Photo Attribution</title>
</head>
<body>
  <p>
    Photo by <a href="${attributionLink(photo.user.links.html)}" target="_blank" rel="noopener noreferrer">${photo.user.name}</a> 
    on <a href="${attributionLink('https://unsplash.com/')}" target="_blank" rel="noopener noreferrer">Unsplash</a>
  </p>
</body>
</html>`;
    }
    else if (format === 'json') {
        content = JSON.stringify({
            id: photo.id,
            photographer: {
                name: photo.user.name,
                username: photo.user.username,
                link: attributionLink(photo.user.links.html)
            },
            description: photo.description || photo.alt_description,
            source: 'Unsplash',
            source_url: attributionLink(photo.links.html),
            links: {
                original: photo.urls.full, // Consider linking to the Unsplash page instead?
                download_trigger: photo.links.download_location // URL to ping for download stats
            },
            width: photo.width,
            height: photo.height,
            color: photo.color,
            tags: ((_a = photo.tags) === null || _a === void 0 ? void 0 : _a.map(t => t.title)) || []
        }, null, 2);
    }
    else { // text format
        content = `Photo by ${photo.user.name} on Unsplash
Photo ID: ${photo.id}
Photographer: ${photo.user.name} (${photo.user.username})
Description: ${photo.description || photo.alt_description || 'No description available'}
Photographer Profile: ${attributionLink(photo.user.links.html)}
Unsplash URL: ${attributionLink(photo.links.html)}`;
    }
    try {
        fs.writeFileSync(`${basePath}.attribution.${format === 'text' ? 'txt' : format}`, content);
        console.log(chalk.gray(`  └─ Attribution file created: ${path.basename(outputPath)}.attribution.${format === 'text' ? 'txt' : format}`));
    }
    catch (error) {
        console.error(chalk.red(`  └─ Failed to create attribution file for ${path.basename(outputPath)}: ${error.message}`));
    }
};
// Download city image command
program
    .command('download-city')
    .description('Download an image for a city')
    .requiredOption('-c, --city <name>', 'City name')
    .requiredOption('-n, --country <name>', 'Country name')
    .option('-s, --state <name>', 'State or province name')
    .option('-o, --output <dir>', 'Output directory', DEFAULT_OUTPUT_DIR)
    .option('-f, --filename <name>', 'Output filename (defaults to city-country.jpg)')
    .option('-a, --attribution <format>', 'Save attribution file (text, html, json)', 'text')
    .option('-r, --rate-limit <number>', 'Maximum requests per hour', `${DEFAULT_RATE_LIMIT}`)
    // .option('--server-auth', 'Use server-side authentication') // Removed as API key is used directly
    .option('--force-country', 'Force using country image even if city image is available')
    .option('--retries <number>', 'Number of retries on failure', `${DEFAULT_RETRY_COUNT}`)
    .action(async (options) => {
    try {
        rateLimit = parseInt(options.rateLimit, 10);
        const retries = parseInt(options.retries, 10);
        const searchSpinner = createSpinner(`Searching for image: ${options.city}, ${options.country}...`).start();
        const result = await withRetry(async () => {
            if (options.forceCountry) {
                searchSpinner.update({ text: `Forcing country search for: ${options.country}...` });
                const countryQuery = `${options.country} landmark scenic`;
                const response = await searchUnsplashPhotos(countryQuery, 1, 1); // Fetch 1 result
                if (response.total === 0) {
                    throw new Error(`No images found for country: ${options.country}`);
                }
                searchSpinner.success({ text: `Found forced country image for ${options.country}` });
                return {
                    photo: response.results[0],
                    attribution: `Photo by ${response.results[0].user.name} on Unsplash`,
                    sourceQuery: countryQuery, // Include source query
                };
            }
            else {
                searchSpinner.update({ text: `Searching for destination: ${options.city}, ${options.country}...` });
                // Normal city search with country fallback
                const destinationResult = await getDestinationPhoto(options.city, options.country, options.state || null);
                searchSpinner.success({ text: `Found image for ${options.city} via query "${destinationResult.sourceQuery}"` });
                return destinationResult; // Contains photo, attribution, sourceQuery
            }
        }, retries);
        // Generate filename (ensure it's sanitized)
        const sanitize = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const defaultFilename = `${sanitize(options.city)}-${sanitize(options.country)}.jpg`;
        const filename = options.filename ?
            (options.filename.endsWith('.jpg') ? options.filename : `${options.filename}.jpg`)
            : defaultFilename;
        const outputPath = await downloadImage(result.photo, filename, options.output);
        if (options.attribution) {
            createAttributionFile(result.photo, outputPath, options.attribution);
        }
        console.log(chalk.green(`\nSuccess! Image downloaded for ${options.city}, ${options.country}`));
        // console.log(chalk.dim(`Attribution: ${result.attribution}`)); // Included in file now
        console.log(chalk.dim(`Source Query: ${result.sourceQuery}`));
    }
    catch (error) {
        // Ensure spinner stops if it was running during an error before download
        // createSpinner('').error(); // This might create a new spinner instance, avoid if possible
        console.error(chalk.red(`\nError processing ${options.city}, ${options.country}: ${error.message}`));
        process.exitCode = 1; // Set exit code to 1 on error, but don't exit immediately in batch
    }
});
// Batch download command
program
    .command('batch-download')
    .description('Batch download images from a CSV file (expects columns: city, country, [state])')
    .requiredOption('-i, --input <file>', 'Input CSV file')
    .option('-o, --output <dir>', 'Output directory', DEFAULT_OUTPUT_DIR)
    .option('-a, --attribution <format>', 'Save attribution files (text, html, json)', 'text')
    .option('-r, --rate-limit <number>', 'Maximum requests per hour', `${DEFAULT_RATE_LIMIT}`)
    .option('-b, --batch-size <number>', 'Number of parallel downloads', `${DEFAULT_BATCH_SIZE}`)
    // .option('--server-auth', 'Use server-side authentication') // Removed
    .option('--force-country', 'Force using country images even if city images are available')
    .option('--retries <number>', 'Number of retries on failure per item', `${DEFAULT_RETRY_COUNT}`)
    .option('--delimiter <char>', 'CSV delimiter', ',')
    .option('--skip-header', 'Skip first line of CSV file', false)
    .action(async (options) => {
    try {
        rateLimit = parseInt(options.rateLimit, 10);
        const batchSize = parseInt(options.batchSize, 10); // This is now parallel download count
        const retries = parseInt(options.retries, 10);
        console.log(chalk.blue(`Reading CSV file: ${options.input}`));
        if (!fs.existsSync(options.input)) {
            throw new Error(`Input file not found: ${options.input}`);
        }
        const fileContent = fs.readFileSync(options.input, 'utf8');
        const lines = fileContent.split(/\\r?\\n/).filter(line => line.trim()); // Handle different line endings
        const header = options.skipHeader ? lines.shift() : null; // Remove header line if flag is set
        if (header)
            console.log(chalk.dim(`Skipped header: ${header}`));
        const locations = lines.map((line, index) => {
            const parts = line.split(options.delimiter).map(p => p.trim());
            if (parts.length < 2 || !parts[0] || !parts[1]) {
                console.log(chalk.yellow(`[Line ${index + (options.skipHeader ? 2 : 1)}] Invalid format: "${line}". Skipping.`));
                return null;
            }
            return {
                city: parts[0],
                country: parts[1],
                state: parts.length > 2 ? parts[2] : null,
                originalLine: line
            };
        }).filter(Boolean); // Filter out nulls and assert type
        const total = locations.length;
        console.log(chalk.blue(`Found ${total} valid locations to process.`));
        let processedCount = 0;
        let successfulCount = 0;
        let failedCount = 0;
        // --- Simple Sequential Processing (easier to manage rate limit) ---
        const mainSpinner = createSpinner(`Processing ${total} locations sequentially...`).start();
        for (let i = 0; i < locations.length; i++) {
            const loc = locations[i];
            mainSpinner.update({ text: `[${i + 1}/${total}] Processing ${loc.city}, ${loc.country}...` });
            try {
                const result = await withRetry(async () => {
                    if (options.forceCountry) {
                        const countryQuery = `${loc.country} landmark scenic`;
                        const response = await searchUnsplashPhotos(countryQuery, 1, 1);
                        if (response.total === 0)
                            throw new Error(`No images found for country: ${loc.country}`);
                        return { photo: response.results[0], sourceQuery: countryQuery };
                    }
                    else {
                        return await getDestinationPhoto(loc.city, loc.country, loc.state);
                    }
                }, retries);
                const sanitize = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const filename = `${sanitize(loc.city)}-${sanitize(loc.country)}.jpg`;
                const outputPath = await downloadImage(result.photo, filename, options.output);
                if (options.attribution) {
                    createAttributionFile(result.photo, outputPath, options.attribution);
                }
                // No need for individual success log here if mainSpinner is updated
                successfulCount++;
            }
            catch (error) {
                mainSpinner.error({ text: `[${i + 1}/${total}] Failed: ${loc.city}, ${loc.country} - ${error.message}` });
                // Restart spinner for next item
                mainSpinner.start({ text: `[${i + 1}/${total}] Processing next...` });
                failedCount++;
            }
            processedCount++;
        }
        mainSpinner.success({ text: `Batch processing complete!` });
        console.log(chalk.blue(`Total: ${total}, Successful: ${successfulCount}, Failed: ${failedCount}`));
    }
    catch (error) {
        createSpinner('').error(); // Ensure any active spinner is stopped
        console.error(chalk.red(`\nBatch Error: ${error.message}`));
        process.exit(1);
    }
});
// Cache management command (Placeholder - not implemented)
program
    .command('cache')
    .description('Manage the image cache (Not Implemented)')
    .option('--clear', 'Clear the entire cache')
    .option('--status', 'Show cache status', true)
    .action((options) => {
    if (options.clear) {
        // clearPhotoCache(); // Function not implemented
        console.log(chalk.yellow('Cache clearing not implemented.'));
    }
    if (options.status) {
        console.log(chalk.blue('Cache status: Not implemented.'));
    }
});
// Preload common destinations command (Placeholder - uses getDestinationPhoto)
program
    .command('preload')
    .description('Preload images for common destinations (Not Fully Implemented)')
    .option('-i, --input <file>', 'Input CSV file with common destinations')
    .option('-r, --rate-limit <number>', 'Maximum requests per hour', `${DEFAULT_RATE_LIMIT}`)
    // .option('--server-auth', 'Use server-side authentication') // Removed
    .action(async (options) => {
    console.log(chalk.yellow('Preload command is placeholder and uses standard getDestinationPhoto logic.'));
    // Basic implementation using getDestinationPhoto for now
    try {
        rateLimit = parseInt(options.rateLimit, 10);
        let destinations = [];
        if (options.input && fs.existsSync(options.input)) {
            const fileContent = fs.readFileSync(options.input, 'utf8');
            destinations = fileContent.split(/\\r?\\n/).filter(line => line.trim()).map(line => {
                var _a, _b;
                const parts = line.split(',');
                return { city: (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.trim(), country: (_b = parts[1]) === null || _b === void 0 ? void 0 : _b.trim() };
            }).filter(d => d.city && d.country);
        }
        else {
            destinations = [
                { city: 'Paris', country: 'France' }, { city: 'London', country: 'UK' },
                { city: 'New York', country: 'USA' }, { city: 'Tokyo', country: 'Japan' }
            ];
            console.log(chalk.blue('Using default common destinations.'));
        }
        console.log(chalk.blue(`Attempting to "preload" ${destinations.length} destinations...`));
        let successCount = 0;
        for (const dest of destinations) {
            try {
                await getDestinationPhoto(dest.city, dest.country, null);
                console.log(chalk.green(` ✓ Preloaded (fetched) ${dest.city}, ${dest.country}`));
                successCount++;
            }
            catch (error) {
                console.log(chalk.yellow(`   ✗ Failed preload for ${dest.city}, ${dest.country}`));
            }
        }
        console.log(chalk.green(`\nPreload attempt finished: ${successCount}/${destinations.length} successful fetches.`));
    }
    catch (error) {
        console.error(chalk.red(`\nPreload Error: ${error.message}`));
        process.exit(1);
    }
});
// Search command
program
    .command('search')
    .description('Search for images with specific query')
    .requiredOption('-q, --query <text>', 'Search query')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-n, --per-page <number>', 'Results per page', '10')
    .option('-o, --output <dir>', 'Download found images to directory')
    .option('-a, --attribution <format>', 'Save attribution files (text, html, json)')
    .option('-r, --rate-limit <number>', 'Maximum requests per hour', `${DEFAULT_RATE_LIMIT}`)
    // .option('--server-auth', 'Use server-side authentication') // Removed
    .action(async (options) => {
    try {
        rateLimit = parseInt(options.rateLimit, 10);
        const page = parseInt(options.page, 10);
        const perPage = parseInt(options.perPage, 10);
        // No spinner for search itself, happens inside searchUnsplashPhotos
        const results = await searchUnsplashPhotos(options.query, page, perPage);
        if (results.total === 0) {
            console.log(chalk.yellow('No images found for this query.'));
            return;
        }
        console.log(chalk.blue(`\nSearch Results (Page ${page}/${results.total_pages}, Total ${results.total}):`));
        results.results.forEach((photo, index) => {
            console.log(chalk.cyan(`\n[${(page - 1) * perPage + index + 1}] Photo ID: ${photo.id}`));
            console.log(`   Desc: ${photo.description || photo.alt_description || chalk.italic('No description')}`);
            console.log(`   By:   ${photo.user.name} (${photo.user.username})`);
            console.log(`   URL:  ${photo.links.html}`);
        });
        if (options.output) {
            console.log(chalk.blue('\nDownloading images...'));
            const downloadSpinner = createSpinner('Starting downloads...').start();
            if (!fs.existsSync(options.output)) {
                fs.mkdirSync(options.output, { recursive: true });
            }
            let downloadedCount = 0;
            for (let i = 0; i < results.results.length; i++) {
                const photo = results.results[i];
                const sanitize = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                // Use photo ID for uniqueness in search downloads
                const filename = `${sanitize(options.query)}-${photo.id}.jpg`;
                downloadSpinner.update({ text: `[${i + 1}/${results.results.length}] Downloading ${filename}...` });
                try {
                    const outputPath = await downloadImage(photo, filename, options.output);
                    if (options.attribution) {
                        createAttributionFile(photo, outputPath, options.attribution);
                    }
                    downloadedCount++;
                }
                catch (error) {
                    console.log(chalk.red(`\n  └─ Failed to download image ${i + 1} (${photo.id}): ${error.message}`));
                }
            }
            downloadSpinner.success({ text: `Download complete! (${downloadedCount}/${results.results.length} successful)` });
        }
    }
    catch (error) {
        createSpinner('').error(); // Stop any spinners
        console.error(chalk.red(`\nSearch Error: ${error.message}`));
        process.exit(1);
    }
});
// Generate country override command (Keep as is, it's mostly template generation)
program
    .command('generate-overrides')
    .description('Generate country override configuration template')
    .option('-o, --output <file>', 'Output file', 'country-overrides.json')
    .option('-i, --input <file>', 'Input CSV with country list (col 2 = country)')
    .action((options) => {
    try {
        let countries = [];
        if (options.input && fs.existsSync(options.input)) {
            const fileContent = fs.readFileSync(options.input, 'utf8');
            countries = [...new Set(fileContent.split(/\\r?\\n/)
                    .map(line => { var _a; return (_a = line.split(',')[1]) === null || _a === void 0 ? void 0 : _a.trim(); }) // Assumes country is second column
                    .filter(Boolean))]; // Filter out empty/undefined and assert type
            console.log(chalk.blue(`Found ${countries.length} unique countries in ${options.input}`));
        }
        else {
            countries = [ /* Default list */];
            console.log(chalk.yellow('No input file specified or found. Using empty list for template.'));
        }
        const overrides = countries.reduce((acc, country) => {
            acc[country] = {
                query: `${country.toLowerCase()} landmark scenic`, // Default query suggestion
                forceOverride: false // Default override flag
            };
            return acc;
        }, {});
        fs.writeFileSync(options.output, JSON.stringify(overrides, null, 2));
        console.log(chalk.green(`Country overrides template saved to ${options.output}`));
        console.log(chalk.blue('Edit this file to customize queries and set force override flags.'));
    }
    catch (error) {
        console.error(chalk.red(`\nGenerate Overrides Error: ${error.message}`));
        process.exit(1);
    }
});
// Run the program
program.parse(process.argv);
