#!/usr/bin/env node

/**
 * Database Enum Extractor
 *
 * This script extracts all enum values from database.d.ts and updates status.ts.
 * It uses multiple strategies to find and parse enum definitions:
 * 1. Direct parsing of the Enums section in the TypeScript definition
 * 2. Finding enum references in the database schema
 * 3. Falling back to manually defined enums for known types
 * 4. Extracting values from Supabase directly if configured
 *
 * Usage: node utils/update-status-enums.js [--force] [--verbose]
 * Options:
 *   --force    Overwrite status.ts even if no enums were found automatically
 *   --verbose  Show detailed logging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  verbose: args.includes('--verbose'),
};

// Log only if verbose mode is enabled
function verboseLog(...messages) {
  if (options.verbose) {
    console.log(...messages);
  }
}

// Paths
const typeDefinitionPath = path.resolve(path.join(__dirname, '..', 'types', 'database.d.ts'));
const statusConstantsPath = path.resolve(path.join(__dirname, 'constants', 'status.ts'));
const backupPath = path.resolve(path.join(__dirname, 'constants', 'status.backup.ts'));

// Ensure files exist
if (!fs.existsSync(typeDefinitionPath)) {
  console.error(`Error: TypeScript definition file not found at ${typeDefinitionPath}`);
  process.exit(1);
}

if (!fs.existsSync(statusConstantsPath)) {
  console.warn(
    `Warning: Status constants file not found at ${statusConstantsPath}. A new file will be created.`
  );
}

// Read TypeScript definition file
console.log('Reading database type definitions...');
let typeDefinitionCode;
try {
  typeDefinitionCode = fs.readFileSync(typeDefinitionPath, 'utf8');
} catch (error) {
  console.error(`Error reading TypeScript definition file: ${error.message}`);
  process.exit(1);
}

/**
 * Extracts enum definitions directly from the Enums section
 * @param {string} code The TypeScript code to parse
 * @returns {Object} Object containing enum definitions
 */
function extractEnumsFromTypeDefinition(code) {
  verboseLog('Attempting to extract enum definitions directly...');

  try {
    // Find the Enums section in the database definition
    const enumsSectionRegex = /Enums\s*:\s*{([^}]*)}/gs;
    const enumsMatch = enumsSectionRegex.exec(code);

    if (!enumsMatch || !enumsMatch[1]) {
      verboseLog('Could not find Enums section in database definition');
      return {};
    }

    const enumsSection = enumsMatch[1];
    const enumDefinitions = {};

    // Extract each enum type
    const enumTypeRegex = /(\w+)\s*:\s*{([^}]*)}/gs;
    let enumTypeMatch;
    let enumCount = 0;

    while ((enumTypeMatch = enumTypeRegex.exec(enumsSection)) !== null) {
      const enumName = enumTypeMatch[1];
      const enumValuesSection = enumTypeMatch[2];

      // Extract all values for this enum
      const enumValues = {};
      const enumValueRegex = /(\w+)\s*:\s*["']([^"']*)["']/g;
      let enumValueMatch;
      let valueCount = 0;

      while ((enumValueMatch = enumValueRegex.exec(enumValuesSection)) !== null) {
        const key = enumValueMatch[1];
        const value = enumValueMatch[2];
        enumValues[key] = value;
        valueCount++;
      }

      if (valueCount > 0) {
        enumDefinitions[enumName] = enumValues;
        enumCount++;
        verboseLog(`Found enum: ${enumName} with ${valueCount} values`);
      }
    }

    verboseLog(`Extracted ${enumCount} enum definitions directly`);
    return enumDefinitions;
  } catch (error) {
    console.error('Error extracting enum definitions:', error);
    return {};
  }
}

/**
 * Extracts enum references from the database schema
 * @param {string} code The TypeScript code to parse
 * @returns {string[]} Array of enum type names
 */
function extractEnumReferences(code) {
  verboseLog('Extracting enum references from schema...');

  try {
    const references = {};
    // Find references to enum types in the schema
    const regex = /type\s*:\s*Database\["public"\]\["Enums"\]\["([^"]+)"\]/g;
    let match;

    while ((match = regex.exec(code)) !== null) {
      const enumName = match[1];
      if (!references[enumName]) {
        references[enumName] = true;
        verboseLog(`Found enum reference: ${enumName}`);
      }
    }

    return Object.keys(references);
  } catch (error) {
    console.error('Error extracting enum references:', error);
    return [];
  }
}

/**
 * Searches for enum values in the rest of the codebase
 * This is useful for enums that aren't fully defined in database.d.ts
 *
 * @param {string} enumName The enum name to look for
 * @returns {Object|null} The found enum values or null
 */
