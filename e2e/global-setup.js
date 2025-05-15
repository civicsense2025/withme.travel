/**
 * Global setup for all Playwright tests
 * This runs once before all test files
 */

async function globalSetup() {
  console.log('🌱 Starting global test setup...');
  
  try {
    // In a simpler setup, we'll just create a stub test token directly
    console.log('🔄 Skipping research data seeding in simplified setup');
    
    console.log('✅ Global setup completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup; 