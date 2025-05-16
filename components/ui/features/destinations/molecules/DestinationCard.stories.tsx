/**
 * DestinationCard Component Stories
 * 
 * Storybook stories for the DestinationCard component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DestinationCard } from './DestinationCard';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof DestinationCard> = {
  title: 'Features/Destinations/Molecules/DestinationCard',
  component: DestinationCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationCard>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default story with minimal props
 */
export const Default: Story = {
  args: {
    destination: {
      id: 'paris-france',
      city: 'Paris',
      country: 'France',
      continent: 'Europe',
      description: 'The City of Light is one of the world\'s most iconic destinations.',
      emoji: '🇫🇷',
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073',
      cuisine_rating: 5,
      nightlife_rating: 4,
      cultural_attractions: 5,
      outdoor_activities: 3,
      beach_quality: 1,
      image_metadata: {
        alt_text: 'View of the Eiffel Tower and Paris cityscape',
        photographer_name: 'Chris Karidis',
        source: 'Unsplash',
      },
    },
  },
};

/**
 * Destination without image
 */
export const WithoutImage: Story = {
  args: {
    destination: {
      id: 'tokyo-japan',
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      description: 'A fascinating blend of traditional and ultramodern.',
      emoji: '🇯🇵',
      image_url: null,
      cuisine_rating: 5,
      nightlife_rating: 5,
      cultural_attractions: 5,
      outdoor_activities: 3,
      beach_quality: 2,
    },
  },
};

/**
 * Without country
 */
export const WithoutCountry: Story = {
  args: {
    destination: {
      id: 'new-york',
      city: 'New York',
      country: null,
      continent: 'North America',
      description: 'The Big Apple - a city that never sleeps.',
      emoji: '🇺🇸',
      image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070',
      cuisine_rating: 5,
      nightlife_rating: 5,
      cultural_attractions: 5,
      outdoor_activities: 3,
      beach_quality: 2,
    },
  },
};

/**
 * Destination with full metadata
 */
export const WithFullMetadata: Story = {
  args: {
    destination: {
      id: 'kyoto-japan',
      city: 'Kyoto',
      country: 'Japan',
      continent: 'Asia',
      description: 'Former capital city famous for its numerous Buddhist temples and gardens.',
      byline: 'Tradition meets beauty',
      highlights: ['Fushimi Inari Shrine', 'Arashiyama Bamboo Grove', 'Kinkaku-ji'],
      emoji: '🇯🇵',
      image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070',
      cuisine_rating: 5,
      nightlife_rating: 3,
      cultural_attractions: 5,
      outdoor_activities: 4,
      beach_quality: 1,
      best_season: 'Spring',
      avg_cost_per_day: 120,
      safety_rating: 5,
      image_metadata: {
        alt_text: 'Traditional Japanese temple in Kyoto surrounded by cherry blossoms',
        photographer_name: 'Sorasak',
        photographer_url: 'https://unsplash.com/@sorsak',
        source: 'Unsplash',
        attribution: 'Photo by Sorasak on Unsplash',
      },
    },
    hideAttributionMobile: false,
  },
};

/**
 * Responsive grid with multiple cards
 */
export const ResponsiveGrid: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <DestinationCard
          destination={{
            id: 'paris-france',
            city: 'Paris',
            country: 'France',
            continent: 'Europe',
            description: 'The City of Light',
            emoji: '🇫🇷',
            image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073',
            cuisine_rating: 5,
            nightlife_rating: 4,
            cultural_attractions: 5,
            outdoor_activities: 3,
            beach_quality: 1,
          }}
        />
        <DestinationCard
          destination={{
            id: 'tokyo-japan',
            city: 'Tokyo',
            country: 'Japan',
            continent: 'Asia',
            description: 'A blend of traditional and ultramodern',
            emoji: '🇯🇵',
            image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2071',
            cuisine_rating: 5,
            nightlife_rating: 5,
            cultural_attractions: 4,
            outdoor_activities: 3,
            beach_quality: 2,
          }}
        />
        <DestinationCard
          destination={{
            id: 'new-york-usa',
            city: 'New York',
            country: 'USA',
            continent: 'North America',
            description: 'The city that never sleeps',
            emoji: '🇺🇸',
            image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070',
            cuisine_rating: 5,
            nightlife_rating: 5,
            cultural_attractions: 5,
            outdoor_activities: 3,
            beach_quality: 2,
          }}
        />
        <DestinationCard
          destination={{
            id: 'bali-indonesia',
            city: 'Bali',
            country: 'Indonesia',
            continent: 'Asia',
            description: 'Island paradise',
            emoji: '🇮🇩',
            image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2938',
            cuisine_rating: 4,
            nightlife_rating: 4,
            cultural_attractions: 4,
            outdoor_activities: 5,
            beach_quality: 5,
          }}
        />
      </div>
    </div>
  ),
}; 