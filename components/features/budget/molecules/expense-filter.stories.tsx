import type { Meta, StoryObj } from '@storybook/react';
import { ExpenseFilter } from './expense-filter';

/**
 * Storybook stories for the ExpenseFilter molecule
 * Shows filter controls and different filter states
 */
const meta: Meta<typeof ExpenseFilter> = {
  title: 'Features/Budget/Molecules/ExpenseFilter',
  component: ExpenseFilter,
  tags: ['autodocs'],
  argTypes: {
    selectedCategory: { control: 'text', description: 'Selected category' },
    onCategoryChange: { action: 'onCategoryChange', description: 'Category change handler' },
    dateRange: { control: 'object', description: 'Selected date range' },
    onDateRangeChange: { action: 'onDateRangeChange', description: 'Date range change handler' },
  },
};
export default meta;
type Story = StoryObj<typeof ExpenseFilter>;

export const Default: Story = {
  args: {
    selectedCategory: 'all',
    dateRange: { start: '2024-06-01', end: '2024-06-10' },
  },
}; 