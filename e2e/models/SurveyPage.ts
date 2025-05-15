/**
 * SurveyPage - Page Object Model for survey research interactions
 * 
 * This class encapsulates all interactions with the survey research system,
 * providing a clean, reliable API for test files to use.
 */
import { Page, Locator, expect } from '@playwright/test';
import { wait } from '../utils/test-helpers.js';
import { getAccessibilityViolations } from '../utils/accessibility-helpers.js';
import { TestEnvironment } from '../test-environment';
import { AxeBuilder } from '@axe-core/playwright';

export interface SurveyPageOptions {
  /** Test token for the survey */
  token: string;
  /** Base URL for the survey page (defaults to environment value) */
  baseUrl?: string;
  /** Should automatically validate common elements on navigation */
  autoValidate?: boolean;
  /** Debug mode - takes screenshots on key actions */
  debug?: boolean;
}

/**
 * Page Object Model for the survey research flow
 */
export class SurveyPage {
  /** Playwright page object */
  private page: Page;
  /** Survey token */
  private token: string;
  /** Base URL for the survey */
  private baseUrl: string;
  /** Debug mode flag */
  private debug: boolean;
  /** Whether to validate common elements automatically */
  private autoValidate: boolean;

  // Store locators for reuse
  private locators = {
    welcomeHeading: 'h1:has-text("Welcome"), h2:has-text("Welcome"), div[role="heading"]:has-text("Welcome")',
    startButton: 'button:has-text("Start Survey"), button:has-text("Begin")',
    nextButton: 'button:has-text("Next"), button:has-text("Continue")',
    backButton: 'button:has-text("Back"), button:has-text("Previous")',
    submitButton: 'button:has-text("Submit"), button:has-text("Finish")',
    completionScreen: '.survey-completion, .thank-you-screen, .completion-screen',
    confirmationCode: '.confirmation-code, code, .code-block',
    errorMessage: '.error-message, .alert-error, div[role="alert"]',
    rating: 'input[type="radio"]',
    textInput: 'textarea, input[type="text"]',
    selectInput: 'select',
    checkboxInput: 'input[type="checkbox"]',
    questionTitle: '.question-title, .question h2, .question h3',
    modal: '.modal, [role="dialog"]',
    milestoneProgress: '.milestone-progress, .progress-indicator',
    surveyContainer: '.survey-container, .research-survey, main'
  };

  // Common selectors with fallbacks
  private startButtonSelectors = [
    '[data-testid="survey-start-button"]',
    'button:has-text("Begin")',
    'button:has-text("Start")',
    '.start-button'
  ];
  
  private nextButtonSelectors = [
    '[data-testid="survey-next-button"]',
    'button:has-text("Next")',
    'button:has-text("Continue")'
  ];
  
  private submitButtonSelectors = [
    '[data-testid="survey-submit-button"]',
    'button:has-text("Submit")',
    'button:has-text("Finish")',
    'button:has-text("Complete")'
  ];
  
  private errorMessageSelectors = [
    '[data-testid="error-message"]',
    '.error-message',
    'text="invalid token"',
    '[role="alert"]'
  ];

  /**
   * Create a new SurveyPage instance
   * 
   * @param page The Playwright page object
   * @param options Options for the survey page
   */
  constructor(page: Page, options: SurveyPageOptions | string) {
    this.page = page;
    
    // Handle string argument (legacy API support)
    if (typeof options === 'string') {
      this.token = options;
      this.baseUrl = process.env.SURVEY_BASE_URL || 'http://localhost:3000';
      this.debug = process.env.DEBUG_SURVEY_TESTS === 'true';
      this.autoValidate = true;
    } else {
      this.token = options.token;
      this.baseUrl = options.baseUrl || process.env.SURVEY_BASE_URL || 'http://localhost:3000';
      this.debug = options.debug || process.env.DEBUG_SURVEY_TESTS === 'true';
      this.autoValidate = options.autoValidate !== false;
    }
  }

  /**
   * Navigate to the survey page
   */
  async goto(): Promise<void> {
    // Construct URL with token
    const url = `${this.baseUrl}/user-testing/survey?token=${this.token}`;
    await this.page.goto(url);
    
    // Wait for page to be ready
    await this.page.waitForLoadState('networkidle');
    
    if (this.debug) {
      console.log(`Navigated to survey with token: ${this.token}`);
      await this.takeScreenshot('survey-loaded');
    }
    
    // Auto-validate if enabled
    if (this.autoValidate) {
      try {
        await this.validatePageLoaded();
      } catch (error) {
        if (this.debug) {
          console.error('Page validation failed:', error);
          await this.takeScreenshot('validation-failure');
          await this.captureHtml('validation-failure');
        }
        throw error;
      }
    }
  }

