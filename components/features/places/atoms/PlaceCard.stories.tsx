/**
 * Place Card Stories
 */
import type { Meta, StoryObj } from '@storybook/react';
import { PlaceCard } from '@/components/features/places/atoms/PlaceCard';

const meta: Meta<typeof PlaceCard> = {
  title: 'Features/Places/Atoms/PlaceCard',
  component: PlaceCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof PlaceCard>;

export const Restaurant: Story = {
  args: {
    place: {
      id: '1',
      name: 'Delicious Restaurant',
      category: 'restaurant',
      address: '123 Main St, City',
      rating: 4.5,
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'A lovely restaurant with amazing food and atmosphere',
    },
  },
};

export const Attraction: Story = {
  args: {
    place: {
      id: '2',
      name: 'Famous Landmark',
      category: 'attraction',
      address: 'Landmark Square, City',
      rating: 4.8,
      image_url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'Historic landmark with breathtaking views',
    },
  },
};

export const Hotel: Story = {
  args: {
    place: {
      id: '3',
      name: 'Luxury Hotel',
      category: 'hotel',
      address: '456 Beach Road, City',
      rating: 4.7,
      image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      description: 'Five-star hotel with premium amenities',
    },
  },
};

export const NoImage: Story = {
  args: {
    place: {
      id: '4',
      name: 'Local Cafe',
      category: 'cafe',
      address: '789 Side Street, City',
      rating: 4.2,
      description: 'Cozy cafe with great coffee and pastries',
    },
  },
};

export const Minimal: Story = {
  args: {
    place: {
      id: '5',
      name: 'Unnamed Place',
      category: 'other',
    },
  },
}; 