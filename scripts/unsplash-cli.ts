#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import fetch from 'node-fetch';

// Import shared functions and types from the service
import {
  searchUnsplashPhotos,
  getDestinationPhoto,
  trackUnsplashDownload, // Keep track download for direct download commands
  type UnsplashPhoto,
  type UnsplashSearchResponse,
} from '../lib/unsplashService';

// --- CLI Specific Types ---
// Keep interface definitions specific to the CLI commands here

interface DownloadCityOptions {
  city: string;
  country: string;
  state?: string;
  output: string;
  filename?: string;
  attribution: 'text' | 'html' | 'json';
  rateLimit: string; // Keep rateLimit option for CLI override if desired, though service handles base limit
  forceCountry?: boolean;
  retries: string;
}

interface BatchDownloadOptions {
  input: string;
  output: string;
  attribution: 'text' | 'html' | 'json';
  rateLimit: string;
  batchSize: string;
  forceCountry?: boolean;
  retries: string;
  delimiter: string;
  skipHeader: boolean;
}

interface CacheOptions {
  clear?: boolean;
  status: boolean;
}

interface PreloadOptions {
  input?: string;
  rateLimit: string;
}

interface SearchOptions {
  query: string;
  page: string;
  perPage: string;
  output?: string;
  attribution?: 'text' | 'html' | 'json';
  rateLimit: string;
  retries: string;
}

interface GenerateOverridesOptions {
  output: string;
  input?: string;
}
// --- End CLI Specific Types ---

// CLI specific constants and setup
dotenv.config({ path: '.env.local' }); // Keep for potential CLI-only env vars if any

// Note: UNSPLASH_ACCESS_KEY check is now primarily in the service,
// but keeping a check here prevents the CLI from running commands if it's missing.
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!UNSPLASH_ACCESS_KEY) {
  console.error(
    chalk.red('Error: UNSPLASH_ACCESS_KEY not found. Add it to .env.local for the CLI to function.')
  );
  process.exit(1);
}

const PACKAGE_VERSION = '1.0.0';
const DEFAULT_OUTPUT_DIR = './images';
// Removed DEFAULT_RATE_LIMIT as it's handled by the service
const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000;

// Removed shared rate limiting state (requestCount, rateLimit, lastRequestTime)
// Removed applyRateLimit function (now in service)

const program = new Command();
program
  .name('unsplash-cli')
  .description('Command-line utility for Unsplash image operations')
  .version(PACKAGE_VERSION);

// Removed searchUnsplashPhotos function (imported from service)
// Removed getDestinationPhoto function (imported from service)

/**
 * Downloads an image from a URL to a specified path.
 * Kept in CLI as it uses the tracking function before downloading.
 */
const downloadImage = async (
  photo: UnsplashPhoto,
  filename: string,
  outputDir: string
): Promise<string> => {
  const dir = path.resolve(outputDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, filename);

  const imageUrl = photo.urls.raw || photo.urls.full || photo.urls.regular;
  if (!imageUrl) {
    throw new Error(`No suitable image URL found for photo ID: ${photo.id}`);
  }

  const downloadSpinner = createSpinner(`Downloading image: ${filename}...`).start();
  try {
    // Trigger Unsplash download tracking FIRST (imported from service)
    await trackUnsplashDownload(photo);

    // Now download the actual image
    const response = await fetch(imageUrl); // Use global fetch or imported node-fetch
    if (!response.ok) {
      throw new Error(
        `Failed to download image (${response.status} ${response.statusText}) from ${imageUrl}`
      );
    }

    const writer = fs.createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      if (!response.body) {
        return reject(new Error('Response body is null, cannot download image.'));
      }
      // Cast response.body to Node.js Readable stream type if necessary
      // If using native fetch, you might need Readable.fromWeb(response.body as any)
      // For node-fetch, it should be compatible.
      const bodyStream = response.body as NodeJS.ReadableStream; // Adjust cast if needed
      bodyStream.pipe(writer);
      // Wrap resolve and pass undefined to satisfy Promise type
      writer.on('finish', () => resolve(undefined));
      writer.on('error', (streamError: Error) => {
        console.error('Stream writing error:', streamError); // Log the actual stream error
        reject(new Error(`Failed to write image to disk: ${streamError.message}`)); // Reject with a new error
      });
    });

    downloadSpinner.success({ text: `Image saved: ${filePath}` });
    return filePath;
  } catch (error) {
    downloadSpinner.error({ text: `Failed to download ${filename}: ${(error as Error).message}` });
    throw error;
  }
};

