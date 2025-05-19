import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryTimeDisplay } from './ItineraryTimeDisplay';

/**
 * Storybook stories for the ItineraryTimeDisplay atom
 * Displays formatted start/end times for itinerary items
 * @module features/itinerary/atoms/ItineraryTimeDisplay
 */
const meta: Meta<typeof ItineraryTimeDisplay> = {
  title: 'Features/Itinerary/Atoms/ItineraryTimeDisplay',
  component: ItineraryTimeDisplay,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ItineraryTimeDisplay>;

export const Default: Story = {
  args: {
    startTime: '2024-06-01T09:00:00Z',
    endTime: '2024-06-01T11:00:00Z',
  },
};

export const OnlyStart: Story = {
  args: {
    startTime: '2024-06-01T14:00:00Z',
    endTime: undefined,
  },
};

export const OnlyEnd: Story = {
  args: {
    startTime: undefined,
    endTime: '2024-06-01T16:00:00Z',
  },
}; 