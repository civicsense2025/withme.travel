import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryDisplay } from './ItineraryDisplay';
import type { EnhancedDisplayItem } from './ItineraryDisplay';

const meta: Meta<typeof ItineraryDisplay> = {
  title: 'Itinerary/ItineraryDisplay',
  component: ItineraryDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ItineraryDisplay>;

const mockItems: EnhancedDisplayItem[] = [
  {
    id: 'item-1',
    trip_id: 'trip-123',
    title: 'Visit Sagrada Familia',
    created_at: '2024-07-01T10:00:00Z',
    section_id: '',
    type: '',
    item_type: null,
    date: '2024-07-01',
    start_time: '10:00',
    end_time: '12:00',
    location: 'Barcelona',
    address: 'Carrer de Mallorca, 401',
    place_id: null,
    latitude: 41.4036,
    longitude: 2.1744,
    estimated_cost: 25,
    currency: 'EUR',
    notes: 'Buy tickets in advance',
    description: 'Tour the iconic basilica.',
    updated_at: undefined,
    created_by: 'user-1',
    is_custom: false,
    day_number: 1,
    category: 'Iconic Landmarks',
    status: 'suggested',
    position: 1,
    duration_minutes: 120,
    cover_image_url: undefined,
    creator_profile: undefined,
    votes: {
      up: 3,
      down: 0,
      upVoters: [],
      downVoters: [],
      userVote: undefined,
    },
    user_vote: undefined,
    creatorProfile: undefined,
    place: undefined,
    formattedCategory: 'Iconic Landmarks',
  },
];

export const Default: Story = {
  args: {
    initialItems: mockItems,
    tripId: 'trip-123',
    canEdit: true,
  },
};

export const ReadOnly: Story = {
  args: {
    initialItems: mockItems,
    tripId: 'trip-123',
    canEdit: false,
  },
};
