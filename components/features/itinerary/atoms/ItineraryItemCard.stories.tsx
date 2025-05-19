import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryItemCard } from './ItineraryItemCard';

const meta: Meta<typeof ItineraryItemCard> = {
  title: 'Itinerary/Atoms/ItineraryItemCard',
  component: ItineraryItemCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ItineraryItemCard>;

export const Default: Story = {
  args: {
    id: '1',
    title: 'Visit the Eiffel Tower',
    description: 'Enjoy the view from the top of the iconic Eiffel Tower',
    location: 'Champ de Mars, 5 Avenue Anatole France, Paris',
    startTime: new Date('2024-06-15T10:00:00'),
    endTime: new Date('2024-06-15T12:00:00'),
    status: 'confirmed',
    category: 'activity',
    canEdit: true,
    onEdit: (id) => console.log('Edit', id),
    onDelete: (id) => console.log('Delete', id),
  },
};

export const Suggested: Story = {
  args: {
    id: '2',
    title: 'Dinner at Le Jules Verne',
    description: 'Fine dining experience in the Eiffel Tower',
    location: 'Eiffel Tower, Champ de Mars, Paris',
    startTime: new Date('2024-06-15T19:30:00'),
    endTime: new Date('2024-06-15T21:30:00'),
    status: 'suggested',
    category: 'food',
    canEdit: true,
    onEdit: (id) => console.log('Edit', id),
    onDelete: (id) => console.log('Delete', id),
  },
};

export const WithVotes: Story = {
  args: {
    id: '3',
    title: 'Seine River Cruise',
    description: 'See Paris from the water with a scenic river cruise',
    location: 'Port de la Conférence, Pont de l\'Alma, Paris',
    startTime: new Date('2024-06-16T14:00:00'),
    endTime: new Date('2024-06-16T15:30:00'),
    status: 'suggested',
    category: 'activity',
    voteCount: 5,
    userVoted: true,
    canEdit: false,
    onVote: (id) => console.log('Vote', id),
  },
};

export const MinimalInfo: Story = {
  args: {
    id: '4',
    title: 'Free time for shopping',
    status: 'confirmed',
    canEdit: true,
    onEdit: (id) => console.log('Edit', id),
    onDelete: (id) => console.log('Delete', id),
  },
};

export const ReadOnly: Story = {
  args: {
    id: '5',
    title: 'Louvre Museum',
    description: 'Visit the world\'s largest art museum',
    location: 'Rue de Rivoli, 75001 Paris',
    startTime: new Date('2024-06-17T09:00:00'),
    endTime: new Date('2024-06-17T13:00:00'),
    status: 'confirmed',
    category: 'activity',
    canEdit: false,
  },
}; 