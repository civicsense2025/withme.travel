import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryItemCard } from './ItineraryItemCard';

const meta: Meta<typeof ItineraryItemCard> = {
  title: 'Itinerary/Molecules/ItineraryItemCard',
  component: ItineraryItemCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onEdit: { action: 'edited' },
    onDelete: { action: 'deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof ItineraryItemCard>;

export const Default: Story = {
  args: {
    item: {
      id: '1',
      title: 'Visit Eiffel Tower',
      description: 'Experience the iconic landmark',
      day_number: 1,
      category: 'attraction',
      votes: [],
      creatorProfile: null,
      section_id: 'section-1',
      type: 'activity',
      status: 'confirmed',
      position: 1,
      place_id: 'place-1',
      details: {},
    },
  },
};

export const WithLongDescription: Story = {
  args: {
    item: {
      id: '2',
      title: 'Restaurant Dinner',
      description: 'Enjoy a lovely dinner at the renowned Le Jules Verne restaurant. Make sure to book in advance and arrive 15 minutes early. Dress code is smart casual. Be prepared for amazing views of the city.',
      day_number: 2,
      category: 'food',
      votes: [],
      creatorProfile: null,
      section_id: 'section-1',
      type: 'food',
      status: 'confirmed',
      position: 1,
      place_id: 'place-2',
      details: {},
    },
  },
};

export const Unscheduled: Story = {
  args: {
    item: {
      id: '3',
      title: 'Museum Visit',
      description: 'Check out the modern art museum',
      day_number: null,
      category: 'culture',
      votes: [],
      creatorProfile: null,
      section_id: 'section-1',
      type: 'activity',
      status: 'suggested',
      position: 1,
      place_id: 'place-3',
      details: {},
    },
  },
};

export const WithoutDescription: Story = {
  args: {
    item: {
      id: '4',
      title: 'Morning Jog',
      description: null,
      day_number: 3,
      category: 'activity',
      votes: [],
      creatorProfile: null,
      section_id: 'section-1',
      type: 'activity',
      status: 'confirmed',
      position: 1,
      place_id: null,
      details: {},
    },
  },
}; 