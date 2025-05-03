#!/usr/bin/env node

/**
 * Script to fix Supabase imports in API routes:
 * - Replace @supabase/auth-helpers-nextjs with @supabase/ssr
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

// Fix imports in a file
function fixImports(content) {
  // Fix specific Supabase imports
  let newContent = content;
  
  // Check if there are auth-helpers-nextjs imports in the file
  if (content.includes('@supabase/auth-helpers-nextjs')) {
    // Fix createRouteHandlerClient imports
    newContent = newContent.replace(
      /import\s+\{\s*createRouteHandlerClient\s*(?:,\s*[\w{}:\s,]*)\s*\}\s*from\s+['"]@supabase\/auth-helpers-nextjs['"]/g,
      `import { createRouteHandlerClient } from '@supabase/ssr'`
    );
    
    // Fix createServerComponentClient imports
    newContent = newContent.replace(
      /import\s+\{\s*createServerComponentClient\s*(?:,\s*[\w{}:\s,]*)\s*\}\s*from\s+['"]@supabase\/auth-helpers-nextjs['"]/g,
      `import { createServerComponentClient } from '@supabase/ssr'`
    );
    
    // Fix createClientComponentClient imports
    newContent = newContent.replace(
      /import\s+\{\s*createClientComponentClient\s*(?:,\s*[\w{}:\s,]*)\s*\}\s*from\s+['"]@supabase\/auth-helpers-nextjs['"]/g,
      `import { createClientComponentClient } from '@supabase/ssr'`
    );
  }
  
  return newContent;
}

// Process a single file
async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = fixImports(content);
    
    if (content !== newContent) {
      // Count the number of changed imports
      const oldImportCount = (content.match(/@supabase\/auth-helpers-nextjs/g) || []).length;
      const newImportCount = (newContent.match(/@supabase\/ssr/g) || []).length;
      
      log.verbose(`${filePath}: Found ${oldImportCount} auth-helpers-nextjs imports, replaced with ${newImportCount} ssr imports`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        log.success(`Updated ${filePath} - Replaced ${oldImportCount} imports`);
      } else {
        log.info(`Would update ${filePath} - Replace ${oldImportCount} imports (dry run)`);
      }
      return { path: filePath, fixed: true, count: oldImportCount };
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
  log.info(`Starting Supabase imports fix script ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  // Find all API route files
  const files = await glob('**/*.ts', { cwd: API_ROUTES_DIR, absolute: true });
  
  log.info(`Found ${files.length} API route files`);
  
  // Process all files
  const results = await Promise.all(files.map(processFile));
  
  // Summarize results
  const fixedFiles = results.filter(r => r.fixed);
  const errorFiles = results.filter(r => r.error);
  const totalImportsFixed = fixedFiles.reduce((sum, file) => sum + (file.count || 0), 0);
  
  log.info(`\n---- SUMMARY ----`);
  log.info(`Total files processed: ${files.length}`);
  log.success(`Files fixed: ${fixedFiles.length}`);
  log.success(`Total Supabase imports updated: ${totalImportsFixed}`);
  log.warn(`Files with errors: ${errorFiles.length}`);
  
  if (errorFiles.length > 0) {
    log.warn(`\nFiles with errors:`);
    errorFiles.forEach(f => log.warn(`- ${f.path}: ${f.error}`));
  }
  
  if (fixedFiles.length > 0 && VERBOSE) {
    log.info(`\nFixed files:`);
    fixedFiles.forEach(f => log.info(`- ${f.path}: ${f.count} imports`));
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