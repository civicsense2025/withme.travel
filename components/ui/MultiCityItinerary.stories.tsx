import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MultiCityItinerary } from './MultiCityItinerary';

const meta: Meta<typeof MultiCityItinerary> = {
  title: 'Product Marketing/MultiCityItinerary',
  component: MultiCityItinerary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A playful, animated multi-city itinerary builder for product marketing and feature demos. Uses the withme.travel design system and supports light/dark theming with fixed height containers.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MultiCityItinerary>;

export const AnimatedDemo: Story = {
  render: () => <MultiCityItinerary withBackground={false} />,
  parameters: {
    docs: {
      description: {
        story:
          'Animated demo with auto-adding items to show off the collaborative itinerary builder. Limited to 3 items per city with fixed height to prevent layout shifts.',
      },
    },
  },
};

export const StaticCustomCities: Story = {
  args: {
    initialCities: [
      {
        id: 1,
        name: 'Lisbon',
        emoji: '🇵🇹',
        color: 'bg-travel-blue',
        items: [
          {
            id: 1,
            type: 'activity',
            name: 'Pastéis de nata at Manteigaria',
            time: '09:30 AM',
            votes: 2,
          },
          { id: 2, type: 'sight', name: 'Tram 28 ride', time: '11:00 AM', votes: 4 },
          { id: 3, type: 'museum', name: 'Tile Museum', time: '02:30 PM', votes: 3 },
        ],
      },
      {
        id: 2,
        name: 'Berlin',
        emoji: '🇩🇪',
        color: 'bg-travel-pink',
        items: [
          { id: 1, type: 'restaurant', name: 'Currywurst at Curry 36', time: '12:30 PM', votes: 3 },
          { id: 2, type: 'museum', name: 'Pergamon Museum', time: '03:00 PM', votes: 5 },
          { id: 3, type: 'sunset', name: 'Sunset at Tempelhofer Feld', time: '08:00 PM', votes: 4 },
        ],
      },
      {
        id: 3,
        name: 'Santorini',
        emoji: '🇬🇷',
        color: 'bg-travel-purple',
        items: [
          { id: 1, type: 'sight', name: 'Oia Village', time: '10:00 AM', votes: 5 },
          { id: 2, type: 'water', name: 'Sailing Trip', time: '01:00 PM', votes: 4 },
          { id: 3, type: 'sunset', name: 'Sunset in Oia', time: '07:30 PM', votes: 7 },
        ],
      },
    ],
    withBackground: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Static example with custom cities and items showing how the component handles exactly 3 items per city.',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    mode: 'dark',
    initialCities: [
      {
        id: 1,
        name: 'Tokyo',
        emoji: '🇯🇵',
        color: 'bg-travel-green',
        items: [
          { id: 1, type: 'activity', name: 'Sensoji Temple', time: '09:00 AM', votes: 4 },
          { id: 2, type: 'restaurant', name: 'Sushi at Tsukiji', time: '12:00 PM', votes: 6 },
          { id: 3, type: 'sight', name: 'Tokyo Skytree', time: '05:00 PM', votes: 3 },
        ],
      },
      {
        id: 2,
        name: 'Kyoto',
        emoji: '🇯🇵',
        color: 'bg-travel-orange',
        items: [
          { id: 1, type: 'sight', name: 'Fushimi Inari Shrine', time: '08:30 AM', votes: 5 },
          { id: 2, type: 'activity', name: 'Arashiyama Bamboo Grove', time: '11:30 AM', votes: 4 },
          {
            id: 3,
            type: 'restaurant',
            name: 'Traditional dinner in Gion',
            time: '07:00 PM',
            votes: 7,
          },
        ],
      },
    ],
    withBackground: false,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Dark mode version of the itinerary builder showcasing theme adaptability.',
      },
    },
  },
};
