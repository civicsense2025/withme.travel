#!/usr/bin/env node

/**
 * This script fixes database constants imports across the codebase.
 * It ensures all files correctly import TABLES, FIELDS, ENUMS, and proper types
 * from utils/constants/database.ts.
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

// Fix old-style DB_TABLES, DB_FIELDS, etc. imports and update them to the new format
function fixDatabaseConstantsImports(fileContent) {
  let updatedContent = fileContent;

  // Pattern 1: Fix old-style imports like import { DB_TABLES } from '@/utils/constants';
  updatedContent = updatedContent.replace(
    /import\s+{\s*(?:(?:DB_TABLES|DB_FIELDS|DB_ENUMS|DB_RELATIONSHIPS)(?:\s*,\s*)?)+\s*}\s*from\s+['"]@\/utils\/constants(?:\/index)?['"];?/g,
    "import { TABLES, FIELDS, ENUMS, RELATIONSHIPS } from '@/utils/constants/database';"
  );

  // Pattern 2: Fix import { DB_TABLES as TABLES } variations
  updatedContent = updatedContent.replace(
    /import\s+{\s*(?:DB_TABLES\s+as\s+TABLES|DB_FIELDS\s+as\s+FIELDS|DB_ENUMS\s+as\s+ENUMS|DB_RELATIONSHIPS\s+as\s+RELATIONSHIPS)(?:\s*,\s*)*\s*}\s*from\s+['"]@\/utils\/constants(?:\/index)?['"];?/g,
    "import { TABLES, FIELDS, ENUMS, RELATIONSHIPS } from '@/utils/constants/database';"
  );

  // Pattern 3: Fix combined imports where some come from database.ts and some from other files
  updatedContent = updatedContent.replace(
    /import\s+{\s*(?:(TABLES|FIELDS|ENUMS|RELATIONSHIPS)(?:\s*,\s*)?)+\s*}\s*from\s+['"]@\/utils\/constants(?:\/[^d][^a][^t][^a][^b][^a][^s][^e][^\.][^t][^s])?['"];?/g,
    "import { $1 } from '@/utils/constants/database';"
  );

  // Pattern 4: Add missing type imports when using TripRole, ItemStatus, etc.
  if (
    (updatedContent.includes('TripRole') && !updatedContent.includes('type TripRole')) ||
    (updatedContent.includes('ItemStatus') && !updatedContent.includes('type ItemStatus')) ||
    (updatedContent.includes('PermissionStatus') &&
      !updatedContent.includes('type PermissionStatus'))
  ) {
    // Check if we already have a database import
    if (updatedContent.includes("from '@/utils/constants/database'")) {
      // Add type imports to existing import
      updatedContent = updatedContent.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@\/utils\/constants\/database['"];?/g,
        (match, imports) => {
          let newImports = imports;

          if (updatedContent.includes('TripRole') && !imports.includes('TripRole')) {
            newImports += ', type TripRole';
          }

          if (updatedContent.includes('ItemStatus') && !imports.includes('ItemStatus')) {
            newImports += ', type ItemStatus';
          }

          if (
            updatedContent.includes('PermissionStatus') &&
            !imports.includes('PermissionStatus')
          ) {
            newImports += ', type PermissionStatus';
          }

          return `import {${newImports}} from '@/utils/constants/database';`;
        }
      );
    } else {
      // Add new type imports
      const typeImports = [];

      if (updatedContent.includes('TripRole')) {
        typeImports.push('TripRole');
      }

      if (updatedContent.includes('ItemStatus')) {
        typeImports.push('ItemStatus');
      }

      if (updatedContent.includes('PermissionStatus')) {
        typeImports.push('PermissionStatus');
      }

      if (typeImports.length > 0) {
        const importLine = `import { type ${typeImports.join(', type ')} } from '@/utils/constants/database';\n`;

        // Add after the last import
        const lastImportIndex = updatedContent.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
          const endOfImportIndex = updatedContent.indexOf('\n', lastImportIndex);
          if (endOfImportIndex !== -1) {
            updatedContent =
              updatedContent.substring(0, endOfImportIndex + 1) +
              importLine +
              updatedContent.substring(endOfImportIndex + 1);
          }
        }
      }
    }
  }

  // Pattern 5: Replace any direct reference to DB_TABLES, DB_FIELDS, etc.
  updatedContent = updatedContent.replace(/DB_TABLES\./g, 'TABLES.');
  updatedContent = updatedContent.replace(/DB_FIELDS\./g, 'FIELDS.');
  updatedContent = updatedContent.replace(/DB_ENUMS\./g, 'ENUMS.');
  updatedContent = updatedContent.replace(/DB_RELATIONSHIPS\./g, 'RELATIONSHIPS.');

  return updatedContent;
}

// Main function to process a file
function processFile(filePath) {
  try {
    // Skip node_modules
    if (filePath.includes('node_modules')) {
      return false;
    }

    // Skip test files
    if (filePath.includes('.test.ts') || filePath.includes('.spec.ts')) {
      return false;
    }

    const content = readFile(filePath);

    // Only process files that reference database constants
    if (
      !content.includes('DB_TABLES') &&
      !content.includes('DB_FIELDS') &&
      !content.includes('DB_ENUMS') &&
      !content.includes('TABLES') &&
      !content.includes('FIELDS') &&
      !content.includes('ENUMS') &&
      !content.includes('TripRole') &&
      !content.includes('ItemStatus')
    ) {
      return false;
    }

    const updatedContent = fixDatabaseConstantsImports(content);

    // Only write the file if changes were made
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
console.log('🔧 Fixing database constants imports...');

// Process all TypeScript files
const tsFiles = await glob('{app,components,lib,utils,hooks}/**/*.{ts,tsx}');
let fixedCount = 0;

for (const file of tsFiles) {
  const fixed = processFile(file);
  if (fixed) fixedCount++;
}

console.log(`\n🎉 Done! Fixed ${fixedCount} files.`);
