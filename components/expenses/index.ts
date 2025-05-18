/**
 * Expenses Component Library
 * 
 * This file exports all expense-related components organized by atomic design principles.
 * - atoms: Basic building blocks (buttons, inputs, small UI elements)
 * - molecules: Simple combinations of atoms (cards, form fields)
 * - organisms: Complex combinations of molecules (lists, forms)
 * - templates: Page layouts without specific content
 * - pages: Complete pages with specific content
 */

// Export everything from each category's barrel file
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './templates';

// Export the main component
export * from './budget-tab';

// Pages
// Note: Pages are typically in the app directory 