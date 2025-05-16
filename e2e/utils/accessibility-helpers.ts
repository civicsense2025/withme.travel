/**
 * Accessibility Testing Utilities for Research System
 * 
 * This module provides functions to test accessibility compliance
 * with specific focus on research interactions.
 */
import { Page, Locator, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/**
 * Test keyboard navigation through a form
 * 
 * @param page The Playwright page object
 * @param options Optional configuration
 * @returns Promise resolving to true if keyboard navigation is working
 */
export async function testKeyboardNavigation(
  page: Page, 
  options: {
    startSelector?: string;
    tabTimes?: number;
    verifyFocus?: boolean;
  } = {}
): Promise<boolean> {
  const { 
    startSelector = 'body', 
    tabTimes = 5,
    verifyFocus = true
  } = options;
  
  // Start from the specified element
  await page.locator(startSelector).focus();
  
  // Track focus history
  const focusHistory: string[] = [];
  
  // Press tab multiple times and track focus
  for (let i = 0; i < tabTimes; i++) {
    await page.keyboard.press('Tab');
    
    // Get the focused element
    const focusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      if (!activeElement) return null;
      
      return {
        tagName: activeElement.tagName,
        id: activeElement.id,
        className: activeElement.className,
        textContent: activeElement.textContent?.trim().substring(0, 50) || '',
        type: activeElement.getAttribute('type') || ''
      };
    });
    
    if (focusedElement) {
      focusHistory.push(
        `${focusedElement.tagName}${focusedElement.id ? `#${focusedElement.id}` : ''}`
      );
    }
  }
  
  // Verify focus is working
  if (verifyFocus) {
    // Focus should not stay on the body element
    const uniqueFocusPoints = new Set(focusHistory);
    const isNavigable = uniqueFocusPoints.size > 1 && !focusHistory.includes('BODY');
    
    if (!isNavigable) {
      console.error('Keyboard navigation test failed. Focus history:', focusHistory);
    }
    
    return isNavigable;
  }
  
  return true;
}

/**
 * Test focus trap in modal components
 * 
 * @param page The Playwright page object
 * @param containerSelector Selector for the modal or container element
 * @returns Promise resolving to true if focus is properly trapped
 */
export async function testFocusTrap(
  page: Page,
  containerSelector: string
): Promise<boolean> {
  // Get all focusable elements in the container
  const focusableElements = await page.locator(
    `${containerSelector} a[href], ${containerSelector} button, ${containerSelector} input, ${containerSelector} select, ${containerSelector} textarea, ${containerSelector} [tabindex]:not([tabindex="-1"])`
  ).all();
  
  if (focusableElements.length === 0) {
    console.error('No focusable elements found in container');
    return false;
  }
  
  // Start by focusing the first element
  await focusableElements[0].focus();
  
  // Tab through all elements and then once more to see if focus wraps
  for (let i = 0; i <= focusableElements.length; i++) {
    await page.keyboard.press('Tab');
  }
  
  // Get the currently focused element
  const focusedElementInContainer = await page.evaluate((selector) => {
    const container = document.querySelector(selector);
    const activeElement = document.activeElement;
    
    return container?.contains(activeElement);
  }, containerSelector);
  
  // Focus should stay within the container
  return !!focusedElementInContainer;
}

/**
 * Get accessibility violations using axe-core
 * 
 * @param page The Playwright page object
 * @param options Optional configuration
 * @returns Promise resolving to array of accessibility violations
 */
export async function getAccessibilityViolations(
  page: Page,
  options: {
    includedSelectors?: string[];
    excludedSelectors?: string[];
    rules?: string[];
  } = {}
): Promise<any[]> {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);
  
  if (options.includedSelectors?.length) {
    builder = builder.include(options.includedSelectors);
  }
  
  if (options.excludedSelectors?.length) {
    builder = builder.exclude(options.excludedSelectors);
  }
  
  if (options.rules?.length) {
    builder = builder.disableRules(options.rules);
  }
  
  const results = await builder.analyze();
  return results.violations;
}

