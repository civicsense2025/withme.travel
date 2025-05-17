import type { Meta, StoryObj } from '@storybook/react';
import EnhancedTripCard from './EnhancedTripCard';

const COMPONENT_CATEGORIES = {
  TRIP: 'Trip Features',
};

const meta: Meta<typeof EnhancedTripCard> = {
  title: 'UI/Features/trips/EnhancedTripCard',
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
