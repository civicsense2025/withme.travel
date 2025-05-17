import type { Meta, StoryObj } from '@storybook/react';
import { ActivityTimeline } from './activity-timeline';

const meta: Meta<typeof ActivityTimeline> = {
  title: 'UI/Features/trips/activity-timeline',
  component: ActivityTimeline,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

export const Default: Story = {
  args: {
    tripId: 'trip-123',
  },
};

export const WithTripHistory: Story = {
  args: {
    tripId: 'trip-123',
    useTripHistory: true,
  },
};

export const CustomMaxHeight: Story = {
  args: {
    tripId: 'trip-123',
    maxHeight: '300px',
  },
};
