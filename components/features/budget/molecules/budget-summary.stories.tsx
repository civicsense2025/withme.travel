import type { Meta, StoryObj } from '@storybook/react';
import { BudgetSummary } from './budget-summary';

/**
 * Storybook stories for the BudgetSummary molecule
 * Shows budget summary with different totals and breakdowns
 */
const meta: Meta<typeof BudgetSummary> = {
  title: 'Features/Budget/Molecules/BudgetSummary',
  component: BudgetSummary,
  tags: ['autodocs'],
  argTypes: {
    total: { control: 'number', description: 'Total budget' },
    spent: { control: 'number', description: 'Amount spent' },
    breakdown: { control: 'object', description: 'Category breakdown' },
  },
};
export default meta;
type Story = StoryObj<typeof BudgetSummary>;

export const Default: Story = {
  args: {
    total: 1000,
    spent: 400,
    breakdown: {
      food: 200,
      accommodation: 100,
      transportation: 100,
    },
  },
};

export const AllSpent: Story = {
  args: {
    total: 1000,
    spent: 1000,
    breakdown: {
      food: 400,
      accommodation: 300,
      transportation: 300,
    },
  },
}; 