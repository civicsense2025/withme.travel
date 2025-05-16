import type { Meta, StoryObj } from '@storybook/react';
import { TripCard } from '../molecules/TripCard';
import { TripWithMemberInfo } from '@/utils/types';

/**
 * The TripCard component displays trip information in an animated card layout.
 */
const meta: Meta<typeof TripCard> = {
  title: 'Features/Trips/Molecules/TripCard',
  component: TripCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TripCard>;

const sampleTrip: TripWithMemberInfo = {
  id: 'trip-123',
  name: 'Weekend in Paris',
  destination_name: 'Paris, France',
  start_date: '2025-06-01',
  end_date: '2025-06-03',
  created_by: 'user-123',
  is_public: true,
  cover_image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  members: 3,
  created_at: '2025-05-01T12:00:00Z',
  role: 'admin',
};

/**
 * Default TripCard
 */
export const Default: Story = {
  args: {
    trip: sampleTrip,
  },
};

/**
 * TripCard with private trip
 */
export const PrivateTrip: Story = {
  args: {
    trip: {
      ...sampleTrip,
      is_public: false,
    },
  },
};

/**
 * TripCard with solo trip (1 member)
 */
export const SoloTrip: Story = {
  args: {
    trip: {
      ...sampleTrip,
      members: 1,
    },
  },
};

/**
 * TripCard with no dates
 */
export const NoDateTrip: Story = {
  args: {
    trip: {
      ...sampleTrip,
      start_date: undefined,
      end_date: undefined,
    },
  },
};

/**
 * TripCard with no image (shows fallback)
 */
export const NoImageTrip: Story = {
  args: {
    trip: {
      ...sampleTrip,
      cover_image_url: undefined,
    },
  },
}; 