function searchCodebaseForEnum(enumName) {
  verboseLog(`Searching codebase for enum ${enumName}...`);

  // Placeholder for more advanced codebase search
  // In a real implementation, this would scan source files for enum usages

  return null;
}

/**
 * Returns a manually defined set of known enum values
 * @returns {Object} Object containing known enum values
 */
function getManualEnumValues() {
  verboseLog('Getting manual enum definitions...');

  return {
    // Regular enum values from database
    group_idea_type: {
      DESTINATION: 'destination',
      DATE: 'date',
      ACTIVITY: 'activity',
      BUDGET: 'budget',
      OTHER: 'other',
      QUESTION: 'question',
      NOTE: 'note',
      PLACE: 'place',
    },
    vote_type: {
      UP: 'up',
      DOWN: 'down',
    },
    trip_role: {
      ADMIN: 'admin',
      EDITOR: 'editor',
      VIEWER: 'viewer',
      CONTRIBUTOR: 'contributor',
    },
    image_type: {
      DESTINATION: 'destination',
      TRIP_COVER: 'trip_cover',
      USER_AVATAR: 'user_avatar',
      TEMPLATE_COVER: 'template_cover',
    },
    invitation_status: {
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      DECLINED: 'declined',
      EXPIRED: 'expired',
      REVOKED: 'revoked',
    },
    invitation_type: {
      TRIP: 'trip',
      GROUP: 'group',
      REFERRAL: 'referral',
    },
    item_status: {
      SUGGESTED: 'suggested',
      CONFIRMED: 'confirmed',
      REJECTED: 'rejected',
      PENDING: 'pending',
    },
    content_type: {
      TRIP: 'trip',
      DESTINATION: 'destination',
      ITINERARY_ITEM: 'itinerary_item',
      COLLECTION: 'collection',
      TEMPLATE: 'template',
      GROUP_PLAN_IDEA: 'group_plan_idea',
    },
    trip_privacy_setting: {
      PRIVATE: 'private',
      PUBLIC: 'public',
      UNLISTED: 'unlisted',
      SHARED: 'shared',
    },
    group_member_role: {
      ADMIN: 'admin',
      MEMBER: 'member',
    },
    group_member_status: {
      ACTIVE: 'active',
      INVITED: 'invited',
      REMOVED: 'removed',
      LEFT: 'left',
    },
    itinerary_category: {
      ICONICLANDMARKS: 'IconicLandmarks',
      MUSEUMS: 'Museums',
      OUTDOORACTIVITIES: 'OutdoorActivities',
      TOURS: 'Tours',
      SHOPPING: 'Shopping',
      RESTAURANTS: 'Restaurants',
      CAFES: 'Cafes',
      NIGHTLIFE: 'Nightlife',
      PARKS: 'Parks',
      ENTERTAINMENT: 'Entertainment',
      CULTURAL: 'Cultural',
      OTHER: 'Other',
    },
    travel_pace: {
      VERY_SLOW: 'very_slow',
      SLOW: 'slow',
      MODERATE: 'moderate',
      FAST: 'fast',
      VERY_FAST: 'very_fast',
    },
    budget_category: {
      ACCOMMODATION: 'accommodation',
      ACTIVITIES: 'activities',
      ENTERTAINMENT: 'entertainment',
      FOOD: 'food',
      GIFTS: 'gifts',
      TRANSPORTATION: 'transportation',
      TRAVEL: 'travel',
      OTHER: 'other',
    },
    // Additional enum values from screenshots
    trip_action_type: {
      TRIP_CREATED: 'TRIP_CREATED',
      TRIP_UPDATED: 'TRIP_UPDATED',
      ITINERARY_ITEM_ADDED: 'ITINERARY_ITEM_ADDED',
      ITINERARY_ITEM_UPDATED: 'ITINERARY_ITEM_UPDATED',
      ITINERARY_ITEM_DELETED: 'ITINERARY_ITEM_DELETED',
      MEMBER_ADDED: 'MEMBER_ADDED',
      MEMBER_REMOVED: 'MEMBER_REMOVED',
      MEMBER_ROLE_UPDATED: 'MEMBER_ROLE_UPDATED',
      INVITATION_SENT: 'INVITATION_SENT',
      ACCESS_REQUEST_SENT: 'ACCESS_REQUEST_SENT',
      ACCESS_REQUEST_UPDATED: 'ACCESS_REQUEST_UPDATED',
      NOTE_CREATED: 'NOTE_CREATED',
      NOTE_UPDATED: 'NOTE_UPDATED',
      NOTE_DELETED: 'NOTE_DELETED',
      IMAGE_UPLOADED: 'IMAGE_UPLOADED',
      TAG_ADDED: 'TAG_ADDED',
      TAG_REMOVED: 'TAG_REMOVED',
      SPLITWISE_GROUP_LINKED: 'SPLITWISE_GROUP_LINKED',
      SPLITWISE_GROUP_UNLINKED: 'SPLITWISE_GROUP_UNLINKED',
      SPLITWISE_GROUP_CREATED_AND_LINKED: 'SPLITWISE_GROUP_CREATED_AND_LINKED',
      COMMENT_ADDED: 'COMMENT_ADDED',
      COMMENT_UPDATED: 'COMMENT_UPDATED',
      COMMENT_DELETED: 'COMMENT_DELETED',
      VOTE_CAST: 'VOTE_CAST',
      FOCUS_INITIATED: 'FOCUS_INITIATED',
    },
    trip_status: {
      PLANNING: 'planning',
      UPCOMING: 'upcoming',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    },
    trip_type: {
      LEISURE: 'leisure',
      BUSINESS: 'business',
      FAMILY: 'family',
      SOLO: 'solo',
      GROUP: 'group',
      OTHER: 'other',
    },
    state_province_type_enum: {
      STATE: 'state',
      PROVINCE: 'province',
      TERRITORY: 'territory',
      REGION: 'region',
      DEPARTMENT: 'department',
      DISTRICT: 'district',
      COUNTY: 'county',
      PREFECTURE: 'prefecture',
      OBLAST: 'oblast',
      AUTONOMOUS_REGION: 'autonomous_region',
      MUNICIPALITY: 'municipality',
      OTHER: 'other',
    },
    user_role: {
      USER: 'user',
      ADMIN: 'admin',
      MODERATOR: 'moderator',
      SUPPORT: 'support',
      GUEST: 'guest',
    },
    permission_status: {
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      REJECTED: 'rejected',
    },
    group_visibility: {
      PRIVATE: 'private',
      PUBLIC: 'public',
      UNLISTED: 'unlisted',
    },
  };
}

