/**
 * Destination Card Stories
 * 
 * Storybook stories for the DestinationCard component
 * 
 * @module destinations/molecules
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DestinationCard } from './DestinationCard';

const meta: Meta<typeof DestinationCard> = {
  title: 'Features/Destinations/Molecules/DestinationCard',
  component: DestinationCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    destination: {
      control: 'object',
      description: 'Destination data object',
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'featured', 'horizontal'],
      description: 'Card display variant',
    },
    onClick: {
      action: 'clicked',
      description: 'Handler for when the card is clicked',
    },
    isSaved: {
      control: 'boolean',
      description: 'Whether the destination is saved by the user',
    },
    onSaveToggle: {
      action: 'save toggled',
      description: 'Handler for when the save button is toggled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationCard>;

// Sample destination data
const sampleDestination = {
  id: 'paris-france',
  name: 'Paris',
  country: 'France',
  description: 'The City of Light draws millions of visitors every year with its unforgettable ambiance. The city is known for its cafe culture, the Eiffel Tower, and its world-renowned art museums.',
  imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  rating: 4.8,
  reviewCount: 1250,
  tags: ['Romantic', 'Architecture', 'Food', 'Art'],
  popularPlaces: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral'],
};

export const Default: Story = {
  args: {
    destination: sampleDestination,
    variant: 'default',
    isSaved: false,
  },
};

export const Compact: Story = {
  args: {
    destination: {
      ...sampleDestination,
      id: 'barcelona-spain',
      name: 'Barcelona',
      country: 'Spain',
      imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
    },
    variant: 'compact',
    isSaved: true,
  },
};

export const Featured: Story = {
  args: {
    destination: {
      ...sampleDestination,
      id: 'tokyo-japan',
      name: 'Tokyo',
      country: 'Japan',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
    },
    variant: 'featured',
    isSaved: false,
  },
};

export const Horizontal: Story = {
  args: {
    destination: {
      ...sampleDestination,
      id: 'rome-italy',
      name: 'Rome',
      country: 'Italy',
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
    },
    variant: 'horizontal',
    isSaved: true,
  },
};

export const WithLongDescription: Story = {
  args: {
    destination: {
      ...sampleDestination,
      description: 'Paris, the capital of France, is a major European city and a global center for art, fashion, gastronomy and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine. Beyond such landmarks as the Eiffel Tower and the 12th-century, Gothic Notre-Dame cathedral, the city is known for its cafe culture and designer boutiques along the Rue du Faubourg Saint-Honoré. The city is also known for hosting iconic fashion shows and the annual French Open tennis tournament.',
    },
    variant: 'default',
    isSaved: false,
  },
};

export const WithCustomClass: Story = {
  args: {
    destination: sampleDestination,
    variant: 'default',
    isSaved: false,
    className: 'shadow-xl ring-2 ring-primary-500',
  },
}; 