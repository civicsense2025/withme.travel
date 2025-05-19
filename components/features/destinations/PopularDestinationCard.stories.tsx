import type { Meta, StoryObj } from '@storybook/react';
import { PopularDestinationCard } from './PopularDestinationCard';

/**
 * Storybook stories for the PopularDestinationCard component
 * Shows a card for a popular destination
 */
const meta: Meta<typeof PopularDestinationCard> = {
  title: 'Features/Destinations/PopularDestinationCard',
  component: PopularDestinationCard,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text', description: 'Destination name' },
    imageUrl: { control: 'text', description: 'Image URL' },
  },
};
export default meta;
type Story = StoryObj<typeof PopularDestinationCard>;

export const Default: Story = {
  args: {
    name: 'Barcelona',
    imageUrl: 'https://example.com/barcelona.jpg',
  },
};

export const NoImage: Story = {
  args: {
    name: 'Unknown',
    imageUrl: '',
  },
}; 