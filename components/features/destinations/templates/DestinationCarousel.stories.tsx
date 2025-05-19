import type { Meta, StoryObj } from '@storybook/react';
import { DestinationCarousel } from './DestinationCarousel';

/**
 * Storybook stories for the DestinationCarousel template
 * Shows a destination carousel with mock data
 */
const meta: Meta<typeof DestinationCarousel> = {
  title: 'Features/Destinations/Templates/DestinationCarousel',
  component: DestinationCarousel,
  tags: ['autodocs'],
  argTypes: {
    destinations: { control: 'object', description: 'Array of destination objects' },
  },
};
export default meta;
type Story = StoryObj<typeof DestinationCarousel>;

const mockDestinations = [
  { id: '1', name: 'Sydney', imageUrl: 'https://example.com/sydney.jpg' },
  { id: '2', name: 'Cape Town', imageUrl: 'https://example.com/capetown.jpg' },
];

export const Default: Story = {
  args: {
    destinations: mockDestinations,
  },
}; 