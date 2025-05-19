import type { Meta, StoryObj } from '@storybook/react';
import { ExpenseAmount } from './expense-amount';

/**
 * Storybook stories for the ExpenseAmount atom
 * Shows formatted currency amounts in different currencies and formats
 */
const meta: Meta<typeof ExpenseAmount> = {
  title: 'Features/Budget/Atoms/ExpenseAmount',
  component: ExpenseAmount,
  tags: ['autodocs'],
  argTypes: {
    amount: { control: 'number', description: 'Amount to display' },
    currency: { control: 'text', description: 'Currency code (e.g. USD, EUR)' },
  },
};
export default meta;
type Story = StoryObj<typeof ExpenseAmount>;

export const Default: Story = {
  args: {
    amount: 123.45,
    currency: 'USD',
  },
};

export const Euros: Story = {
  args: {
    amount: 99.99,
    currency: 'EUR',
  },
};

export const LargeAmount: Story = {
  args: {
    amount: 1000000,
    currency: 'USD',
  },
}; 