/**
 * Generic retry wrapper for async functions (kept in CLI for retrying CLI operations).
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = DEFAULT_RETRY_COUNT,
  delay = DEFAULT_RETRY_DELAY
): Promise<T> => {
  let lastError: Error | undefined;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        console.log(
          chalk.yellow(
            `Operation failed (attempt ${i + 1}/${retries + 1}). Retrying in ${delay / 1000}s... Error: ${lastError.message}`
          )
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  throw lastError;
};

// --- Attribution File Creation (kept in CLI) ---
const createAttributionFile = (
  photo: UnsplashPhoto,
  outputPath: string,
  format: 'text' | 'html' | 'json' = 'text'
): void => {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const attributionLink = (url: string) => `${url}?utm_source=withme.travel&utm_medium=referral`;
  const photoUrl = attributionLink(photo.links.html);
  const userUrl = attributionLink(photo.user.links.html);
  const unsplashUrl = attributionLink('https://unsplash.com');

  let content = '';
  const baseFilename = path.basename(outputPath, path.extname(outputPath));
  const attributionFilename = `${baseFilename}.attribution.${format}`;
  const attributionPath = path.join(dir, attributionFilename);

  switch (format) {
    case 'html':
      content = `Photo by <a href="${userUrl}">${photo.user.name}</a> on <a href="${unsplashUrl}">Unsplash</a>`;
      break;
    case 'json':
      content = JSON.stringify(
        {
          source: 'Unsplash',
          source_url: unsplashUrl,
          photo_url: photoUrl,
          author_name: photo.user.name,
          author_url: userUrl,
          photo_id: photo.id,
          description: photo.description || photo.alt_description || '',
          raw_photo_urls: photo.urls,
          raw_user_links: photo.user.links,
        },
        null,
        2
      );
      break;
    case 'text':
    default:
      content = `Photo by ${photo.user.name} (${userUrl}) on Unsplash (${unsplashUrl})\nPhoto URL: ${photoUrl}`;
      break;
  }

  try {
    fs.writeFileSync(attributionPath, content);
    console.log(chalk.blue(`Attribution file saved: ${attributionPath}`));
  } catch (error) {
    console.error(
      chalk.red(`Error saving attribution file ${attributionPath}: ${(error as Error).message}`)
    );
  }
};

// --- Command Implementations --- (Use imported functions)

// DOWNLOAD-CITY Command
program
  .command('download-city')
  .description('Download the best matching image for a specific city from Unsplash.')
  .requiredOption('-c, --city <name>', 'City name')
  .requiredOption('--country <name>', 'Country name')
  .option('-s, --state <name>', 'State or region name (optional)')
  .option('-o, --output <dir>', 'Output directory', DEFAULT_OUTPUT_DIR)
  .option(
    '-f, --filename <name>',
    'Custom filename (without extension). Default: generated from city/country'
  )
  .option('--attribution <format>', 'Attribution file format (text, html, json)', 'text')
  .option(
    '--rate-limit <number>',
    `Max requests per hour (Service default: 50) - CLI option currently informational`
  ) // Informational only
  .option(
    '--force-country',
    'Force using country query if city/state yields no results (use with caution)',
    false
  )
  .option(
    '--retries <number>',
    `Number of retries on API/download failure (default: ${DEFAULT_RETRY_COUNT})`,
    DEFAULT_RETRY_COUNT.toString()
  )
  .action(async (options: DownloadCityOptions) => {
    const spinner = createSpinner('Starting city image download...').start();
    try {
      // Rate limit parsing is informational now, service handles the actual limit
      // const cliRateLimit = parseInt(options.rateLimit, 10);

      const retryCount = parseInt(options.retries, 10);
      if (isNaN(retryCount) || retryCount < 0) {
        spinner.warn({
          text: `Invalid retry count "${options.retries}". Using default: ${DEFAULT_RETRY_COUNT}`,
        });
        options.retries = DEFAULT_RETRY_COUNT.toString();
      }

      // Use getDestinationPhoto imported from the service
      const result = await withRetry(
        () => getDestinationPhoto(options.city, options.country, options.state || null),
        retryCount
      );

      if (!result) {
        spinner.error({
          text: `Could not find a suitable photo for ${options.city}, ${options.country}.`,
        });
        throw new Error('Photo fetch failed after retries.');
      }

      const { photo, attribution, sourceQuery } = result;

      spinner.update({ text: `Found photo: ${photo.id} (via query: "${sourceQuery}")` });

      const sanitize = (name: string) =>
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      const defaultFilenameBase = `${sanitize(options.city)}-${sanitize(options.country)}${options.state ? '-' + sanitize(options.state) : ''}`;
      const filenameBase = options.filename ? sanitize(options.filename) : defaultFilenameBase;
      const filenameExt =
        path.extname(new URL(photo.urls.raw || photo.urls.full || photo.urls.regular).pathname) ||
        '.jpg';
      const finalFilename = `${filenameBase}${filenameExt}`;

      spinner.update({ text: `Downloading as ${finalFilename}...` });

      // Use local downloadImage which includes tracking
      const downloadedPath = await withRetry(
        () => downloadImage(photo, finalFilename, options.output),
        retryCount
      );

      spinner.success({ text: `Successfully downloaded image for ${options.city}!` });
      console.log(chalk.green(`  File: ${downloadedPath}`));
      console.log(chalk.cyan(`  Attribution: ${attribution}`)); // Use attribution from service result
      console.log(chalk.dim(`  Source Query: ${sourceQuery}`));
      console.log(chalk.dim(`  Photo ID: ${photo.id}`));

      if (options.attribution) {
        createAttributionFile(photo, downloadedPath, options.attribution);
      }
    } catch (error) {
      spinner.error({
        text: `Failed to download image for ${options.city}: ${(error as Error).message}`,
      });
      process.exitCode = 1;
    }
  });

// BATCH-DOWNLOAD Command
program
  .command('batch-download')
  .description('Download images for multiple cities listed in a CSV file.')
  .requiredOption('-i, --input <file>', 'Input CSV file (columns: city, country, [state])')
  .requiredOption('-o, --output <dir>', 'Output directory for images', DEFAULT_OUTPUT_DIR)
  .option(
    '--attribution <format>',
    'Attribution file format (text, html, json) for each image',
    'text'
  )
  .option(
    '--rate-limit <number>',
    `Max requests per hour (Service default: 50) - CLI option currently informational`
  )
  .option(
    '--batch-size <number>',
    `Number of parallel downloads (default: ${DEFAULT_BATCH_SIZE})`,
    DEFAULT_BATCH_SIZE.toString()
  )
  .option('--force-country', 'Force using country query if city/state yields no results', false)
  .option(
    '--retries <number>',
    `Number of retries on API/download failure (default: ${DEFAULT_RETRY_COUNT})`,
    DEFAULT_RETRY_COUNT.toString()
  )
  .option('--delimiter <char>', 'CSV delimiter character', ',')
  .option('--skip-header', 'Skip the first line (header) of the CSV', false)
  .action(async (options: BatchDownloadOptions) => {
    const batchSpinner = createSpinner('Starting batch download...').start();
    try {
      // Rate limit parsing informational
      const batchSize = parseInt(options.batchSize, 10);
      if (isNaN(batchSize) || batchSize <= 0) {
        batchSpinner.warn({
          text: `Invalid batch size "${options.batchSize}". Using default: ${DEFAULT_BATCH_SIZE}`,
        });
        options.batchSize = DEFAULT_BATCH_SIZE.toString();
      }
      const retryCount = parseInt(options.retries, 10);
      if (isNaN(retryCount) || retryCount < 0) {
        batchSpinner.warn({
          text: `Invalid retry count "${options.retries}". Using default: ${DEFAULT_RETRY_COUNT}`,
        });
        options.retries = DEFAULT_RETRY_COUNT.toString();
      }

      if (!fs.existsSync(options.input)) {
        throw new Error(`Input file not found: ${options.input}`);
      }
      const csvContent = fs.readFileSync(options.input, 'utf-8');
      const lines = csvContent
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l); // Split, trim, remove empty lines

      if (lines.length === 0) {
        throw new Error(`Input file is empty or contains only empty lines: ${options.input}`);
      }

      const startIndex = options.skipHeader ? 1 : 0;
      const locations = lines
        .slice(startIndex)
        .map((line, index) => {
          const parts = line.split(options.delimiter).map((p) => p.trim());
          if (parts.length < 2) {
            batchSpinner.warn({
              text: `Skipping invalid line ${index + startIndex + 1}: Not enough columns (expected city, country, [state]). Line: "${line}"`,
            });
            return null;
          }
          return {
            city: parts[0],
            country: parts[1],
            state: parts[2] || null, // Handle optional state
            originalLine: index + startIndex + 1,
          };
        })
        .filter((loc) => loc !== null);

      if (locations.length === 0) {
        throw new Error(`No valid locations found in CSV after processing.`);
      }

      batchSpinner.update({ text: `Found ${locations.length} locations to process.` });

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize);
        batchSpinner.update({
          text: `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(locations.length / batchSize)} ...`,
        });

        const promises = batch.map(async (location) => {
          if (!location) return;
          const { city, country, state, originalLine } = location;
          const locationSpinner = createSpinner(
            `Processing: ${city}, ${country}... (Line ${originalLine})`
          ).start();

          try {
            // Use getDestinationPhoto from service
            const result = await withRetry(
              () => getDestinationPhoto(city, country, state || null),
              retryCount
            );

            if (!result) {
              locationSpinner.warn({ text: `No photo found for ${city}, ${country}` });
              return;
            }

            const { photo, attribution, sourceQuery } = result;

            const sanitize = (name: string) =>
              name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            const filenameBase = `${sanitize(city)}-${sanitize(country)}${state ? '-' + sanitize(state) : ''}`;
            const filenameExt =
              path.extname(
                new URL(photo.urls.raw || photo.urls.full || photo.urls.regular).pathname
              ) || '.jpg';
            const finalFilename = `${filenameBase}${filenameExt}`;

            // Use local downloadImage
            const downloadedPath = await withRetry(
              () => downloadImage(photo, finalFilename, options.output),
              retryCount
            );

            if (options.attribution) {
              createAttributionFile(photo, downloadedPath, options.attribution);
            }
            locationSpinner.success({ text: `Success: ${city}, ${country} -> ${finalFilename}` });
            successCount++;
          } catch (error) {
            const errorMessage = `Failed: ${city}, ${country} (Line ${originalLine}) - ${(error as Error).message}`;
            locationSpinner.error({ text: errorMessage });
            errors.push(errorMessage);
            errorCount++;
          }
        });

        await Promise.allSettled(promises);
      }

      batchSpinner.success({
        text: `Batch download complete. Success: ${successCount}, Errors: ${errorCount}`,
      });
      if (errors.length > 0) {
        console.log(chalk.red('\n--- Errors ---'));
        errors.forEach((err) => console.log(chalk.red(`- ${err}`)));
        process.exitCode = 1;
      }
    } catch (error) {
      batchSpinner.error({ text: `Batch download failed: ${(error as Error).message}` });
      process.exitCode = 1;
    }
  });

// SEARCH Command
program
  .command('search')
  .description('Search for images on Unsplash.')
  .requiredOption('-q, --query <search_term>', 'Search query')
  .option('-p, --page <number>', 'Page number', '1')
  .option('--per-page <number>', 'Results per page', '10')
  .option('-o, --output <file>', 'Output results to a JSON file (optional)')
  .option(
    '--attribution <format>',
    'Create attribution file(s) if downloading (text, html, json)',
    undefined
  )
  .option(
    '--rate-limit <number>',
    `Max requests per hour (Service default: 50) - CLI option currently informational`
  )
  .option(
    '--retries <number>',
    `Number of retries on API failure (default: ${DEFAULT_RETRY_COUNT})`,
    DEFAULT_RETRY_COUNT.toString()
  )
  .action(async (options: SearchOptions) => {
    const searchSpinner = createSpinner('Starting Unsplash search...').start();
    try {
      // Rate limit informational
      const page = parseInt(options.page, 10);
      const perPage = parseInt(options.perPage, 10);
      if (isNaN(page) || page <= 0) throw new Error('Invalid page number.');
      if (isNaN(perPage) || perPage <= 0 || perPage > 30)
        throw new Error('Invalid per-page value (must be 1-30).');
      const retryCount = parseInt(options.retries, 10);
      if (isNaN(retryCount) || retryCount < 0) {
        searchSpinner.warn({
          text: `Invalid retry count "${options.retries}". Using default: ${DEFAULT_RETRY_COUNT}`,
        });
        options.retries = DEFAULT_RETRY_COUNT.toString();
      }

      // Use searchUnsplashPhotos from service
      const results = await withRetry(
        () => searchUnsplashPhotos(options.query, page, perPage),
        retryCount
      );

      searchSpinner.success({ text: `Search complete. Found ${results.total} total results.` });

      if (options.output) {
        const outputPath = path.resolve(options.output);
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        console.log(chalk.green(`Results saved to: ${outputPath}`));
      } else {
        console.log(chalk.bold(`\nResults (Page ${page}, ${results.results.length} items):`));
        if (results.results.length === 0) {
          console.log(chalk.yellow('  No results found on this page for your query.'));
        } else {
          results.results.forEach((photo) => {
            const attribution = `Photo by ${photo.user.name} on Unsplash`; // Simple attribution for display
            console.log(chalk.cyan(`- ID: ${photo.id}`));
            console.log(`  Desc: ${photo.description || photo.alt_description || 'N/A'}`);
            console.log(`  URL: ${photo.links.html}`);
            console.log(`  By: ${photo.user.name} (${photo.user.links.html})`);
            console.log(`  Attribution: ${attribution}`);
            console.log(chalk.dim(`  Download Location: ${photo.links.download_location}`));
            console.log('---');
          });
        }
        console.log(chalk.dim(`\nTotal Pages: ${results.total_pages}`));
      }
    } catch (error) {
      searchSpinner.error({ text: `Search failed: ${(error as Error).message}` });
      process.exitCode = 1;
    }
  });

// --- Final CLI Execution Logic ---
if (process.env.NODE_ENV !== 'test') {
  if (process.argv.length > 2) {
    program.parse(process.argv);
  } else {
    const scriptName = path.basename(process.argv[1]);
    if (
      process.argv[1] &&
      (scriptName.includes('unsplash') || scriptName === 'index.js' || scriptName === 'cli.js')
    ) {
      console.log(chalk.yellow('No command specified. Use --help to see available commands.'));
    }
  }
}
