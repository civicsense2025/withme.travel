/**
 * Place List Stories
 */
import type { Meta, StoryObj } from '@storybook/react';
import { PlaceList } from './place-list';
import { Place } from '@/components/features/places/types';

const meta: Meta<typeof PlaceList> = {
  title: 'Features/Places/Organisms/PlaceList',
  component: PlaceList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelectPlace: { action: 'place selected' },
  },
};

export default meta;
type Story = StoryObj<typeof PlaceList>;

// Sample places data
const samplePlaces: Place[] = [
  {
    id: '1',
    name: 'Delicious Restaurant',
    category: 'restaurant',
    address: '123 Main St, City',
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'A lovely restaurant with amazing food and atmosphere',
  },
  {
    id: '2',
    name: 'Famous Landmark',
    category: 'attraction',
    address: 'Landmark Square, City',
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Historic landmark with breathtaking views',
  },
  {
    id: '3',
    name: 'Luxury Hotel',
    category: 'hotel',
    address: '456 Beach Road, City',
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Five-star hotel with premium amenities',
  },
  {
    id: '4',
    name: 'Local Cafe',
    category: 'cafe',
    address: '789 Side Street, City',
    rating: 4.2,
    description: 'Cozy cafe with great coffee and pastries',
  },
];

export const Default: Story = {
  args: {
    places: samplePlaces,
    isLoading: false,
    error: '',
  },
};

export const Loading: Story = {
  args: {
    places: [],
    isLoading: true,
    error: '',
  },
};

export const Error: Story = {
  args: {
    places: [],
    isLoading: false,
    error: 'Failed to load places. Please try again.',
  },
};

export const Empty: Story = {
  args: {
    places: [],
    isLoading: false,
    error: '',
  },
};

export const WithClassName: Story = {
  args: {
    places: samplePlaces,
    isLoading: false,
    error: '',
    className: 'p-6 bg-gray-100 rounded-xl',
  },
}; 