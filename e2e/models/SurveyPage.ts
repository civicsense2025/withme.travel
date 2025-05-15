/**
 * Survey Page Object Model
 * 
 * Encapsulates interactions with the survey page to make tests more 
 * maintainable and less brittle.
 */
import { Page, expect } from '@playwright/test';
import { config } from '../test-config';
import { 
  findElement, 
  takeDebugScreenshot,
  capturePageHtml,
  elementExists,
  EventRequest
} from '../utils/test-helpers';

/**
 * Options for answer submission
 */
interface AnswerOptions {
  // For all question types
  waitAfterAnswer?: number;
  
  // For text inputs
  clearExisting?: boolean;
  
  // For checkboxes
  multiSelect?: boolean;
}

/**
 * Survey page object model
 */
export class SurveyPage {
  constructor(
    private page: Page, 
    private token: string
  ) {}
  
  /**
   * Navigate to the survey page
   */
  async goto() {
    await this.page.goto(`/user-testing/survey?token=${this.token}`);
    await takeDebugScreenshot(this.page, `survey-${this.token}-start`);
  }
  
  /**
   * Start the survey
   */
  async startSurvey() {
    const startButton = await findElement(this.page, config.selectors.startButton);
    await startButton.click();
    console.log('Started survey');
    
    // Verify progress indicator is shown
    const progressBar = await findElement(this.page, config.selectors.progressBar);
    await expect(progressBar).toBeVisible();
  }
  
  /**
   * Go to next question
   */
  async next() {
    const nextButton = await findElement(this.page, config.selectors.nextButton);
    await nextButton.click();
    console.log('Clicked next button');
    await this.page.waitForTimeout(config.timeouts.animation);
  }
  
  /**
   * Go to previous question
   */
  async previous() {
    const previousButton = await findElement(this.page, config.selectors.previousButton);
    await previousButton.click();
    console.log('Clicked previous button');
    await this.page.waitForTimeout(config.timeouts.animation);
  }
  
  /**
   * Submit the survey
   */
  async submit() {
    const submitButton = await findElement(this.page, config.selectors.submitButton);
    await submitButton.click();
    console.log('Submitted survey');
    
    // Take a screenshot of completion screen
    await takeDebugScreenshot(this.page, `survey-${this.token}-complete`);
    
    // Verify completion screen
    await this.verifyCompletionScreen();
  }
  
  /**
   * Check if validation error is present
   */
  async hasValidationError(): Promise<boolean> {
    return await elementExists(this.page, config.selectors.validationError);
  }
  
  /**
   * Get current milestone progress text
   */
  async getMilestoneProgress(): Promise<string> {
    try {
      const progressElement = await this.page.locator('[data-testid="milestone-progress"]');
      return await progressElement.textContent() || '';
    } catch (error) {
      return '';
    }
  }
  
  /**
   * Check if survey has multiple milestones
   */
  async isMultiMilestoneSurvey(): Promise<boolean> {
    const progress = await this.getMilestoneProgress();
    return progress.includes('/');
  }
  
  /**
   * Answer a rating question
   */
  async answerRating(starIndex: number, options: AnswerOptions = {}) {
    const { waitAfterAnswer = 0 } = options;
    
    // Use 0-based index (0 = first star, 4 = fifth star)
    const stars = this.page.locator('label[for^="rating-"]');
    const count = await stars.count();
    
    if (starIndex >= count) {
      throw new Error(`Star index ${starIndex} out of range (0-${count-1})`);
    }
    
    await stars.nth(starIndex).click();
    console.log(`Selected rating ${starIndex + 1}`);
    
    if (waitAfterAnswer > 0) {
      await this.page.waitForTimeout(waitAfterAnswer);
    }
  }
  
  /**
   * Answer a text input question
   */
  async answerText(text: string, options: AnswerOptions = {}) {
    const { clearExisting = false, waitAfterAnswer = 0 } = options;
    
    const textField = await findElement(this.page, config.selectors.textInput);
    
    if (clearExisting) {
      await textField.clear();
    }
    
    await textField.fill(text);
    console.log(`Entered text: "${text}"`);
    
    if (waitAfterAnswer > 0) {
      await this.page.waitForTimeout(waitAfterAnswer);
    }
  }
  
