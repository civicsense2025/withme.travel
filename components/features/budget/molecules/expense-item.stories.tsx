import type { Meta, StoryObj } from '@storybook/react';
import { ExpenseItem } from './expense-item';

/**
 * Storybook stories for the ExpenseItem molecule
 * Shows expense item in basic and expanded views, with different categories
 */
const meta: Meta<typeof ExpenseItem> = {
  title: 'Features/Budget/Molecules/ExpenseItem',
  component: ExpenseItem,
  tags: ['autodocs'],
  argTypes: {
    amount: { control: 'number', description: 'Expense amount' },
    category: { control: 'text', description: 'Expense category' },
    description: { control: 'text', description: 'Expense description' },
    expanded: { control: 'boolean', description: 'Show expanded details' },
  },
};
export default meta;
type Story = StoryObj<typeof ExpenseItem>;

export const Default: Story = {
  args: {
    amount: 42.5,
    category: 'food',
    description: 'Lunch at cafe',
    expanded: false,
  },
};

export const Expanded: Story = {
  args: {
    amount: 42.5,
    category: 'food',
    description: 'Lunch at cafe',
    expanded: true,
  },
};

export const Shopping: Story = {
  args: {
    amount: 120,
    category: 'shopping',
    description: 'Souvenirs',
    expanded: false,
  },
}; 