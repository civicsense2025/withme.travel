#!/usr/bin/env node

/**
 * Migrate Database Constants
 *
 * This script updates imports of database-related constants from the
 * utils/constants.ts file to the more specific utils/constants/database.ts file.
 *
 * It helps clean up the codebase by properly using the modular constants structure.
 *
 * Usage:
 *   node scripts/migrate-database-constants.js [--check] [--fix]
 *
 * Options:
 *   --check  Only check for issues without fixing (default)
 *   --fix    Automatically fix identified issues
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Process command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const checkOnly = args.includes('--check') || !shouldFix;

console.log(`Running in ${checkOnly ? 'check' : 'fix'} mode\n`);

// Define paths and exclusions
const ROOT_DIR = path.resolve(__dirname, '..');
const EXCLUDED_DIRS = ['node_modules', '.next', 'dist', '.git'];

// Constants to migrate
const DB_CONSTANTS = ['DB_TABLES', 'DB_FIELDS', 'DB_ENUMS'];

// Find TypeScript files that import from utils/constants
function findFilesToProcess() {
  const filesToProcess = [];

  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip excluded directories
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(entry.name)) {
          scanDirectory(fullPath);
        }
        continue;
      }

      // Only process .ts and .tsx files
      if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) {
        continue;
      }

      // Read file content
      const content = fs.readFileSync(fullPath, 'utf8');

      // Check if file imports from utils/constants
      if (
        content.includes("from '@/utils/constants'") ||
        content.includes('from "@/utils/constants"')
      ) {
        // Check if it imports any database constants
        if (
          DB_CONSTANTS.some(
            (constant) =>
              content.includes(`import { ${constant}`) ||
              content.includes(`import {${constant}`) ||
              content.includes(`, ${constant},`) ||
              content.includes(`, ${constant} }`) ||
              content.includes(`{ ${constant},`)
          )
        ) {
          filesToProcess.push(fullPath);
        }
      }
    }
  }

  scanDirectory(ROOT_DIR);
  return filesToProcess;
}

// Update imports in a file
function updateFileImports(filePath) {
  console.log(`Processing: ${path.relative(ROOT_DIR, filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check which database constants are imported
  const importedDbConstants = DB_CONSTANTS.filter(
    (constant) =>
      content.includes(`import { ${constant}`) ||
      content.includes(`import {${constant}`) ||
      content.includes(`, ${constant},`) ||
      content.includes(`, ${constant} }`) ||
      content.includes(`{ ${constant},`)
  );

  if (importedDbConstants.length === 0) {
    return false;
  }

  // Find the import statement for utils/constants
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@\/utils\/constants['"]/g;
  const matches = Array.from(content.matchAll(importRegex));

  for (const match of matches) {
    const importStatement = match[0];
    const importedItems = match[1].split(',').map((item) => item.trim());

    // Separate database constants from other imports
    const dbConstantsToMove = importedItems.filter((item) => DB_CONSTANTS.includes(item));

    const remainingImports = importedItems.filter((item) => !DB_CONSTANTS.includes(item));

    if (dbConstantsToMove.length === 0) {
      continue;
    }

    // Create new import statements
    let newContent = content;

    // Replace or remove the original import
    if (remainingImports.length > 0) {
      // Keep the import but remove database constants
      const newImport = `import { ${remainingImports.join(', ')} } from '@/utils/constants'`;
      newContent = newContent.replace(importStatement, newImport);
    } else {
      // Remove the entire import statement
      newContent = newContent.replace(importStatement, '');
    }

    // Add the new database constants import
    const dbImport = `import { ${dbConstantsToMove.join(', ')} } from '@/utils/constants/database'`;

    // Insert the new import after any existing imports
    const lastImportIndex = newContent.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfImportsIndex = newContent.indexOf('\n', lastImportIndex);
      if (endOfImportsIndex !== -1) {
        newContent =
          newContent.substring(0, endOfImportsIndex + 1) +
          dbImport +
          '\n' +
          newContent.substring(endOfImportsIndex + 1);
      }
    }

    content = newContent;
    modified = true;
  }

  // Write changes to file if in fix mode
  if (modified && shouldFix) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Updated imports in ${path.relative(ROOT_DIR, filePath)}`);
  } else if (modified) {
    console.log(`  ⚠️ Needs update: ${path.relative(ROOT_DIR, filePath)}`);
  }

  return modified;
}

// Main function
function migrateDbConstants() {
  console.log('Searching for files importing database constants...');
  const filesToProcess = findFilesToProcess();

  console.log(`\nFound ${filesToProcess.length} files with database constants imports`);

  let modifiedCount = 0;

  for (const filePath of filesToProcess) {
    const wasModified = updateFileImports(filePath);
    if (wasModified) {
      modifiedCount++;
    }
  }

  console.log(
    `\n${checkOnly ? 'Would fix' : 'Fixed'} ${modifiedCount} files of ${filesToProcess.length} total`
  );

  if (checkOnly && modifiedCount > 0) {
    console.log('\nRun with --fix to automatically update these files');
  }
}

// Run the migration
migrateDbConstants();
