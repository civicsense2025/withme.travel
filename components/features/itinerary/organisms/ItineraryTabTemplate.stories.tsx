import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryTabLayout } from '../templates/ItineraryTabLayout';

const meta: Meta<typeof ItineraryTabLayout> = {
  title: 'Itinerary/Organisms/ItineraryTabTemplate',
  component: ItineraryTabLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ItineraryTabLayout>;

const sampleItems = [
  {
    id: '1',
    title: 'Visit Eiffel Tower',
    description: 'Enjoy the view from the top of the iconic Eiffel Tower',
    location: 'Champ de Mars, 5 Avenue Anatole France, Paris',
    startTime: new Date('2023-07-15T09:00:00'),
    endTime: new Date('2023-07-15T11:00:00'),
    status: 'confirmed',
    category: 'activity',
    voteCount: 0,
    userVoted: false,
  },
  {
    id: '2',
    title: 'Lunch at Café de Paris',
    description: 'Enjoy authentic French cuisine at this popular café',
    location: '10 Avenue des Champs-Élysées, Paris',
    startTime: new Date('2023-07-15T12:30:00'),
    endTime: new Date('2023-07-15T14:00:00'),
    status: 'suggested',
    category: 'food',
    voteCount: 3,
    userVoted: true,
  },
  {
    id: '3',
    title: 'Louvre Museum Tour',
    description: 'Explore the world\'s largest art museum and historic monument',
    location: 'Rue de Rivoli, 75001 Paris',
    startTime: new Date('2023-07-15T15:00:00'),
    endTime: new Date('2023-07-15T18:00:00'),
    status: 'confirmed',
    category: 'activity',
    voteCount: 0,
    userVoted: false,
  },
  {
    id: '4',
    title: 'Hotel Le Grand',
    description: '4-star hotel in the heart of Paris',
    location: '2 Rue Scribe, 75009 Paris',
    status: 'confirmed',
    category: 'accommodation',
    voteCount: 0,
    userVoted: false,
  },
  {
    id: '5',
    title: 'Notre-Dame Cathedral',
    description: 'Visit the medieval Catholic cathedral',
    location: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris',
    startTime: new Date('2023-07-16T10:00:00'),
    endTime: new Date('2023-07-16T12:00:00'),
    status: 'confirmed',
    category: 'activity',
    voteCount: 0,
    userVoted: false,
  },
  {
    id: '6',
    title: 'Seine River Cruise',
    description: 'Enjoy a relaxing cruise along the Seine River',
    location: 'Port de la Conférence, Paris',
    startTime: new Date('2023-07-16T14:00:00'),
    endTime: new Date('2023-07-16T16:00:00'),
    status: 'suggested',
    category: 'activity',
    voteCount: 2,
    userVoted: false,
  },
];

const sampleUnscheduledItems = [
  {
    id: '7',
    title: 'Visit Montmartre',
    description: 'Explore the artistic neighborhood and visit Sacré-Cœur',
    location: 'Montmartre, Paris',
    status: 'suggested',
    category: 'activity',
    voteCount: 2,
    userVoted: false,
  },
  {
    id: '8',
    title: 'Shakespeare and Company Bookstore',
    description: 'Visit the famous English-language bookshop',
    location: '37 Rue de la Bûcherie, 75005 Paris',
    status: 'suggested',
    category: 'activity',
    voteCount: 4,
    userVoted: true,
  },
];

export const Default: Story = {
  args: {
    scheduledDays: [
      {
        dayNumber: 1,
        date: '2024-06-01',
        items: sampleItems,
      },
    ],
    unscheduledItems: [],
    canEdit: true,
    onEditItem: (id: string) => {},
    onDeleteItem: (id: string) => {},
    onVoteItem: (id: string) => {},
  },
};

export const Loading: Story = {
  args: {
    scheduledDays: [],
    unscheduledItems: [],
  },
};

export const Empty: Story = {
  args: {
    scheduledDays: [],
    unscheduledItems: [],
    canEdit: true,
    onAddItem: () => console.log('Add item clicked'),
  },
};

export const ReadOnly: Story = {
  args: {
    scheduledDays: [
      {
        dayNumber: 1,
        date: new Date('2023-07-15'),
        items: sampleItems.slice(0, 3),
      },
      {
        dayNumber: 2,
        date: new Date('2023-07-16'),
        items: sampleItems.slice(4, 6),
      },
    ],
    unscheduledItems: sampleUnscheduledItems,
    canEdit: false,
  },
}; 