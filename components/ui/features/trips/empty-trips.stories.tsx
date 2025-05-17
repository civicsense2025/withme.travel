import { Meta, StoryObj } from '@storybook/react';
import { EmptyTrips } from './empty-trips';

/**
 * `EmptyTrips` is displayed when a user has no trips.
 * It provides a call-to-action to create a new trip.
 */
const meta: Meta<typeof EmptyTrips> = {
  title: 'UI/Features/trips/empty-trips',
  component: EmptyTrips,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component displayed when a user has no trips, with a CTA to create a new trip.'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyTrips>;

/**
 * Default empty state for a user with no trips
 */
export const Default: Story = {
  args: {},
};

/**
 * Loading state while trips are being fetched
 */
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

/**
 * Error state when trips could not be loaded
 */
export const Error: Story = {
  args: {
    error: 'Could not load trips. Please try again later.',
  },
}; 