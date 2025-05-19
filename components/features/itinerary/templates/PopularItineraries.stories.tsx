import type { Meta, StoryObj } from '@storybook/react';
import { PopularItineraries } from './PopularItineraries';

/**
 * Storybook stories for the PopularItineraries template
 * Displays a list of popular itinerary templates
 * @module features/itinerary/templates/PopularItineraries
 */
const meta: Meta<typeof PopularItineraries> = {
  title: 'Features/Itinerary/Templates/PopularItineraries',
  component: PopularItineraries,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof PopularItineraries>;

export const Default: Story = {
  args: {
    templates: [
      {
        id: 'tpl-1',
        title: 'Classic Rome Weekend',
        description: 'A 3-day itinerary covering Rome highlights.',
        duration_days: 3,
        image_url: 'https://images.unsplash.com/photo-rome',
        created_by: 'user-1',
        created_at: '2024-06-01T10:00:00Z',
        is_published: true,
        view_count: 120,
        use_count: 15,
      },
      {
        id: 'tpl-2',
        title: 'Florence Art & Food',
        description: '2 days of art, food, and culture in Florence.',
        duration_days: 2,
        image_url: 'https://images.unsplash.com/photo-florence',
        created_by: 'user-2',
        created_at: '2024-06-02T10:00:00Z',
        is_published: true,
        view_count: 80,
        use_count: 10,
      },
    ],
    onTemplateClick: (id: string) => alert(`View template ${id}`),
    onUseTemplate: (id: string) => alert(`Use template ${id}`),
  },
}; 