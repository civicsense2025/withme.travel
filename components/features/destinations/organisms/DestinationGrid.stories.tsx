/**
 * Destination Grid Stories
 * 
 * Storybook stories for the DestinationGrid component
 * 
 * @module destinations/organisms
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DestinationGrid } from './DestinationGrid';

const meta: Meta<typeof DestinationGrid> = {
  title: 'Features/Destinations/Organisms/DestinationGrid',
  component: DestinationGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    destinations: {
      control: 'object',
      description: 'Array of destination objects to display',
    },
    onDestinationClick: {
      action: 'destination clicked',
      description: 'Handler for when a destination card is clicked',
    },
    showSearch: {
      control: 'boolean',
      description: 'Whether to show search functionality',
    },
    showFilters: {
      control: 'boolean',
      description: 'Whether to show filtering options',
    },
    showSorting: {
      control: 'boolean',
      description: 'Whether to show sorting options',
    },
    initialSearchTerm: {
      control: 'text',
      description: 'Initial search term to populate the search field',
    },
    columns: {
      control: 'object',
      description: 'Number of columns at different breakpoints',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationGrid>;

// Generate sample destinations data
const generateDestinations = (count: number) => {
  const continents = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];
  const countries = [
    { name: 'France', emoji: '🇫🇷' },
    { name: 'Japan', emoji: '🇯🇵' },
    { name: 'Italy', emoji: '🇮🇹' },
    { name: 'United States', emoji: '🇺🇸' },
    { name: 'Spain', emoji: '🇪🇸' },
    { name: 'United Kingdom', emoji: '🇬🇧' },
  ];
  const cities = [
    'Paris', 'Tokyo', 'Rome', 'New York', 'Barcelona', 
    'London', 'Kyoto', 'Florence', 'San Francisco', 
    'Madrid', 'Berlin', 'Amsterdam', 'Seoul', 'Toronto'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const country = countries[i % countries.length];
    const city = cities[i % cities.length];
    const continent = continents[i % continents.length];
    
    return {
      id: `dest-${i}`,
      name: city,
      city: city,
      country: country.name,
      continent: continent,
      emoji: country.emoji,
      image_url: `https://images.unsplash.com/photo-${1500000000 + i * 10000}?w=300&h=400`,
      byline: `Experience the beauty of ${city}`,
    };
  });
};

export const Default: Story = {
  args: {
    destinations: generateDestinations(12),
    showSearch: true,
    showFilters: true,
    showSorting: true,
    columns: { sm: 1, md: 2, lg: 3 },
  },
};

export const MinimalControls: Story = {
  args: {
    destinations: generateDestinations(12),
    showSearch: true,
    showFilters: false,
    showSorting: false,
  },
};

export const WithInitialSearch: Story = {
  args: {
    destinations: generateDestinations(12),
    showSearch: true,
    showFilters: true,
    showSorting: true,
    initialSearchTerm: 'Paris',
  },
};

export const ManyDestinations: Story = {
  args: {
    destinations: generateDestinations(24),
    showSearch: true,
    showFilters: true,
    showSorting: true,
  },
};

export const NoDestinations: Story = {
  args: {
    destinations: [],
    showSearch: true,
    showFilters: true,
    showSorting: true,
  },
};

export const CustomColumns: Story = {
  args: {
    destinations: generateDestinations(12),
    showSearch: true,
    showFilters: true,
    showSorting: true,
    columns: { sm: 2, md: 3, lg: 4 },
  },
};

export const WithDestinationClickHandler: Story = {
  args: {
    destinations: generateDestinations(12),
    onDestinationClick: (destination) => console.log('Clicked on:', destination.name),
    showSearch: true,
    showFilters: true,
    showSorting: true,
  },
}; 