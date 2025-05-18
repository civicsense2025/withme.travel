import type { Meta, StoryObj } from '@storybook/react';
import { DestinationDetail } from './DestinationDetail';

const meta: Meta<typeof DestinationDetail> = {
  title: 'Destinations/Organisms/DestinationDetail',
  component: DestinationDetail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    destination: {
      id: 'paris',
      name: 'Paris',
      city: 'Paris',
      country: 'France',
      continent: 'Europe',
      description: 'Paris, the capital of France, is a major European city and a global center for art, fashion, gastronomy and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine.',
      byline: 'The City of Light',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Montmartre', 'Seine River Cruise'],
      image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      emoji: '🇫🇷',
      best_season: 'Spring & Fall',
      cuisine_rating: 4.8,
      nightlife_rating: 4.5,
      cultural_attractions: 4.9,
      outdoor_activities: 3.7,
      beach_quality: 2.5,
      avg_cost_per_day: 150,
      safety_rating: 4.2,
      image_metadata: {
        alt_text: 'Eiffel Tower at sunset in Paris, France',
        attribution: 'Photo by John Doe on Unsplash',
        photographer_name: 'John Doe',
        photographer_url: 'https://unsplash.com/@johndoe',
        source: 'unsplash',
        source_id: 'abc123',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6 max-w-6xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DestinationDetail>;

export const Default: Story = {
  args: {},
};

export const Tokyo: Story = {
  args: {
    destination: {
      id: 'tokyo',
      name: 'Tokyo',
      city: 'Tokyo',
      country: 'Japan',
      continent: 'Asia',
      description: 'Tokyo, Japan\'s busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples. The opulent Meiji Shinto Shrine is known for its towering gate and surrounding woods.',
      byline: 'Where tradition meets innovation',
      highlights: ['Tokyo Skytree', 'Meiji Shrine', 'Shibuya Crossing', 'Tsukiji Fish Market', 'Akihabara'],
      image_url: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      emoji: '🇯🇵',
      best_season: 'Spring (Cherry Blossoms)',
      cuisine_rating: 4.9,
      nightlife_rating: 4.7,
      cultural_attractions: 4.8,
      outdoor_activities: 4.2,
      beach_quality: 3.0,
      avg_cost_per_day: 180,
      safety_rating: 4.9,
      image_metadata: {
        alt_text: 'Tokyo skyline with Mt. Fuji in the background',
        photographer_name: 'Jane Smith',
        source: 'unsplash',
      },
    },
  },
};

export const Bali: Story = {
  args: {
    destination: {
      id: 'bali',
      name: 'Bali',
      city: 'Bali',
      country: 'Indonesia',
      continent: 'Asia',
      description: 'Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple.',
      byline: 'Island of the Gods',
      highlights: ['Ubud Monkey Forest', 'Tanah Lot Temple', 'Kuta Beach', 'Mount Batur', 'Rice Terraces'],
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      emoji: '🇮🇩',
      best_season: 'May to September',
      cuisine_rating: 4.5,
      nightlife_rating: 4.2,
      cultural_attractions: 4.8,
      outdoor_activities: 4.9,
      beach_quality: 4.9,
      avg_cost_per_day: 80,
      safety_rating: 4.3,
      image_metadata: {
        alt_text: 'Rice terraces in Bali, Indonesia',
        photographer_name: 'Emily Wong',
        source: 'unsplash',
      },
    },
  },
};

export const StringHighlights: Story = {
  args: {
    destination: {
      id: 'barcelona',
      name: 'Barcelona',
      city: 'Barcelona',
      country: 'Spain',
      continent: 'Europe',
      description: 'Barcelona, the cosmopolitan capital of Spain\'s Catalonia region, is known for its art and architecture. The fantastical Sagrada Família church and other modernist landmarks designed by Antoni Gaudí dot the city.',
      byline: 'A city of art and architecture',
      highlights: 'Sagrada Família, Park Güell, La Rambla, Gothic Quarter, Camp Nou',
      image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      emoji: '🇪🇸',
      best_season: 'Spring & Fall',
      cuisine_rating: 4.7,
      nightlife_rating: 4.8,
      cultural_attractions: 4.9,
      outdoor_activities: 4.5,
      beach_quality: 4.2,
      avg_cost_per_day: 120,
      safety_rating: 4.0,
    },
  },
}; 