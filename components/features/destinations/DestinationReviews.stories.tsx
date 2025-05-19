import type { Meta, StoryObj } from '@storybook/react';
import { DestinationReviews } from './destination-reviews';

/**
 * Storybook stories for the DestinationReviews component
 * Shows a list of reviews or an empty state
 */
const meta: Meta<typeof DestinationReviews> = {
  title: 'Features/Destinations/DestinationReviews',
  component: DestinationReviews,
  tags: ['autodocs'],
  argTypes: {
    reviews: { control: 'object', description: 'Array of review objects' },
  },
};
export default meta;
type Story = StoryObj<typeof DestinationReviews>;

const mockReviews = [
  { id: '1', author: 'Alice', content: 'Amazing place!', rating: 5 },
  { id: '2', author: 'Bob', content: 'Had a great time.', rating: 4 },
];

export const Default: Story = {
  args: {
    reviews: mockReviews,
  },
};

export const Empty: Story = {
  args: {
    reviews: [],
  },
}; 