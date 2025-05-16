import { test, expect } from '@playwright/test';

/**
 * E2E test for multi-milestone survey flow
 * Tests the complete user journey through a multi-step survey
 */
test.describe('Multi-milestone survey flow', () => {
  test('should complete the product experience survey', async ({ page }) => {
    // Navigate to the survey page with the product experience survey type
    await page.goto('/user-testing/survey/test-token?type=product-experience');
    
    // Expect to see the welcome screen
    await expect(page.getByText('Product Experience Survey')).toBeVisible();
    await expect(page.getByText(/Help us understand your experience/)).toBeVisible();
    
    // Click the start button
    await page.getByRole('button', { name: 'Start Survey' }).click();
    
    // ========= MILESTONE 1: Onboarding =========
    // Expect to see the first milestone
    await expect(page.getByText('How did you hear about withme.travel?')).toBeVisible();
    
    // Answer the first question
    await page.getByRole('combobox').selectOption('Social Media');
    
    // Answer the second question
    await page.getByLabel('What do you hope to accomplish with withme.travel?').fill('Plan a trip with friends easily');
    
    // Go to next milestone
    await page.getByRole('button', { name: 'Next' }).click();
    
    // ========= MILESTONE 2: Trip Planning =========
    // Answer the rating question
    await page.getByLabel('How easy was it to create a trip?').getByText('4').click();
    
    // Answer the text question
    await page.getByLabel('What features would make trip planning easier?').fill('Easier date coordination');
    
    // Go to next milestone
    await page.getByRole('button', { name: 'Next' }).click();
    
    // ========= MILESTONE 3: Feedback =========
    // Answer the likelihood question
    await page.getByLabel('How likely are you to recommend withme.travel to a friend?').getByText('9').click();
    
    // Answer the feedback question
    await page.getByLabel('Any other feedback or suggestions?').fill('Overall great experience!');
    
    // Submit the survey
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // ========= COMPLETION =========
    // Expect to see the completion screen
    await expect(page.getByText('Thank You!')).toBeVisible();
    await expect(page.getByText(/Your feedback has been submitted/)).toBeVisible();
  });

  test('should complete the feature feedback survey', async ({ page }) => {
    // Navigate to the survey page with the feature feedback survey type
    await page.goto('/user-testing/survey/test-token?type=feature-feedback');
    
    // Expect to see the welcome screen
    await expect(page.getByText('Group Planning Feature Feedback')).toBeVisible();
    
    // Click the start button
    await page.getByRole('button', { name: 'Start Survey' }).click();
    
    // ========= MILESTONE 1: Usage =========
    // Answer first question
    await page.getByLabel('Have you used our group planning feature?').getByText('Yes, multiple times').click();
    
    // Answer second question
    await page.getByLabel('How often do you plan trips with groups of friends?').selectOption('Multiple times a year');
    
    // Go to next milestone
    await page.getByRole('button', { name: 'Next' }).click();
    
    // ========= MILESTONE 2: Satisfaction =========
    // Answer rating question
    await page.getByLabel('How would you rate the group voting feature?').getByText('5').click();
    
    // Answer checkbox question - select multiple options
    await page.getByLabel('Voting on destinations').check();
    await page.getByLabel('Shared itinerary').check();
    await page.getByLabel('Budget tracking').check();
    
    // Go to next milestone
    await page.getByRole('button', { name: 'Next' }).click();
    
    // ========= MILESTONE 3: Improvements =========
    // Answer text questions
    await page.getByLabel('What additional features would you like to see in group planning?')
      .fill('Integration with calendar apps to check everyone\'s availability');
    
    await page.getByLabel('How can we make group planning more intuitive?')
      .fill('Better mobile UI for voting');
    
    // Submit the survey
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // ========= COMPLETION =========
    // Expect to see the completion screen
    await expect(page.getByText('Thank You!')).toBeVisible();
  });
  
  test('should show error state for invalid survey type', async ({ page }) => {
    // Navigate to the survey page with an invalid survey type
    await page.goto('/user-testing/survey/test-token?type=non-existent-survey');
    
    // Short wait for the error to appear
    await page.waitForTimeout(1000);
    
    // Expect to see the error screen - this will fail until we implement proper error handling
    await expect(page.getByText('Error')).toBeVisible();
    await expect(page.getByText('Try Again')).toBeVisible();
  });
}); 