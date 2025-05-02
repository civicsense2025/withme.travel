#!/usr/bin/env node

/**
 * Script to run the forms system migration SQL
 *
 * This script will:
 * 1. Create the forms system database schema
 * 2. Set up tables for forms, questions, responses, etc.
 * 3. Create necessary indexes and RLS policies
 *
 * Usage:
 * npm run migrate:forms
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_FILE = path.join(__dirname, '../migrations/20250620_01_forms_system.sql');

// Get the database connection URL from environment variables
const getDatabaseUrl = () => {
  try {
    const envPath = path.join(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');

    for (const line of envLines) {
      if (line.startsWith('DATABASE_URL=')) {
        return line.substring('DATABASE_URL='.length).trim();
      }
    }

    // If no DATABASE_URL is found, try to use SUPABASE values
    let supabaseUrl, supabaseKey;

    for (const line of envLines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
      }
      if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        supabaseKey = line.substring('SUPABASE_SERVICE_ROLE_KEY='.length).trim();
      }
    }

    if (supabaseUrl && supabaseKey) {
      return `postgresql://postgres:${supabaseKey}@${supabaseUrl.replace('https://', '')}/postgres`;
    }

    console.error('No database connection found in .env.local');
    return null;
  } catch (error) {
    console.error('Error reading .env.local file:', error);
    return null;
  }
};

const runMigration = () => {
  try {
    console.log('Starting forms system migration...');

    // Check if the migration file exists
    if (!fs.existsSync(MIGRATION_FILE)) {
      console.error(`Migration file not found: ${MIGRATION_FILE}`);
      process.exit(1);
    }

    const dbUrl = getDatabaseUrl();
    if (!dbUrl) {
      console.error('Could not determine database URL. Please set DATABASE_URL in .env.local');
      process.exit(1);
    }

    // Run the migration
    console.log('Running SQL migration...');
    console.log(`Using migration file: ${MIGRATION_FILE}`);
    const command = `psql "${dbUrl}" -f "${MIGRATION_FILE}"`;

    execSync(command, { stdio: 'inherit' });

    console.log('Migration completed successfully!');

    // Remind to update constants
    console.log('\nIMPORTANT: Make sure your utils/constants/database.ts file includes:');
    console.log("- TABLES.FORMS = 'forms'");
    console.log("- TABLES.QUESTIONS = 'questions'");
    console.log("- TABLES.RESPONSES = 'responses'");
    console.log("- TABLES.RESPONSE_SESSIONS = 'response_sessions'");
    console.log("- TABLES.FORM_TEMPLATES = 'form_templates'");
    console.log("- TABLES.FORM_COLLABORATORS = 'form_collaborators'");
    console.log("- TABLES.QUESTION_BRANCHING = 'question_branching'");
    console.log('- And update FIELDS and RELATIONSHIPS accordingly');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
