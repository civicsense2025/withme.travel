import type { Meta, StoryObj } from '@storybook/react';
import { PublicItineraryMap } from './PublicItineraryMap';

/**
 * Storybook stories for the PublicItineraryMap organism
 * Shows a public itinerary map with mock points and selection
 */
const meta: Meta<typeof PublicItineraryMap> = {
  title: 'Features/Maps/Organisms/PublicItineraryMap',
  component: PublicItineraryMap,
  tags: ['autodocs'],
  argTypes: {
    points: { control: 'object', description: 'Array of itinerary points' },
    selectedId: { control: 'text', description: 'ID of selected marker' },
    onSelect: { action: 'onSelect', description: 'Select handler' },
  },
};
export default meta;
type Story = StoryObj<typeof PublicItineraryMap>;

const mockPoints = [
  { id: '1', title: 'Start', lat: 40.7128, lng: -74.006 },
  { id: '2', title: 'Stop 1', lat: 40.73061, lng: -73.935242 },
  { id: '3', title: 'End', lat: 40.758896, lng: -73.98513 },
];

export const Default: Story = {
  args: {
    points: mockPoints,
    selectedId: undefined,
  },
};

export const WithSelected: Story = {
  args: {
    points: mockPoints,
    selectedId: '2',
  },
}; 