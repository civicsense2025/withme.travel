import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryTemplateCard } from './ItineraryTemplateCard';

/**
 * Storybook stories for the ItineraryTemplateCard molecule
 * Displays a card for an itinerary template with title, description, and actions
 * @module features/itinerary/molecules/ItineraryTemplateCard
 */
const meta: Meta<typeof ItineraryTemplateCard> = {
  title: 'Features/Itinerary/Molecules/ItineraryTemplateCard',
  component: ItineraryTemplateCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ItineraryTemplateCard>;

export const Default: Story = {
  args: {
    itinerary: {
      id: 'tpl-1',
      title: 'Classic Rome Weekend',
      slug: 'classic-rome-weekend',
      cover_image_url: 'https://images.unsplash.com/photo-rome',
      description: 'A 3-day itinerary covering Rome highlights.',
      duration_days: 3,
      location: 'Rome, Italy',
    },
    index: 0,
  },
};

export const NoImage: Story = {
  args: {
    itinerary: {
      id: 'tpl-2',
      title: 'Florence Art & Food',
      slug: 'florence-art-food',
      cover_image_url: null,
      description: '2 days of art, food, and culture in Florence.',
      duration_days: 2,
      location: 'Florence, Italy',
    },
    index: 1,
  },
}; 