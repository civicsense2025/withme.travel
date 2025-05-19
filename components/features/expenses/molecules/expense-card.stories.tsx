import { Meta, StoryObj } from '@storybook/react';
import { ExpenseCard } from './expense-card';

const meta: Meta<typeof ExpenseCard> = {
  title: 'Expenses/Molecules/ExpenseCard',
  component: ExpenseCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    expense: {
      id: 'exp-123',
      description: 'Hotel Grand Budapest',
      amount: 250.75,
      currency: 'USD',
      category: 'accommodation',
      date: new Date(2023, 5, 15),
      paidBy: {
        id: 'user-1',
        name: 'John Doe',
        avatarUrl: undefined
      },
      splitWith: [
        {
          id: 'user-1',
          name: 'John Doe',
          avatarUrl: undefined,
          amount: 125.38
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          avatarUrl: undefined,
          amount: 125.37
        }
      ]
    },
    onEdit: (id) => console.log('Edit expense:', id),
    onDelete: (id) => console.log('Delete expense:', id),
    canEdit: true,
    expanded: false
  },
};

export default meta;
type Story = StoryObj<typeof ExpenseCard>;

export const Default: Story = {};

export const Expanded: Story = {
  args: {
    expanded: true
  }
};

export const ReadOnly: Story = {
  args: {
    canEdit: false
  }
};

export const DifferentCategories: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <ExpenseCard
        expense={{
          id: 'exp-123',
          description: 'Hotel Grand Budapest',
          amount: 250.75,
          currency: 'USD',
          category: 'accommodation',
          date: new Date(2023, 5, 15),
          paidBy: {
            id: 'user-1',
            name: 'John Doe'
          },
        }}
        canEdit={true}
      />
      <ExpenseCard
        expense={{
          id: 'exp-124',
          description: 'Dinner at Luigi\'s',
          amount: 85.50,
          currency: 'USD',
          category: 'food',
          date: new Date(2023, 5, 15),
          paidBy: {
            id: 'user-2',
            name: 'Jane Smith'
          },
        }}
        canEdit={true}
      />
      <ExpenseCard
        expense={{
          id: 'exp-125',
          description: 'Museum Tickets',
          amount: 45.00,
          currency: 'USD',
          category: 'activities',
          date: new Date(2023, 5, 16),
          paidBy: {
            id: 'user-1',
            name: 'John Doe'
          },
        }}
        canEdit={true}
      />
    </div>
  ),
}; 