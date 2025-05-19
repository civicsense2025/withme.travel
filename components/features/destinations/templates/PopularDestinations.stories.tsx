import type { Meta, StoryObj } from '@storybook/react';
import { PopularDestinations } from './PopularDestinations';

/**
 * Storybook stories for the PopularDestinations template
 * Shows a list of popular destinations
 */
const meta: Meta<typeof PopularDestinations> = {
  title: 'Features/Destinations/Templates/PopularDestinations',
  component: PopularDestinations,
  tags: ['autodocs'],
  argTypes: {
    destinations: { control: 'object', description: 'Array of destination objects' },
  },
};
export default meta;
type Story = StoryObj<typeof PopularDestinations>;

const mockDestinations = [
  { id: '1', name: 'Berlin', imageUrl: 'https://example.com/berlin.jpg' },
  { id: '2', name: 'Rio de Janeiro', imageUrl: 'https://example.com/rio.jpg' },
];

export const Default: Story = {
  args: {
    destinations: mockDestinations,
  },
}; 