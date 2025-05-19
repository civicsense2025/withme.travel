import type { Meta, StoryObj } from '@storybook/react';
import { EnhancedTripCard } from './EnhancedTripCard';

const meta: Meta<typeof EnhancedTripCard> = {
  title: 'Features/Trips/Molecules/EnhancedTripCard',
  component: EnhancedTripCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    trip: { control: 'object', description: 'Trip data' },
    disableNavigation: { control: 'boolean', description: 'Disable navigation on click' },
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedTripCard>;

export const Default: Story = {
  args: {
    trip: {
      id: '1',
      name: 'Summer in Paris',
      destination_name: 'Paris',
      cover_image_url: '',
      description: 'A week-long adventure in the City of Light.',
      start_date: '2024-07-01',
      end_date: '2024-07-08',
      memberCount: 4,
      role: 'admin',
    },
    disableNavigation: false,
  },
};

export const NoNavigation: Story = {
  args: {
    ...Default.args,
    disableNavigation: true,
  },
};

export const WithImage: Story = {
  args: {
    trip: {
      id: '2',
      name: 'Italian Adventure',
      destination_name: 'Rome, Italy',
      cover_image_url: 'https://source.unsplash.com/random/800x600/?rome',
      description: 'Exploring the ancient ruins and enjoying authentic cuisine.',
      start_date: '2024-08-10',
      end_date: '2024-08-20',
      memberCount: 2,
      role: 'admin',
    },
    disableNavigation: false,
  },
};

export const LongTitle: Story = {
  args: {
    trip: {
      id: '3',
      name: 'This is a very long trip title that should be handled gracefully by the card component to ensure proper display',
      destination_name: 'Tokyo, Japan',
      description: 'Cherry blossoms and city lights.',
      start_date: '2024-04-01',
      end_date: '2024-04-15',
      memberCount: 1,
      role: 'admin',
    },
    disableNavigation: false,
  },
}; 