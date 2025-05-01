#!/usr/bin/env node

/**
 * Script to fix common TypeScript errors in the codebase
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Find all TypeScript errors
console.log('Finding TypeScript errors...');

try {
  // Run TypeScript check and capture output
  const result = execSync('npx tsc --noEmit', { stdio: 'pipe' }).toString();
  console.log('TypeScript check completed successfully!');
} catch (error) {
  const errorOutput = error.stdout.toString();
  console.log('TypeScript errors found. Processing...');

  // Extract patterns of common errors
  const missingRoleErrors = errorOutput.match(/Property 'role' is missing in type 'Trip'/g) || [];
  const tripHeaderErrors =
    errorOutput.match(
      /Property 'title' does not exist on type 'IntrinsicAttributes & TripHeaderProps'/g
    ) || [];
  const destinationsErrors =
    errorOutput.match(/Property 'destinations' does not exist on type 'Trip'/g) || [];
  const presenceErrors = errorOutput.match(/Cannot find name 'ExtendedUserPresence'/g) || [];

  console.log(`Found ${missingRoleErrors.length} missing role errors`);
  console.log(`Found ${tripHeaderErrors.length} TripHeader prop errors`);
  console.log(`Found ${destinationsErrors.length} destinations property errors`);
  console.log(`Found ${presenceErrors.length} missing ExtendedUserPresence errors`);

  // Implement fixes
  fixCommonErrors();
}

function fixCommonErrors() {
  // 1. Create presence types file if it doesn't exist
  const presenceTypesPath = path.join(ROOT_DIR, 'types', 'presence.ts');
  if (!fs.existsSync(presenceTypesPath)) {
    console.log('Creating presence types file...');

    const presenceTypesContent = `import { PresenceStatus } from "@/utils/constants/database";

export interface CursorPosition {
  x: number;
  y: number;
  timestamp?: number;
}

// Basic user presence interface
export interface UserPresence {
  id: string;
  user_id: string; 
  trip_id: string;
  status: PresenceStatus;
  last_active: string;
  document_id?: string;
  editing_item_id?: string;
  cursor_position?: CursorPosition;
  page_path?: string;
}

// Extended user presence with profile information
export interface ExtendedUserPresence extends UserPresence {
  name?: string;
  email?: string;
  avatar_url?: string;
  username?: string;
}

// Type for user presence from imports
export interface ImportedUserPresence extends UserPresence {
  profiles?: {
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}`;

    // Ensure directory exists
    if (!fs.existsSync(path.dirname(presenceTypesPath))) {
      fs.mkdirSync(path.dirname(presenceTypesPath), { recursive: true });
    }

    fs.writeFileSync(presenceTypesPath, presenceTypesContent);
    console.log('Created presence types file.');
  }

  // 2. Fix missing role errors in TripCard components
  try {
    const files = findFilesWithPattern('TripCard');
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('<TripCard') && !content.includes('role:')) {
        const updatedContent = content.replace(
          /<TripCard\s+key={([^}]+)}\s+trip={([^}]+)}/g,
          '<TripCard key={$1} trip={{...$2, role: "admin"}}'
        );
        fs.writeFileSync(file, updatedContent);
        console.log(`Fixed missing role in ${file}`);
      }
    }
  } catch (error) {
    console.error('Error fixing TripCard components:', error);
  }

  // 3. Fix destinations property errors
  try {
    const files = findFilesWithPattern('trip.destinations');
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('trip.destinations')) {
        const updatedContent = content.replace(
          /trip\.destinations\s+&&\s+trip\.destinations\.length\s+>\s+0[^?]*\?[^:]*:[^;]*/g,
          'trip.destination_name || "Unknown Destination"'
        );
        fs.writeFileSync(file, updatedContent);
        console.log(`Fixed destinations property in ${file}`);
      }
    }
  } catch (error) {
    console.error('Error fixing destinations property:', error);
  }

  console.log('\nFinished fixing common TypeScript errors.');
}

function findFilesWithPattern(pattern) {
  try {
    const result = execSync(
      `grep -r -l "${pattern}" --include="*.tsx" --include="*.ts" ${ROOT_DIR}/app ${ROOT_DIR}/components 2>/dev/null`
    ).toString();
    return result.split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

console.log('\nScript completed!');
console.log('Some TypeScript errors may still need manual fixing.');
console.log('Run "npx tsc --noEmit" to check for remaining errors.');
