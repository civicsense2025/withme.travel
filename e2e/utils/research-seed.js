/**
 * Research Survey Seed Utilities
 * 
 * Helper functions to seed test data for E2E tests of the user testing
 * and research flows.
 */
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seed research test data for E2E tests
 * Creates test tokens for user testing
 * 
 * @param {Object} options - Options for the seed function
 * @param {string} [options.logLevel='info'] - Log level (error, warn, info, debug)
 * @returns {Object} The generated test tokens
 */
export async function seedResearchTestData(options = {}) {
  const {
    logLevel = 'info',
  } = options;
  
  console.log('[Seed] Starting to seed research test data');
  
  // Create test tokens with UUIDs to ensure they're properly formatted 
  // and match what the system would expect
  const TEST_TOKENS = {
    VALID: uuidv4(),
    EXPIRED: uuidv4(),
    INVALID: uuidv4(),
    MULTI_MILESTONE: uuidv4(),
  };
  
  try {
    // Write tokens to file for use by tests
    const tokensPath = path.join(process.cwd(), 'e2e/test-tokens.json');
    fs.writeFileSync(tokensPath, JSON.stringify(TEST_TOKENS, null, 2));
    
    console.log('[Seed] Successfully wrote test tokens to file:', tokensPath);
    console.log('[Seed] Test tokens:', TEST_TOKENS);
    
    // Create mock data in survey-flow.spec.ts
    const mockDataPath = path.join(process.cwd(), 'e2e/.test-seed.json');
    fs.writeFileSync(mockDataPath, JSON.stringify({ 
      TEST_TOKENS,
      mockSurveyData: {
        basicSurvey: {
          id: uuidv4(),
          name: 'Basic Test Survey',
          form_fields: [
            { 
              name: 'welcome',
              type: 'welcome',
              config: { 
                title: 'Welcome to our survey',
                description: 'Thank you for participating in our research.',
                button_text: 'Start'
              }
            },
            {
              name: 'rating',
              type: 'rating',
              config: {
                question: 'How satisfied are you with WithMe?',
                required: true,
                max_rating: 5
              }
            },
            {
              name: 'feedback',
              type: 'textarea',
              config: {
                question: 'How can we improve the experience?',
                required: false,
                placeholder: 'Share your thoughts'
              }
            }
          ]
        },
        multiMilestoneSurvey: {
          id: uuidv4(),
          name: 'Multi-Milestone Test Survey',
          milestones: ['onboarding_complete', 'itinerary_3_items', 'group_formation_complete'],
          form_fields: [
            {
              name: 'welcome',
              type: 'welcome',
              config: {
                title: 'Multi-Milestone Test',
                description: 'This survey tracks progress across milestones.',
                button_text: 'Begin Session'
              }
            }
          ]
        }
      }
    }, null, 2));
    
    console.log('[Seed] Successfully wrote mock data file:', mockDataPath);
    
    return TEST_TOKENS;
  } catch (error) {
    console.error('[Seed] Error seeding research test data:', error);
    return null;
  }
}

/**
 * Clean up all research test data after tests
 * 
 * @param {Object} options - Options for the cleanup function
 * @param {string} [options.logLevel='info'] - Log level (error, warn, info, debug)
 * @param {boolean} [options.removeTokenFile=true] - Whether to remove the token file
 * @returns {boolean} Whether cleanup was successful
 */
export async function cleanupResearchTestDataAfterTests(options = {}) {
  const { 
    logLevel = 'info',
    removeTokenFile = true
  } = options;
  
  console.log('[Cleanup] Starting cleanup of research test data');
  
  // Optionally, remove the test files
  if (removeTokenFile) {
    try {
      const tokensPath = path.join(process.cwd(), 'e2e/test-tokens.json');
      if (fs.existsSync(tokensPath)) {
        fs.unlinkSync(tokensPath);
        console.log('[Cleanup] Removed test-tokens.json file');
      }
      
      const mockDataPath = path.join(process.cwd(), 'e2e/.test-seed.json');
      if (fs.existsSync(mockDataPath)) {
        fs.unlinkSync(mockDataPath);
        console.log('[Cleanup] Removed .test-seed.json file');
      }
    } catch (e) {
      console.warn('[Cleanup] Error removing test files:', e);
    }
  }
  
  console.log('[Cleanup] Cleanup completed');
  return true;
}

// Execute directly when run from command line
if (process.argv.includes('--seed')) {
  console.log('Running seed script directly from command line');
  seedResearchTestData().then(tokens => {
    console.log('Seeding completed with tokens:', tokens);
  }).catch(error => {
    console.error('Error during seeding:', error);
    process.exit(1);
  });
}

if (process.argv.includes('--cleanup')) {
  console.log('Running cleanup script directly from command line');
  cleanupResearchTestDataAfterTests().then(success => {
    console.log('Cleanup completed with status:', success);
  }).catch(error => {
    console.error('Error during cleanup:', error);
    process.exit(1);
  });
} 