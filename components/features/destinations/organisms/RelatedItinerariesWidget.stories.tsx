import type { Meta, StoryObj } from '@storybook/react';
import { RelatedItinerariesWidget } from './related-itineraries-widget';

/**
 * Storybook stories for the RelatedItinerariesWidget component
 * Shows related itineraries or an empty state
 */
const meta: Meta<typeof RelatedItinerariesWidget> = {
  title: 'Features/Destinations/RelatedItinerariesWidget',
  component: RelatedItinerariesWidget,
  tags: ['autodocs'],
  argTypes: {
    itineraries: { control: 'object', description: 'Array of itinerary objects' },
  },
};
export default meta;
type Story = StoryObj<typeof RelatedItinerariesWidget>;

const mockItineraries = [
  { id: '1', name: 'Paris in 3 Days' },
  { id: '2', name: 'Tokyo Highlights' },
];

export const Default: Story = {
  args: {
    itineraries: mockItineraries,
  },
};

export const Empty: Story = {
  args: {
    itineraries: [],
  },
}; 