/**
 * Check color contrast on a specific element
 * 
 * @param page The Playwright page object
 * @param selector Element selector to check
 * @returns Promise resolving to an object with contrast information
 */
export async function checkColorContrast(
  page: Page,
  selector: string
): Promise<{ ratio: number; passes: boolean }> {
  return page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return { ratio: 0, passes: false };
    
    const computedStyle = window.getComputedStyle(element);
    const bgColor = computedStyle.backgroundColor;
    const textColor = computedStyle.color;
    
    // Simple luminance calculation function
    function getLuminance(color: string): number {
      // Extract RGB components - this is a simplified approach
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!rgbMatch) return 0;
      
      const r = parseInt(rgbMatch[1], 10) / 255;
      const g = parseInt(rgbMatch[2], 10) / 255;
      const b = parseInt(rgbMatch[3], 10) / 255;
      
      const rsRgb = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      const gsRgb = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      const bsRgb = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
      
      return 0.2126 * rsRgb + 0.7152 * gsRgb + 0.0722 * bsRgb;
    }
    
    const bgLuminance = getLuminance(bgColor);
    const textLuminance = getLuminance(textColor);
    
    // Calculate contrast ratio
    const l1 = Math.max(bgLuminance, textLuminance);
    const l2 = Math.min(bgLuminance, textLuminance);
    const contrastRatio = (l1 + 0.05) / (l2 + 0.05);
    
    // WCAG AA requires 4.5:1 for normal text
    const passes = contrastRatio >= 4.5;
    
    return {
      ratio: contrastRatio,
      passes
    };
  }, selector);
}

/**
 * Verify that an element has proper ARIA attributes
 * 
 * @param element Playwright locator for the element
 * @param requiredAttributes Array of required ARIA attributes
 * @returns Promise resolving to true if all required attributes are present
 */
export async function verifyAriaAttributes(
  element: Locator,
  requiredAttributes: string[]
): Promise<boolean> {
  for (const attr of requiredAttributes) {
    const value = await element.getAttribute(attr);
    if (value === null) {
      return false;
    }
  }
  return true;
}

/**
 * Generate a comprehensive accessibility report
 * 
 * @param page The Playwright page object
 * @param options Optional configuration
 * @returns Promise resolving to an accessibility report object
 */
export async function generateAccessibilityReport(
  page: Page,
  options: {
    pageTitle?: string;
    includeScreenshot?: boolean;
    keyElements?: string[];
  } = {}
): Promise<any> {
  const {
    pageTitle = 'Accessibility Report',
    includeScreenshot = true,
    keyElements = []
  } = options;
  
  // Get axe violations
  const violations = await getAccessibilityViolations(page);
  
  // Get keyboard navigation status
  const keyboardNavigable = await testKeyboardNavigation(page);
  
  // Check key elements for ARIA attributes
  const ariaChecks: Record<string, boolean> = {};
  for (const selector of keyElements) {
    const element = page.locator(selector);
    if (await element.isVisible()) {
      ariaChecks[selector] = await verifyAriaAttributes(element, [
        'role',
        'aria-label'
      ]);
    }
  }
  
  // Create report
  const report = {
    title: pageTitle,
    timestamp: new Date().toISOString(),
    url: page.url(),
    violations: violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length
    })),
    keyboardNavigable,
    ariaChecks,
    criticalIssuesCount: violations.filter(v => v.impact === 'critical').length,
    seriousIssuesCount: violations.filter(v => v.impact === 'serious').length,
    moderateIssuesCount: violations.filter(v => v.impact === 'moderate').length,
    minorIssuesCount: violations.filter(v => v.impact === 'minor').length,
  };
  
  // Take screenshot if requested
  if (includeScreenshot) {
    const screenshotBuffer = await page.screenshot();
    const base64Screenshot = screenshotBuffer.toString('base64');
    // @ts-ignore: Dynamic property assignment
    report.screenshot = base64Screenshot;
  }
  
  return report;
} 