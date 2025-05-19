import { Meta, StoryObj } from '@storybook/react';
import { ExpenseFilter, ExpenseFilterValues } from './expense-filter';
import { useState } from 'react';

const meta: Meta<typeof ExpenseFilter> = {
  title: 'Expenses/Molecules/ExpenseFilter',
  component: ExpenseFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ExpenseFilter>;

// Interactive story with working filter
export const Default = {
  render: () => {
    const [filters, setFilters] = useState<ExpenseFilterValues>({
      search: '',
      categories: [],
      startDate: undefined,
      endDate: undefined,
      memberIds: [],
    });

    return (
      <ExpenseFilter
        value={filters}
        onChange={setFilters}
      />
    );
  },
};

// Story with prefilled values
export const WithValues: Story = {
  args: {
    value: {
      search: 'hotel',
      categories: ['accommodation'],
      startDate: new Date(2023, 6, 1),
      endDate: new Date(2023, 6, 15),
      memberIds: ['user1', 'user2']
    },
    onChange: () => {},
  },
};

// Add members
export const WithMembers: Story = {
  args: {
    value: {
      search: '',
      categories: [],
      startDate: undefined,
      endDate: undefined,
      memberIds: []
    },
    onChange: () => {},
    members: [
      { id: 'user1', name: 'Jane Smith', avatarUrl: 'https://i.pravatar.cc/300?u=jane' },
      { id: 'user2', name: 'John Doe', avatarUrl: 'https://i.pravatar.cc/300?u=john' },
      { id: 'user3', name: 'Emily Wilson', avatarUrl: 'https://i.pravatar.cc/300?u=emily' },
    ],
  },
}; 