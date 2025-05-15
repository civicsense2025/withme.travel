/**
 * SurveyPage - Page Object Model for survey flows
 * 
 * Provides methods to interact with and verify survey components
 */
import { expect } from '@playwright/test';
import { runAccessibilityScan } from '../utils/accessibility-helpers.js';
import { 
  elementExists, 
  takeDebugScreenshot,
  capturePageHtml
} from '../utils/test-helpers.js';

/**
 * Page object for survey flows
 */
export class SurveyPage {
  /**
   * Initialize the page object
   */
  constructor(page, token = 'valid-test-token') {
    this.page = page;
    this.token = token;
    
    // Common selectors
    this.selectors = {
      modal: '[data-testid="survey-modal"]',
      form: '[data-testid="survey-form"]',
      welcome: '[data-testid="survey-welcome-heading"]',
      startButton: '[data-testid="survey-start-button"]',
      nextButton: '[data-testid="survey-next-button"]',
      prevButton: '[data-testid="survey-prev-button"]',
      submitButton: '[data-testid="survey-submit-button"]',
      closeButton: '[data-testid="survey-close-button"]',
      questionHeading: '[data-testid="question-heading"]',
      errorMessage: '[data-testid="error-message"]',
      errorContainer: '[data-testid="error-container"]',
      progressBar: '[data-testid="survey-progress"]',
      completionScreen: '[data-testid="survey-completion"]',
      checkmark: '[data-testid="checkmark"]',
      homeButton: '[data-testid="home-button"]',
      milestoneProgress: '[data-testid="milestone-progress"]',
      // Input field selectors
      textInput: '[data-testid="text-input"]',
      radioGroup: '[data-testid="radio-group"]',
      radioOption: (value) => `[data-testid="radio-option-${value}"]`,
      checkboxGroup: '[data-testid="checkbox-group"]',
      checkboxOption: (value) => `[data-testid="checkbox-option-${value}"]`,
      ratingContainer: '[data-testid="rating-container"]',
      ratingOption: (value) => `[data-testid="rating-${value}"]`
    };
  }
  
  /**
   * Navigate to the survey page
   */
  async goto() {
    await this.page.goto(`/user-testing/survey?token=${this.token}`);
  }
  
  /**
   * Wait for the survey to be visible
   */
  async waitForSurveyVisible() {
    await this.page.waitForSelector(this.selectors.modal, { state: 'visible', timeout: 10000 })
      .catch(async (err) => {
        // Fallback to waiting for welcome screen if modal isn't found
        await this.page.waitForSelector(this.selectors.welcome, { state: 'visible', timeout: 5000 })
          .catch(async (err2) => {
            console.error('Failed to find survey modal or welcome heading');
            await takeDebugScreenshot(this.page, 'survey-not-visible');
            throw err2;
          });
      });
  }
  
  /**
   * Check if survey is visible
   */
  async isSurveyVisible() {
    return elementExists(this.page, [this.selectors.modal, this.selectors.welcome]);
  }
  
