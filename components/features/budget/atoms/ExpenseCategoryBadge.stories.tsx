import type { Meta, StoryObj } from '@storybook/react';
import { ExpenseCategoryBadge } from './expense-category-badge';

/**
 * Storybook stories for the ExpenseCategoryBadge atom
 * Shows all category icons and styles
 */
const meta: Meta<typeof ExpenseCategoryBadge> = {
  title: 'Features/Budget/Atoms/ExpenseCategoryBadge',
  component: ExpenseCategoryBadge,
  tags: ['autodocs'],
  argTypes: {
    category: {
      control: 'select',
      options: ['food', 'accommodation', 'transportation', 'activities', 'shopping', 'other'],
      description: 'Expense category',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge size',
    },
  },
};
export default meta;
type Story = StoryObj<typeof ExpenseCategoryBadge>;

export const Default: Story = {
  args: {
    category: 'food',
    size: 'md',
  },
};

export const AllCategories: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <ExpenseCategoryBadge category="food" />
      <ExpenseCategoryBadge category="accommodation" />
      <ExpenseCategoryBadge category="transportation" />
      <ExpenseCategoryBadge category="activities" />
      <ExpenseCategoryBadge category="shopping" />
      <ExpenseCategoryBadge category="other" />
    </div>
  ),
}; 