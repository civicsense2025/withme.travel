/**
 * Storybook stories for PopularDestinationsGrid
 * Allows visual testing of the grid with mock data and both tooltip and dialog variants.
 */

import React from 'react';
import { PopularDestinationsGrid, Destination } from './popular-destinations';
import { Meta, StoryObj } from '@storybook/react';

const mockDestinations: Destination[] = [
  {
    id: '1',
    name: 'Tokyo',
    slug: 'tokyo',
    emoji: '🗼',
    byline: 'Japan',
    description: 'A vibrant city blending tradition and technology.',
    highlights: ['Sushi', 'Shibuya Crossing', 'Cherry Blossoms'],
  },
  {
    id: '2',
    name: 'Paris',
    slug: 'paris',
    emoji: '🗼',
    byline: 'France',
    description: 'The city of lights and romance.',
    highlights: ['Eiffel Tower', 'Cafés', 'Museums'],
  },
  {
    id: '3',
    name: 'New York',
    slug: 'new-york',
    emoji: '🗽',
    byline: 'USA',
    description: 'The city that never sleeps.',
    highlights: ['Broadway', 'Central Park', 'Skyscrapers'],
  },
  {
    id: '4',
    name: 'Sydney',
    slug: 'sydney',
    emoji: '🌉',
    byline: 'Australia',
    description: 'Harbor city with iconic landmarks.',
    highlights: ['Opera House', 'Beaches', 'Harbor Bridge'],
  },
  {
    id: '5',
    name: 'Rio',
    slug: 'rio',
    emoji: '🎉',
    byline: 'Brazil',
    description: 'Carnival, beaches, and mountains.',
    highlights: ['Carnival', 'Copacabana', 'Christ the Redeemer'],
  },
  {
    id: '6',
    name: 'London',
    slug: 'london',
    emoji: '🎡',
    byline: 'UK',
    description: 'History, culture, and modern life.',
    highlights: ['Big Ben', 'Museums', 'Pubs'],
  },
  // Add more mock destinations as needed
];

const meta: Meta<typeof PopularDestinationsGrid> = {
  title: 'Destinations/PopularDestinationsGrid',
  component: PopularDestinationsGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof PopularDestinationsGrid>;

export const TooltipVariant: Story = {
  args: {
    destinations: mockDestinations,
    showDialog: false,
    showPopover: false,
  },
  render: (args) => <PopularDestinationsGrid {...args} />,
};

export const DialogVariant: Story = {
  args: {
    destinations: mockDestinations,
    showDialog: true,
    showPopover: false,
  },
  render: (args) => <PopularDestinationsGrid {...args} />,
};

export const PopoverVariant: Story = {
  args: {
    destinations: mockDestinations,
    showDialog: false,
    showPopover: true,
  },
  render: (args) => <PopularDestinationsGrid {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Hover over a destination to see details and quickly create a trip with one click.',
      },
    },
  },
}; 