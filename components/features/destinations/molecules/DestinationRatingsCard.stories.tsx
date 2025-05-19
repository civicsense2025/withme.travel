import type { Meta, StoryObj } from '@storybook/react';
import { DestinationRatingsCard } from './DestinationRatingsCard';

const meta: Meta<typeof DestinationRatingsCard> = {
  title: 'Destinations/Molecules/DestinationRatingsCard',
  component: DestinationRatingsCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    cuisineRating: { 
      control: { type: 'range', min: 0, max: 5, step: 0.5 },
      description: 'Rating for local cuisine'
    },
    nightlifeRating: { 
      control: { type: 'range', min: 0, max: 5, step: 0.5 },
      description: 'Rating for nightlife'
    },
    culturalAttractions: { 
      control: { type: 'range', min: 0, max: 5, step: 0.5 },
      description: 'Rating for cultural attractions'
    },
    outdoorActivities: { 
      control: { type: 'range', min: 0, max: 5, step: 0.5 },
      description: 'Rating for outdoor activities'
    },
    beachQuality: { 
      control: { type: 'range', min: 0, max: 5, step: 0.5 },
      description: 'Rating for beach quality'
    },
    safetyRating: { 
      control: { type: 'range', min: 0, max: 5, step: 0.5 },
      description: 'Rating for safety'
    },
    title: {
      control: 'text',
      description: 'Card title'
    }
  },
};

export default meta;
type Story = StoryObj<typeof DestinationRatingsCard>;

export const Default: Story = {
  args: {
    cuisineRating: 4.5,
    nightlifeRating: 4.0,
    culturalAttractions: 5.0,
    outdoorActivities: 3.5,
    beachQuality: 2.0,
    safetyRating: 4.5,
  },
};

export const HighRatings: Story = {
  args: {
    cuisineRating: 5.0,
    nightlifeRating: 4.5,
    culturalAttractions: 5.0,
    outdoorActivities: 4.5,
    beachQuality: 5.0,
    safetyRating: 5.0,
    title: "Top-Rated Destination"
  },
};

export const LowRatings: Story = {
  args: {
    cuisineRating: 2.0,
    nightlifeRating: 1.0,
    culturalAttractions: 2.5,
    outdoorActivities: 1.5,
    beachQuality: 1.0,
    safetyRating: 2.0,
    title: "Lower-Rated Destination"
  },
};

export const BeachDestination: Story = {
  args: {
    cuisineRating: 3.5,
    nightlifeRating: 4.0,
    culturalAttractions: 2.0,
    outdoorActivities: 4.5,
    beachQuality: 5.0,
    safetyRating: 4.0,
    title: "Beach Resort Ratings"
  },
};

export const PartialRatings: Story = {
  args: {
    cuisineRating: 4.0,
    culturalAttractions: 4.5,
    safetyRating: 3.5,
  },
}; 