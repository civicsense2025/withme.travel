import { test, expect } from '@playwright/test';

test('User can complete the Demo User Research Survey from the homepage', async ({ page }) => {
  // 1. Go to the homepage
  await page.goto('/');

  // 2. Click the "Open Demo Survey" button
  await page.click('text=Open Demo Survey');

  // 3. Wait for the survey modal to appear
  await expect(page.locator('text=Demo User Research Survey')).toBeVisible();

  // 4. Click the "Begin Survey" button
  await page.click('text=Begin Survey');

  // 5. Interact with the first question (example: select an option or fill input)
  // Adjust selectors based on your actual survey question types
  // Example for a radio/select question:
  await page.click('text=Very Satisfied'); // or whatever the first option is

  // 6. Click "Next" or "Submit" as needed
  await page.click('text=Next'); // or 'Submit' if it's the last step

  // 7. Repeat for additional questions if present
  // await page.click('text=Some Option');
  // await page.click('text=Next');

  // 8. Expect the completion/thank you screen
  await expect(page.locator('text=Thank you for your feedback')).toBeVisible();

  // 9. Optionally, close the modal or return to the app
  await page.click('text=Return to App');
});
