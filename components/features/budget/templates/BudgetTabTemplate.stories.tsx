import type { Meta, StoryObj } from '@storybook/react';
import { BudgetTabTemplate } from './budget-tab-template';

/**
 * Storybook stories for the BudgetTabTemplate template
 * Shows the full budget tab with mocked data
 */
const meta: Meta<typeof BudgetTabTemplate> = {
  title: 'Features/Budget/Templates/BudgetTabTemplate',
  component: BudgetTabTemplate,
  tags: ['autodocs'],
  argTypes: {
    expenses: { control: 'object', description: 'Array of expenses' },
    summary: { control: 'object', description: 'Budget summary data' },
  },
};
export default meta;
type Story = StoryObj<typeof BudgetTabTemplate>;

const mockExpenses = [
  { id: '1', amount: 20, category: 'food', description: 'Lunch' },
  { id: '2', amount: 50, category: 'accommodation', description: 'Hotel' },
  { id: '3', amount: 15, category: 'transportation', description: 'Taxi' },
];
const mockSummary = {
  total: 1000,
  spent: 400,
  breakdown: {
    food: 200,
    accommodation: 100,
    transportation: 100,
  },
};

export const Default: Story = {
  args: {
    expenses: mockExpenses,
    summary: mockSummary,
  },
}; 