#!/usr/bin/env node

/**
 * This script ensures that utils/constants/database.ts properly exports
 * all needed constants and types to fix TypeScript errors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONSTANTS_PATH = path.join(__dirname, '..', 'utils', 'constants', 'database.ts');

console.log('🔧 Ensuring proper exports in database.ts...');

// Read the current file content
let content = fs.readFileSync(DB_CONSTANTS_PATH, 'utf8');

// Check if required type exports are already present
const missingExports = [];

// Check for essential type exports
if (!content.includes('export type TripRole =')) {
  missingExports.push('TripRole');
}
if (!content.includes('export type ItemStatus =')) {
  missingExports.push('ItemStatus');
}
if (!content.includes('export type TripStatus =')) {
  missingExports.push('TripStatus');
}
if (!content.includes('export type PermissionStatus =')) {
  missingExports.push('PermissionStatus');
}

// If no missing exports, we're done
if (missingExports.length === 0) {
  console.log('✅ All required type exports already exist in database.ts');
} else {
  console.log(`⚠️ Missing type exports in database.ts: ${missingExports.join(', ')}`);

  // Add type export statements if needed
  let typeExports = '';
  if (missingExports.includes('TripRole')) {
    typeExports +=
      'export type TripRole = typeof ENUMS.TRIP_ROLES[keyof typeof ENUMS.TRIP_ROLES];\n';
  }
  if (missingExports.includes('ItemStatus')) {
    typeExports +=
      'export type ItemStatus = typeof ENUMS.ITEM_STATUS[keyof typeof ENUMS.ITEM_STATUS];\n';
  }
  if (missingExports.includes('TripStatus')) {
    typeExports +=
      'export type TripStatus = typeof ENUMS.TRIP_STATUS[keyof typeof ENUMS.TRIP_STATUS];\n';
  }
  if (missingExports.includes('PermissionStatus')) {
    typeExports +=
      'export type PermissionStatus = typeof ENUMS.PERMISSION_STATUS[keyof typeof ENUMS.PERMISSION_STATUS];\n';
  }

  // Find the right place to insert the exports
  // First look for existing type exports to add alongside
  let insertPoint = content.indexOf('export type ');

  // If none found, look for legacy exports
  if (insertPoint === -1) {
    insertPoint = content.indexOf('export const DB_TABLES');
  }

  // If still not found, just append to end
  if (insertPoint === -1) {
    content += '\n\n// Type exports\n' + typeExports;
  } else {
    // Otherwise insert at the found position
    content = content.substring(0, insertPoint) + typeExports + content.substring(insertPoint);
  }

  // Write the updated content back to the file
  fs.writeFileSync(DB_CONSTANTS_PATH, content);
  console.log('✅ Added missing type exports to database.ts');
}

// Now check for the main constants exports
const missingConstants = [];

if (!content.includes('export const TABLES =')) {
  missingConstants.push('TABLES');
}
if (!content.includes('export const FIELDS =')) {
  missingConstants.push('FIELDS');
}
if (!content.includes('export const ENUMS =')) {
  missingConstants.push('ENUMS');
}

if (missingConstants.length === 0) {
  console.log('✅ All required constant exports already exist in database.ts');
} else {
  console.log(`⚠️ Missing constant exports in database.ts: ${missingConstants.join(', ')}`);

  // Add legacy exports to proper exports if needed
  let updates = content;

  if (missingConstants.includes('TABLES') && content.includes('export const DB_TABLES')) {
    updates = updates.replace('export const DB_TABLES', 'export const TABLES');
    // Also add a line to maintain backward compatibility
    if (!updates.includes('export const DB_TABLES = TABLES')) {
      updates += '\nexport const DB_TABLES = TABLES;\n';
    }
  }

  if (missingConstants.includes('FIELDS') && content.includes('export const DB_FIELDS')) {
    updates = updates.replace('export const DB_FIELDS', 'export const FIELDS');
    // Also add a line to maintain backward compatibility
    if (!updates.includes('export const DB_FIELDS = FIELDS')) {
      updates += '\nexport const DB_FIELDS = FIELDS;\n';
    }
  }

  if (missingConstants.includes('ENUMS') && content.includes('export const DB_ENUMS')) {
    updates = updates.replace('export const DB_ENUMS', 'export const ENUMS');
    // Also add a line to maintain backward compatibility
    if (!updates.includes('export const DB_ENUMS = ENUMS')) {
      updates += '\nexport const DB_ENUMS = ENUMS;\n';
    }
  }

  // Write the updated content back to the file
  fs.writeFileSync(DB_CONSTANTS_PATH, updates);
  console.log('✅ Added missing constant exports to database.ts');
}

console.log('🎉 Done!');
