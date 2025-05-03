#!/usr/bin/env node

/**
 * This script fixes export issues in utils/constants/database.ts
 * Specifically, it ensures that TABLES, FIELDS, ENUMS, and type exports are properly defined
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONSTANTS_PATH = path.join(__dirname, '..', 'utils', 'constants', 'database.ts');

console.log('🔧 Fixing database.ts exports...');

// Read the file
let content = fs.readFileSync(DB_CONSTANTS_PATH, 'utf8');

// Check if the file has necessary exports
const hasTables = content.includes('export const TABLES =');
const hasFields = content.includes('export const FIELDS =');
const hasEnums = content.includes('export const ENUMS =');
const hasTypes = content.includes('export type TripRole =');

if (hasTables && hasFields && hasEnums && hasTypes) {
  console.log('✅ All required exports already exist in database.ts');
} else {
  console.log('❌ Missing required exports in database.ts. Fixing...');

  // Extract the data from content for each section
  const extractSection = (name) => {
    const startMarker = `export const ${name} = {`;
    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) return null;

    let braceCount = 1;
    let endIdx = startIdx + startMarker.length;

    while (braceCount > 0 && endIdx < content.length) {
      const char = content[endIdx];
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      endIdx++;
    }

    return content.substring(startIdx, endIdx) + ' as const;';
  };

  // Build a new database.ts file with all required exports
  let newContent = `// This file was automatically generated from the database schema
// Generated at: ${new Date().toISOString()}

`;

  // Add TABLES section
  const tablesSection = extractSection('TABLES') || extractSection('DB_TABLES');
  if (tablesSection) {
    newContent += tablesSection.replace('DB_TABLES', 'TABLES') + '\n\n';
  } else {
    console.error('❌ Could not find TABLES or DB_TABLES definition in database.ts');
    process.exit(1);
  }

  // Add FIELDS section
  const fieldsSection = extractSection('FIELDS') || extractSection('DB_FIELDS');
  if (fieldsSection) {
    newContent += fieldsSection.replace('DB_FIELDS', 'FIELDS') + '\n\n';
  } else {
    console.error('❌ Could not find FIELDS or DB_FIELDS definition in database.ts');
    process.exit(1);
  }

  // Add ENUMS section
  const enumsSection = extractSection('ENUMS') || extractSection('DB_ENUMS');
  if (enumsSection) {
    newContent += enumsSection.replace('DB_ENUMS', 'ENUMS') + '\n\n';
  } else {
    console.error('❌ Could not find ENUMS or DB_ENUMS definition in database.ts');
    process.exit(1);
  }

  // Add RELATIONSHIPS section
  const relationshipsSection =
    extractSection('RELATIONSHIPS') || extractSection('DB_RELATIONSHIPS');
  if (relationshipsSection) {
    newContent += relationshipsSection.replace('DB_RELATIONSHIPS', 'RELATIONSHIPS') + '\n\n';
  }

  // Add type definitions
  newContent += `// Export type definitions for enum values to ensure type safety
export type TripRole = typeof ENUMS.TRIP_ROLES[keyof typeof ENUMS.TRIP_ROLES];
export type ItemStatus = typeof ENUMS.ITEM_STATUS[keyof typeof ENUMS.ITEM_STATUS];
export type TripStatus = typeof ENUMS.TRIP_STATUS[keyof typeof ENUMS.TRIP_STATUS];
export type PermissionStatus = typeof ENUMS.PERMISSION_STATUS[keyof typeof ENUMS.PERMISSION_STATUS];
export type ImageType = typeof ENUMS.IMAGE_TYPE[keyof typeof ENUMS.IMAGE_TYPE];
export type ContentType = typeof ENUMS.CONTENT_TYPE[keyof typeof ENUMS.CONTENT_TYPE];
export type QuestionType = typeof ENUMS.QUESTION_TYPE[keyof typeof ENUMS.QUESTION_TYPE];
export type FormStatus = typeof ENUMS.FORM_STATUS[keyof typeof ENUMS.FORM_STATUS];
export type FormVisibility = typeof ENUMS.FORM_VISIBILITY[keyof typeof ENUMS.FORM_VISIBILITY];
export type ItineraryCategory = typeof ENUMS.ITINERARY_CATEGORY[keyof typeof ENUMS.ITINERARY_CATEGORY];

// Table-related type definitions
export type TableNames = typeof TABLES[keyof typeof TABLES];
export type TableFields<T extends keyof typeof FIELDS> = typeof FIELDS[T][keyof typeof FIELDS[T]];

// Legacy exports for backward compatibility (deprecated, use direct exports instead)
export const DB_TABLES = TABLES;
export const DB_FIELDS = FIELDS;
export const DB_ENUMS = ENUMS;
export const DB_RELATIONSHIPS = RELATIONSHIPS;
`;

  // Write the new content back to database.ts
  fs.writeFileSync(DB_CONSTANTS_PATH, newContent);
  console.log('✅ Fixed database.ts exports');
}

console.log('🎉 Done!');
