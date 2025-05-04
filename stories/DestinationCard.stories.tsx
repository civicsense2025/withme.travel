import type { Meta, StoryObj } from '@storybook/react';
import { DestinationCard } from '../components/destination-card';

const mockDestination = {
  id: '1',
  city: 'Paris',
  country: 'France',
  continent: 'Europe',
  description: 'The city of lights and romance, known for the Eiffel Tower, Louvre Museum, and exquisite cuisine.',
  byline: 'Fall in love with the city of lights',
  highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Seine River Cruise'],
  image_url: '/destinations/paris.jpg',
  emoji: '🇫🇷',
  image_metadata: {
    alt_text: 'Scenic view of Paris with the Eiffel Tower',
    attribution: 'Photo by Jean Dupont on Unsplash',
    photographer_name: 'Jean Dupont',
    photographer_url: 'https://unsplash.com/@jeandupont',
    source: 'unsplash',
    source_id: 'abc123',
    url: 'https://unsplash.com/photos/abc123'
  },
  cuisine_rating: 5,
  nightlife_rating: 4,
  cultural_attractions: 5,
  outdoor_activities: 3,
  beach_quality: 1,
  best_season: 'Spring',
  avg_cost_per_day: 150,
  safety_rating: 4
};

const minimalDestination = {
  id: '2',
  city: 'Barcelona',
  country: 'Spain',
  continent: 'Europe',
  description: 'A vibrant city known for its art and architecture.',
  image_url: '/destinations/barcelona.jpg',
  cuisine_rating: 4,
  nightlife_rating: 5,
  cultural_attractions: 4,
  outdoor_activities: 4,
  beach_quality: 4
};

const meta: Meta<typeof DestinationCard> = {
  title: 'DestinationCard',
  component: DestinationCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DestinationCard>;

export const Default: Story = {
  args: {
    destination: mockDestination,
  },
};

export const Minimal: Story = {
  args: {
    destination: minimalDestination,
  },
};

export const WithCustomLink: Story = {
  args: {
    destination: mockDestination,
    href: '/explore/paris-france',
  },
};

export const LongCityName: Story = {
  args: {
    destination: {
      ...mockDestination,
      city: 'Saint Petersburg',
      country: 'Russia',
    },
  },
};

export const HideAttributionMobile: Story = {
  args: {
    destination: mockDestination,
    hideAttributionMobile: true,
  },
}; 