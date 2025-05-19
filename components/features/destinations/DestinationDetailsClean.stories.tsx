import type { Meta, StoryObj } from '@storybook/react';
import { DestinationDetailsClean } from './destination-details-clean';

/**
 * Storybook stories for the DestinationDetailsClean component
 * Shows a clean destination details view with different data
 */
const meta: Meta<typeof DestinationDetailsClean> = {
  title: 'Features/Destinations/DestinationDetailsClean',
  component: DestinationDetailsClean,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text', description: 'Destination name' },
    description: { control: 'text', description: 'Description' },
    country: { control: 'text', description: 'Country' },
    imageUrl: { control: 'text', description: 'Image URL' },
  },
};
export default meta;
type Story = StoryObj<typeof DestinationDetailsClean>;

export const Default: Story = {
  args: {
    name: 'Paris',
    description: 'The city of lights.',
    country: 'France',
    imageUrl: 'https://example.com/paris.jpg',
  },
};

export const Minimal: Story = {
  args: {
    name: 'Unknown',
    description: '',
    country: '',
    imageUrl: '',
  },
}; 