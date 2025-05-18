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

// Atoms
export * from './atoms/amount-input';
export * from './atoms/expense-category-badge';
export * from './atoms/currency-selector';
export * from './atoms/budget-progress';

// Molecules
export * from './molecules/expense-card';
export * from './molecules/expense-form-field';
export * from './molecules/budget-summary';
export * from './molecules/expense-filter';

// Organisms
export * from './organisms/expense-list';
export * from './organisms/expense-form';
export * from './organisms/budget-snapshot-card';
export * from './organisms/member-expenses-grid';

// Templates
export * from './templates/budget-tab-template';

// Pages
// Note: Pages are typically in the app directory 