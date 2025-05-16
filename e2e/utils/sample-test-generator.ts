/**
 * Sample Test Generator for Research System
 * 
 * This utility creates sample test data for multi-milestone surveys and forms
 * to be used in E2E tests without requiring tokens.
 */
import { ResearchDataHelper, FormData } from './research-data-helpers';
import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Define common milestone types from the constants
const MILESTONE_TYPES = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  ITINERARY_3_ITEMS: 'itinerary_3_items',
  GROUP_FORMATION_COMPLETE: 'group_formation_complete',
  VOTE_PROCESS_USED: 'vote_process_used',
  TRIP_FROM_TEMPLATE: 'trip_from_template',
};

/**
 * Creates a sample onboarding feedback survey
 */
export function createOnboardingSurvey(): FormData {
  return {
    title: 'Onboarding Experience Feedback',
    description: 'Help us improve our onboarding process with your feedback',
    milestone_trigger: MILESTONE_TYPES.ONBOARDING_COMPLETE,
    fields: [
      {
        label: 'How would you rate your onboarding experience?',
        type: 'rating',
        required: true,
        milestone: MILESTONE_TYPES.ONBOARDING_COMPLETE,
        order: 1
      },
      {
        label: 'What could we improve about the onboarding process?',
        type: 'textarea',
        placeholder: 'Please share your thoughts...',
        required: false,
        milestone: MILESTONE_TYPES.ONBOARDING_COMPLETE,
        order: 2
      }
    ],
    completionMessage: 'Thanks for your feedback on our onboarding process!'
  };
}

/**
 * Creates a comprehensive user journey survey spanning multiple milestones
 */
export function createUserJourneySurvey(): FormData {
  return {
    title: 'Travel Planning Journey Feedback',
    description: 'Help us understand your experience at different stages of travel planning',
    milestones: [
      MILESTONE_TYPES.ONBOARDING_COMPLETE,
      MILESTONE_TYPES.GROUP_FORMATION_COMPLETE,
      MILESTONE_TYPES.ITINERARY_3_ITEMS,
      MILESTONE_TYPES.VOTE_PROCESS_USED,
      MILESTONE_TYPES.TRIP_FROM_TEMPLATE
    ],
    milestone_trigger: MILESTONE_TYPES.ONBOARDING_COMPLETE,
    fields: [
      // Onboarding milestone questions
      {
        label: 'How clear was our onboarding process?',
        type: 'rating',
        required: true,
        milestone: MILESTONE_TYPES.ONBOARDING_COMPLETE,
        order: 1
      },
      {
        label: 'What aspects of the onboarding were most helpful?',
        type: 'checkbox',
        options: ['Tutorial walkthrough', 'Example trips', 'Feature explanations', 'User interface design'],
        required: true,
        milestone: MILESTONE_TYPES.ONBOARDING_COMPLETE,
        order: 2
      },
      
      // Group formation milestone questions
      {
        label: 'How easy was it to add travel companions to your trip?',
        type: 'rating',
        required: true,
        milestone: MILESTONE_TYPES.GROUP_FORMATION_COMPLETE,
        order: 1
      },
      {
        label: 'Did everyone you invited join your trip planning?',
        type: 'radio',
        options: ['Yes, everyone joined', 'Most people joined', 'Only a few joined', 'No one joined yet'],
        required: true,
        milestone: MILESTONE_TYPES.GROUP_FORMATION_COMPLETE,
        order: 2
      },
      
      // Itinerary milestone questions
      {
        label: 'How satisfied are you with the itinerary creation experience?',
        type: 'rating',
        required: true,
        milestone: MILESTONE_TYPES.ITINERARY_3_ITEMS,
        order: 1
      },
      {
        label: 'What types of items did you add to your itinerary?',
        type: 'checkbox',
        options: ['Accommodations', 'Restaurants', 'Activities', 'Transport', 'Notes'],
        required: true,
        milestone: MILESTONE_TYPES.ITINERARY_3_ITEMS,
        order: 2
      },
      
      // Voting milestone questions
      {
        label: 'How useful was the voting feature for group decision making?',
        type: 'rating',
        required: true,
        milestone: MILESTONE_TYPES.VOTE_PROCESS_USED,
        order: 1
      },
      {
        label: 'How could we improve the voting process?',
        type: 'textarea',
        required: false,
        milestone: MILESTONE_TYPES.VOTE_PROCESS_USED,
        order: 2
      },
      
      // Template usage milestone questions
      {
        label: 'Which trip template did you use?',
        type: 'select',
        options: ['Weekend Getaway', 'Beach Vacation', 'City Break', 'Road Trip', 'Backpacking Adventure', 'Other'],
        required: true,
        milestone: MILESTONE_TYPES.TRIP_FROM_TEMPLATE,
        order: 1
      },
      {
        label: 'How accurately did the template match your needs?',
        type: 'rating',
        required: true,
        milestone: MILESTONE_TYPES.TRIP_FROM_TEMPLATE,
        order: 2
      }
    ],
    completionMessage: 'Thank you for providing feedback throughout your travel planning journey!'
  };
}

