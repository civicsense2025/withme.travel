import type { Meta, StoryObj } from '@storybook/react';
import { TripCard } from '@/components';
import type { TripRole } from '../utils/types';

// Complete mock data for the TripWithMemberInfo type
const mockTrip = {
  id: '1',
  name: 'Summer Vacation in Barcelona',
  destination_name: 'Barcelona, Spain',
  location: 'Barcelona, Spain',
  start_date: '2023-07-01',
  end_date: '2023-07-14',
  members: 3,
  cover_image: '/destinations/barcelona.jpg',
  description:
    'Exploring the beautiful city of Barcelona with friends, visiting Sagrada Familia, Park Güell, and enjoying the beaches.',
  // Required properties for TripWithMemberInfo
  role: 'admin' as TripRole,
  created_by: 'user-123',
  is_public: true,
  created_at: '2023-06-15T10:00:00Z',
  memberSince: '2023-06-15T10:00:00Z',
};

// Trip with minimal data
const minimalTrip = {
  id: '2',
  name: 'Weekend Getaway',
  members: 2,
  // Required properties for TripWithMemberInfo
  role: 'viewer' as TripRole,
  created_by: 'user-456',
  is_public: false,
  created_at: '2023-06-20T10:00:00Z',
};

// Trip with no description
const noDescriptionTrip = {
  id: '3',
  name: 'Paris Adventure',
  destination_name: 'Paris, France',
  location: 'Paris, France',
  start_date: '2023-08-15',
  end_date: '2023-08-22',
  members: 4,
  cover_image: '/destinations/paris.jpg',
  // Required properties for TripWithMemberInfo
  role: 'editor' as TripRole,
  created_by: 'user-789',
  is_public: true,
  created_at: '2023-07-01T10:00:00Z',
};

const meta: Meta<typeof TripCard> = {
  title: 'TripCard',
  component: TripCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TripCard>;

export const Default: Story = {
  args: {
    trip: mockTrip,
  },
};

export const MinimalData: Story = {
  args: {
    trip: minimalTrip,
  },
};

export const NoDescription: Story = {
  args: {
    trip: noDescriptionTrip,
  },
};

export const LongName: Story = {
  args: {
    trip: {
      ...mockTrip,
      name: 'This is an extremely long trip name that should be truncated in the UI to prevent layout issues',
    },
  },
};

export const LongDestinationName: Story = {
  args: {
    trip: {
      ...mockTrip,
      destination_name: 'Barcelona, Catalonia, Spain, Mediterranean Coast, Europe',
      location: 'Barcelona, Catalonia, Spain, Mediterranean Coast, Europe',
    },
  },
};
