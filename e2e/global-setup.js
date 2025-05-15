/**
 * Global setup for all Playwright tests
 * This runs once before all test files
 */
import { seedResearchTestData } from './utils/research-seed.js';

async function globalSetup() {
  console.log('🌱 Starting global test setup...');
  
  try {
    // Seed research test data
    console.log('🔄 Seeding research test data...');
    const tokens = await seedResearchTestData();
    
    if (tokens) {
      console.log('Successfully loaded research-seed.js functions');
    } else {
      console.error('Failed to seed research test data');
    }
    
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup; 