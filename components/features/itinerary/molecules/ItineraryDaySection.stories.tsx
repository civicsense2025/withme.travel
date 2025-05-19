import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryDaySection } from './ItineraryDaySection';
import { addDays } from 'date-fns';

const meta: Meta<typeof ItineraryDaySection> = {
  title: 'Itinerary/Molecules/ItineraryDaySection',
  component: ItineraryDaySection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ItineraryDaySection>;

// Helper to create sample items
const createSampleItems = (count: number, baseDate: Date) => {
  return Array.from({ length: count }).map((_, index) => ({
    id: `item-${index + 1}`,
    title: `Activity ${index + 1}`,
    description: index % 2 === 0 ? `Description for activity ${index + 1}` : undefined,
    location: index % 3 === 0 ? `Location ${index + 1}` : undefined,
    startTime: new Date(baseDate.setHours(9 + index, 0, 0)),
    endTime: new Date(baseDate.setHours(10 + index, 0, 0)),
    status: index % 3 === 0 ? 'confirmed' : 'suggested',
    category: index % 2 === 0 ? 'activity' : 'food',
    voteCount: index,
    userVoted: index % 2 === 0,
  }));
};

const baseDate = new Date('2024-06-15');

export const Default: Story = {
  args: {
    dayNumber: 1,
    date: baseDate,
    items: createSampleItems(3, baseDate),
    canEdit: true,
    onEditItem: (id) => console.log('Edit item', id),
    onDeleteItem: (id) => console.log('Delete item', id),
    onVoteItem: (id) => console.log('Vote for item', id),
  },
};

export const WithoutItems: Story = {
  args: {
    dayNumber: 2,
    date: addDays(baseDate, 1),
    items: [],
    canEdit: true,
    onEditItem: (id) => console.log('Edit item', id),
    onDeleteItem: (id) => console.log('Delete item', id),
  },
};

export const ReadOnlyMode: Story = {
  args: {
    dayNumber: 3,
    date: addDays(baseDate, 2),
    items: createSampleItems(4, addDays(baseDate, 2)),
    canEdit: false,
    onVoteItem: (id) => console.log('Vote for item', id),
  },
};

export const WithoutDate: Story = {
  args: {
    dayNumber: 4,
    items: createSampleItems(2, addDays(baseDate, 3)),
    canEdit: true,
    onEditItem: (id) => console.log('Edit item', id),
    onDeleteItem: (id) => console.log('Delete item', id),
    onVoteItem: (id) => console.log('Vote for item', id),
  },
}; 