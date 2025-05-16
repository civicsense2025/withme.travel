import type { Meta, StoryObj } from '@storybook/react';
import { DestinationCard } from '../molecules/DestinationCard';

/**
 * The DestinationCard component displays destination information with interactive hover effects.
 */
const meta: Meta<typeof DestinationCard> = {
  title: 'Features/Destinations/Molecules/DestinationCard',
  component: DestinationCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['link', 'selectable'],
      description: 'Card variant - link navigates to destination, selectable allows user interaction',
    },
    hideAttributionMobile: {
      control: 'boolean',
      description: 'Whether to hide image attribution on mobile devices',
    },
    disableNavigation: {
      control: 'boolean',
      description: 'Whether to disable navigation on click',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the card',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationCard>;

const sampleDestination = {
  id: 'dest-123',
  name: 'Paris',
  city: 'Paris',
  country: 'France',
  continent: 'Europe',
  description: 'The city of lights and love, known for its iconic Eiffel Tower, world-class cuisine, and vibrant art scene.',
  byline: 'The City of Light',
  emoji: '🇫🇷',
  image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  image_metadata: {
    photographer_name: 'Chris Karidis',
    photographer_url: 'https://unsplash.com/@chriskaridis',
    source: 'Unsplash',
    alt_text: 'View of the Eiffel Tower and Paris cityscape',
  },
  cuisine_rating: 5,
  nightlife_rating: 4,
  cultural_attractions: 5,
  outdoor_activities: 3,
  beach_quality: 1,
};

/**
 * Default DestinationCard (link variant)
 */
export const Default: Story = {
  args: {
    destination: sampleDestination,
  },
};

/**
 * Selectable variant (shows heart icon)
 */
export const Selectable: Story = {
  args: {
    destination: sampleDestination,
    variant: 'selectable',
  },
};

/**
 * Destination with long description
 */
export const LongDescription: Story = {
  args: {
    destination: {
      ...sampleDestination,
      description: 'Paris, the capital of France, is known as the "City of Light" for its stunning illuminated landmarks and rich cultural heritage. Visitors flock to see the iconic Eiffel Tower, explore the vast collections of the Louvre Museum, and stroll along the Seine River. Parisian cafés and patisseries offer world-renowned cuisine, while the city\'s fashion scene continues to set global trends. With its picturesque neighborhoods, historic architecture, and vibrant art scene, Paris remains one of the world\'s most beloved travel destinations.',
    },
  },
};

/**
 * Destination without image (shows fallback)
 */
export const NoImage: Story = {
  args: {
    destination: {
      ...sampleDestination,
      image_url: undefined,
    },
  },
};

/**
 * Destination without country
 */
export const NoCountry: Story = {
  args: {
    destination: {
      ...sampleDestination,
      country: null,
    },
  },
}; 