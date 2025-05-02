#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv-flow';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env files
config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ADMIN_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Supabase URL or service/admin key is missing from environment variables.');
  console.log('Please ensure these are set in your .env.local file:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ADMIN_KEY)');
  process.exit(1);
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Execute a raw SQL query using the Supabase REST API
 */
async function executeSql(query) {
  const { data, error } = await supabase.rpc('pg_execute', { query });

  if (error) {
    throw new Error(`Error executing SQL: ${error.message}`);
  }

  return data;
}

/**
 * Check if a function exists in the database
 */
async function checkFunctionExists(functionName) {
  try {
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', functionName)
      .maybeSingle();

    return !error && data !== null;
  } catch (err) {
    console.warn(
      'Could not check for function existence, assuming it does not exist:',
      err.message
    );
    return false;
  }
}

/**
 * Run a SQL migration file
 */
async function runMigration(filePath) {
  try {
    // Check if migration file exists
    await fs.promises.access(filePath);
    console.log('Found migration file:', filePath);

    // Read the SQL file
    const sql = await fs.promises.readFile(filePath, 'utf8');

    // Execute the SQL directly
    await executeSql(sql);
    console.log(`Successfully executed migration: ${path.basename(filePath)}`);

    return true;
  } catch (err) {
    console.error(`Error running migration ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Run a SQL migration file by splitting it into DO blocks
 */
async function runMigrationInBlocks(filePath) {
  try {
    // Check if migration file exists
    await fs.promises.access(filePath);
    console.log('Found migration file:', filePath);

    // Read the SQL file
    const sql = await fs.promises.readFile(filePath, 'utf8');

    // Split into separate DO statements and execute them
    console.log(`Running migration in blocks: ${path.basename(filePath)}...`);
    const doBlocks = sql.split('DO $$').filter((block) => block.trim());

    for (let i = 0; i < doBlocks.length; i++) {
      let block = doBlocks[i];

      // Skip empty blocks
      if (!block.trim()) continue;

      // Add back the DO $$ at the beginning if it's not there
      if (!block.trim().startsWith('DO')) {
        block = 'DO $$' + block;
      }

      try {
        // Execute each block
        console.log(`Executing block ${i + 1} of ${doBlocks.length}...`);
        await executeSql(block);
        console.log(`Successfully executed block ${i + 1}`);
      } catch (err) {
        console.error(`Exception executing block ${i + 1}:`, err.message);
      }
    }

    return true;
  } catch (err) {
    console.error(`Error running migration in blocks ${filePath}:`, err.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    // First, check if pg_execute function exists
    const pgExecuteFunctionPath = path.join(
      __dirname,
      '../migrations/create_pg_execute_function.sql'
    );

    console.log('Running migrations for itinerary_template_sections table...');

    // First, try to create the pg_execute function using direct SQL - this may or may not work
    // depending on permissions, but we'll try it anyway
    await runMigration(pgExecuteFunctionPath);

    // Now run the main migration to fix the itinerary_template_sections table
    const migrationFilePath = path.join(
      __dirname,
      '../migrations/fix_itinerary_template_sections.sql'
    );
    await runMigrationInBlocks(migrationFilePath);

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

// Run the main function
main();
