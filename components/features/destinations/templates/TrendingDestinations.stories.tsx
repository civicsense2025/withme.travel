import type { Meta, StoryObj } from '@storybook/react';
import { TrendingDestinations } from './TrendingDestinations';

/**
 * Storybook stories for the TrendingDestinations template
 * Shows a list of trending destinations
 */
const meta: Meta<typeof TrendingDestinations> = {
  title: 'Features/Destinations/Templates/TrendingDestinations',
  component: TrendingDestinations,
  tags: ['autodocs'],
  argTypes: {
    destinations: { control: 'object', description: 'Array of destination objects' },
  },
};
export default meta;
type Story = StoryObj<typeof TrendingDestinations>;

const mockDestinations = [
  { id: '1', name: 'Bangkok', imageUrl: 'https://example.com/bangkok.jpg' },
  { id: '2', name: 'Dubai', imageUrl: 'https://example.com/dubai.jpg' },
];

export const Default: Story = {
  args: {
    destinations: mockDestinations,
  },
}; 