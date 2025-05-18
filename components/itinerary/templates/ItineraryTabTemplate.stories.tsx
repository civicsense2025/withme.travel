import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryTabTemplate } from './ItineraryTabTemplate';
import { addDays } from 'date-fns';

const meta: Meta<typeof ItineraryTabTemplate> = {
  title: 'Itinerary/Templates/ItineraryTabTemplate',
  component: ItineraryTabTemplate,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ItineraryTabTemplate>;

// Generate sample data
const startDate = new Date('2024-06-15');

const generateScheduledDays = (numDays = 3) => {
  return Array.from({ length: numDays }).map((_, index) => {
    const dayDate = addDays(startDate, index);
    return {
      dayNumber: index + 1,
      date: dayDate,
      items: Array.from({ length: index + 2 }).map((_, itemIndex) => ({
        id: `day-${index + 1}-item-${itemIndex + 1}`,
        title: `Activity ${itemIndex + 1} for Day ${index + 1}`,
        description: itemIndex % 2 === 0 ? `Description for activity ${itemIndex + 1}` : undefined,
        location: itemIndex % 3 === 0 ? `Location ${itemIndex + 1}` : undefined,
        startTime: new Date(dayDate.setHours(9 + itemIndex, 0, 0)),
        endTime: new Date(dayDate.setHours(10 + itemIndex, 0, 0)),
        status: itemIndex % 3 === 0 ? 'confirmed' : 'suggested',
        category: itemIndex % 2 === 0 ? 'activity' : 'food',
        voteCount: itemIndex,
        userVoted: itemIndex % 2 === 0,
      })),
    };
  });
};

const generateUnscheduledItems = (count = 3) => {
  return Array.from({ length: count }).map((_, index) => ({
    id: `unscheduled-${index + 1}`,
    title: `Unscheduled Activity ${index + 1}`,
    description: index % 2 === 0 ? `Description for unscheduled activity ${index + 1}` : undefined,
    location: index % 2 === 1 ? `Location ${index + 1}` : undefined,
    status: 'suggested',
    category: index % 2 === 0 ? 'activity' : 'food',
    voteCount: index + 1,
    userVoted: index % 2 === 0,
  }));
};

export const Default: Story = {
  args: {
    scheduledDays: generateScheduledDays(3),
    unscheduledItems: generateUnscheduledItems(3),
    canEdit: true,
    onEditItem: (id) => console.log('Edit item', id),
    onDeleteItem: (id) => console.log('Delete item', id),
    onVoteItem: (id) => console.log('Vote for item', id),
    onAddItem: () => console.log('Add new item'),
  },
};

export const ReadOnlyMode: Story = {
  args: {
    scheduledDays: generateScheduledDays(2),
    unscheduledItems: generateUnscheduledItems(2),
    canEdit: false,
    onVoteItem: (id) => console.log('Vote for item', id),
  },
};

export const NoUnscheduledItems: Story = {
  args: {
    scheduledDays: generateScheduledDays(3),
    unscheduledItems: [],
    canEdit: true,
    onEditItem: (id) => console.log('Edit item', id),
    onDeleteItem: (id) => console.log('Delete item', id),
    onVoteItem: (id) => console.log('Vote for item', id),
    onAddItem: () => console.log('Add new item'),
  },
};

export const EmptyItinerary: Story = {
  args: {
    scheduledDays: [],
    unscheduledItems: generateUnscheduledItems(4),
    canEdit: true,
    onEditItem: (id) => console.log('Edit item', id),
    onDeleteItem: (id) => console.log('Delete item', id),
    onVoteItem: (id) => console.log('Vote for item', id),
    onAddItem: () => console.log('Add new item'),
  },
}; 