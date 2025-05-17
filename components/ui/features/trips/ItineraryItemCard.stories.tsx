import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryItemCard } from './ItineraryItemCard';
import type { DisplayItineraryItem } from '@/types/itinerary';

const meta: Meta<typeof ItineraryItemCard> = {
  title: 'UI/Features/trips/ItineraryItemCard',
  component: ItineraryItemCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ItineraryItemCard>;

const mockItem: DisplayItineraryItem = {
  id: 'item-1',
  trip_id: 'trip-123',
  title: 'Visit Sagrada Familia',
  created_at: '2024-07-01T10:00:00Z',
  section_id: null,
  type: null,
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
  updated_at: null,
  created_by: 'user-1',
  is_custom: false,
  day_number: 1,
  category: 'Iconic Landmarks',
  status: 'suggested',
  position: 1,
  duration_minutes: 120,
  cover_image_url: null,
  creator_profile: undefined,
  votes: {
    up: 3,
    down: 0,
    upVoters: [],
    downVoters: [],
    userVote: null,
  },
  user_vote: null,
  creatorProfile: null,
  place: null,
  formattedCategory: 'Iconic Landmarks',
};

export const Default: Story = {
  args: {
    item: mockItem,
  },
};

export const Editable: Story = {
  args: {
    item: mockItem,
    editable: true,
  },
};

export const CoreItem: Story = {
  args: {
    item: mockItem,
    isCoreItem: true,
  },
};

export const Overlay: Story = {
  args: {
    item: mockItem,
    isOverlay: true,
  },
};
