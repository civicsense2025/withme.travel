import type { Meta, StoryObj } from '@storybook/react';
import { UnscheduledItemsSection } from './UnscheduledItemsSection';

const meta: Meta<typeof UnscheduledItemsSection> = {
  title: 'Itinerary/Molecules/UnscheduledItemsSection',
  component: UnscheduledItemsSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UnscheduledItemsSection>;

// Sample unscheduled items
const unscheduledItems = [
  {
    id: '101',
    title: 'Museum of Modern Art',
    description: 'Visit the famous modern art museum',
    location: '11 W 53rd St, New York, NY 10019',
    status: 'suggested',
    category: 'activity',
    voteCount: 2,
    userVoted: true,
  },
  {
    id: '102',
    title: 'Central Park Bike Tour',
    description: 'Explore Central Park on bikes with a local guide',
    location: 'Central Park, New York, NY',
    status: 'suggested',
    category: 'activity',
    voteCount: 1,
    userVoted: false,
  },
  {
    id: '103',
    title: 'Dinner at Per Se',
    description: 'Fine dining experience at one of the best restaurants in NYC',
    location: '10 Columb-s Circle, New York, NY 10019',
    status: 'suggested',
    category: 'food',
    voteCount: 3,
    userVoted: true,
  },
];

export const Default: Story = {
  args: {
    items: unscheduledItems,
    canEdit: true,
    onEditItem: (id) => console.log('Edit item', id),
    onDeleteItem: (id) => console.log('Delete item', id),
    onVoteItem: (id) => console.log('Vote for item', id),
  },
};

export const ReadOnlyMode: Story = {
  args: {
    items: unscheduledItems,
    canEdit: false,
    onVoteItem: (id) => console.log('Vote for item', id),
  },
};

export const WithOneItem: Story = {
  args: {
    items: [unscheduledItems[0]],
    canEdit: true,
    onEditItem: (id) => console.log('Edit item', id),
    onDeleteItem: (id) => console.log('Delete item', id),
    onVoteItem: (id) => console.log('Vote for item', id),
  },
};

export const Empty: Story = {
  args: {
    items: [],
    canEdit: true,
  },
}; 