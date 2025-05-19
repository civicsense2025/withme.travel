import type { Meta, StoryObj } from '@storybook/react';
import { DestinationRating } from './DestinationRating';

const meta: Meta<typeof DestinationRating> = {
  title: 'Destinations/Atoms/DestinationRating',
  component: DestinationRating,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Cuisine',
    value: 3.5,
    maxValue: 5,
    size: 'md',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DestinationRating>;

export const Default: Story = {
  args: {
    label: 'Cuisine',
    value: 3.5,
  },
};

export const Excellent: Story = {
  args: {
    label: 'Cultural Attractions',
    value: 4.8,
  },
};

export const Average: Story = {
  args: {
    label: 'Nightlife',
    value: 3.0,
  },
};

export const Poor: Story = {
  args: {
    label: 'Value for Money',
    value: 1.5,
  },
};

export const SmallSize: Story = {
  args: {
    label: 'Beach Quality',
    value: 4.2,
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    label: 'Safety',
    value: 4.5,
    size: 'lg',
  },
};

export const AllRatings: Story = {
  render: () => (
    <div className="space-y-4 w-full">
      <DestinationRating label="Cuisine" value={4.7} />
      <DestinationRating label="Nightlife" value={3.8} />
      <DestinationRating label="Cultural Attractions" value={4.9} />
      <DestinationRating label="Outdoor Activities" value={3.2} />
      <DestinationRating label="Beach Quality" value={2.5} />
      <DestinationRating label="Safety" value={4.3} />
    </div>
  ),
}; 