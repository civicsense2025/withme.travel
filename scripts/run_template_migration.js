#!/usr/bin/env node

/**
 * Script to run the template migration SQL
 *
 * This script will:
 * 1. Create the itinerary_template_items table if it doesn't exist
 * 2. Migrate any template items from itinerary_items table
 * 3. Update the database relationships
 *
 * Usage:
 * npm run migrate:templates
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const MIGRATION_FILE = path.join(__dirname, '../migrations/migrate_template_items.sql');

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
    console.log('Starting template migration...');

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
    const command = `psql "${dbUrl}" -f "${MIGRATION_FILE}"`;

    execSync(command, { stdio: 'inherit' });

    console.log('Migration completed successfully!');

    // Remind to update constants
    console.log('\nIMPORTANT: Make sure your utils/constants/database.ts file includes:');
    console.log("- TABLES.ITINERARY_TEMPLATE_ITEMS = 'itinerary_template_items'");
    console.log('- FIELDS.ITINERARY_TEMPLATE_ITEMS = {...}');
    console.log('- RELATIONSHIPS with proper relationships defined');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
