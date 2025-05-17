/**
 * ItineraryItemCard Component Stories
 * 
 * Storybook stories for the ItineraryItemCard component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryItemCard } from './ItineraryItemCard';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof ItineraryItemCard> = {
  title: 'UI/Features/itinerary/ItineraryItemCard',
  component: ItineraryItemCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onEdit: { action: 'edited' },
    onDelete: { action: 'deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof ItineraryItemCard>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default accommodation item
 */
export const Accommodation: Story = {
  args: {
    item: {
      id: '1',
      title: 'Grand Hyatt Tokyo',
      type: 'accommodation',
      category: 'hotel',
      day_number: 1,
      start_time: '14:00',
      end_time: null,
      address: '6-10-3 Roppongi, Minato City, Tokyo 106-0032, Japan',
      description: 'Luxury hotel in the heart of Tokyo',
      notes: 'Confirmation #12345678',
      status: 'confirmed',
      url: 'https://www.hyatt.com/en-US/hotel/japan/grand-hyatt-tokyo/tyogh',
    },
    isCoreItem: true,
    editable: true,
  },
};

/**
 * Transportation item
 */
export const Transportation: Story = {
  args: {
    item: {
      id: '2',
      title: 'Tokyo to Kyoto - Shinkansen',
      type: 'transportation',
      category: 'train',
      day_number: 3,
      start_time: '09:30',
      end_time: '12:00',
      address: 'Tokyo Station → Kyoto Station',
      description: 'Shinkansen Nozomi (fastest route)',
      notes: 'Reserved seats, Car 5, Seats 12A-12B',
      status: 'confirmed',
      url: 'https://www.jrpass.com/shinkansen',
    },
    isCoreItem: true,
  },
};

/**
 * Food item
 */
export const Restaurant: Story = {
  args: {
    item: {
      id: '3',
      title: 'Sushi Dai',
      type: 'food',
      category: 'lunch',
      day_number: 2,
      start_time: '12:30',
      end_time: '14:00',
      address: 'Tsukiji Outer Market, 5 Chome-2-1 Tsukiji, Chuo City, Tokyo',
      description: 'Famous sushi restaurant near the former Tsukiji Fish Market',
      notes: 'Expect long queues, go early',
      status: 'suggested',
    },
  },
};

/**
 * Activity item 
 */
export const Activity: Story = {
  args: {
    item: {
      id: '4',
      title: 'Fushimi Inari Shrine',
      type: 'activity',
      category: 'sightseeing',
      day_number: 4,
      start_time: '10:00',
      end_time: '13:00',
      address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto',
      description: 'Famous shrine with thousands of vermilion torii gates',
      notes: 'The hike to the top takes about 2-3 hours',
      status: 'confirmed',
      url: 'https://www.japan-guide.com/e/e3915.html',
    },
  },
};

/**
 * Minimal item (without many fields)
 */
export const Minimal: Story = {
  args: {
    item: {
      id: '5',
      title: 'Free time in Shibuya',
      type: 'other',
      day_number: 2,
    },
  },
};

/**
 * Item without day number
 */
export const Unscheduled: Story = {
  args: {
    item: {
      id: '6',
      title: 'Robot Restaurant',
      type: 'activity',
      category: 'nightlife',
      description: 'Bizarre robot-themed restaurant/show in Shinjuku',
      address: '1-7-1 Kabukicho, Shinjuku, Tokyo',
      status: 'suggested',
      url: 'https://shinjuku-robot.com/pc/',
    },
  },
};

/**
 * Non-editable item
 */
export const NonEditable: Story = {
  args: {
    item: {
      id: '7',
      title: 'Tokyo Skytree',
      type: 'activity',
      category: 'sightseeing',
      day_number: 1,
      start_time: '16:00',
      end_time: '18:00',
      address: '1-1-2 Oshiage, Sumida City, Tokyo',
      description: 'Tallest tower in Japan with observation decks',
    },
    editable: false,
  },
};

/**
 * ResponsiveGrid with multiple items
 */
export const ResponsiveGrid: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Day 1 - Tokyo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ItineraryItemCard
          item={{
            id: '1',
            title: 'Check-in: Grand Hyatt Tokyo',
            type: 'accommodation',
            category: 'hotel',
            day_number: 1,
            start_time: '14:00',
            address: 'Roppongi, Tokyo',
            status: 'confirmed',
          }}
          isCoreItem
        />
        <ItineraryItemCard
          item={{
            id: '2',
            title: 'Meiji Shrine',
            type: 'activity',
            category: 'sightseeing',
            day_number: 1,
            start_time: '16:00',
            end_time: '17:30',
            address: 'Shibuya, Tokyo',
          }}
        />
        <ItineraryItemCard
          item={{
            id: '3',
            title: 'Dinner at Ichiran Ramen',
            type: 'food',
            category: 'dinner',
            day_number: 1,
            start_time: '19:00',
            end_time: '20:30',
            address: 'Shinjuku, Tokyo',
            notes: 'Famous tonkotsu ramen chain',
          }}
        />
      </div>
    </div>
  ),
}; 