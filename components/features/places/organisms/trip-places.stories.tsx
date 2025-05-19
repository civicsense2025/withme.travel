/**
 * TripPlaces Stories
 */
import type { Meta, StoryObj } from '@storybook/react';
import { TripPlaces } from './trip-places';
import { Place } from '@/components/features/places/types';
import * as reactHooks from '@/lib/features/places/hooks';

// Mock data
const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Eiffel Tower',
    category: 'attraction',
    address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=500',
    description: 'Iconic landmark and one of the most recognizable structures in the world',
  },
  {
    id: '2',
    name: 'Le Petit Café',
    category: 'restaurant',
    address: '123 Rue de Rivoli, Paris, France',
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
    description: 'Charming café with authentic French cuisine and pastries',
  },
  {
    id: '3',
    name: 'Hôtel de Ville',
    category: 'hotel',
    address: '456 Avenue des Champs-Élysées, Paris, France',
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500',
    description: 'Luxurious boutique hotel in the heart of Paris',
  },
];

// Mock the usePlaces hook
const mockUsePlaces = (places: Place[], isLoading = false, error: string | null = null) => {
  return {
    places,
    isLoading,
    error,
    refreshPlaces: async () => {},
    addPlace: async () => null,
    updatePlace: async () => null,
    deletePlace: async () => false,
  };
};

const meta: Meta<typeof TripPlaces> = {
  title: 'Features/Places/Organisms/TripPlaces',
  component: TripPlaces,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onAddPlace: { action: 'add place clicked' },
    onSelectPlace: { action: 'place selected' },
  },
  decorators: [
    (Story, context) => {
      // Mock the hook based on story parameters
      const mockData = context.parameters.mockData || {};
      const isLoading = mockData.isLoading || false;
      const error = mockData.error || null;
      const places = mockData.places || mockPlaces;

      jest.spyOn(reactHooks, 'usePlaces').mockImplementation(() => 
        mockUsePlaces(places, isLoading, error)
      );

      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof TripPlaces>;

export const Default: Story = {
  args: {
    tripId: 'trip-123',
    canEdit: true,
  },
  parameters: {
    mockData: {
      places: mockPlaces,
      isLoading: false,
      error: null,
    },
  },
};

export const Loading: Story = {
  args: {
    tripId: 'trip-123',
    canEdit: true,
  },
  parameters: {
    mockData: {
      places: [],
      isLoading: true,
      error: null,
    },
  },
};

export const Error: Story = {
  args: {
    tripId: 'trip-123',
    canEdit: true,
  },
  parameters: {
    mockData: {
      places: [],
      isLoading: false,
      error: 'Failed to load places. Please try again.',
    },
  },
};

export const Empty: Story = {
  args: {
    tripId: 'trip-123',
    canEdit: true,
  },
  parameters: {
    mockData: {
      places: [],
      isLoading: false,
      error: null,
    },
  },
};

export const ReadOnly: Story = {
  args: {
    tripId: 'trip-123',
    canEdit: false,
  },
  parameters: {
    mockData: {
      places: mockPlaces,
      isLoading: false,
      error: null,
    },
  },
}; 