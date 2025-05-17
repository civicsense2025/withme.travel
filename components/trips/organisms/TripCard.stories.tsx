import type { Meta, StoryObj } from '@storybook/react';
import { TripCard } from './TripCard';

const meta: Meta<typeof TripCard> = {
  title: 'Trips/Organisms/TripCard',
  component: TripCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '420px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TripCard>;

const header = {
  name: 'Weekend in Paris',
  destination: 'Paris, France',
  coverImageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
  isLiked: false,
  likesCount: 12,
  isClickable: true,
  showLikeButton: true,
};

const footer = {
  startDate: '2023-06-15',
  endDate: '2023-06-22',
  members: [
    { id: '1', name: 'Alice', imageUrl: 'https://i.pravatar.cc/300?img=1', status: 'online' as const },
    { id: '2', name: 'Bob', imageUrl: 'https://i.pravatar.cc/300?img=2', status: 'offline' as const },
    { id: '3', name: 'Carol', imageUrl: 'https://i.pravatar.cc/300?img=3', status: 'away' as const },
  ],
  maxMembers: 3,
};

export const Default: Story = {
  args: {
    header,
    footer,
    children: <div className="text-sm text-gray-600 dark:text-gray-300">Trip highlights or summary can go here.</div>,
  },
}; 