  /**
   * Start the survey
   */
  async startSurvey(): Promise<void> {
    const startButton = this.page.locator(this.locators.startButton);
    await expect(startButton).toBeVisible();
    await startButton.click();
    
    if (this.debug) {
      console.log('Started survey');
      await this.takeScreenshot('survey-started');
    }
    
    // Wait for first question to appear
    await this.waitForQuestion();
  }

  /**
   * Answer the current question (auto-detects question type)
   * 
   * @param answerIndex Index of the answer to select (for ratings/selects)
   * @param answerText Text to enter (for text inputs)
   */
  async answerQuestion(answerIndex: number = 0, answerText: string = 'Test answer'): Promise<void> {
    // Try to determine question type
    const hasRating = await this.page.locator(this.locators.rating).isVisible();
    const hasText = await this.page.locator(this.locators.textInput).isVisible();
    const hasSelect = await this.page.locator(this.locators.selectInput).isVisible();
    const hasCheckbox = await this.page.locator(this.locators.checkboxInput).isVisible();
    
    if (hasRating) {
      await this.answerRating(answerIndex);
    } else if (hasText) {
      await this.answerText(answerText);
    } else if (hasSelect) {
      await this.answerSelect(answerIndex);
    } else if (hasCheckbox) {
      await this.answerCheckbox(answerIndex);
    } else {
      throw new Error('Could not determine question type');
    }
    
    if (this.debug) {
      console.log(`Answered question (index: ${answerIndex}, text: ${answerText})`);
      await this.takeScreenshot('question-answered');
    }
  }

  /**
   * Answer a rating question
   * 
   * @param rating Rating value to select (0-based index)
   */
  async answerRating(rating: number = 3): Promise<void> {
    const ratingInputs = this.page.locator(this.locators.rating);
    await expect(ratingInputs).toBeVisible();
    
    const count = await ratingInputs.count();
    if (rating >= count) {
      rating = count - 1; // Adjust if out of bounds
    }
    
    await ratingInputs.nth(rating).click();
  }

  /**
   * Answer a text question
   * 
   * @param text Text to enter
   */
  async answerText(text: string = 'Test response from automated test'): Promise<void> {
    const textInput = this.page.locator(this.locators.textInput);
    await expect(textInput).toBeVisible();
    await textInput.fill(text);
  }

  /**
   * Answer a select question
   * 
   * @param optionIndex Index of option to select (0-based)
   */
  async answerSelect(optionIndex: number | string): Promise<void> {
    const selectInput = this.page.locator(this.locators.selectInput);
    await expect(selectInput).toBeVisible();
    
    if (typeof optionIndex === 'number') {
      // Get all options
      const options = await selectInput.locator('option').all();
      // Skip the first one if it's a placeholder
      const adjustedIndex = options.length > 0 && 
        await options[0].getAttribute('value') === '' ? optionIndex + 1 : optionIndex;
      
      // Select by index
      const value = await options[adjustedIndex]?.getAttribute('value');
      if (value) {
        await selectInput.selectOption({ value });
      } else {
        // Fallback to index selection
        await selectInput.selectOption({ index: adjustedIndex });
      }
    } else {
      // Select by text
      await selectInput.selectOption({ label: optionIndex });
    }
  }

  /**
   * Answer a checkbox question
   * 
   * @param index Index of checkbox to check (0-based)
   */
  async answerCheckbox(index: number = 0): Promise<void> {
    const checkboxes = this.page.locator(this.locators.checkboxInput);
    await expect(checkboxes).toBeVisible();
    
    // Click the checkbox at the given index
    await checkboxes.nth(index).check();
  }

  /**
   * Go to the next question
   */
  async goToNextQuestion(): Promise<void> {
    const nextButton = this.page.locator(this.locators.nextButton);
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    
    // Wait for new question to load
    await this.waitForQuestion();
  }

  /**
   * Go to the previous question
   */
  async goToPreviousQuestion(): Promise<void> {
    const backButton = this.page.locator(this.locators.backButton);
    await expect(backButton).toBeVisible();
    await backButton.click();
    
    // Wait for new question to load
    await this.waitForQuestion();
  }

