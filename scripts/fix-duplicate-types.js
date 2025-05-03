#!/usr/bin/env node

/**
 * This script fixes duplicate type imports by ensuring all files
 * import types from the standard location (utils/constants/database.ts)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const ROOT_DIR = path.join(__dirname, '..');

console.log('🔧 Fixing duplicate type imports...');

// Common types that are defined in utils/constants/database.ts
const DATABASE_TYPES = ['TripRole', 'ItemStatus', 'TripStatus', 'PermissionStatus'];

// Function to fix imports in a file
async function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updated = content;
  let hasChanges = false;

  // Check for duplicate imports of the same types
  for (const typeName of DATABASE_TYPES) {
    // Look for imports from other locations
    const otherImportRegex = new RegExp(`import\\s+(?:{[^}]*?(?:\\b${typeName}\\b)[^}]*?}|\\b${typeName}\\b)\\s+from\\s+['"](?!@/utils/constants/database)[^'"]*['"]`, 'g');
    const hasOtherImport = otherImportRegex.test(updated);

    // Look for import from database constants
    const dbImportRegex = new RegExp(`import\\s+{[^}]*?(?:\\b${typeName}\\b)[^}]*?}\\s+from\\s+['"]@/utils/constants/database['"]`, 'g');
    const hasDbImport = dbImportRegex.test(updated);

    if (hasOtherImport) {
      // Remove other imports of this type
      updated = updated.replace(new RegExp(`import\\s+{([^}]*?)\\b${typeName}\\b([^}]*?)}\\s+from\\s+['"](?!@/utils/constants/database)[^'"]*['"]`, 'g'), (match, before, after) => {
        // If it's the only type in the import, remove the entire import
        const cleanBefore = before.replace(/,\s*$/, '');
        const cleanAfter = after.replace(/^\s*,/, '');
        
        if (!cleanBefore && !cleanAfter) {
          return ''; // Remove the entire import
        }
        
        // Keep the import but remove this type
        if (cleanBefore && cleanAfter) {
          return `import {${cleanBefore},${cleanAfter}} from ${match.split('from')[1]}`;
        } else if (cleanBefore) {
          return `import {${cleanBefore}} from ${match.split('from')[1]}`;
        } else {
          return `import {${cleanAfter}} from ${match.split('from')[1]}`;
        }
      });

      // If we don't already have the database import, add it
      if (!hasDbImport) {
        // Find the last import statement
        const lastImportIndex = updated.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
          const endOfImport = updated.indexOf('\n', lastImportIndex);
          if (endOfImport !== -1) {
            updated = 
              updated.substring(0, endOfImport + 1) + 
              `import { type ${typeName} } from '@/utils/constants/database';\n` + 
              updated.substring(endOfImport + 1);
          }
        }
      }

      hasChanges = true;
    }
  }

  // Fix type assertions of already imported types
  // For example: type TripRole from '@/utils/constants/database'
  const typeAssertionRegex = /import\s+{\s*(?:type\s+)?(\w+)(?:\s*,\s*(?:type\s+)?(\w+))*\s*}\s+from\s+['"]@\/utils\/constants\/database['"]/g;
  const match = typeAssertionRegex.exec(updated);
  if (match) {
    // Get all captured types
    const importedTypes = [];
    for (let i = 1; i < match.length; i++) {
      if (match[i]) {
        importedTypes.push(match[i]);
      }
    }

    // Replace the import with proper type imports
    const newImport = `import { ${importedTypes.map(t => `type ${t}`).join(', ')} } from '@/utils/constants/database'`;
    updated = updated.replace(match[0], newImport);
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, updated);
    console.log(`✅ Fixed duplicate imports in: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main function to process all TypeScript files
async function main() {
  const tsFiles = await glob('**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: [
      'node_modules/**',
      'coverage/**',
      'build/**',
      '.next/**',
      'scripts/**'
    ]
  });

  let fixedCount = 0;
  
  for (const file of tsFiles) {
    const filePath = path.join(ROOT_DIR, file);
    try {
      const fixed = await fixImportsInFile(filePath);
      if (fixed) fixedCount++;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  console.log(`\n🎉 Done! Fixed ${fixedCount} files.`);
}

main().catch(console.error); 