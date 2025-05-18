import { Meta, StoryObj } from '@storybook/react';
import { ExpenseCategoryBadge } from './expense-category-badge';

const meta: Meta<typeof ExpenseCategoryBadge> = {
  title: 'Expenses/Atoms/ExpenseCategoryBadge',
  component: ExpenseCategoryBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    category: 'food',
    showIcon: true,
    showLabel: true,
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof ExpenseCategoryBadge>;

export const Default: Story = {};

export const AllCategories: Story = {
  render: () => (
    <div className="flex flex-col space-y-2">
      <ExpenseCategoryBadge category="accommodation" />
      <ExpenseCategoryBadge category="food" />
      <ExpenseCategoryBadge category="transportation" />
      <ExpenseCategoryBadge category="activities" />
      <ExpenseCategoryBadge category="entertainment" />
      <ExpenseCategoryBadge category="shopping" />
      <ExpenseCategoryBadge category="flights" />
      <ExpenseCategoryBadge category="fees" />
      <ExpenseCategoryBadge category="other" />
    </div>
  ),
};

export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col space-y-2">
      <ExpenseCategoryBadge category="food" size="sm" />
      <ExpenseCategoryBadge category="food" size="md" />
      <ExpenseCategoryBadge category="food" size="lg" />
    </div>
  ),
};

export const IconOnly: Story = {
  args: {
    showLabel: false,
  },
};

export const LabelOnly: Story = {
  args: {
    showIcon: false,
  },
}; 