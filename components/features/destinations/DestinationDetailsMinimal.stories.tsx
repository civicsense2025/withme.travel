import type { Meta, StoryObj } from '@storybook/react';
import { DestinationDetailsMinimal } from './destination-details-minimal';

/**
 * Storybook stories for the DestinationDetailsMinimal component
 * Shows a minimal destination details view
 */
const meta: Meta<typeof DestinationDetailsMinimal> = {
  title: 'Features/Destinations/DestinationDetailsMinimal',
  component: DestinationDetailsMinimal,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text', description: 'Destination name' },
    description: { control: 'text', description: 'Description' },
    imageUrl: { control: 'text', description: 'Image URL' },
  },
};
export default meta;
type Story = StoryObj<typeof DestinationDetailsMinimal>;

export const Default: Story = {
  args: {
    name: 'Tokyo',
    description: 'A bustling metropolis.',
    imageUrl: 'https://example.com/tokyo.jpg',
  },
};

export const NoImage: Story = {
  args: {
    name: 'Mystery Place',
    description: 'No image available.',
    imageUrl: '',
  },
}; 