  /**
   * Submit the survey
   */
  async submitSurvey(): Promise<void> {
    const submitButton = this.page.locator(this.locators.submitButton);
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    
    // Wait for completion screen
    await this.page.waitForSelector(this.locators.completionScreen, { 
      state: 'visible', 
      timeout: 10000 
    });
    
    if (this.debug) {
      console.log('Survey submitted');
      await this.takeScreenshot('survey-completed');
    }
  }
  
  /**
   * Complete the entire survey with default answers
   */
  async completeEntireSurvey(): Promise<void> {
    let isLastQuestion = false;
    let questionCount = 0;
    const maxQuestions = 20; // Safety limit
    
    while (!isLastQuestion && questionCount < maxQuestions) {
      // Answer current question
      await this.answerQuestion();
      questionCount++;
      
      // Check if there's a submit button (last question)
      isLastQuestion = await this.page.locator(this.locators.submitButton).isVisible();
      
      if (isLastQuestion) {
        // Submit the survey
        await this.submitSurvey();
      } else {
        // Go to next question
        await this.goToNextQuestion();
      }
    }
    
    if (this.debug) {
      console.log(`Completed survey with ${questionCount} questions`);
    }
  }

  /**
   * Check if the survey is completed
   */
  async isCompletionScreenVisible(): Promise<boolean> {
    return await this.page.locator(this.locators.completionScreen).isVisible();
  }

  /**
   * Get the confirmation code from the completion screen
   */
  async getConfirmationCode(): Promise<string | null> {
    if (!await this.isCompletionScreenVisible()) {
      return null;
    }
    
    const codeElement = this.page.locator(this.locators.confirmationCode);
    if (await codeElement.isVisible()) {
      return await codeElement.textContent();
    }
    
    return null;
  }

  /**
   * Check if this is a multi-milestone survey
   */
  async isMultiMilestoneSurvey(): Promise<boolean> {
    return await this.page.locator(this.locators.milestoneProgress).isVisible();
  }

  /**
   * Get the current milestone progress
   */
  async getMilestoneProgress(): Promise<string | null> {
    const progressElement = this.page.locator(this.locators.milestoneProgress);
    if (await progressElement.isVisible()) {
      return await progressElement.textContent();
    }
    
    return null;
  }

  /**
   * Check if there is an expired session error
   */
  async hasExpiredSessionError(): Promise<boolean> {
    const errorElement = this.page.locator(this.locators.errorMessage);
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      return errorText?.toLowerCase().includes('expired') || false;
    }
    
