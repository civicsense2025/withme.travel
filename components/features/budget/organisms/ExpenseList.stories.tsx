import type { Meta, StoryObj } from '@storybook/react';
import { ExpenseList } from './expense-list';

/**
 * Storybook stories for the ExpenseList organism
 * Shows a list of expenses with filtering
 */
const meta: Meta<typeof ExpenseList> = {
  title: 'Features/Budget/Organisms/ExpenseList',
  component: ExpenseList,
  tags: ['autodocs'],
  argTypes: {
    expenses: { control: 'object', description: 'Array of expense items' },
    filter: { control: 'object', description: 'Filter state' },
    onFilterChange: { action: 'onFilterChange', description: 'Filter change handler' },
  },
};
export default meta;
type Story = StoryObj<typeof ExpenseList>;

const mockExpenses = [
  { id: '1', amount: 20, category: 'food', description: 'Lunch' },
  { id: '2', amount: 50, category: 'accommodation', description: 'Hotel' },
  { id: '3', amount: 15, category: 'transportation', description: 'Taxi' },
];

export const Default: Story = {
  args: {
    expenses: mockExpenses,
    filter: { category: 'all' },
  },
}; 