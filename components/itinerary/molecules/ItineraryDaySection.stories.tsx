import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryDaySection } from './ItineraryDaySection';

const meta: Meta<typeof ItineraryDaySection> = {
  title: 'Itinerary/Molecules/ItineraryDaySection',
  component: ItineraryDaySection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onEdit: { action: 'edited' },
    onDelete: { action: 'deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof ItineraryDaySection>;

export const Default: Story = {
  args: {
    title: 'Day 1',
    items: [
      {
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
      {
        id: '2',
        title: 'Lunch at Le Café Marly',
        description: 'Enjoy the view of the Louvre Pyramid',
        day_number: 1,
        category: 'food',
        votes: [],
        creatorProfile: null,
        section_id: 'section-1',
        type: 'food',
        status: 'confirmed',
        position: 2,
        place_id: 'place-2',
        details: {},
      },
      {
        id: '3',
        title: 'Seine River Cruise',
        description: 'Relaxing evening boat tour',
        day_number: 1,
        category: 'activity',
        votes: [],
        creatorProfile: null,
        section_id: 'section-1',
        type: 'activity',
        status: 'confirmed',
        position: 3,
        place_id: 'place-3',
        details: {},
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    title: 'Day 2',
    items: [],
  },
};

export const WithMultipleCategories: Story = {
  args: {
    title: 'Day 3',
    items: [
      {
        id: '4',
        title: 'Hotel Checkout',
        description: 'Before 11am',
        day_number: 3,
        category: 'accommodation',
        votes: [],
        creatorProfile: null,
        section_id: 'section-2',
        type: 'logistics',
        status: 'confirmed',
        position: 1,
        place_id: 'place-4',
        details: {},
      },
      {
        id: '5',
        title: 'Train to Nice',
        description: 'TGV high-speed train, 2nd class',
        day_number: 3,
        category: 'transportation',
        votes: [],
        creatorProfile: null,
        section_id: 'section-2',
        type: 'logistics',
        status: 'confirmed',
        position: 2,
        place_id: 'place-5',
        details: {},
      },
      {
        id: '6',
        title: 'Beach Time',
        description: 'Relax at the Mediterranean',
        day_number: 3,
        category: 'activity',
        votes: [],
        creatorProfile: null,
        section_id: 'section-2',
        type: 'activity',
        status: 'suggested',
        position: 3,
        place_id: 'place-6',
        details: {},
      },
    ],
  },
}; 