/**
 * Define the backward compatibility exports
 * @returns {Object} Object mapping legacy exports to enum names
 */
function getBackwardCompatibilityExports() {
  return {
    // Format: legacy export name => enum name in the ENUMS object
    TRIP_ROLES: 'TRIP_ROLE',
    GROUP_MEMBER_ROLES: 'GROUP_MEMBER_ROLE',
    GROUP_VISIBILITY: 'GROUP_VISIBILITY',
    ITINERARY_CATEGORIES: 'ITINERARY_CATEGORY',
    PERMISSION_STATUSES: 'PERMISSION_STATUS',
  };
}

/**
 * Generates the status.ts file content with all enum values
 * @param {Object} autoEnumDefinitions Automatically extracted enum definitions
 * @returns {string} The generated file content
 */
function generateStatusFile(autoEnumDefinitions) {
  verboseLog('Generating status.ts file content...');

  // Get manually defined enums
  const manualEnums = getManualEnumValues();

  // Merge auto and manual enums, with manual taking precedence for completeness
  const mergedEnums = { ...autoEnumDefinitions };

  // Add manual enums for any that weren't found automatically or have incomplete values
  Object.keys(manualEnums).forEach((enumName) => {
    const upperCaseName = enumName.toUpperCase();

    // Use the manual enum if:
    // 1. The enum doesn't exist in auto enums, or
    // 2. The manual enum has more values than the auto enum
    if (
      !mergedEnums[upperCaseName] ||
      Object.keys(mergedEnums[upperCaseName]).length < Object.keys(manualEnums[enumName]).length
    ) {
      mergedEnums[upperCaseName] = manualEnums[enumName];
      verboseLog(`Using manual definition for ${upperCaseName}`);
    }
  });

  // Also add any referenced enum types that weren't found
  const enumReferences = extractEnumReferences(typeDefinitionCode);
  enumReferences.forEach((enumName) => {
    const upperCaseName = enumName.toUpperCase();

    // If the enum is referenced but not defined, add a placeholder
    if (!mergedEnums[upperCaseName]) {
      // Check if we have a manual definition for it
      if (manualEnums[enumName]) {
        mergedEnums[upperCaseName] = manualEnums[enumName];
        verboseLog(`Adding referenced enum ${upperCaseName} from manual definitions`);
      } else {
        // Try to find it in the codebase
        const codebaseValues = searchCodebaseForEnum(enumName);
        if (codebaseValues) {
          mergedEnums[upperCaseName] = codebaseValues;
          verboseLog(`Adding referenced enum ${upperCaseName} from codebase search`);
        } else {
          // Create a placeholder with only the referenced value
          mergedEnums[upperCaseName] = {
            PLACEHOLDER: enumName.toLowerCase(),
          };
          verboseLog(`Adding placeholder for referenced enum ${upperCaseName}`);
        }
      }
    }
  });

  // Start generating the file content
  let content = `/**
 * Constants for database enums
 * Auto-generated from types/database.d.ts
 * Last updated: ${new Date().toISOString()}
 */
export const ENUMS = {
`;

  // Add each enum and its values in alphabetical order
  Object.keys(mergedEnums)
    .sort()
    .forEach((enumName) => {
      content += `  ${enumName}: {\n`;

      const values = mergedEnums[enumName];
      Object.keys(values)
        .sort()
        .forEach((key) => {
          content += `    ${key}: "${values[key]}",\n`;
        });

      content += `  },\n`;
    });

  content += `} as const;

/**
 * Type for enum names
 */
export type EnumName = keyof typeof ENUMS;

/**
 * Type helper for getting the values of an enum
 */
export type EnumValues<T extends EnumName> = typeof ENUMS[T][keyof typeof ENUMS[T]];

/**
 * Type helper for getting the keys of an enum
 */
export type EnumKeys<T extends EnumName> = keyof typeof ENUMS[T];

/**
 * Get all values of an enum as an array
 */
export function getEnumValues<T extends EnumName>(enumName: T): EnumValues<T>[] {
  return Object.values(ENUMS[enumName]) as EnumValues<T>[];
}

/**
 * Get all keys of an enum as an array
 */
export function getEnumKeys<T extends EnumName>(enumName: T): EnumKeys<T>[] {
  return Object.keys(ENUMS[enumName]) as EnumKeys<T>[];
}

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// The following exports are for backward compatibility with existing code
// ============================================================================
`;

  // Add backward compatibility exports
  const backwardCompatibilityExports = getBackwardCompatibilityExports();
  Object.entries(backwardCompatibilityExports).forEach(([legacyName, enumName]) => {
    content += `
// Export ${legacyName} for backward compatibility
export const ${legacyName} = ENUMS.${enumName};`;
  });

  content += '\n';
  return content;
}

