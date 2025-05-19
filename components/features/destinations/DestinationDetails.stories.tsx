import type { Meta, StoryObj } from '@storybook/react';
import { DestinationDetails } from './destination-details';

/**
 * Storybook stories for the DestinationDetails component
 * Shows destination details with different data
 */
const meta: Meta<typeof DestinationDetails> = {
  title: 'Features/Destinations/DestinationDetails',
  component: DestinationDetails,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text', description: 'Destination name' },
    description: { control: 'text', description: 'Description' },
    country: { control: 'text', description: 'Country' },
    highlights: { control: 'object', description: 'Highlights' },
    imageUrl: { control: 'text', description: 'Image URL' },
  },
};
export default meta;
type Story = StoryObj<typeof DestinationDetails>;

export const Default: Story = {
  args: {
    name: 'Rome',
    description: 'Historic city with ancient ruins.',
    country: 'Italy',
    highlights: ['Colosseum', 'Vatican', 'Trevi Fountain'],
    imageUrl: 'https://example.com/rome.jpg',
  },
};

export const WithExtraDetails: Story = {
  args: {
    name: 'London',
    description: 'Capital of England.',
    country: 'UK',
    highlights: ['Big Ben', 'London Eye', 'Tower Bridge'],
    imageUrl: 'https://example.com/london.jpg',
  },
}; 