#!/usr/bin/env node

/**
 * This script fixes Supabase cookie handling in API routes
 * It adds missing await keywords to cookie operations
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

// Function to fix cookie handlers in a file
function fixCookieHandlers(fileContent) {
  // Fix get() cookie handlers
  let updatedContent = fileContent.replace(
    /get\(name: string\).*?\{[\s\n]*return cookieStore\.get\(name\)\?\.value;/gs,
    'get(name: string) {\n            return cookieStore.get(name)?.value;'
  );

  // Fix set() cookie handlers - add missing await
  updatedContent = updatedContent.replace(
    /set\(name: string, value: string, options: CookieOptions\).*?\{[\s\n]*try \{[\s\n]*cookieStore\.set\(/gs,
    'set(name: string, value: string, options: CookieOptions) {\n            try {\n              await cookieStore.set('
  );

  // Fix remove() cookie handlers - add missing await
  updatedContent = updatedContent.replace(
    /remove\(name: string, options: CookieOptions\).*?\{[\s\n]*try \{[\s\n]*cookieStore\.set\(/gs,
    'remove(name: string, options: CookieOptions) {\n            try {\n              await cookieStore.set('
  );

  return updatedContent;
}

// Function to fix API route parameters for Next.js 15
function fixApiRouteParams(fileContent) {
  // Check for route handler parameter signatures
  return fileContent.replace(
    /export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)\s*\(\s*request\s*:\s*(?:NextRequest|Request)\s*,\s*\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*(?!Promise<)(\{[^}]*\})\s*\}\s*\)/g,
    'export async function $1(request: NextRequest, { params }: { params: Promise<$2> })'
  );
}

// Main function to process a file
function processFile(filePath) {
  try {
    const content = readFile(filePath);
    let updatedContent = content;

    // First fix API route parameters
    updatedContent = fixApiRouteParams(updatedContent);

    // Then fix cookie handlers
    updatedContent = fixCookieHandlers(updatedContent);

    // Only write the file if changes were made
    if (content !== updatedContent) {
      writeFile(filePath, updatedContent);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️ No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Start the script
console.log('🔧 Fixing Supabase cookie handling and API route parameters...');

// Process API routes files
const apiRouteFiles = await glob('app/api/**/*.ts');
let fixedCount = 0;

for (const file of apiRouteFiles) {
  const fixed = processFile(file);
  if (fixed) fixedCount++;
}

console.log(`\n🎉 Done! Fixed ${fixedCount} files.`);
