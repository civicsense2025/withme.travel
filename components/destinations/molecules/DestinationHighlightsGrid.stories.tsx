import type { Meta, StoryObj } from '@storybook/react';
import { DestinationHighlightsGrid } from './DestinationHighlightsGrid';

const meta: Meta<typeof DestinationHighlightsGrid> = {
  title: 'Destinations/Molecules/DestinationHighlightsGrid',
  component: DestinationHighlightsGrid,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    highlights: {
      control: 'object',
      description: 'Array of highlight text items',
    },
    beachQuality: {
      control: { type: 'range', min: 0, max: 5, step: 0.5 },
      description: 'Rating for beach quality',
    },
    nightlifeRating: {
      control: { type: 'range', min: 0, max: 5, step: 0.5 },
      description: 'Rating for nightlife',
    },
    title: {
      control: 'text',
      description: 'Section title',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationHighlightsGrid>;

export const Default: Story = {
  args: {
    highlights: [
      'Beautiful architecture',
      'Rich history',
      'Amazing food scene',
      'Friendly locals'
    ],
    beachQuality: null,
    nightlifeRating: null,
  },
};

export const WithStringHighlights: Story = {
  args: {
    highlights: 'Stunning views, Historic sites, Local markets, Street food',
    beachQuality: null,
    nightlifeRating: null,
  },
};

export const BeachDestination: Story = {
  args: {
    highlights: [
      'Crystal clear waters',
      'Soft white sand',
      'Water sports',
    ],
    beachQuality: 4.5,
    nightlifeRating: 3.0,
    title: 'Beach Highlights',
  },
};

export const PartyDestination: Story = {
  args: {
    highlights: [
      'World-class clubs',
      'Popular bars',
      'Live music venues',
    ],
    beachQuality: 3.0,
    nightlifeRating: 5.0,
    title: 'Nightlife Highlights',
  },
};

export const CompleteDestination: Story = {
  args: {
    highlights: [
      'Historic sites',
      'Amazing restaurants',
      'Beautiful scenery',
    ],
    beachQuality: 4.5,
    nightlifeRating: 4.5,
    title: 'Destination Features',
  },
}; 