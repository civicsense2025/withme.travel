import { Meta, StoryObj } from '@storybook/react';
import { ItineraryItemCard } from './ItineraryItemCard';
import { ItemStatus } from '@/utils/constants/status';

/**
 * ItineraryItemCard displays an itinerary item with title, details, location, and interactive elements
 */
const meta: Meta<typeof ItineraryItemCard> = {
  title: 'Features/Itineraries/Molecules/ItineraryItemCard',
  component: ItineraryItemCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    editable: { control: 'boolean' },
    isCoreItem: { control: 'boolean' },
    dayNumber: { control: 'number' },
    onEdit: { action: 'edited' },
    onDelete: { action: 'deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof ItineraryItemCard>;

const mockItem = {
  id: 'item-1',
  trip_id: 'trip-123',
  title: 'Visit Eiffel Tower',
  created_at: new Date().toISOString(),
  section_id: null,
  type: 'activity',
  item_type: null,
  date: null,
  start_time: '14:00:00',
  end_time: '16:00:00',
  location: 'Eiffel Tower, Paris, France',
  address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
  place_id: 'ChIJAQquYq_j5kcRLKslDuENAxg',
  latitude: 48.85837,
  longitude: 2.294481,
  estimated_cost: 25,
  currency: 'EUR',
  notes: 'Iconic landmark with amazing views of Paris. Consider going during sunset for the best experience.',
  description: null,
  updated_at: null,
  created_by: 'user-1',
  is_custom: true,
  day_number: null,
  category: 'Iconic Landmarks',
  status: 'confirmed' as ItemStatus,
  position: 1,
  duration_minutes: 120,
  cover_image_url: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e',
  url: null,
  votes: {
    up: 5,
    down: 1,
    total: 4,
    userVote: null,
    upVoters: ['user-2', 'user-3', 'user-4', 'user-5', 'user-6'],
    downVoters: ['user-7']
  },
  user_vote: null,
  reactions: [
    {
      id: 'reaction-1',
      user_id: 'user-1',
      emoji: '👍',
      created_at: new Date().toISOString(),
      itinerary_item_id: 'item-1'
    },
    {
      id: 'reaction-2',
      user_id: 'user-2',
      emoji: '👍',
      created_at: new Date().toISOString(),
      itinerary_item_id: 'item-1'
    }
  ],
  creatorProfile: {
    id: 'user-1',
    email: 'user@example.com',
    full_name: 'John Doe',
    avatar_url: 'https://i.pravatar.cc/150?u=user1',
  },
  place: null,
  creator_profile: null,
  formattedCategory: 'Iconic Landmarks'
};

export const Default: Story = {
  args: {
    item: mockItem,
    className: 'max-w-md',
  },
};

export const WithDayNumber: Story = {
  args: {
    item: mockItem,
    className: 'max-w-md',
    dayNumber: 2,
  },
};

export const Editable: Story = {
  args: {
    item: mockItem,
    className: 'max-w-md',
    editable: true,
  },
};

export const CoreItem: Story = {
  args: {
    item: {
      ...mockItem,
      type: 'accommodation',
      title: 'Hotel de Paris',
      location: 'Rue de Rivoli, Paris, France',
    },
    className: 'max-w-md',
    isCoreItem: true,
  },
};

export const WithURL: Story = {
  args: {
    item: {
      ...mockItem,
      url: 'https://www.toureiffel.paris/en',
    },
    className: 'max-w-md',
  },
}; 