/**
 * Generates test form data and saves to a file for E2E tests to use
 * 
 * @param page Playwright page instance
 */
export async function generateAndSaveTestData(page: Page): Promise<{
  formIds: Record<string, string>,
  testData: Record<string, FormData>
}> {
  const dataHelper = new ResearchDataHelper(page);
  const testDir = path.join(process.cwd(), 'test-results');
  
  // Ensure test directory exists
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Generate test surveys
  const testData = {
    onboardingSurvey: createOnboardingSurvey(),
    userJourneySurvey: createUserJourneySurvey(),
    standardSurvey: {
      title: 'Standard Feedback Survey',
      description: 'Simple feedback form for user testing',
      fields: [
        {
          label: 'How would you rate your experience?',
          type: 'rating',
          required: true
        },
        {
          label: 'What did you like most?',
          type: 'textarea',
          required: true
        },
        {
          label: 'What could be improved?',
          type: 'textarea',
          required: true
        }
      ],
      completionMessage: 'Thanks for your feedback!'
    }
  };
  
  // Create forms in the database
  const formIds: Record<string, string> = {};
  for (const [key, formData] of Object.entries(testData)) {
    try {
      formIds[key] = await dataHelper.createTestForm(formData);
      console.log(`Created ${key} with ID: ${formIds[key]}`);
    } catch (error) {
      console.error(`Failed to create ${key}:`, error);
    }
  }
  
  // Create milestone triggers for multi-milestone survey
  if (formIds.userJourneySurvey) {
    const milestones = [
      MILESTONE_TYPES.ONBOARDING_COMPLETE,
      MILESTONE_TYPES.GROUP_FORMATION_COMPLETE,
      MILESTONE_TYPES.ITINERARY_3_ITEMS,
      MILESTONE_TYPES.VOTE_PROCESS_USED,
      MILESTONE_TYPES.TRIP_FROM_TEMPLATE
    ];
    
    for (const milestone of milestones) {
      try {
        await dataHelper.createMilestoneTrigger({
          formId: formIds.userJourneySurvey,
          milestone
        });
        console.log(`Created trigger for milestone: ${milestone}`);
      } catch (error) {
        console.error(`Failed to create trigger for ${milestone}:`, error);
      }
    }
  }
  
  // Save to file for tests to use
  const testDataPath = path.join(testDir, 'test-forms.json');
  fs.writeFileSync(
    testDataPath,
    JSON.stringify({ formIds, testData }, null, 2)
  );
  console.log(`Test data saved to: ${testDataPath}`);
  
  return { formIds, testData };
}

/**
 * Load test form IDs from file
 */
export function loadTestFormIds(): Record<string, string> {
  const testDataPath = path.join(process.cwd(), 'test-results', 'test-forms.json');
  
  if (fs.existsSync(testDataPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
      return data.formIds || {};
    } catch (error) {
      console.error('Failed to load test form IDs:', error);
    }
  }
  
  return {};
} 