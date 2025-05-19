import type { Meta, StoryObj } from '@storybook/react';
import { PopularDestinationsCarousel } from './popular-destinations-carousel';

/**
 * Storybook stories for the PopularDestinationsCarousel component
 * Shows a carousel of popular destinations
 */
const meta: Meta<typeof PopularDestinationsCarousel> = {
  title: 'Features/Destinations/PopularDestinationsCarousel',
  component: PopularDestinationsCarousel,
  tags: ['autodocs'],
  argTypes: {
    destinations: { control: 'object', description: 'Array of destination objects' },
  },
};
export default meta;
type Story = StoryObj<typeof PopularDestinationsCarousel>;

const mockDestinations = [
  { id: '1', name: 'Paris', imageUrl: 'https://example.com/paris.jpg' },
  { id: '2', name: 'Tokyo', imageUrl: 'https://example.com/tokyo.jpg' },
  { id: '3', name: 'New York', imageUrl: 'https://example.com/ny.jpg' },
];

export const Default: Story = {
  args: {
    destinations: mockDestinations,
  },
}; 