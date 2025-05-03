#!/usr/bin/env node

/**
 * This script adds async keyword to cookie handler functions in API routes
 * to fix TypeScript errors with await in non-async functions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to read a file
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Helper function to write a file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

// Fix set() and remove() cookie handler functions
function fixAsyncCookieHandlers(fileContent) {
  // Add async to set() cookie handlers if they use await
  let updatedContent = fileContent.replace(
    /set\(name: string, value: string, options: CookieOptions\)\s*\{[\s\n]*try\s*\{[\s\n]*await/g,
    'async set(name: string, value: string, options: CookieOptions) {\n            try {\n              await'
  );
  
  // Add async to remove() cookie handlers if they use await
  updatedContent = updatedContent.replace(
    /remove\(name: string, options: CookieOptions\)\s*\{[\s\n]*try\s*\{[\s\n]*await/g,
    'async remove(name: string, options: CookieOptions) {\n            try {\n              await'
  );
  
  return updatedContent;
}

// Main function to process a file
function processFile(filePath) {
  try {
    const content = readFile(filePath);
    
    // Only process files that use cookieStore
    if (!content.includes('cookieStore')) {
      return false;
    }
    
    const updatedContent = fixAsyncCookieHandlers(content);
    
    // Only write the file if changes were made
    if (content !== updatedContent) {
      writeFile(filePath, updatedContent);
      console.log(`✅ Fixed async cookie handlers in: ${filePath}`);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Start the script
console.log('🔧 Fixing async cookie handlers in API routes...');

// Process API routes files
const apiRouteFiles = await glob('app/api/**/*.ts');
let fixedCount = 0;

for (const file of apiRouteFiles) {
  const fixed = processFile(file);
  if (fixed) fixedCount++;
}

console.log(`\n🎉 Done! Fixed ${fixedCount} files.`); 