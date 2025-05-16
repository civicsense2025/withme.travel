/**
 * ResearchPage - Page Object Model for research interactions
 * 
 * This class encapsulates all interactions with the forms-based research system,
 * providing a clean, reliable API for test automation.
 */
import { Page, Locator, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

export interface ResearchPageOptions {
  /** Base URL for the research/forms page */
  baseUrl?: string;
  /** Form ID to interact with */
  formId?: string;
  /** Debug mode - takes screenshots on key actions */
  debug?: boolean;
}

interface AccessibilityCheckOptions {
  /** Selectors to exclude from testing */
  excludedSelectors?: string[];
  /** Only test specific selectors */
  includeSelectors?: string[];
}

/**
 * Page Object Model for the survey/form research flows
 */
export class ResearchPage {
  /** Playwright page object */
  readonly page: Page;
  /** Form ID */
  private formId: string | null;
  /** Base URL for the survey */
  private baseUrl: string;
  /** Debug mode flag */
  private debug: boolean;
  
  /** Key locators for important elements */
  private selectors = {
    surveyContainer: '[data-testid="survey-container"]',
    startButton: '[data-testid="start-survey-button"]',
    nextButton: '[data-testid="next-button"]',
    backButton: '[data-testid="back-button"]',
    submitButton: '[data-testid="submit-button"]',
    textInput: '[data-testid="text-input"]',
    textareaInput: '[data-testid="textarea-input"]',
    radioOptions: '[data-testid="radio-options"]',
    radioOption: '[data-testid="radio-option"]',
    checkboxOptions: '[data-testid="checkbox-options"]',
    checkboxOption: '[data-testid="checkbox-option"]',
    selectInput: '[data-testid="select-input"]',
    ratingInput: '[data-testid="rating-input"]',
    errorContainer: '[data-testid="error-container"]',
    formFields: '[data-testid="form-field"]',
    completionScreen: '[data-testid="completion-screen"]'
  };
  
  /**
   * Initialize a new ResearchPage instance
   * 
   * @param page The Playwright page object
   * @param options Configuration options
   */
  constructor(page: Page, options: ResearchPageOptions = {}) {
    this.page = page;
    this.formId = options.formId || null;
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.debug = options.debug || false;
  }
  
  /**
   * Navigate to the survey page
   * 
   * @param formId Optional override for the form ID
   * @param params Additional URL parameters
   */
  async gotoSurvey(formId?: string, params: Record<string, string> = {}): Promise<void> {
    // Use provided form ID, fallback to instance property
    const targetFormId = formId || this.formId;
    
    if (!targetFormId) {
      throw new Error('No formId provided for the survey');
    }
    
    // Construct URL with parameters
    let url = `${this.baseUrl}/research/forms/${targetFormId}`;
    
    // Add query parameters if present
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      
      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, value);
      }
      
      url += `?${searchParams.toString()}`;
    }
    
    // Navigate to the survey
    await this.page.goto(url);
    
    // Wait for the survey container to be visible
    await this.page.locator(this.selectors.surveyContainer).waitFor({ state: 'visible', timeout: 10000 });
    
    if (this.debug) {
      await this.takeScreenshot('survey-loaded');
    }
  }
  
  /**
   * Start the survey by clicking the start button
   */
  async startSurvey(): Promise<void> {
    const startButton = this.page.locator(this.selectors.startButton);
    await startButton.waitFor({ state: 'visible' });
    await startButton.click();
    
    // Wait for the first form field to be visible
    await this.page.locator(this.selectors.formFields).first().waitFor({ state: 'visible' });
    
    if (this.debug) {
      await this.takeScreenshot('survey-started');
    }
  }
  
  /**
   * Answer the current question with the provided value
   * 
   * @param answer The answer to provide (string for text/textarea, number for select/radio)
   */
  async answerCurrentQuestion(answer: string | number): Promise<void> {
    // Get all form fields on the current page
    const formFields = this.page.locator(this.selectors.formFields);
    const count = await formFields.count();
    
    if (count === 0) {
      throw new Error('No form fields found on the current page');
    }
    
    // Get the visible field
    const field = formFields.first();
    
    // Determine the type of field and interact with it appropriately
    if (await this.page.locator(this.selectors.textInput).isVisible()) {
      // Handle text input
      if (typeof answer !== 'string') {
        throw new Error('Text input requires a string answer');
      }
      
      await this.page.locator(this.selectors.textInput).fill(answer);
    } else if (await this.page.locator(this.selectors.textareaInput).isVisible()) {
      // Handle textarea input
      if (typeof answer !== 'string') {
        throw new Error('Textarea input requires a string answer');
      }
      
      await this.page.locator(this.selectors.textareaInput).fill(answer);
    } else if (await this.page.locator(this.selectors.radioOptions).isVisible()) {
      // Handle radio options
      const options = this.page.locator(this.selectors.radioOption);
      const optionCount = await options.count();
      
      if (typeof answer === 'number') {
        // Select by index
        if (answer < 0 || answer >= optionCount) {
          throw new Error(`Radio option index ${answer} out of range (0-${optionCount - 1})`);
        }
        
        await options.nth(answer).click();
      } else {
        // Select by text
        await options.getByText(answer, { exact: false }).click();
      }
    } else if (await this.page.locator(this.selectors.checkboxOptions).isVisible()) {
      // Handle checkbox options
      const options = this.page.locator(this.selectors.checkboxOption);
      
      if (typeof answer === 'number') {
        // Select by index
        const optionCount = await options.count();
        
        if (answer < 0 || answer >= optionCount) {
          throw new Error(`Checkbox option index ${answer} out of range (0-${optionCount - 1})`);
        }
        
        await options.nth(answer).click();
      } else if (Array.isArray(answer)) {
        // Select multiple options by index
        for (const idx of answer) {
          await options.nth(idx).click();
        }
      } else {
        // Select by text
        await options.getByText(answer, { exact: false }).click();
      }
    } else if (await this.page.locator(this.selectors.selectInput).isVisible()) {
      // Handle select dropdown
      const select = this.page.locator(this.selectors.selectInput);
      
      if (typeof answer === 'number') {
        // Convert from 0-based index to 1-based option index
        const optionIndex = answer + 1;
        await select.selectOption({ index: optionIndex });
      } else {
        await select.selectOption({ label: answer });
      }
    } else if (await this.page.locator(this.selectors.ratingInput).isVisible()) {
      // Handle rating input
      const rating = typeof answer === 'number' ? answer : parseInt(answer, 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new Error('Rating must be a number between 1 and 5');
      }
      
      await this.page.locator(`${this.selectors.ratingInput} button:nth-child(${rating})`).click();
    } else {
      throw new Error('No recognized form field found on the current page');
    }
    
    if (this.debug) {
      await this.takeScreenshot('question-answered');
    }
  }
  
  /**
   * Navigate to the next question
   */
  async goToNextQuestion(): Promise<void> {
    const nextButton = this.page.locator(this.selectors.nextButton);
    await nextButton.waitFor({ state: 'visible' });
    await nextButton.click();
    
    // Wait for navigation to complete
    await this.page.waitForTimeout(500);
    
    if (this.debug) {
      await this.takeScreenshot('next-question');
    }
  }
  
  /**
   * Navigate to the previous question
   */
  async goToPreviousQuestion(): Promise<void> {
    const backButton = this.page.locator(this.selectors.backButton);
    await backButton.waitFor({ state: 'visible' });
    await backButton.click();
    
    // Wait for navigation to complete
    await this.page.waitForTimeout(500);
    
    if (this.debug) {
      await this.takeScreenshot('previous-question');
    }
  }
  
  /**
   * Complete the entire survey by answering all questions with provided answers
   * 
   * @param answers Array of answers for each question (optional)
   */
  async completeEntireSurvey(answers?: (string | number)[]): Promise<void> {
    // Start the survey if not already started
    if (await this.page.locator(this.selectors.startButton).isVisible()) {
      await this.startSurvey();
    }
    
    // Keep track of how many questions we've answered
    let questionIndex = 0;
    
    // While there are more questions to answer
    while (
      await this.page.locator(this.selectors.formFields).isVisible() &&
      (await this.page.locator(this.selectors.nextButton).isVisible() || await this.page.locator(this.selectors.submitButton).isVisible())
    ) {
      // Determine the answer to use
      let answer: string | number;
      
      if (answers && questionIndex < answers.length) {
        // Use the provided answer
        answer = answers[questionIndex];
      } else {
        // Use a default answer based on the field type
        if (await this.page.locator(this.selectors.textInput).isVisible()) {
          answer = `Default text answer for question ${questionIndex + 1}`;
        } else if (await this.page.locator(this.selectors.textareaInput).isVisible()) {
          answer = `Default textarea answer for question ${questionIndex + 1}. This is a longer response.`;
        } else if (await this.page.locator(this.selectors.radioOptions).isVisible() || 
                 await this.page.locator(this.selectors.selectInput).isVisible()) {
          answer = 0; // Select the first option
        } else if (await this.page.locator(this.selectors.checkboxOptions).isVisible()) {
          answer = 0; // Select the first checkbox
        } else if (await this.page.locator(this.selectors.ratingInput).isVisible()) {
          answer = 5; // Give the highest rating
        } else {
          throw new Error(`Unknown field type for question ${questionIndex + 1}`);
        }
      }
      
      // Answer the current question
      await this.answerCurrentQuestion(answer);
      
      // Go to the next question or submit the survey
      if (await this.page.locator(this.selectors.submitButton).isVisible()) {
        await this.page.locator(this.selectors.submitButton).click();
      } else {
        await this.goToNextQuestion();
      }
      
      questionIndex++;
    }
    
    // Wait for completion screen
    await this.page.locator(this.selectors.completionScreen).waitFor({ state: 'visible', timeout: 10000 }).catch(e => {
      console.warn('Completion screen not found after completing survey');
    });
    
    if (this.debug) {
      await this.takeScreenshot('survey-completed');
    }
  }
  
  /**
   * Check if the completion screen is visible
   * 
   * @returns True if the completion screen is visible
   */
  async isCompletionScreenVisible(): Promise<boolean> {
    return this.page.locator(this.selectors.completionScreen).isVisible();
  }
  
  /**
   * Take a screenshot for debugging
   * 
   * @param name The name of the screenshot
   */
  private async takeScreenshot(name: string): Promise<void> {
    if (!this.debug) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ path: `./screenshots/${name}-${timestamp}.png` });
  }
  
  /**
   * Run an accessibility check on the current page
   * 
   * @param options Accessibility check options
   * @returns Array of accessibility violations
   */
  async checkAccessibility(options: AccessibilityCheckOptions = {}): Promise<any[]> {
    let builder = new AxeBuilder({ page: this.page });
    
    // Apply exclusions if specified
    if (options.excludedSelectors) {
      builder = builder.exclude(options.excludedSelectors);
    }
    
    // Apply inclusions if specified
    if (options.includeSelectors) {
      builder = builder.include(options.includeSelectors);
    }
    
    const results = await builder.analyze();
    
    if (this.debug && results.violations.length > 0) {
      console.warn(`Accessibility violations found: ${results.violations.length}`);
      console.table(results.violations.map(v => ({
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length
      })));
      
      await this.takeScreenshot('accessibility-issues');
    }
    
    return results.violations;
  }
  
  /**
   * Get the number of questions in the survey
   * 
   * @returns The total number of questions
   */
  async getTotalQuestionCount(): Promise<number> {
    // We need to make an API call to get this information
    const response = await this.page.request.get(`${this.baseUrl}/api/research/forms/${this.formId}`);
    
    if (!response.ok()) {
      throw new Error(`Failed to get form data: ${response.statusText()}`);
    }
    
    const form = await response.json();
    return form.fields?.length || 0;
  }
  
  /**
   * Get the current question index (1-based)
   * 
   * @returns The current question number
   */
  async getCurrentQuestionNumber(): Promise<number> {
    // Look for a progress indicator
    const progressText = await this.page.locator('[data-testid="progress-indicator"]').textContent();
    
    if (progressText) {
      // Parse text like "Question 2 of 5"
      const match = progressText.match(/Question (\d+) of (\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    
    // Fallback: check URL for question parameter
    const url = this.page.url();
    const questionParam = new URL(url).searchParams.get('question');
    
    if (questionParam) {
      return parseInt(questionParam, 10);
    }
    
    // Default to 1 if we can't determine
    return 1;
  }
} 