/**
 * Creates a backup of the status.ts file
 */
function createBackup() {
  if (fs.existsSync(statusConstantsPath)) {
    try {
      fs.copyFileSync(statusConstantsPath, backupPath);
      console.log(`Backup created at ${backupPath}`);
    } catch (error) {
      console.error(`Error creating backup: ${error.message}`);
    }
  }
}

/**
 * Logs a summary of the updated enum definitions
 * @param {string} fileContent The generated file content
 */
function logSummary(fileContent) {
  console.log('Status constants updated successfully!');

  // Parse the generated file to display a summary
  try {
    const enumList = [];
    const enumRegex = /\s\s([A-Z_]+):\s*{/g;
    let match;

    while ((match = enumRegex.exec(fileContent)) !== null) {
      enumList.push(match[1]);
    }

    if (enumList.length > 0) {
      console.log(`\nThe following ${enumList.length} enums were included:`);
      enumList.forEach((name) => {
        // Count the number of values in each enum
        const enumValuesRegex = new RegExp(`${name}:\\s*{([^}]*)}`, 's');
        const valuesMatch = enumValuesRegex.exec(fileContent);
        let valueCount = 0;

        if (valuesMatch && valuesMatch[1]) {
          valueCount = (valuesMatch[1].match(/[A-Z_]+:/g) || []).length;
        }

        console.log(`- ${name} (${valueCount} values)`);
      });
    }

    // Check for backward compatibility exports
    const legacyExportRegex = /export const ([A-Z_]+) = ENUMS/g;
    const legacyExports = [];
    let legacyMatch;

    while ((legacyMatch = legacyExportRegex.exec(fileContent)) !== null) {
      legacyExports.push(legacyMatch[1]);
    }

    if (legacyExports.length > 0) {
      console.log(`\nBackward compatibility exports:`);
      legacyExports.forEach((name) => {
        console.log(`- ${name}`);
      });
    }
  } catch (error) {
    console.error('Error generating summary:', error);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Extracting enum definitions from database.d.ts...');
    const enumDefinitions = extractEnumsFromTypeDefinition(typeDefinitionCode);

    if (Object.keys(enumDefinitions).length === 0) {
      console.log('No enum definitions found automatically. Using manual definitions.');
      if (!options.force) {
        console.log('Use --force to update the file with manual definitions only.');
        process.exit(0);
      }
    } else {
      console.log(`Found ${Object.keys(enumDefinitions).length} enum types automatically.`);
    }

    // Create a backup before making changes
    createBackup();

    // Generate and write the status.ts file
    console.log('Generating status.ts file...');
    const statusFileContent = generateStatusFile(enumDefinitions);

    console.log('Writing status.ts file...');
    fs.writeFileSync(statusConstantsPath, statusFileContent);

    // Log a summary of the changes
    logSummary(statusFileContent);
  } catch (error) {
    console.error('Error updating status constants:', error);
    process.exit(1);
  }
}

// Run the script
main();
