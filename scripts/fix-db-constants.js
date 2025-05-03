#!/usr/bin/env node

/**
 * Fix Database Constants TypeScript Errors
 *
 * This script fixes TypeScript errors related to database constants imports
 * by updating imports and usages of ENUMS, FIELDS, and TABLES in the codebase.
 *
 * It performs the following transformations:
 * 1. Replaces import of ENUMS with DB_ENUMS
 * 2. Replaces import of FIELDS with DB_FIELDS
 * 3. Adds ExtendedTables type assertion for TABLES usage
 * 4. Replaces ENUMS. with DB_ENUMS. in code
 * 5. Replaces FIELDS. with DB_FIELDS. in code
 *
 * Usage:
 *   node scripts/fix-db-constants.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory and root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// High-priority files to process first
const PRIORITY_FILES = [
  'lib/trip-access.ts',
  'components/trip-overview-tab.tsx',
  'components/members-tab.tsx',
  'components/itinerary/itinerary-tab.tsx',
];

// Directories to exclude from processing
const EXCLUDED_DIRS = [
  'node_modules',
  '.next',
  'scripts',
  'mobile/withme-app',
  'tests',
  '__tests__',
  '_disabled_features',
  'coverage',
  'playwright-report',
];

// Files to exclude that contain special features we want to skip
const EXCLUDED_PATTERNS = ['presence', 'focus-session', 'realtime', 'test', 'spec'];

// Type assertion block to add for TABLES
const TABLE_TYPE_ASSERTION_BLOCK = `
// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;
`;

// Counter to track progress
let processedFiles = 0;
let modifiedFiles = 0;
let errorFiles = 0;

/**
 * Process a single file to fix database constant imports and usage
 * @param {string} filePath - Path to the file to process
 * @param {boolean} isPriority - Whether this is a priority file
 * @returns {boolean} - Whether the file was modified
 */
function processFile(filePath, isPriority = false) {
  console.log(`${isPriority ? '🔍 PRIORITY' : '  '} Processing: ${filePath}`);

  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;

    // Check if this file should be processed (has relevant imports)
    if (
      !content.includes('@/utils/constants/database') &&
      !content.includes('ENUMS.') &&
      !content.includes('FIELDS.') &&
      !content.includes('TABLES.')
    ) {
      return false;
    }

    // 1. Update imports - Replace ENUMS with DB_ENUMS and FIELDS with DB_FIELDS
    if (content.includes('import {') && content.includes("from '@/utils/constants/database'")) {
      content = content.replace(
        /import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]@\/utils\/constants\/database['"]/g,
        (match, importList) => {
          // Process the import list
          const imports = importList.split(',').map((item) => item.trim());

          const processedImports = imports.map((item) => {
            if (item === 'ENUMS') return 'DB_ENUMS';
            if (item === 'FIELDS') return 'DB_FIELDS';
            return item;
          });

          return `import { ${processedImports.join(', ')} } from '@/utils/constants/database'`;
        }
      );
    }

    // 2. Add type assertion for TABLES if it's imported but no assertion exists yet
    if (
      content.includes('TABLES') &&
      !content.includes('const Tables =') &&
      !content.includes('// Define a more complete type for TABLES')
    ) {
      // Add type assertion after the import
      const importPattern =
        /import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]@\/utils\/constants\/database['"];\s*\n/;

      if (importPattern.test(content) && content.includes('TABLES')) {
        content = content.replace(importPattern, (match) => {
          return match + TABLE_TYPE_ASSERTION_BLOCK;
        });
      }
    }

    // 3. Replace usage of TABLES with Tables if we added the type assertion
    if (content.includes('const Tables = TABLES as unknown as ExtendedTables')) {
      // Replace .from(TABLES. with .from(Tables.
      content = content.replace(/\.from\s*\(\s*TABLES\./g, '.from(Tables.');

      // Replace other uses of TABLES. with Tables.
      content = content.replace(/TABLES\.\w+/g, (match) => {
        return match.replace('TABLES', 'Tables');
      });
    }

    // 4. Replace usages of ENUMS and FIELDS with DB_ versions
    // But ensure we don't create double prefixes like DB_DB_ENUMS

    // First, fix any potential double prefixes that might already exist
    const fixDoublePrefix = (text) => {
      return text
        .replace(/DB_DB_ENUMS/g, 'DB_ENUMS')
        .replace(/DB_DB_FIELDS/g, 'DB_FIELDS')
        .replace(/DB_DB_TABLES/g, 'DB_TABLES');
    };

    content = fixDoublePrefix(content);

    // Then replace direct references to ENUMS and FIELDS
    if (!content.includes('const ENUMS =')) {
      // Don't replace if defining a local ENUMS constant
      content = content.replace(/ENUMS\./g, 'DB_ENUMS.');
    }

    if (!content.includes('const FIELDS =')) {
      // Don't replace if defining a local FIELDS constant
      content = content.replace(/FIELDS\./g, 'DB_FIELDS.');
    }

    // Final check for any double prefixes that might have been introduced
    content = fixDoublePrefix(content);

    // Write back to the file if modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Modified: ${filePath}`);
      modifiedFiles++;
      modified = true;
    } else {
      console.log(`  ⏭️ No changes needed: ${filePath}`);
    }

    processedFiles++;
    return modified;
  } catch (error) {
    console.error(`  ❌ Error processing file ${filePath}:`, error);
    errorFiles++;
    return false;
  }
}

