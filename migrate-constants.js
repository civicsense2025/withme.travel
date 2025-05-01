/**
 * Migrate Constants Script
 *
 * This script helps migrate from the deprecated @/utils/constants to use
 * the newer @/utils/constants/database where appropriate
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Constants to be migrated to database constants
const DATABASE_CONSTANTS = [
  'DB_TABLES',
  'DB_FIELDS',
  'DB_ENUMS',
  'TRIP_ROLES',
  'CONTENT_TYPES',
  'URL_FORMATS',
  'QUALITY_TIERS',
  'IMAGE_TYPES',
  'INVITATION_STATUS',
  'PRESENCE_STATUS',
  'REQUEST_STATUSES',
  'ACCESS_REQUEST_STATUS',
];

// Find all files that use constants
const findConstantsImports = () => {
  try {
    // Use grep to find files that import from '@/utils/constants'
    const grepOutput = execSync(
      'grep -r "from \'@/utils/constants\'" --include="*.ts" --include="*.tsx" .',
      {
        encoding: 'utf-8',
      }
    );

    // Parse the output to get file paths
    return grepOutput
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const match = line.match(/^([^:]+):/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Error finding constants imports:', error.message);
    return [];
  }
};

// Process a file to migrate constants
const processFile = (filePath) => {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if the file has import from '@/utils/constants'
    if (!content.includes("from '@/utils/constants'")) {
      return;
    }

    // Extract import statement for constants
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@\/utils\/constants['"]/g;
    let match;
    let updatedContent = content;

    while ((match = importRegex.exec(content)) !== null) {
      // Get the imported items
      const importedItems = match[1].split(',').map((item) => item.trim());

      // Separate database constants from other constants
      const databaseConstants = [];
      const otherConstants = [];

      importedItems.forEach((item) => {
        // Check for "type" prefix
        const actualItem = item.startsWith('type ') ? item.slice(5) : item;

        if (DATABASE_CONSTANTS.includes(actualItem)) {
          databaseConstants.push(item);
        } else {
          otherConstants.push(item);
        }
      });

      // If there are database constants, add new import
      if (databaseConstants.length > 0) {
        const dbImport = `import { ${databaseConstants.join(', ')} } from '@/utils/constants/database'`;

        // Add new import if we have database constants
        if (!updatedContent.includes("from '@/utils/constants/database'")) {
          updatedContent = updatedContent.replace(match[0], dbImport);

          // If there are other constants, re-add those with original import
          if (otherConstants.length > 0) {
            const otherImport = `import { ${otherConstants.join(', ')} } from '@/utils/constants'`;
            updatedContent = updatedContent.replace(dbImport, `${dbImport}\n${otherImport}`);
          }
        } else {
          // If database import already exists, just modify the constants import
          if (otherConstants.length > 0) {
            updatedContent = updatedContent.replace(
              match[0],
              `import { ${otherConstants.join(', ')} } from '@/utils/constants'`
            );
          } else {
            // Remove the import if no other constants remain
            updatedContent = updatedContent.replace(match[0], '');
          }
        }
      }
    }

    // If content was updated, write back to the file
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      console.log(`Updated constants imports in: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return false;
  }
};

// Main function
const main = () => {
  console.log('Starting constants migration...');

  // Find files with constants imports
  const files = findConstantsImports();
  console.log(`Found ${files.length} files with constants imports`);

  // Process each file
  let updatedCount = 0;
  for (const file of files) {
    const updated = processFile(file);
    if (updated) {
      updatedCount++;
    }
  }

  console.log(`\nCompleted migration: ${updatedCount} files updated`);
};

// Run the script
main();
