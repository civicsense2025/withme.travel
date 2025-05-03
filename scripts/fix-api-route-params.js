#!/usr/bin/env node

/**
 * Script to fix API route parameter handling in Next.js 15 routes:
 * - Update route parameters to use Promise<T> type for dynamic route segments
 * - Fix async/await patterns in route handlers
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_ROUTES_DIR = path.join(path.resolve(__dirname, '..'), 'app', 'api');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Logging utilities
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.log(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  verbose: (msg) => VERBOSE && console.log(`[VERBOSE] ${msg}`)
};

// Fix route parameter handling in a file
function fixRouteParams(content) {
  let newContent = content;
  
  // Only process files that have API route handlers
  if (
    (content.includes('export async function GET(') || 
     content.includes('export async function POST(') ||
     content.includes('export async function PUT(') ||
     content.includes('export async function DELETE(') ||
     content.includes('export async function PATCH('))
  ) {
    // Fix non-promised route parameters (for dynamic route segments in Next.js 15)
    newContent = newContent.replace(
      /\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*([^}]+)\s*\}\s*\}/g,
      '{ params }: { params: Promise<{ $1 }> }'
    );

    // Fix functions that don't await params
    newContent = newContent.replace(
      /(export\s+async\s+function\s+(?:GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*(?::\s*Promise<[^>]+>)?\s*\{)(?:\s*(?:\/\/|\/\*)[^\n]*\n)*\s*(?:let|const|var)\s+\{\s*([^}]+)\s*\}\s*=\s*params;/g,
      '$1\n  // Await params for Next.js 15 compatibility\n  const { $2 } = await params;'
    );

    // Fix cases where params are destructured without await
    newContent = newContent.replace(
      /(const|let|var)\s+\{\s*([^}]+)\s*\}\s*=\s*params;/g,
      '$1 { $2 } = await params;'
    );
  }
  
  return newContent;
}

// Process a single file
async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = fixRouteParams(content);
    
    if (content !== newContent) {
      log.verbose(`${filePath}: Fixed route parameter handling`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        log.success(`Updated ${filePath}`);
      } else {
        log.info(`Would update ${filePath} (dry run)`);
      }
      return { path: filePath, fixed: true };
    } else {
      log.verbose(`No changes needed for ${filePath}`);
      return { path: filePath, fixed: false };
    }
  } catch (error) {
    log.error(`Error processing ${filePath}: ${error.message}`);
    return { path: filePath, fixed: false, error: error.message };
  }
}

// Main function to run the script
async function main() {
  log.info(`Starting API route parameter fix script ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  // Find all API route files
  const files = await glob('**/*route.ts', { cwd: API_ROUTES_DIR, absolute: true });
  
  log.info(`Found ${files.length} API route files`);
  
  // Process all files
  const results = await Promise.all(files.map(processFile));
  
  // Summarize results
  const fixedFiles = results.filter(r => r.fixed);
  const errorFiles = results.filter(r => r.error);
  
  log.info(`\n---- SUMMARY ----`);
  log.info(`Total files processed: ${files.length}`);
  log.success(`Files fixed: ${fixedFiles.length}`);
  log.warn(`Files with errors: ${errorFiles.length}`);
  
  if (errorFiles.length > 0) {
    log.warn(`\nFiles with errors:`);
    errorFiles.forEach(f => log.warn(`- ${f.path}: ${f.error}`));
  }
  
  if (fixedFiles.length > 0 && VERBOSE) {
    log.info(`\nFixed files:`);
    fixedFiles.forEach(f => log.info(`- ${f.path}`));
  }
  
  if (DRY_RUN) {
    log.info(`\nThis was a dry run. No actual changes were made.`);
    log.info(`Run without --dry-run to apply changes.`);
  }
}

// Run main function
main().catch(error => {
  log.error(`Script failed: ${error.message}`);
  process.exit(1);
}); 