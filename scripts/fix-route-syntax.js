#!/usr/bin/env node

/**
 * This script specifically targets and fixes common syntax errors in route.ts files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔧 Fixing route.ts syntax errors...');

/**
 * Fix common syntax issues in route.ts files
 */
function fixRouteSyntax(content, filePath) {
  let updated = content;
  let hasChanges = false;

  // Fix 1: Remove extra closing braces at the end of the file
  const extraClosingBraces = /}\s*}\s*$/;
  if (extraClosingBraces.test(updated)) {
    updated = updated.replace(/}\s*}\s*$/, '}');
    hasChanges = true;
  }

  // Fix 2: Fix broken export function declarations
  // Pattern: export async function POST(request: NextRequest) {
  //          : Promise<NextResponse> {
  const brokenExportPattern = /(export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*)\{\s*:\s*Promise<[^>]*>\s*\{/g;
  if (brokenExportPattern.test(updated)) {
    updated = updated.replace(brokenExportPattern, (match, p1, p2) => {
      return `${p1}: Promise<NextResponse> {`;
    });
    hasChanges = true;
  }

  // Fix 3: Fix route handler function declarations with missing return type
  const missingReturnType = /(export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*)\{/g;
  updated = updated.replace(missingReturnType, (match, p1, p2) => {
    // Only replace if not already fixed
    if (!match.includes('Promise<NextResponse>')) {
      return `${p1}: Promise<NextResponse> {`;
    }
    return match;
  });

  // Fix 4: Fix missing object property separators (commas)
  const propertyPattern = /(\n\s+)([a-zA-Z0-9_]+)(\s*:)([^,;{}]*?)(\n\s+[a-zA-Z0-9_]+\s*:)/g;
  updated = updated.replace(propertyPattern, '$1$2$3$4,$5');

  // Fix 5: Fix missing object property values 
  const missingValuePattern = /(\n\s+)([a-zA-Z0-9_]+)(\s*:)(\s*)(\n)/g;
  updated = updated.replace(missingValuePattern, '$1$2$3 null,$5');

  // Compare original and updated content
  if (updated !== content) {
    hasChanges = true;
  }

  return { updated, hasChanges };
}

/**
 * Process all route.ts files in the API directory
 */
async function processRouteFiles() {
  try {
    const files = await glob('app/api/**/*.ts', {
      cwd: ROOT_DIR,
      absolute: true,
    });

    let totalFiles = 0;
    let fixedFiles = 0;

    for (const file of files) {
      // Only process route.ts files
      if (!file.endsWith('route.ts')) continue;

      totalFiles++;
      try {
        const content = fs.readFileSync(file, 'utf8');
        const { updated, hasChanges } = fixRouteSyntax(content, file);

        if (hasChanges) {
          fs.writeFileSync(file, updated, 'utf8');
          console.log(`✅ Fixed route file: ${path.relative(ROOT_DIR, file)}`);
          fixedFiles++;
        }
      } catch (err) {
        console.error(`❌ Error processing file ${file}:`, err);
      }
    }

    console.log(`\n🎉 Done! Fixed ${fixedFiles} of ${totalFiles} route files.`);
  } catch (err) {
    console.error('❌ Error finding files:', err);
    process.exit(1);
  }
}

// Run the script
processRouteFiles().catch(err => {
  console.error('❌ Script execution failed:', err);
  process.exit(1);
}); 