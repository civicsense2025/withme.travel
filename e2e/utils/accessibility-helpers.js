/**
 * Accessibility Helpers
 * 
 * Utilities for testing accessibility compliance in end-to-end tests.
 * These functions help verify that the application meets accessibility standards.
 */
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';
import { logError } from './test-helpers.js';

/**
 * Run an accessibility scan on the current page
 */
export async function runAccessibilityScan(
  page, 
  options = {}
) {
  // Default options
  const scanOptions = {
    name: 'accessibility-scan',
    exclude: [],
    include: [],
    failOnCritical: true,
    ...options
  };
  
  // Create axe builder
  let axeBuilder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['color-contrast']); // Disable color contrast for now

  // Add excluded selectors
  if (scanOptions.exclude && scanOptions.exclude.length > 0) {
    axeBuilder = axeBuilder.exclude(scanOptions.exclude);
  }
  
  // Add included selectors
  if (scanOptions.include && scanOptions.include.length > 0) {
    axeBuilder = axeBuilder.include(scanOptions.include);
  }
  
  // Run the scan
  const results = await axeBuilder.analyze();
  
  // Log violation summary
  const violations = results.violations;
  if (violations.length > 0) {
    console.log(`Accessibility scan (${scanOptions.name}) found ${violations.length} violations`);
    
    violations.forEach(violation => {
      const { id, impact, description, nodes } = violation;
      console.log(`- ${id} (${impact}): ${description}`);
      console.log(`  Affects ${nodes.length} node(s)`);
    });
    
    // Screenshot for reference
    await page.screenshot({ 
      path: `./test-results/a11y-${scanOptions.name}-violations.png`,
      fullPage: true 
    });
    
    // Fail test on critical issues if configured
    if (scanOptions.failOnCritical) {
      const criticalIssues = violations.filter(v => v.impact === 'critical');
      if (criticalIssues.length > 0) {
        throw new Error(`Found ${criticalIssues.length} critical accessibility issues`);
      }
    }
  } else {
    console.log(`✓ Accessibility scan (${scanOptions.name}) passed with no violations`);
  }
}

/**
 * Run an accessibility scan on the current page and return violations
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} [context='accessibility-scan'] - Optional context for the scan
 * @returns {Promise<Array<Object>>} Array of accessibility violations
 */
export async function getAccessibilityViolations(
  page,
  context = 'accessibility-scan'
) {
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
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} [options] - Navigation options
 * @param {string} [options.targetSelector] - Selector that should be focusable
 * @param {number} [options.maxTabs=10] - Maximum number of Tab presses to try
 * @param {boolean} [options.shouldReach=true] - Whether the target should be reached
 * @returns {Promise<boolean>} True if navigation works as expected
 */
export async function testKeyboardNavigation(
  page,
  options = {}
) {
  const { 
    targetSelector,
    maxTabs = 10,
    shouldReach = true
  } = typeof options === 'object' ? options : { targetSelector: options };
  
  try {
    // If no target selector provided, just test that Tab moves focus
    if (!targetSelector) {
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
    
    // Try to tab to the target
    let tabCount = 0;
    let foundTarget = false;
    
    while (tabCount < maxTabs && !foundTarget) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      foundTarget = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        return element === document.activeElement;
      }, targetSelector);
      
      if (foundTarget) {
        return true;
      }
    }
    
    // If we should reach the target but didn't, or
    // if we shouldn't reach the target but did, test fails
    return shouldReach === foundTarget;
  } catch (error) {
    console.error('Error testing keyboard navigation:', error);
    return false;
  }
}

/**
 * Test that focus is properly trapped in a modal or dialog
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} modalSelector - Selector for the modal container
 * @param {number} [expectedTabCount=3] - Expected number of tab stops within the modal
 * @returns {Promise<boolean>} True if focus is properly trapped
 */
export async function testFocusTrap(
  page,
  modalSelector,
  expectedTabCount = 3
) {
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