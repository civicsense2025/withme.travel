import type { Meta, StoryObj } from '@storybook/react';
import { BudgetBreakdown } from './budget-breakdown';

/**
 * Storybook stories for the BudgetBreakdown organism
 * Shows budget breakdown with charts and different data
 */
const meta: Meta<typeof BudgetBreakdown> = {
  title: 'Features/Budget/Organisms/BudgetBreakdown',
  component: BudgetBreakdown,
  tags: ['autodocs'],
  argTypes: {
    breakdown: { control: 'object', description: 'Category breakdown data' },
  },
};
export default meta;
type Story = StoryObj<typeof BudgetBreakdown>;

export const Default: Story = {
  args: {
    breakdown: {
      food: 200,
      accommodation: 300,
      transportation: 100,
      activities: 50,
      shopping: 75,
      other: 25,
    },
  },
}; 