  /**
   * Answer a radio question
   */
  async answerRadio(labelText: string, options: AnswerOptions = {}) {
    const { waitAfterAnswer = 0 } = options;
    
    await this.page.getByText(labelText).click();
    console.log(`Selected radio option: "${labelText}"`);
    
    if (waitAfterAnswer > 0) {
      await this.page.waitForTimeout(waitAfterAnswer);
    }
  }
  
  /**
   * Answer a checkbox question
   */
  async answerCheckbox(labelTexts: string[], options: AnswerOptions = {}) {
    const { waitAfterAnswer = 0 } = options;
    
    for (const labelText of labelTexts) {
      await this.page.getByLabel(labelText).check();
      console.log(`Checked option: "${labelText}"`);
    }
    
    if (waitAfterAnswer > 0) {
      await this.page.waitForTimeout(waitAfterAnswer);
    }
  }
  
  /**
   * Answer a select dropdown question
   */
  async answerSelect(value: string, options: AnswerOptions = {}) {
    const { waitAfterAnswer = 0 } = options;
    
    await this.page.locator('select').selectOption(value);
    console.log(`Selected dropdown option: "${value}"`);
    
    if (waitAfterAnswer > 0) {
      await this.page.waitForTimeout(waitAfterAnswer);
    }
  }
  
  /**
   * Verify survey completion screen
   */
  async verifyCompletionScreen() {
    // Check for thank you message
    const thankYouMessage = await findElement(this.page, config.selectors.thankYouMessage);
    await expect(thankYouMessage).toBeVisible();
    
    // Try to find the checkmark (if present)
    const hasCheckmark = await elementExists(this.page, config.selectors.checkmark);
    if (hasCheckmark) {
      console.log('Found completion checkmark');
    }
    
    // Wait for animation to complete
    await this.page.waitForTimeout(config.timeouts.animation);
  }
  
  /**
   * Return to home after completing survey
   */
  async returnHome() {
    const homeButton = await findElement(this.page, config.selectors.homeButton);
    await homeButton.click();
    console.log('Returned home');
    
    // Verify we've navigated away
    await expect(this.page).toHaveURL(/\//);
  }
  
  /**
   * Verify events were tracked correctly
   */
  async verifyEvents(events: EventRequest[]): Promise<{
    hasProgressEvent: boolean;
    hasMilestoneEvent: boolean;
    hasCompletionEvent: boolean;
  } | null> {
    // Tracked events are stored on the page object by the test
    if (!events || events.length === 0) {
      console.warn('No events were tracked or provided for verification');
      return null;
    }
    
    // Check for progress events
    const hasProgressEvent = events.some(event => 
      event.event_type?.includes('progress') || 
      typeof event.progress === 'number'
    );
    
    // Check for milestone events
    const hasMilestoneEvent = events.some(event => 
      event.event_type?.includes('milestone') || 
      event.milestone
    );
    
    // Check for completion event
    const hasCompletionEvent = events.some(event => 
      event.event_type?.includes('complete')
    );
    
    console.log(`Events verified - Progress: ${hasProgressEvent}, Milestone: ${hasMilestoneEvent}, Completion: ${hasCompletionEvent}`);
    
    return {
      hasProgressEvent,
      hasMilestoneEvent,
      hasCompletionEvent
    };
  }
  
  /**
   * Check if there's an expired session error
   */
  async hasExpiredSessionError(): Promise<boolean> {
    await capturePageHtml(this.page, 'expired-session');
    return await elementExists(this.page, config.selectors.errorContainer);
  }
  
  /**
   * Check if there's an invalid token error
   */
  async hasInvalidTokenError(): Promise<boolean> {
    await capturePageHtml(this.page, 'invalid-token');
    return await elementExists(this.page, config.selectors.errorMessage);
  }
} 