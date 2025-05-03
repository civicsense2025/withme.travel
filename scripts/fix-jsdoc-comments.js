#!/usr/bin/env node

/**
 * This script fixes JSDoc comments that TypeScript is incorrectly parsing as code
 * due to our previous fixes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔧 Fixing JSDoc comments in TypeScript files...');

// Files with known JSDoc issues based on TypeScript error output
const FILES_WITH_ISSUES = [
  'lib/trip-access.ts',
  'types/itinerary.ts',
  'types/trip.ts',
  'utils/constants/validation.ts',
];

// Regular expression to match JSDoc-style comments before an export statement
// This regex captures documentation comments right before an export statement
const jsdocBeforeExportRegex = /(\/\*\*[\s\S]*?\*\/)\s*(export\s+(?:interface|type|const)\s+\w+)/g;

function fixJSDocComments(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if the file has problematic JSDoc comments
    if (jsdocBeforeExportRegex.test(content)) {
      // Fix: Add a blank line between the JSDoc comment and the export
      let updated = content.replace(jsdocBeforeExportRegex, '$1\n\n$2');

      // Fix: Make sure JSDoc comments are properly formatted
      updated = updated.replace(/\/\*\*\s*\*([^\/]+)\*\//g, '/**\n *$1\n */');

      // Write the updated content back to the file
      fs.writeFileSync(filePath, updated);
      console.log(`✅ Fixed JSDoc comments in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Also fix type definition issues in validation.ts
function fixValidationTypes(filePath) {
  if (!filePath.endsWith('utils/constants/validation.ts')) {
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Fix type definitions for keyof typeof pattern
    let updated = content.replace(
      /export\s+type\s+(\w+)\s+=\s+\(typeof\s+(\w+)\)\[keyof\s+typeof\s+\2\];/g,
      'export type $1 = typeof $2[keyof typeof $2];'
    );

    // Fix ZOD_SCHEMAS object definition
    updated = updated.replace(
      /export\s+const\s+ZOD_SCHEMAS\s+=\s+{([^}]*)};/gs,
      'export const ZOD_SCHEMAS = {$1};'
    );

    // Write the updated content back to the file
    if (content !== updated) {
      fs.writeFileSync(filePath, updated);
      console.log(`✅ Fixed type definitions in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing validation types in ${filePath}:`, error);
    return false;
  }
}

// Fix index.ts constants exports
function fixConstantsIndex(filePath) {
  if (!filePath.endsWith('utils/constants/index.ts')) {
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Fix re-exports
    const updated = content.replace(
      /export\s+{\s*([^}]*)\s*}\s+from\s+['"]([^'"]*)['"]/g,
      "export { $1 } from '$2'"
    );

    // Write the updated content back to the file
    if (content !== updated) {
      fs.writeFileSync(filePath, updated);
      console.log(`✅ Fixed re-exports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing constants index in ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  let fixedCount = 0;

  // Fix known files with issues first
  for (const filePath of FILES_WITH_ISSUES) {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      let fixed = fixJSDocComments(fullPath);

      // For validation.ts, also fix type definitions
      if (filePath === 'utils/constants/validation.ts') {
        fixed = fixValidationTypes(fullPath) || fixed;
      }

      if (fixed) fixedCount++;
    } else {
      console.warn(`⚠️ File not found: ${filePath}`);
    }
  }

  // Fix constants index.ts
  const constantsIndexPath = path.join(ROOT_DIR, 'utils/constants/index.ts');
  if (fs.existsSync(constantsIndexPath)) {
    const fixed = fixConstantsIndex(constantsIndexPath);
    if (fixed) fixedCount++;
  }

  // Scan all TypeScript files for similar issues
  const tsFiles = await glob('**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: [
      'node_modules/**',
      'coverage/**',
      'build/**',
      '.next/**',
      'scripts/**',
      ...FILES_WITH_ISSUES, // Skip already fixed files
      'utils/constants/index.ts', // Skip already fixed file
    ],
  });

  for (const file of tsFiles) {
    const fullPath = path.join(ROOT_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Only process files that might have JSDoc issues
    if (jsdocBeforeExportRegex.test(content)) {
      const fixed = fixJSDocComments(fullPath);
      if (fixed) fixedCount++;
    }
  }

  console.log(`\n🎉 Done! Fixed ${fixedCount} files.`);
}

main().catch(console.error);
