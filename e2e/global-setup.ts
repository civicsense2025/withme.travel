// ============================================================================
// PLAYWRIGHT GLOBAL SETUP: Seed research test data before all tests
// ============================================================================
import { FullConfig } from '@playwright/test';
import { seedResearchTestData } from './utils/research-seed.js';
import { retry } from './utils/test-helpers.js';
import { config } from './test-config.js';

/**
 * Global setup for Playwright tests
 * Runs once before all tests to set up necessary test data
 */
async function globalSetup(config: FullConfig) {
  console.log('🌱 Starting global test setup...');
  
  // Add timeout to prevent hanging in CI
  const setupPromise = async () => {
    // Validate environment variables are set
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables for test setup:');
      missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      
      // In CI, we should fail fast if environment variables are missing
      if (process.env.CI) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      } else {
        console.warn('⚠️ Continuing without seeding test data. Tests may fail.');
        return;
      }
    }
    
    // Seed research survey test data (creates forms, sessions, tokens)
    console.log('🔄 Seeding research test data...');
    
    // Use retry logic
    await retry(
      async () => {
        await seedResearchTestData({
          logLevel: 'info',
          useTransaction: true
        });
      },
      {
        retries: 2,
        delay: 1000,
        onRetry: (attempt, error) => {
          console.warn(`⚠️ Retry ${attempt} after seeding error:`, error);
        }
      }
    );
  };
  
  // Set a timeout for the entire setup process
  const timeoutMs = 60000; // 1 minute
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Setup timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  
  try {
    await Promise.race([setupPromise(), timeoutPromise]);
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Error during global test setup:', error);
    
    // Only exit in CI environments to fail fast
    if (process.env.CI) {
      process.exit(1);
    } else {
      console.warn('⚠️ Continuing despite setup errors. Tests may fail.');
    }
  }
}

export default globalSetup; 