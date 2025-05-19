import type { Meta, StoryObj } from '@storybook/react';
import { PlaceCard } from './PlaceCard';
import { PlaceCategory } from '@/types/places';

const meta: Meta<typeof PlaceCard> = {
  title: 'Features/Places/Molecules/PlaceCard',
  component: PlaceCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlaceCard>;

// Sample place data
const samplePlace = {
  id: 'place-1',
  name: 'Eiffel Tower',
  description: 'Iconic iron tower in Paris',
  address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
  latitude: 48.8584,
  longitude: 2.2945,
  category: PlaceCategory.LANDMARK,
  rating: 4.7,
  rating_count: 12853,
  website: 'https://www.toureiffel.paris/en',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  cover_image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80',
};

const restaurantPlace = {
  id: 'place-2',
  name: 'Le Jules Verne',
  description: 'Fine dining restaurant in the Eiffel Tower',
  address: 'Eiffel Tower, 2nd Floor, Avenue Gustave Eiffel, 75007 Paris, France',
  latitude: 48.8583,
  longitude: 2.2944,
  category: PlaceCategory.RESTAURANT,
  rating: 4.4,
  rating_count: 2476,
  price_level: 4,
  website: 'https://www.restaurants-toureiffel.com/en/jules-verne-restaurant.html',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  cover_image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
};

const hotelPlace = {
  id: 'place-3',
  name: 'Hotel de Crillon',
  description: 'Luxury hotel in Paris',
  address: '10 Place de la Concorde, 75008 Paris, France',
  latitude: 48.8673,
  longitude: 2.3232,
  category: PlaceCategory.HOTEL,
  rating: 4.8,
  rating_count: 1043,
  price_level: 5,
  website: 'https://www.rosewoodhotels.com/en/hotel-de-crillon',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  cover_image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
};

// Default story
export const Default: Story = {
  args: {
    place: samplePlace,
    fullWidth: false,
    showImage: true,
    showAddress: true,
    showRating: true,
    showCategory: true,
    showWebsite: false,
    interactive: true,
    compact: false,
  },
};

// Compact version
export const Compact: Story = {
  args: {
    place: samplePlace,
    fullWidth: false,
    showImage: true,
    showAddress: true,
    showRating: true,
    showCategory: true,
    showWebsite: false,
    interactive: true,
    compact: true,
  },
};

// Restaurant card
export const Restaurant: Story = {
  args: {
    place: restaurantPlace,
    fullWidth: false,
    showImage: true,
    showAddress: true,
    showRating: true,
    showCategory: true,
    showWebsite: false,
  },
};

// Hotel card
export const Hotel: Story = {
  args: {
    place: hotelPlace,
    fullWidth: false,
    showImage: true,
    showAddress: true,
    showRating: true,
    showCategory: true,
    showWebsite: true,
  },
};

// No image
export const NoImage: Story = {
  args: {
    place: samplePlace,
    fullWidth: false,
    showImage: false,
    showAddress: true,
    showRating: true,
    showCategory: true,
  },
};

// Full width card
export const FullWidth: Story = {
  args: {
    place: samplePlace,
    fullWidth: true,
    showImage: true,
    showAddress: true,
    showRating: true,
    showCategory: true,
  },
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'gray' },
  },
  decorators: [
    (Story) => (
      <div className="p-4 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

// Card collection
export const CardCollection: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <PlaceCard place={samplePlace} />
      <PlaceCard place={restaurantPlace} />
      <PlaceCard place={hotelPlace} />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}; 