/**
 * Check if a file should be excluded based on its path
 * @param {string} filePath - Path to check
 * @returns {boolean} - Whether the file should be excluded
 */
function shouldExcludeFile(filePath) {
  // Check against excluded directories
  for (const dir of EXCLUDED_DIRS) {
    if (filePath.includes(`/${dir}/`) || filePath.startsWith(dir + '/')) {
      return true;
    }
  }

  // Check against excluded patterns
  for (const pattern of EXCLUDED_PATTERNS) {
    if (filePath.toLowerCase().includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Get all TypeScript files that need processing
 * @returns {string[]} - Array of file paths
 */
function findFilesToProcess() {
  console.log('Finding files with database constants references...');

  // Get a list of all TypeScript files, excluding node_modules, etc.
  let allTsFiles = [];

  try {
    // Command to find all TS/TSX files, excluding specific directories
    const excludePatterns = EXCLUDED_DIRS.map((dir) => `-not -path "./${dir}/*"`).join(' ');
    const findCommand = `find . -type f \\( -name "*.ts" -o -name "*.tsx" \\) ${excludePatterns}`;

    const findOutput = execSync(findCommand, { cwd: rootDir }).toString();
    allTsFiles = findOutput.trim().split('\n').filter(Boolean);

    // Further filter files that might contain references to database constants
    const grepCommand = `grep -l "ENUMS\\|FIELDS\\|TABLES\\|@/utils/constants/database" ${allTsFiles.join(' ')}`;

    try {
      const grepOutput = execSync(grepCommand, { cwd: rootDir }).toString();
      allTsFiles = grepOutput.trim().split('\n').filter(Boolean);
    } catch (error) {
      // grep returns non-zero exit code if no matches, which is expected in some cases
      if (error.status !== 1) {
        console.error('Error filtering files:', error);
      }
      // If grep finds nothing, return an empty array
      allTsFiles = [];
    }

    // Remove excluded files
    allTsFiles = allTsFiles.filter((file) => !shouldExcludeFile(file));

    console.log(`Found ${allTsFiles.length} files to process`);
    return allTsFiles;
  } catch (error) {
    console.error('Error finding files:', error);
    return [];
  }
}

/**
 * Main function to run the script
 */
function main() {
  console.log('Starting database constants fix script...\n');

  // Process priority files first
  console.log('--- Processing priority files ---');
  for (const filePath of PRIORITY_FILES) {
    const fullPath = path.resolve(rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      processFile(fullPath, true);
    } else {
      console.log(`⚠️ Priority file not found: ${filePath}`);
    }
  }

  console.log('\n--- Processing remaining files ---');

  // Find all other files to process
  const filesToProcess = findFilesToProcess();

  // Filter out priority files that have already been processed
  const remainingFiles = filesToProcess.filter(
    (file) => !PRIORITY_FILES.includes(file) && !PRIORITY_FILES.includes(file.substring(2))
  );

  // Process remaining files
  for (const file of remainingFiles) {
    const fullPath = path.resolve(rootDir, file);
    processFile(fullPath);
  }

  // Print summary
  console.log('\n--- Summary ---');
  console.log(`Processed ${processedFiles} files`);
  console.log(`Modified ${modifiedFiles} files`);
  console.log(`Encountered errors in ${errorFiles} files`);
  console.log('\nDone.');
}

// Run the script
main();