  /**
   * Wait for survey to fully load
   */
  async waitForSurveyLoaded() {
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Wait for either welcome screen or first question or error message
      const surveyElements = [
        this.selectors.welcome,
        this.selectors.questionHeading,
        this.selectors.errorContainer
      ];
      
      const isVisible = await elementExists(this.page, surveyElements);
      
      if (!isVisible) {
        await takeDebugScreenshot(this.page, 'survey-load-waiting');
        await this.page.waitForSelector(surveyElements.join(', '), { 
          state: 'visible',
          timeout: 10000
        });
      }
      
      return true;
    } catch (error) {
      console.error('Survey failed to load:', error);
      await takeDebugScreenshot(this.page, 'survey-load-failed');
      await capturePageHtml(this.page, 'survey-load-failed');
      return false;
    }
  }
  
  /**
   * Start the survey
   */
  async startSurvey() {
    try {
      await this.waitForSurveyLoaded();
      const startButtonSelector = this.selectors.startButton;
      
      // First check if button exists
      const buttonExists = await elementExists(this.page, startButtonSelector);
      if (!buttonExists) {
        console.log('Start button not found, checking alternative selectors');
        
        // Try alternative selectors
        const altSelectors = [
          'button:has-text("Start")',
          'button:has-text("Begin Session")', 
          'button.start-button'
        ];
        
        for (const selector of altSelectors) {
          if (await elementExists(this.page, selector)) {
            console.log(`Found alternative start button: ${selector}`);
            await this.page.click(selector);
            return;
          }
        }
        
        throw new Error('Start button not found with any selector');
      }
      
      await this.page.click(startButtonSelector);
    } catch (error) {
      console.error('Error starting survey:', error);
      await takeDebugScreenshot(this.page, 'start-survey-error');
      throw error;
    }
  }
  
  /**
   * Get current question text
   */
  async getCurrentQuestionText() {
    const questionHeading = this.page.locator(this.selectors.questionHeading);
    if (await questionHeading.isVisible()) {
      return questionHeading.textContent();
    }
    return null;
  }
  
  /**
   * Click the next button
   */
  async next() {
    await this.page.click(this.selectors.nextButton);
  }
  
  /**
   * Click the previous button
   */
  async previous() {
    await this.page.click(this.selectors.prevButton);
  }
  
  /**
   * Fill a text input field
   */
  async answerText(value, index = 0) {
    const textInput = this.page.locator(this.selectors.textInput);
    await textInput.nth(index).fill(value);
  }
  
  /**
   * Select a radio option
   */
  async answerRadio(optionValue) {
    try {
      // Try to find the option by specific data-testid first
      const radioSelector = this.selectors.radioOption(optionValue);
      if (await elementExists(this.page, radioSelector)) {
        await this.page.click(radioSelector);
        return;
      }
      
      // Fallback to label text
      await this.page.click(`label:has-text("${optionValue}")`);
    } catch (error) {
      console.error(`Error selecting radio option ${optionValue}:`, error);
      await takeDebugScreenshot(this.page, `radio-option-error-${optionValue}`);
      throw error;
    }
  }
  
  /**
   * Select checkbox options
   */
  async answerCheckbox(optionValues) {
    if (!Array.isArray(optionValues)) {
      optionValues = [optionValues];
    }
    
    for (const value of optionValues) {
      try {
        // Try to find by data-testid
        const checkboxSelector = this.selectors.checkboxOption(value);
        if (await elementExists(this.page, checkboxSelector)) {
          await this.page.click(checkboxSelector);
          continue;
        }
        
        // Fallback to label text
        await this.page.click(`label:has-text("${value}")`);
      } catch (error) {
        console.error(`Error selecting checkbox option ${value}:`, error);
        await takeDebugScreenshot(this.page, `checkbox-option-error-${value}`);
        throw error;
      }
    }
  }
  
  /**
   * Select a rating
   */
  async answerRating(value) {
    try {
      // Try data-testid first
      const ratingSelector = this.selectors.ratingOption(value);
      if (await elementExists(this.page, ratingSelector)) {
        await this.page.click(ratingSelector);
        return;
      }
      
      // Fallback to generic selectors
      const ratingContainer = await this.page.locator(this.selectors.ratingContainer);
      if (await ratingContainer.isVisible()) {
        // Find all rating buttons
        const ratingButtons = this.page.locator(`${this.selectors.ratingContainer} button`);
        // Click the one at the specified index (value - 1)
        await ratingButtons.nth(value - 1).click();
        return;
      }
      
      // Last resort: click any button with the text
      await this.page.click(`button:has-text("${value}")`);
    } catch (error) {
      console.error(`Error selecting rating ${value}:`, error);
      await takeDebugScreenshot(this.page, `rating-option-error-${value}`);
      throw error;
    }
  }
  
  /**
   * Select a dropdown option
   */
  async answerSelect(value) {
    try {
      // Open the select dropdown
      await this.page.click('text="Select an option"');
      // Click the option
      await this.page.click(`text="${value}"`);
    } catch (error) {
      console.error(`Error selecting option ${value}:`, error);
      await takeDebugScreenshot(this.page, `select-option-error-${value}`);
      throw error;
    }
  }
  
  /**
   * Submit the survey
   */
  async submit() {
    await this.page.click(this.selectors.submitButton);
    await this.page.waitForSelector(this.selectors.completionScreen, { state: 'visible' });
  }
  
  /**
   * Check if there's a validation error displayed
   */
  async hasValidationError() {
    return elementExists(this.page, '[data-testid="validation-error"]');
  }
  
  /**
   * Check if expired session error is shown
   */
  async hasExpiredSessionError() {
    const errorVisible = await elementExists(this.page, this.selectors.errorContainer);
    if (!errorVisible) return false;
    
    const errorText = await this.page.locator(this.selectors.errorMessage).textContent();
    return errorText.toLowerCase().includes('expired');
  }
  
  /**
   * Check if invalid token error is shown
   */
  async hasInvalidTokenError() {
    const errorVisible = await elementExists(this.page, this.selectors.errorContainer);
    if (!errorVisible) return false;
    
    const errorText = await this.page.locator(this.selectors.errorMessage).textContent();
    return errorText.toLowerCase().includes('invalid') || errorText.toLowerCase().includes('not found');
  }
  
  /**
   * Check if this is a multi-milestone survey
   */
  async isMultiMilestoneSurvey() {
    return elementExists(this.page, this.selectors.milestoneProgress);
  }
  
  /**
   * Get milestone progress text
   */
  async getMilestoneProgress() {
    if (await elementExists(this.page, this.selectors.milestoneProgress)) {
      return this.page.locator(this.selectors.milestoneProgress).textContent();
    }
    return null;
  }
  
  /**
   * Return to home page after survey completion
   */
  async returnHome() {
    await this.page.click(this.selectors.homeButton);
  }
  
  /**
   * Get performance metrics from the survey
   */
  async getPerformanceMetrics() {
    // Simplified performance metrics for this example
    return {
      navigationTime: 1000, // Mock value for now
      responseTime: 500,    // Mock value for now
    };
  }
  
  /**
   * Verify events were tracked
   */
  async verifyEvents(events) {
    if (!events || events.length === 0) {
      return null;
    }
    
    return {
      hasProgressEvent: events.some(e => e.event_type?.includes('progress')),
      hasCompletionEvent: events.some(e => e.event_type?.includes('complete')),
      hasMilestoneEvent: events.some(e => e.event_type?.includes('milestone'))
    };
  }
} 