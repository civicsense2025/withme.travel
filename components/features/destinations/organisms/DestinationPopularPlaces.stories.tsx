import type { Meta, StoryObj } from '@storybook/react';
import { DestinationPopularPlaces } from './DestinationPopularPlaces';

const meta: Meta<typeof DestinationPopularPlaces> = {
  title: 'Features/Destinations/Organisms/DestinationPopularPlaces',
  component: DestinationPopularPlaces,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    destinationName: {
      control: 'text',
      description: 'Name of the destination',
    },
    places: {
      control: 'object',
      description: 'Array of popular places in the destination',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether places data is loading',
    },
    error: {
      control: 'text',
      description: 'Error message if places failed to load',
    },
    onViewPlace: {
      action: 'view place',
      description: 'Handler for when a place is clicked',
    },
    onViewAllPlaces: {
      action: 'view all places',
      description: 'Handler for when "View All" button is clicked',
    },
    maxInitialPlaces: {
      control: { type: 'number', min: 2, max: 10 },
      description: 'Maximum number of places to show initially',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationPopularPlaces>;

// Sample popular places
const samplePlaces = [
  {
    id: 'eiffel-tower',
    name: 'Eiffel Tower',
    description: 'Iconic iron tower on the Champ de Mars',
    imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e',
    type: 'landmark',
    rating: 4.7,
    reviewCount: 87500,
    estimatedDuration: '2-3 hours',
    price: {
      level: 'moderate',
      rangeText: '€17.10 - €28.30',
    },
    openingHours: '9:00 AM - 11:45 PM',
    location: {
      address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
      lat: 48.8584,
      lng: 2.2945,
    },
  },
  {
    id: 'louvre-museum',
    name: 'Louvre Museum',
    description: 'World\'s largest art museum and historic monument',
    imageUrl: 'https://images.unsplash.com/photo-1564660435734-30dd0373ebb4',
    type: 'museum',
    rating: 4.8,
    reviewCount: 92300,
    estimatedDuration: '3-4 hours',
    price: {
      level: 'moderate',
      rangeText: '€15 - €17',
    },
    openingHours: '9:00 AM - 6:00 PM, Closed on Tuesdays',
    location: {
      address: 'Rue de Rivoli, 75001 Paris, France',
      lat: 48.8606,
      lng: 2.3376,
    },
  },
  {
    id: 'notre-dame',
    name: 'Notre-Dame Cathedral',
    description: 'Medieval Catholic cathedral on the Île de la Cité',
    imageUrl: 'https://images.unsplash.com/photo-1546532936-1dc2205f14a9',
    type: 'landmark',
    rating: 4.6,
    reviewCount: 71200,
    estimatedDuration: '1-2 hours',
    price: {
      level: 'free',
      rangeText: 'Free (exterior viewing only due to reconstruction)',
    },
    openingHours: 'Exterior viewing only',
    location: {
      address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris, France',
      lat: 48.8530,
      lng: 2.3499,
    },
  },
  {
    id: 'sacre-coeur',
    name: 'Sacré-Cœur Basilica',
    description: 'Roman Catholic church and basilica on Montmartre hill',
    imageUrl: 'https://images.unsplash.com/photo-1550340499-a6c60986dc8e',
    type: 'landmark',
    rating: 4.6,
    reviewCount: 68900,
    estimatedDuration: '1-2 hours',
    price: {
      level: 'free',
      rangeText: 'Free (donation suggested)',
    },
    openingHours: '6:30 AM - 10:30 PM',
    location: {
      address: '35 Rue du Chevalier de la Barre, 75018 Paris, France',
      lat: 48.8867,
      lng: 2.3431,
    },
  },
  {
    id: 'arc-de-triomphe',
    name: 'Arc de Triomphe',
    description: 'Iconic triumphal arch honoring those who fought for France',
    imageUrl: 'https://images.unsplash.com/photo-1567592088906-9261e50a6b2c',
    type: 'landmark',
    rating: 4.7,
    reviewCount: 65800,
    estimatedDuration: '1 hour',
    price: {
      level: 'budget',
      rangeText: '€13',
    },
    openingHours: '10:00 AM - 10:30 PM',
    location: {
      address: 'Place Charles de Gaulle, 75008 Paris, France',
      lat: 48.8738,
      lng: 2.2950,
    },
  },
];

export const Default: Story = {
  args: {
    destinationName: 'Paris',
    places: samplePlaces,
    isLoading: false,
    error: null,
    maxInitialPlaces: 4,
  },
};

export const Loading: Story = {
  args: {
    destinationName: 'Paris',
    places: [],
    isLoading: true,
    error: null,
    maxInitialPlaces: 4,
  },
};

export const WithError: Story = {
  args: {
    destinationName: 'Paris',
    places: [],
    isLoading: false,
    error: 'Failed to load popular places. Please try again later.',
    maxInitialPlaces: 4,
  },
};

export const LimitedPlaces: Story = {
  args: {
    destinationName: 'Paris',
    places: samplePlaces.slice(0, 2),
    isLoading: false,
    error: null,
    maxInitialPlaces: 4,
  },
};

export const ShowFewerInitially: Story = {
  args: {
    destinationName: 'Paris',
    places: samplePlaces,
    isLoading: false,
    error: null,
    maxInitialPlaces: 2,
  },
}; 