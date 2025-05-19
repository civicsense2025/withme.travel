import type { Meta, StoryObj } from '@storybook/react';
import { DestinationRelated } from './DestinationRelated';

const meta: Meta<typeof DestinationRelated> = {
  title: 'Features/Destinations/Organisms/DestinationRelated',
  component: DestinationRelated,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    currentDestination: {
      control: 'object',
      description: 'Current destination data',
    },
    relatedDestinations: {
      control: 'object',
      description: 'Array of related destinations',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether related destinations are loading',
    },
    error: {
      control: 'text',
      description: 'Error message if failed to load',
    },
    onViewDestination: {
      action: 'view destination',
      description: 'Handler for when a destination is clicked',
    },
    maxToShow: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of related destinations to show',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationRelated>;

// Sample current destination
const sampleCurrentDestination = {
  id: 'paris-france',
  name: 'Paris',
  country: 'France',
  continent: 'Europe',
  imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
};

// Sample related destinations
const sampleRelatedDestinations = [
  {
    id: 'nice-france',
    name: 'Nice',
    country: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1491166617655-191d1a863df9',
    description: 'Beautiful coastal city on the French Riviera',
    similarity: 'Same country',
    distanceKm: 688,
  },
  {
    id: 'lyon-france',
    name: 'Lyon',
    country: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1524396139085-d9c5bb3474d5',
    description: 'Known for its gastronomy and historical architecture',
    similarity: 'Same country',
    distanceKm: 392,
  },
  {
    id: 'london-uk',
    name: 'London',
    country: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    description: 'Dynamic capital city just a short train ride away',
    similarity: 'Major European capital',
    distanceKm: 344,
  },
  {
    id: 'rome-italy',
    name: 'Rome',
    country: 'Italy',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
    description: 'Historic city with incredible architecture and cuisine',
    similarity: 'Historic European capital',
    distanceKm: 1107,
  },
  {
    id: 'barcelona-spain',
    name: 'Barcelona',
    country: 'Spain',
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
    description: 'Vibrant coastal city known for Gaudi architecture',
    similarity: 'Popular European tourism destination',
    distanceKm: 831,
  },
];

export const Default: Story = {
  args: {
    currentDestination: sampleCurrentDestination,
    relatedDestinations: sampleRelatedDestinations,
    isLoading: false,
    error: null,
    maxToShow: 4,
  },
};

export const Loading: Story = {
  args: {
    currentDestination: sampleCurrentDestination,
    relatedDestinations: [],
    isLoading: true,
    error: null,
    maxToShow: 4,
  },
};

export const WithError: Story = {
  args: {
    currentDestination: sampleCurrentDestination,
    relatedDestinations: [],
    isLoading: false,
    error: 'Failed to load related destinations. Please try again.',
    maxToShow: 4,
  },
};

export const LimitedRelated: Story = {
  args: {
    currentDestination: sampleCurrentDestination,
    relatedDestinations: sampleRelatedDestinations.slice(0, 2),
    isLoading: false,
    error: null,
    maxToShow: 4,
  },
};

export const ShowFewerDestinations: Story = {
  args: {
    currentDestination: sampleCurrentDestination,
    relatedDestinations: sampleRelatedDestinations,
    isLoading: false,
    error: null,
    maxToShow: 3,
  },
}; 