import type { Meta, StoryObj } from '@storybook/react';
import { DestinationDetails } from './DestinationDetails';

const meta: Meta<typeof DestinationDetails> = {
  title: 'Features/Destinations/Templates/DestinationDetails',
  component: DestinationDetails,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    destination: {
      control: 'object',
      description: 'Destination data to display',
    },
    relatedDestinations: {
      control: 'object',
      description: 'Related destinations to show',
    },
    popularPlaces: {
      control: 'object',
      description: 'Popular places within the destination',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether destination data is loading',
    },
    error: {
      control: 'text',
      description: 'Error message if destination data failed to load',
    },
    userTrips: {
      control: 'object',
      description: 'User trips for add to trip functionality',
    },
    isSaved: {
      control: 'boolean',
      description: 'Whether the destination is saved by the user',
    },
    onSaveToggle: {
      action: 'save toggled',
      description: 'Handler for when the save button is toggled',
    },
    onAddToTrip: {
      action: 'added to trip',
      description: 'Handler for when adding to a trip',
    },
    onCreateTrip: {
      action: 'create trip',
      description: 'Handler for creating a new trip',
    },
    onViewPlace: {
      action: 'view place',
      description: 'Handler for viewing a place',
    },
    onViewRelatedDestination: {
      action: 'view related destination',
      description: 'Handler for viewing a related destination',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationDetails>;

// Sample destination data
const sampleDestination = {
  id: 'paris-france',
  name: 'Paris',
  country: 'France',
  continent: 'Europe',
  description: 'Paris, the City of Light, is the capital and most populous city of France. Situated on the Seine River, in the north of the country, it is at the heart of the Île-de-France region. Paris is known for its museums and architectural landmarks, including the Eiffel Tower, the Louvre, Notre-Dame Cathedral, and its elegant boulevards and parks.',
  imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  images: [
    { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', alt: 'Eiffel Tower in Paris' },
    { url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a', alt: 'Seine River in Paris' },
    { url: 'https://images.unsplash.com/photo-1546532936-1dc2205f14a9', alt: 'Notre Dame Cathedral in Paris' },
    { url: 'https://images.unsplash.com/photo-1564660435734-30dd0373ebb4', alt: 'Louvre Museum in Paris' },
  ],
  highlights: [
    'World-renowned museums like the Louvre and Musée d\'Orsay',
    'Iconic landmarks including the Eiffel Tower and Arc de Triomphe',
    'Charming neighborhoods such as Montmartre and Le Marais',
    'Exquisite French cuisine and sidewalk cafés',
    'Elegant shopping along the Champs-Élysées',
  ],
  climate: {
    best_time_to_visit: 'April to June or September to October',
    average_temperatures: {
      spring: '8°C to 20°C',
      summer: '15°C to 25°C',
      autumn: '7°C to 21°C',
      winter: '3°C to 8°C',
    },
    rainy_season: 'Winter months (December to February)',
  },
  cuisine: [
    'Croissants and baguettes from local bakeries',
    'Classic French dishes like Coq au Vin and Beef Bourguignon',
    'Fine dining at Michelin-starred restaurants',
    'French cheese and wine pairings',
    'Delicate pastries and macarons',
  ],
  budget: {
    currency: 'Euro (€)',
    budget_level: 'High',
    average_daily_cost: '€150-200',
    budget_tips: [
      'Visit museums on the first Sunday of the month for free entry',
      'Use public transportation instead of taxis',
      'Enjoy picnics in Paris\'s beautiful parks',
      'Look for prix fixe lunch menus for better value',
    ],
  },
  practical_info: {
    languages: ['French', 'English (in tourist areas)'],
    time_zone: 'Central European Time (CET)',
    electricity: '230V, 50Hz, Type E plugs',
    transportation: [
      'Extensive metro network',
      'Bus system',
      'RER trains for suburbs',
      'Bike-sharing system (Vélib)',
    ],
  },
};

// Sample related destinations
const relatedDestinations = [
  {
    id: 'nice-france',
    name: 'Nice',
    country: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1491166617655-191d1a863df9',
    description: 'Beautiful coastal city on the French Riviera',
  },
  {
    id: 'lyon-france',
    name: 'Lyon',
    country: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1524396139085-d9c5bb3474d5',
    description: 'Known for its gastronomy and historical architecture',
  },
  {
    id: 'london-uk',
    name: 'London',
    country: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    description: 'Dynamic capital city just a short train ride away',
  },
];

// Sample popular places
const popularPlaces = [
  {
    id: 'eiffel-tower',
    name: 'Eiffel Tower',
    type: 'landmark',
    imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e',
    description: 'Iconic iron tower on the Champ de Mars',
    rating: 4.7,
  },
  {
    id: 'louvre-museum',
    name: 'Louvre Museum',
    type: 'museum',
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    description: 'World\'s largest art museum and historic monument',
    rating: 4.8,
  },
  {
    id: 'notre-dame',
    name: 'Notre-Dame Cathedral',
    type: 'landmark',
    imageUrl: 'https://images.unsplash.com/photo-1546532936-1dc2205f14a9',
    description: 'Medieval Catholic cathedral on the Île de la Cité',
    rating: 4.6,
  },
  {
    id: 'sacre-coeur',
    name: 'Sacré-Cœur Basilica',
    type: 'landmark',
    imageUrl: 'https://images.unsplash.com/photo-1550340499-a6c60986dc8e',
    description: 'Roman Catholic church and basilica on Montmartre hill',
    rating: 4.6,
  },
];

// Sample user trips
const userTrips = [
  { id: 'trip-1', name: 'Summer in Europe', startDate: '2023-06-15', endDate: '2023-06-30' },
  { id: 'trip-2', name: 'Romantic Getaway', startDate: '2023-09-10', endDate: '2023-09-20' },
  { id: 'trip-3', name: 'Christmas Markets', startDate: '2023-12-15', endDate: '2023-12-26' },
];

export const Default: Story = {
  args: {
    destination: sampleDestination,
    relatedDestinations: relatedDestinations,
    popularPlaces: popularPlaces,
    isLoading: false,
    error: null,
    userTrips: userTrips,
    isSaved: false,
  },
};

export const Loading: Story = {
  args: {
    destination: null,
    relatedDestinations: [],
    popularPlaces: [],
    isLoading: true,
    error: null,
    userTrips: [],
    isSaved: false,
  },
};

export const WithError: Story = {
  args: {
    destination: null,
    relatedDestinations: [],
    popularPlaces: [],
    isLoading: false,
    error: 'Failed to load destination data. Please try again later.',
    userTrips: [],
    isSaved: false,
  },
};

export const Saved: Story = {
  args: {
    destination: sampleDestination,
    relatedDestinations: relatedDestinations,
    popularPlaces: popularPlaces,
    isLoading: false,
    error: null,
    userTrips: userTrips,
    isSaved: true,
  },
};

export const WithoutUserTrips: Story = {
  args: {
    destination: sampleDestination,
    relatedDestinations: relatedDestinations,
    popularPlaces: popularPlaces,
    isLoading: false,
    error: null,
    userTrips: [],
    isSaved: false,
  },
};

export const WithoutRelatedDestinations: Story = {
  args: {
    destination: sampleDestination,
    relatedDestinations: [],
    popularPlaces: popularPlaces,
    isLoading: false,
    error: null,
    userTrips: userTrips,
    isSaved: false,
  },
}; 