#!/usr/bin/env node

/**
 * This script fixes instances where createRouteHandlerClient is incorrectly awaited
 * The createRouteHandlerClient function is not async, so it should not be awaited
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';

async function fixFiles() {
  console.log('Finding API route files with incorrect supabase client creation...');
  
  // Find all API route files
  const files = await globby('app/api/**/*.ts');
  
  let fixedCount = 0;
  
  // Process each file
  for (const file of files) {
    try {
      // Read the file
      const content = await fs.readFile(file, 'utf8');
      
      // Check if it contains any of the patterns
      const patterns = [
        /const\s+supabase\s*=\s*await\s+createRouteHandlerClient\(\)/g,
        /const\s+supabase\s*=\s*await\s+createRouteHandlerClient\(.*?\)/g,
        /const\s*{\s*supabase\s*}\s*=\s*await\s+createRouteHandlerClient\(\)/g,
        /let\s+supabase\s*=\s*await\s+createRouteHandlerClient\(\)/g,
        /let\s+supabase\s*=\s*await\s+createRouteHandlerClient\(.*?\)/g,
        /var\s+supabase\s*=\s*await\s+createRouteHandlerClient\(\)/g,
        /var\s+supabase\s*=\s*await\s+createRouteHandlerClient\(.*?\)/g
      ];
      
      let modified = false;
      let fixedContent = content;
      
      for (const pattern of patterns) {
        if (pattern.test(fixedContent)) {
          // Replace the pattern without awaiting
          fixedContent = fixedContent.replace(pattern, match => {
            return match.replace('await ', '');
          });
          modified = true;
        }
      }
      
      if (modified) {
        // Write the fixed content
        await fs.writeFile(file, fixedContent, 'utf8');
        console.log(`Fixed: ${file}`);
        fixedCount++;
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
  
  console.log(`\nFixed ${fixedCount} files`);
  
  if (fixedCount > 0) {
    console.log('\nPlease rebuild your application now.');
  } else {
    console.log('\nNo issues found or patterns not matching.');
    console.log('You may need to manually check your API routes for incorrect await usage.');
  }
}

// Run the script
fixFiles().catch(error => {
  console.error('Error fixing files:', error);
  process.exit(1);
}); 