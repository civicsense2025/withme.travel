#!/usr/bin/env node

/**
 * Comprehensive script to fix TypeScript errors in trip API routes:
 * 1. Fix database constants imports (TABLES, FIELDS, ENUMS)
 * 2. Fix async cookie handlers
 * 3. Fix route parameter handling for Next.js 15
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

// Fix database constants imports
function fixDatabaseImports(fileContent) {
  let updatedContent = fileContent;

  // First find the existing imports
  const hasDbTablesImport = updatedContent.includes('import { DB_TABLES');
  const hasTablesImport = updatedContent.includes('import { TABLES');

  // If neither is imported, add the import
  if (!hasDbTablesImport && !hasTablesImport) {
    // Add import after the last import statement
    const lastImportIndex = updatedContent.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfImportIndex = updatedContent.indexOf('\n', lastImportIndex);
      if (endOfImportIndex !== -1) {
        updatedContent =
          updatedContent.substring(0, endOfImportIndex + 1) +
          "import { TABLES, FIELDS, ENUMS } from '@/utils/constants/database';\n" +
          updatedContent.substring(endOfImportIndex + 1);
      }
    }
  }

  // Replace DB_ constants with regular ones
  updatedContent = updatedContent.replace(/DB_TABLES/g, 'TABLES');
  updatedContent = updatedContent.replace(/DB_FIELDS/g, 'FIELDS');
  updatedContent = updatedContent.replace(/DB_ENUMS/g, 'ENUMS');

  // Fix import statements
  updatedContent = updatedContent.replace(
    /import\s+{\s*(?:(?:DB_TABLES|DB_FIELDS|DB_ENUMS|DB_RELATIONSHIPS)(?:\s*,\s*)?)+\s*}\s*from\s+['"]@\/utils\/constants(?:\/database)?['"];?/g,
    "import { TABLES, FIELDS, ENUMS } from '@/utils/constants/database';"
  );

  // Add CookieOptions import if needed
  if (updatedContent.includes('CookieOptions') && !updatedContent.includes('type CookieOptions')) {
    updatedContent = updatedContent.replace(
      /import\s+{\s*createServerClient(?:\s*,\s*)?(?:type\s+CookieOptions)?(?:\s*,\s*)?}\s*from\s+['"]@\/supabase\/ssr['"];?/g,
      "import { createServerClient, type CookieOptions } from '@supabase/ssr';"
    );

    // If the import wasn't replaced, add it
    if (!updatedContent.includes('type CookieOptions')) {
      updatedContent = updatedContent.replace(
        /import\s+{\s*createServerClient\s*}\s*from\s+['"]@\/supabase\/ssr['"];?/g,
        "import { createServerClient, type CookieOptions } from '@supabase/ssr';"
      );
    }
  }

  // Add date-fns imports if needed
  if (
    (updatedContent.includes('parseISO') ||
      updatedContent.includes('isBefore') ||
      updatedContent.includes('differenceInCalendarDays')) &&
    !updatedContent.includes('import { isBefore, parseISO')
  ) {
    updatedContent = updatedContent.replace(
      /import\s+{\s*z\s*}/g,
      "import { z } from 'zod';\nimport { isBefore, parseISO, differenceInCalendarDays } from 'date-fns'"
    );
  }

  return updatedContent;
}

// Fix async cookie handlers
function fixAsyncCookieHandlers(fileContent) {
  // Add async to set() cookie handlers if they contain await
  let updatedContent = fileContent.replace(
    /set\(name: string, value: string, options: CookieOptions\)\s*\{[\s\n]*try\s*\{[\s\n]*await/g,
    'async set(name: string, value: string, options: CookieOptions) {\n            try {\n              await'
  );

  // Remove duplicate async keywords
  updatedContent = updatedContent.replace(/async\s+async\s+/g, 'async ');

  // Add async to remove() cookie handlers if they contain await
  updatedContent = updatedContent.replace(
    /remove\(name: string, options: CookieOptions\)\s*\{[\s\n]*try\s*\{[\s\n]*await/g,
    'async remove(name: string, options: CookieOptions) {\n            try {\n              await'
  );

  return updatedContent;
}

// Fix Next.js 15 route parameter types
function fixRouteParams(fileContent) {
  // Fix parameter types in exports
  let updatedContent = fileContent.replace(
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
    console.log(`Processing ${filePath}...`);
    let content = readFile(filePath);
    let updatedContent = content;

    // Apply fixes in sequence
    updatedContent = fixDatabaseImports(updatedContent);
    updatedContent = fixAsyncCookieHandlers(updatedContent);
    updatedContent = fixRouteParams(updatedContent);

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
console.log('🔧 Fixing TypeScript errors in trip API routes...');

// Process only trip API routes
const tripApiRoutes = await glob('app/api/trips/**/*.ts');
let fixedCount = 0;

for (const file of tripApiRoutes) {
  const fixed = processFile(file);
  if (fixed) fixedCount++;
}

console.log(`\n🎉 Done! Fixed ${fixedCount} trip API route files.`);
