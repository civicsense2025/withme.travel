#!/usr/bin/env node

/**
 * This script cleans up XML-style closing tags that were erroneously added to files
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

// Get current directory using ES module pattern
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const ROOT_DIR = path.resolve(__dirname);

console.log('🧹 Cleaning up XML-style closing tags...');

/**
 * Remove XML-style closing tags from files
 */
function cleanXmlTags(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains any XML-style closing tags
    const xmlTagPattern = /<\/[A-Za-z0-9_]+>/g;
    
    if (xmlTagPattern.test(content)) {
      console.log(`Processing ${filePath}...`);
      
      // Create a regular expression that matches XML-style closing tags at the end of the file
      const endXmlTagPattern = /\s*(<\/[A-Za-z0-9_]+>)+\s*$/;
      
      // Remove XML tags at the end of the file
      let cleanedContent = content.replace(endXmlTagPattern, '');
      
      // Write the cleaned content back to the file
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      
      return true; // File was modified
    }
    
    return false; // File was not modified
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Process all TypeScript files in the project
 */
async function processFiles() {
  // Find all TypeScript files
  const files = glob.sync('**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
    absolute: true,
  });
  
  console.log(`Found ${files.length} TypeScript files to check...`);
  
  let totalModified = 0;
  
  // Process each file
  for (const file of files) {
    const modified = cleanXmlTags(file);
    if (modified) {
      totalModified++;
    }
  }
  
  console.log(`\n✅ Done! Modified ${totalModified} files.`);
}

// Run the script
processFiles().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 