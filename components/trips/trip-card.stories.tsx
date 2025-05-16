import type { Meta, StoryObj } from '@storybook/react';
import { TripCard } from '@/components';

const meta: Meta<typeof TripCard> = {
  title: 'Trip Features/Trip Card',
  component: TripCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    trip: {
      control: 'object',
      description: 'Trip data object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TripCard>;

const mockTrip = {
  id: '1',
  name: 'European Getaway',
  slug: 'european-getaway',
  destination: 'Europe',
  start_date: '2024-06-15',
  end_date: '2024-06-30',
  created_by: 'user-123',
  created_at: '2023-12-01T00:00:00Z',
  updated_at: '2023-12-15T00:00:00Z',
  is_public: true,
  cover_image: undefined,
  members: 5,
  destination_name: 'Paris, France',
  cover_image_url: undefined,
  role: 'admin' as const,
};

export const Default: Story = {
  args: {
    trip: mockTrip,
  },
};

export const WithImage: Story = {
  args: {
    trip: {
      ...mockTrip,
      cover_image_url: 'https://placekitten.com/400/300',
    },
  },
};

export const LongTripName: Story = {
  args: {
    trip: {
      ...mockTrip,
      name: 'Super Amazing Fantastic European Getaway with Friends and Family Summer Trip 2024',
    },
  },
};

export const WithLocation: Story = {
  args: {
    trip: {
      ...mockTrip,
      location: 'Downtown Paris, France',
    },
  },
};
