#!/usr/bin/env node

/**
 * Fix Constants Import Script
 * 
 * This script updates all imports of FIELDS and ENUMS from @/utils/constants/database
 * to use DB_FIELDS and DB_ENUMS instead, which are the legacy versions still available.
 * 
 * Also adds type assertions for TABLES to handle TypeScript errors.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory and root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Find all TypeScript files with imports from database constants
console.log('Finding files with imports from database constants...');

// Helper function to fix a file
function fixFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files in mobile/withme-app or scripts directories
    if (filePath.includes('mobile/withme-app') || filePath.includes('/scripts/')) {
      console.log(`  Skipping file in excluded directory: ${filePath}`);
      return;
    }

    let modified = false;
    
    // Replace FIELDS with DB_FIELDS and ENUMS with DB_ENUMS in imports
    if (content.includes('import {') && content.includes('from \'@/utils/constants/database\'')) {
      const originalContent = content;
      
      // Replace imports
      content = content.replace(
        /import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]@\/utils\/constants\/database['"]/g,
        (match, importList) => {
          // Process the import list
          const imports = importList.split(',').map(item => item.trim());
          
          const processedImports = imports.map(item => {
            if (item === 'FIELDS') return 'DB_FIELDS';
            if (item === 'ENUMS') return 'DB_ENUMS';
            if (item === 'TRIP_ROLES') return 'DB_ENUMS.TRIP_ROLES';
            return item;
          });
          
          return `import { ${processedImports.join(', ')} } from '@/utils/constants/database'`;
        }
      );
      
      // Add type assertion for TABLES if it's imported
      if (content.includes('TABLES') && 
          !content.includes('const Tables =') && 
          !content.includes('// Define a more complete type for TABLES')) {
        
        // Add type assertion after the import
        const importPattern = /import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]@\/utils\/constants\/database['"];\s*\n/;
        const typeAssertionBlock = `
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

        if (importPattern.test(content) && content.includes('TABLES')) {
          content = content.replace(importPattern, (match) => {
            return match + typeAssertionBlock;
          });
        }
      }
      
      // Replace usage of TABLES with Tables if we added the type assertion
      if (content.includes('const Tables = TABLES as unknown as ExtendedTables')) {
        // Replace .from(TABLES. with .from(Tables.
        content = content.replace(/\.from\s*\(\s*TABLES\./g, '.from(Tables.');
        
        // Replace other uses of TABLES. with Tables.
        content = content.replace(/TABLES\.\w+/g, (match) => {
          return match.replace('TABLES', 'Tables');
        });
      }
      
      // Replace usages of FIELDS and ENUMS with legacy versions
      content = content.replace(/FIELDS\./g, 'DB_FIELDS.');
      content = content.replace(/ENUMS\./g, 'DB_ENUMS.');
      
      // Add new replacements for DB_DB_ENUMS and similar patterns
      const replacements = [
        // Handle multiple DB_ prefixes for ENUMS
        {
          find: /DB_DB_DB_DB_ENUMS/g,
          replace: 'ENUMS',
          needsImport: 'ENUMS'
        },
        {
          find: /DB_DB_DB_ENUMS/g,
          replace: 'ENUMS',
          needsImport: 'ENUMS'
        },
        {
          find: /DB_DB_ENUMS/g,
          replace: 'ENUMS',
          needsImport: 'ENUMS'
        },
        // Handle multiple DB_ prefixes for FIELDS
        {
          find: /DB_DB_DB_DB_FIELDS/g,
          replace: 'FIELDS',
          needsImport: 'FIELDS'
        },
        {
          find: /DB_DB_DB_FIELDS/g,
          replace: 'FIELDS',
          needsImport: 'FIELDS'
        },
        {
          find: /DB_DB_FIELDS/g,
          replace: 'FIELDS',
          needsImport: 'FIELDS'
        },
        // Handle multiple DB_ prefixes for TABLES
        {
          find: /DB_DB_DB_DB_TABLES/g,
          replace: 'TABLES',
          needsImport: 'TABLES'
        },
        {
          find: /DB_DB_DB_TABLES/g,
          replace: 'TABLES',
          needsImport: 'TABLES'
        },
        {
          find: /DB_DB_TABLES/g,
          replace: 'TABLES',
          needsImport: 'TABLES'
        },
      ];
      
      replacements.forEach(({ find, replace, needsImport }) => {
        content = content.replace(find, replace);
      });
      
      if (content !== originalContent) {
        modified = true;
      }
    }
    
    // Write back to the file if modified
    if (modified) {
      console.log(`  Modified: ${filePath}`);
      fs.writeFileSync(filePath, content, 'utf8');
    } else {
      console.log(`  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Get a list of TypeScript files with potential imports
const findFilesCommand = 'find . -type f -name "*.ts" -o -name "*.tsx" | grep -v "node_modules" | grep -v ".next" | grep -v "scripts/" | grep -v "mobile/withme-app/"';
let filesToProcess = [];

try {
  const filesOutput = execSync(findFilesCommand, { cwd: rootDir }).toString();
  filesToProcess = filesOutput.trim().split('\n');
  
  // Filter to only files that might contain database constant imports
  const grepCommand = 'grep -l "from \'"\'@/utils/constants/database\'"\'\\|TABLES\\|FIELDS\\|ENUMS" ' + filesToProcess.join(' ');
  
  try {
    const grepOutput = execSync(grepCommand, { cwd: rootDir }).toString();
    filesToProcess = grepOutput.trim().split('\n').filter(Boolean);
  } catch (error) {
    // grep returns non-zero exit code if no matches, which is okay
    if (error.status !== 1) {
      console.error('Error filtering files:', error);
    }
  }
  
} catch (error) {
  console.error('Error finding files:', error);
  process.exit(1);
}

// Process each file
console.log(`Found ${filesToProcess.length} files to process`);
filesToProcess.forEach(file => {
  const fullPath = path.resolve(rootDir, file);
  fixFile(fullPath);
});

console.log('Done.'); 