/**
 * Global Setup for Research System E2E Tests
 * 
 * This file runs once before all tests and is responsible for initializing the
 * test environment, such as creating test data and setting up the database.
 */
import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Environment setup that runs before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('\n🔧 Setting up research test environment...');
  
  // Create directories for test artifacts
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  const testResultsDir = path.join(process.cwd(), 'test-results');
  
  ensureDirExists(screenshotsDir);
  ensureDirExists(testResultsDir);
  
  // Optionally seed the database with test data
  if (process.env.SEED_TEST_DATA) {
    try {
      console.log('🌱 Seeding database with test data...');
      execSync('npm run seed:test-research', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed database:', error);
      // Continue tests even if seeding fails
    }
  } else {
    console.log('ℹ️ Skipping database seeding (set SEED_TEST_DATA=true to enable)');
  }
  
  // Set environment variables for the test run
  process.env.TEST_INITIALIZED = 'true';
  process.env.TEST_START_TIME = new Date().toISOString();
  
  console.log('✅ Test environment setup complete\n');
}

/**
 * Ensure a directory exists
 */
function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

export default globalSetup; 