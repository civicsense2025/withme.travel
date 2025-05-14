import type { Meta, StoryObj } from '@storybook/react';
import { TripReviewForm } from './trip-review-form';

const meta: Meta<typeof TripReviewForm> = {
  title: 'Trip Features/TripReviewForm',
  component: TripReviewForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TripReviewForm>;

const mockOnReviewSubmitted = () => alert('Review submitted!');

export const Default: Story = {
  args: {
    tripId: 'trip-123',
    destinationId: 'dest-1',
    destinationName: 'Barcelona',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-14'),
    onReviewSubmitted: mockOnReviewSubmitted,
  },
};

export const ParisTrip: Story = {
  args: {
    tripId: 'trip-456',
    destinationId: 'dest-2',
    destinationName: 'Paris',
    startDate: new Date('2024-09-10'),
    endDate: new Date('2024-09-20'),
    onReviewSubmitted: mockOnReviewSubmitted,
  },
};
