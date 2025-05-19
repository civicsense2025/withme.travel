import type { Meta, StoryObj } from '@storybook/react';
import { DestinationTripPlanner } from './DestinationTripPlanner';

const meta: Meta<typeof DestinationTripPlanner> = {
  title: 'Features/Destinations/Templates/DestinationTripPlanner',
  component: DestinationTripPlanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    destination: {
      control: 'object',
      description: 'Destination data for trip planning',
    },
    suggestedPlaces: {
      control: 'object',
      description: 'Places suggested for the trip',
    },
    suggestedDuration: {
      control: 'object',
      description: 'Suggested duration options for the trip',
    },
    userTrips: {
      control: 'object',
      description: 'Existing user trips',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether data is loading',
    },
    error: {
      control: 'text',
      description: 'Error message if loading failed',
    },
    onCreateTrip: {
      action: 'create trip',
      description: 'Handler for creating a new trip',
    },
    onAddToTrip: {
      action: 'add to trip',
      description: 'Handler for adding destination to existing trip',
    },
    onSelectPlace: {
      action: 'select place',
      description: 'Handler for selecting a place to include',
    },
    onChangeDuration: {
      action: 'change duration',
      description: 'Handler for changing trip duration',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationTripPlanner>;

// Sample destination data
const sampleDestination = {
  id: 'tokyo-japan',
  name: 'Tokyo',
  country: 'Japan',
  description: 'Tokyo, Japan\'s busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples.',
  imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
  climate: {
    best_time_to_visit: 'March to May and September to November',
    average_temperatures: {
      spring: '10°C to 21°C',
      summer: '21°C to 31°C',
      autumn: '12°C to 24°C',
      winter: '2°C to 13°C',
    },
  },
  practical_info: {
    languages: ['Japanese', 'English (limited)'],
    time_zone: 'Japan Standard Time (JST)',
    transportation: [
      'Extensive metro and train network',
      'Buses',
      'Taxis',
    ],
  },
};

// Sample suggested places
const suggestedPlaces = [
  {
    id: 'tokyo-skytree',
    name: 'Tokyo Skytree',
    type: 'landmark',
    description: 'Tall broadcasting tower with observation decks',
    imageUrl: 'https://images.unsplash.com/photo-1509785307496-c7f20b6151fb',
    rating: 4.5,
    duration: 2, // hours
  },
  {
    id: 'sensoji-temple',
    name: 'Sensō-ji Temple',
    type: 'cultural',
    description: 'Ancient Buddhist temple in Asakusa',
    imageUrl: 'https://images.unsplash.com/photo-1583396728312-ff99a89e56d0',
    rating: 4.7,
    duration: 1.5,
  },
  {
    id: 'meiji-shrine',
    name: 'Meiji Shrine',
    type: 'cultural',
    description: 'Shinto shrine dedicated to Emperor Meiji',
    imageUrl: 'https://images.unsplash.com/photo-1570125656106-cc2a9a61f7fe',
    rating: 4.6,
    duration: 1.5,
  },
  {
    id: 'tsukiji-market',
    name: 'Tsukiji Outer Market',
    type: 'food',
    description: 'Famous market with fresh seafood and local specialties',
    imageUrl: 'https://images.unsplash.com/photo-1531253225256-5e0bee3a1b45',
    rating: 4.4,
    duration: 2,
  },
  {
    id: 'shibuya-crossing',
    name: 'Shibuya Crossing',
    type: 'urban',
    description: 'Famous intersection known for its scramble crossing',
    imageUrl: 'https://images.unsplash.com/photo-1554797589-7241bb691973',
    rating: 4.5,
    duration: 1,
  },
];

// Sample suggested durations
const suggestedDuration = [
  { days: 3, label: 'Weekend trip', description: 'See the highlights' },
  { days: 5, label: 'Short vacation', description: 'Explore the city in depth' },
  { days: 7, label: 'Extended trip', description: 'Include day trips to nearby areas' },
];

// Sample user trips
const userTrips = [
  { id: 'trip-1', name: 'Japan Adventure', startDate: '2023-10-15', endDate: '2023-10-30' },
  { id: 'trip-2', name: 'Asian Cities Tour', startDate: '2024-03-10', endDate: '2024-03-25' },
];

export const Default: Story = {
  args: {
    destination: sampleDestination,
    suggestedPlaces,
    suggestedDuration,
    userTrips,
    isLoading: false,
    error: null,
  },
};

export const Loading: Story = {
  args: {
    destination: null,
    suggestedPlaces: [],
    suggestedDuration: [],
    userTrips: [],
    isLoading: true,
    error: null,
  },
};

export const WithError: Story = {
  args: {
    destination: null,
    suggestedPlaces: [],
    suggestedDuration: [],
    userTrips: [],
    isLoading: false,
    error: 'Failed to load trip planning data. Please try again.',
  },
};

export const NoUserTrips: Story = {
  args: {
    destination: sampleDestination,
    suggestedPlaces,
    suggestedDuration,
    userTrips: [],
    isLoading: false,
    error: null,
  },
};

export const FewSuggestedPlaces: Story = {
  args: {
    destination: sampleDestination,
    suggestedPlaces: suggestedPlaces.slice(0, 2),
    suggestedDuration,
    userTrips,
    isLoading: false,
    error: null,
  },
}; 