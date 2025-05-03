#!/usr/bin/env node

/**
 * This script specifically targets trip API routes to ensure they properly handle
 * dynamic parameters in Next.js 15 by ensuring:
 * 1. Route parameters are typed as Promise<{param: string}>
 * 2. Parameters are properly awaited in the handler functions
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

// Fix route parameter typing
function fixRouteParamTypes(fileContent) {
  let updatedContent = fileContent;
  
  // Fix parameter types in exports
  updatedContent = updatedContent.replace(
    /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(\s*([^,)]+)\s*,\s*\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*(?!Promise<)(\{[^}]*\})\s*\}\s*\)/g, 
    'export async function $1($2, { params }: { params: Promise<$3> })'
  );
  
  // Fix parameter access to use await
  updatedContent = updatedContent.replace(
    /const\s+\{([^}]+)\}\s*=\s*params;(?!\s*\/\/\s*already\s*awaited)/g,
    'const {$1} = await params; // Ensure params are awaited'
  );
  
  return updatedContent;
}

// Process a single file
function processFile(filePath) {
  try {
    const content = readFile(filePath);
    const updatedContent = fixRouteParamTypes(content);
    
    if (content !== updatedContent) {
      writeFile(filePath, updatedContent);
      console.log(`✅ Fixed: ${filePath}`);
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
console.log('🔧 Fixing trip API route parameter handling...');

// Process only trip API routes
const tripApiRoutes = await glob('app/api/trips/**/*.ts');
let fixedCount = 0;

for (const file of tripApiRoutes) {
  const fixed = processFile(file);
  if (fixed) fixedCount++;
}

console.log(`\n🎉 Done! Fixed ${fixedCount} trip API route files.`); 