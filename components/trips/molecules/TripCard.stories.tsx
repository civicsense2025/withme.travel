/**
 * Trip Card Stories
 * 
 * Storybook stories for the TripCard component
 * 
 * @module trips/molecules
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TripCard } from './TripCard';

const meta: Meta<typeof TripCard> = {
  title: 'Trips/Molecules/TripCard',
  component: TripCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TripCard>;

// Sample trip data
const sampleTrip = {
  id: '1',
  name: 'European Getaway',
  destination_name: 'Paris, France',
  start_date: '2024-06-15',
  end_date: '2024-06-30',
  is_public: true,
  members: 5,
  cover_image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
};

export const Default: Story = {
  args: {
    trip: sampleTrip,
  },
};

export const WithClickHandler: Story = {
  args: {
    trip: sampleTrip,
    onClick: (trip) => console.log('Trip clicked:', trip.name),
  },
};

export const WithoutImage: Story = {
  args: {
    trip: {
      ...sampleTrip,
      cover_image_url: undefined,
    },
  },
};

export const Private: Story = {
  args: {
    trip: {
      ...sampleTrip,
      is_public: false,
    },
  },
};

export const LongTitle: Story = {
  args: {
    trip: {
      ...sampleTrip,
      name: 'Super Amazing Fantastic European Getaway with Friends and Family Summer Trip 2024',
    },
  },
};

export const NoDateRange: Story = {
  args: {
    trip: {
      ...sampleTrip,
      start_date: undefined,
      end_date: undefined,
    },
  },
};

export const JapanTrip: Story = {
  args: {
    trip: {
      id: '2',
      name: 'Japan Adventure',
      destination_name: 'Tokyo, Japan',
      start_date: '2024-09-10',
      end_date: '2024-09-25',
      is_public: true,
      members: 3,
      cover_image_url: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9',
    },
  },
}; 