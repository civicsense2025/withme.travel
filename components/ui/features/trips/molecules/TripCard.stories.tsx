/**
 * TripCard Component Stories
 * 
 * Storybook stories for the TripCard component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TripCard } from './TripCard';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof TripCard> = {
  title: 'Features/Trips/Molecules/TripCard',
  component: TripCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof TripCard>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default story with minimal props
 */
export const Default: Story = {
  args: {
    id: 'trip-1',
    name: 'Summer Vacation',
    destinationName: 'Barcelona, Spain',
    startDate: '2023-07-15',
    endDate: '2023-07-22',
    coverImageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070',
    members: [
      {
        id: 'user-1',
        name: 'John Doe',
        avatarUrl: 'https://i.pravatar.cc/150?u=user1',
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        avatarUrl: 'https://i.pravatar.cc/150?u=user2',
      },
    ],
  },
};

/**
 * Many members story
 */
export const ManyMembers: Story = {
  args: {
    ...Default.args,
    members: [
      {
        id: 'user-1',
        name: 'John Doe',
        avatarUrl: 'https://i.pravatar.cc/150?u=user1',
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        avatarUrl: 'https://i.pravatar.cc/150?u=user2',
      },
      {
        id: 'user-3',
        name: 'Robert Johnson',
        avatarUrl: 'https://i.pravatar.cc/150?u=user3',
      },
      {
        id: 'user-4',
        name: 'Emily Davis',
        avatarUrl: 'https://i.pravatar.cc/150?u=user4',
      },
      {
        id: 'user-5',
        name: 'Michael Brown',
        avatarUrl: 'https://i.pravatar.cc/150?u=user5',
      },
    ],
  },
};

/**
 * Without image
 */
export const WithoutImage: Story = {
  args: {
    ...Default.args,
    coverImageUrl: undefined,
  },
};

/**
 * Without dates
 */
export const WithoutDates: Story = {
  args: {
    ...Default.args,
    startDate: undefined,
    endDate: undefined,
  },
};

/**
 * Responsive demo with multiple cards
 */
export const ResponsiveGrid: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <TripCard {...args} name="Barcelona Trip" destinationName="Barcelona, Spain" />
        <TripCard {...args} name="Paris Getaway" destinationName="Paris, France" />
        <TripCard {...args} name="New York Adventure" destinationName="New York, USA" />
        <TripCard {...args} name="Tokyo Experience" destinationName="Tokyo, Japan" />
      </div>
    </div>
  ),
}; 