    return false;
  }

  /**
   * Check if there is an invalid token error
   */
  async hasInvalidTokenError(): Promise<boolean> {
    const errorElement = this.page.locator(this.locators.errorMessage);
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      return errorText?.toLowerCase().includes('invalid') || false;
    }
    
    return false;
  }

  /**
   * Wait for a question to be visible
   */
  private async waitForQuestion(): Promise<void> {
    await this.page.waitForSelector(this.locators.questionTitle, { 
      state: 'visible', 
      timeout: 5000 
    });
  }

  /**
   * Validate that the page is properly loaded
   */
  private async validatePageLoaded(): Promise<void> {
    // Check for errors first
    const errorElement = this.page.locator(this.locators.errorMessage);
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      throw new Error(`Survey error: ${errorText}`);
    }
    
    // Check for welcome screen or first question
    const welcomeVisible = await this.page.locator(this.locators.welcomeHeading).isVisible();
    const questionVisible = await this.page.locator(this.locators.questionTitle).isVisible();
    
    if (!welcomeVisible && !questionVisible) {
      throw new Error('Neither welcome screen nor question is visible');
    }
    
    // Success
    if (this.debug) {
      console.log('Page validated successfully');
    }
  }

  /**
   * Take a screenshot for debugging
   */
  private async takeScreenshot(name: string): Promise<void> {
    if (!this.debug) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    
    try {
      await this.page.screenshot({ 
        path: `test-results/${filename}`,
        fullPage: true 
      });
    } catch (error) {
      console.error(`Failed to take screenshot: ${error}`);
    }
  }

  /**
   * Capture page HTML for debugging
   */
  private async captureHtml(name: string): Promise<void> {
    if (!this.debug) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.html`;
    
    try {
      const html = await this.page.content();
      const fs = require('fs');
      const path = require('path');
      
      // Ensure directory exists
      const dir = 'test-results';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(dir, filename), html);
    } catch (error) {
      console.error(`Failed to capture HTML: ${error}`);
    }
  }

  /**
   * Run accessibility checks on the current page
   * 
   * @returns Array of accessibility violations
   */
  async checkAccessibility(): Promise<any[]> {
    return await getAccessibilityViolations(this.page);
  }

  /**
   * Take a screenshot for debugging purposes
   */
  async takeScreenshotForDebugging(): Promise<void> {
    const path = `./test-results/${Date.now()}.png`;
    await this.page.screenshot({ path, fullPage: true });
    console.log(`Took screenshot: ${path}`);
  }

  /**
   * Log the current page state for debugging
   */
  async logPageState(message: string) {
    console.log(`DEBUG [${message}]:`);
    console.log(`- URL: ${this.page.url()}`);
    
    // Log visible buttons
    const buttons = await this.page.getByRole('button').all();
    console.log(`- Visible buttons: ${buttons.length}`);
    for (const button of buttons) {
      const text = await button.textContent();
      console.log(`  • ${text?.trim() || '[no text]'}`);
    }
    
    // Log form elements
    const inputs = await this.page.locator('input, textarea, select').all();
    console.log(`- Form elements: ${inputs.length}`);
  }

  /**
   * Find an element using multiple selectors with fallbacks
   */
  async findElement(selectors: string[], timeout = 10000): Promise<Locator> {
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: i === 0 ? timeout : 1000 })) {
          console.log(`Found element with selector: ${selector}`);
          return element;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // If we reach here, none of the selectors worked
    console.error(`Failed to find element with any of the selectors:`, selectors);
    throw new Error(`Could not find element with selectors: ${selectors.join(', ')}`);
  }

  /**
   * Start the survey by clicking the start button
   */
  async startSurveyByClickingButton(timeout = 10000) {
    console.log('Attempting to start survey...');
    await this.logPageState("before clicking start");
    
    const startButton = await this.findElement(this.startButtonSelectors, timeout);
    await startButton.click();
  }

  /**
   * Click the next button to advance to the next question
   */
  async clickNextButton() {
    const nextButton = await this.findElement(this.nextButtonSelectors);
    await nextButton.click();
  }

  /**
   * Submit the survey
   */
  async submitSurveyByClickingButton() {
    const submitButton = await this.findElement(this.submitButtonSelectors);
    await submitButton.click();
  }

  /**
   * Fill a text input question
   */
  async fillTextQuestion(text: string) {
    const textInput = this.page.locator('input[type="text"], textarea').first();
    await textInput.fill(text);
  }

  /**
   * Select a rating
   */
  async selectRating(rating: number) {
    // Find all rating options and click the one matching the rating
    const ratingOption = this.page.locator(`[role="radio"]`).nth(rating - 1);
    await ratingOption.click();
  }

  /**
   * Select an option from a dropdown
   */
  async selectDropdownOption(optionText: string) {
    await this.page.locator('select').selectOption({ label: optionText });
  }

  /**
   * Check for error message presence
   */
  async checkForError(timeout = 10000) {
    const errorElement = await this.findElement(this.errorMessageSelectors, timeout);
    await expect(errorElement).toBeVisible();
    return errorElement.textContent();
  }

  /**
   * Wait for completion message
   */
  async waitForCompletion(timeout = 10000) {
    await this.page
      .locator('[data-testid="survey-completion"], .survey-completion, text="Thank you"')
      .first()
      .waitFor({ timeout });
  }

  /**
   * Perform accessibility check and return violations (optionally filtered)
   */
  async checkAccessibilityWithAxeBuilder(options?: {
    excludeSelectors?: string[];
    disabledRules?: string[];
  }) {
    let builder = new AxeBuilder({ page: this.page });
    
    // Apply exclusions if provided
    if (options?.excludeSelectors?.length) {
      builder = builder.exclude(options.excludeSelectors);
    }
    
    // Disable specific rules if provided
    if (options?.disabledRules?.length) {
      const rules: Record<string, { enabled: boolean }> = {};
      options.disabledRules.forEach(rule => {
        rules[rule] = { enabled: false };
      });
      
      builder = builder.options({
        rules
      });
    }
    
    return await builder.analyze();
  }
} 