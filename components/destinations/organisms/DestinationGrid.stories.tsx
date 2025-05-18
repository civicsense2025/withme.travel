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
  title: 'Destinations/Organisms/DestinationGrid',
  component: DestinationGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    onDestinationClick: { action: 'destination clicked' },
    showSearch: { control: 'boolean' },
    showFilters: { control: 'boolean' },
    showSorting: { control: 'boolean' },
    initialSearchTerm: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="container p-8">
        <Story />
      </div>
    ),
  ],
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
    { name: 'Thailand', emoji: '🇹🇭' },
    { name: 'Australia', emoji: '🇦🇺' },
    { name: 'Brazil', emoji: '🇧🇷' },
    { name: 'Egypt', emoji: '🇪🇬' },
  ];
  const cities = [
    'Paris', 'Tokyo', 'Rome', 'New York', 'Bangkok', 
    'Sydney', 'Rio de Janeiro', 'Cairo', 'London', 
    'Barcelona', 'Kyoto', 'Florence', 'San Francisco', 
    'Chiang Mai', 'Melbourne', 'São Paulo', 'Alexandria'
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
      image_url: `https://source.unsplash.com/300x400/?${city.toLowerCase().replace(/\s+/g, '-')},${country.name.toLowerCase().replace(/\s+/g, '-')}`,
      byline: `Experience the beauty of ${city}`,
      cuisine_rating: Math.floor(Math.random() * 5) + 1,
      nightlife_rating: Math.floor(Math.random() * 5) + 1,
      cultural_attractions: Math.floor(Math.random() * 5) + 1,
      outdoor_activities: Math.floor(Math.random() * 5) + 1,
      beach_quality: Math.floor(Math.random() * 5) + 1,
      safety_rating: Math.floor(Math.random() * 5) + 1,
      avg_cost_per_day: Math.floor(Math.random() * 200) + 50,
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