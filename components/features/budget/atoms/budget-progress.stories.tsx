import type { Meta, StoryObj } from '@storybook/react';
import { BudgetProgress } from './budget-progress';

/**
 * Storybook stories for the BudgetProgress atom
 * Shows progress bar for different percentages and thresholds
 */
const meta: Meta<typeof BudgetProgress> = {
  title: 'Features/Budget/Atoms/BudgetProgress',
  component: BudgetProgress,
  tags: ['autodocs'],
  argTypes: {
    percent: { control: 'number', description: 'Progress percentage (0-100)' },
    threshold: { control: 'number', description: 'Warning threshold (e.g. 80)' },
  },
};
export default meta;
type Story = StoryObj<typeof BudgetProgress>;

export const Default: Story = {
  args: {
    percent: 50,
    threshold: 80,
  },
};

export const NearThreshold: Story = {
  args: {
    percent: 79,
    threshold: 80,
  },
};

export const OverThreshold: Story = {
  args: {
    percent: 90,
    threshold: 80,
  },
}; 