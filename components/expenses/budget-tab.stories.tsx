/**
 * Storybook Story - Budget Tab
 */
import { Meta, StoryObj } from '@storybook/react';
import { BudgetTab } from './budget-tab';

const mockManualExpenses = [
  {
    id: '1',
    trip_id: 'trip1',
    title: 'Hotel Booking',
    amount: 350,
    currency: 'USD',
    category: 'accommodation',
    paid_by: 'user1',
    date: '2023-07-10',
    created_at: '2023-06-05T10:00:00Z',
  },
  {
    id: '2',
    trip_id: 'trip1',
    title: 'Dinner at Seafood Restaurant',
    amount: 120,
    currency: 'USD',
    category: 'food',
    paid_by: 'user2',
    date: '2023-07-11',
    created_at: '2023-06-06T14:30:00Z',
  },
  {
    id: '3',
    trip_id: 'trip1',
    title: 'Museum Tickets',
    amount: 60,
    currency: 'USD',
    category: 'entertainment',
    paid_by: 'user1',
    date: '2023-07-12',
    created_at: '2023-06-07T09:15:00Z',
  },
  {
    id: '4',
    trip_id: 'trip1',
    title: 'Taxi to Airport',
    amount: 45,
    currency: 'USD',
    category: 'transportation',
    paid_by: 'user3',
    date: '2023-07-14',
    created_at: '2023-06-08T16:45:00Z',
  },
];

const mockPlannedExpenses = [
  {
    id: 'p1',
    title: 'Beach Tour',
    amount: 80,
    currency: 'USD',
    category: 'activities',
    date: '2023-07-15',
    source: 'planned' as const,
  },
  {
    id: 'p2',
    title: 'Souvenir Shopping',
    amount: 50,
    currency: 'USD',
    category: 'other',
    date: '2023-07-16',
    source: 'planned' as const,
  },
];

const mockMembers = [
  {
    user_id: 'user1',
    trip_id: 'trip1',
    role: 'admin',
    created_at: '2023-06-01T00:00:00Z',
    profiles: {
      name: 'Jane Smith',
      avatar_url: 'https://i.pravatar.cc/300?u=jane',
    },
  },
  {
    user_id: 'user2',
    trip_id: 'trip1',
    role: 'editor',
    created_at: '2023-06-02T00:00:00Z',
    profiles: {
      name: 'John Doe',
      avatar_url: 'https://i.pravatar.cc/300?u=john',
    },
  },
  {
    user_id: 'user3',
    trip_id: 'trip1',
    role: 'viewer',
    created_at: '2023-06-03T00:00:00Z',
    profiles: {
      name: 'Emily Wilson',
      avatar_url: 'https://i.pravatar.cc/300?u=emily',
    },
  },
];

/**
 * Configuring the story
 */
export default {
  title: 'Trip/Budget Tab',
  component: BudgetTab,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    canEdit: {
      control: 'boolean',
      defaultValue: true,
    },
    budget: {
      control: 'number',
    },
    isTripOver: {
      control: 'boolean',
      defaultValue: false,
    },
  },
} as Meta<typeof BudgetTab>;

/**
 * Story templates
 */
type Story = StoryObj<typeof BudgetTab>;

/**
 * Default story
 */
export const Default: Story = {
  args: {
    tripId: 'trip1',
    canEdit: true,
    isTripOver: false,
    manualExpenses: mockManualExpenses,
    plannedExpenses: mockPlannedExpenses,
    initialMembers: mockMembers,
    budget: 800,
  },
};

/**
 * Budget story with no budget set
 */
export const NoBudgetSet: Story = {
  args: {
    ...Default.args,
    budget: null,
  },
};

/**
 * Story with read-only view (can't edit)
 */
export const ReadOnly: Story = {
  args: {
    ...Default.args,
    canEdit: false,
  },
};

/**
 * Story with trip over
 */
export const TripComplete: Story = {
  args: {
    ...Default.args,
    isTripOver: true,
  },
}; 