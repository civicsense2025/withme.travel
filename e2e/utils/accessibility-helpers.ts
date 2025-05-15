/**
 * Accessibility Helpers
 * 
 * Utilities for testing accessibility compliance in end-to-end tests.
 * These functions help verify that the application meets accessibility standards.
 */
import { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';
import { logError } from './test-helpers';

/**
 * Run an accessibility scan on the current page and return violations
 * 
 * @param page Playwright page object
 * @param context Optional context for the scan (e.g., 'survey-welcome')
 * @returns Array of accessibility violations
 */
export async function getAccessibilityViolations(
  page: Page,
  context: string = 'accessibility-scan'
): Promise<Record<string, any>[]> {
  try {
    const axeBuilder = new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.sse-fixes') // Exclude known issues marked with this class
      .exclude('[aria-hidden="true"]'); // Exclude hidden elements
    
    const results = await axeBuilder.analyze();
    
    // Save full results to file for detailed analysis
    const timestamp = Date.now();
    const filename = `a11y-${context}-${timestamp}.json`;
    const directory = './test-results/accessibility';
    
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(directory, filename),
      JSON.stringify(results, null, 2)
    );
    
    // Log summary if violations found
    if (results.violations.length > 0) {
      console.warn(`Found ${results.violations.length} accessibility violations in ${context}`);
      
      results.violations.forEach(violation => {
        console.warn(`- ${violation.impact || 'unknown'} impact: ${violation.help} (${violation.nodes.length} nodes affected)`);
      });
      
      // Save screenshot for visual reference
      await page.screenshot({
        path: path.join(directory, `a11y-${context}-violations.png`),
        fullPage: true
      });
    } else {
      console.log(`✓ No accessibility violations found in ${context}`);
    }
    
    return results.violations;
  } catch (error) {
    logError(`accessibility-scan-${context}`, error);
    console.error('Error running accessibility scan:', error);
    return [];
  }
}

/**
 * Test keyboard navigation on the current page
 * 
 * @param page Playwright page object
 * @param selectors Array of selectors that should be focusable in order
 * @returns True if all selectors were focusable in order
 */
export async function testKeyboardNavigation(
  page: Page,
  selectors: string[] = []
): Promise<boolean> {
  try {
    // If no selectors provided, just test that Tab moves focus
    if (selectors.length === 0) {
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => {
        return document.activeElement !== document.body;
      });
      
      return focusedElement;
    }
    
    // Start by focusing the body
    await page.evaluate(() => {
      document.body.focus();
    });
    
    // Try to tab through each selector in order
    for (const selector of selectors) {
      await page.keyboard.press('Tab');
      
      const isFocused = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        return element === document.activeElement;
      }, selector);
      
      if (!isFocused) {
        console.warn(`Keyboard navigation test failed: Could not focus ${selector}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error testing keyboard navigation:', error);
    return false;
  }
}

/**
 * Test that focus is properly trapped in a modal or dialog
 * 
 * @param page Playwright page object
 * @param modalSelector Selector for the modal container
 * @param expectedTabCount Expected number of tab stops within the modal
 * @returns True if focus is properly trapped
 */
export async function testFocusTrap(
  page: Page,
  modalSelector: string,
  expectedTabCount: number = 3
): Promise<boolean> {
  try {
    // First verify the modal is visible
    const isModalVisible = await page.isVisible(modalSelector);
    if (!isModalVisible) {
      console.warn(`Focus trap test failed: Modal ${modalSelector} not visible`);
      return false;
    }
    
    // Focus the first element in the modal
    await page.focus(`${modalSelector} *:first-child`);
    
    // Count focusable elements by tabbing through them
    let tabCount = 0;
    let previousActiveElement = null;
    let activeElement = null;
    
    // Tab forward through all elements and count
    for (let i = 0; i < expectedTabCount * 2; i++) {
      previousActiveElement = await page.evaluate(() => {
        return document.activeElement?.outerHTML;
      });
      
      await page.keyboard.press('Tab');
      
      activeElement = await page.evaluate(() => {
        return document.activeElement?.outerHTML;
      });
      
      // Check if we're still in the modal
      const stillInModal = await page.evaluate((sel) => {
        return document.activeElement?.closest(sel) !== null;
      }, modalSelector);
      
      if (stillInModal) {
        tabCount++;
      } else {
        console.warn('Focus trap test failed: Focus escaped the modal');
        return false;
      }
      
      // If we've gone through all elements twice, focus should cycle
      if (i >= expectedTabCount && activeElement === previousActiveElement) {
        break;
      }
    }
    
    // Now try shift+tab to go backwards
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
      
      // Check if we're still in the modal
      const stillInModal = await page.evaluate((sel) => {
        return document.activeElement?.closest(sel) !== null;
      }, modalSelector);
      
      if (!stillInModal) {
        console.warn('Focus trap test failed: Focus escaped the modal with Shift+Tab');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error testing focus trap:', error);
    return false;
  }
} 