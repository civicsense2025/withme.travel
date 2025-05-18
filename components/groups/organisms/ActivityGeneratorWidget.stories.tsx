import type { Meta, StoryObj } from '@storybook/react';
import { ActivityGeneratorWidget } from './ActivityGeneratorWidget';

// Mock the hooks and functions used by the component
import { useActivitySuggestions } from '@/hooks/useActivitySuggestions';
import { getBrowserClient } from '@/utils/supabase/browser-client';

// Mock the useActivitySuggestions hook
jest.mock('@/hooks/useActivitySuggestions', () => ({
  useActivitySuggestions: () => ({
    activities: [
      {
        title: 'Visit the Louvre Museum',
        description: 'The world\'s largest art museum housing iconic pieces like the Mona Lisa and Venus de Milo.',
        category: 'Cultural',
        activityType: 'Museum',
        duration: 3,
        budgetCategory: 'activities',
      },
      {
        title: 'Explore the Eiffel Tower',
        description: 'Take in panoramic views of Paris from the top of this iconic landmark.',
        category: 'Sightseeing',
        activityType: 'Landmark',
        duration: 2.5,
        budgetCategory: 'activities',
      },
      {
        title: 'Enjoy a Seine River Cruise',
        description: 'See Paris from the water on a relaxing river cruise past major landmarks.',
        category: 'Leisure',
        activityType: 'Tour',
        duration: 1.5,
        budgetCategory: 'activities',
      }
    ],
    keywords: ['Paris', 'Art', 'Culture', 'History', 'Landmarks', 'Museums'],
    isLoading: false,
    error: null,
    fetchActivities: () => Promise.resolve(),
  })
}));

// Mock Supabase client
jest.mock('@/utils/supabase/browser-client', () => ({
  getBrowserClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            data: { name: 'Paris', description: 'The City of Light' },
            error: null
          })
        })
      })
    })
  })
}));

const meta: Meta<typeof ActivityGeneratorWidget> = {
  title: 'Groups/Organisms/ActivityGeneratorWidget',
  component: ActivityGeneratorWidget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onAddIdea: { action: 'addIdea' },
    onClose: { action: 'close' },
    onToggleCollapse: { action: 'toggleCollapse' },
    isCollapsed: {
      control: 'boolean',
    }
  },
};

export default meta;
type Story = StoryObj<typeof ActivityGeneratorWidget>;

// Default story with expanded view
export const Expanded: Story = {
  args: {
    groupId: 'group-123',
    planId: 'plan-456',
    destinationId: 'destination-paris',
    isCollapsed: false,
  },
};

// Collapsed view
export const Collapsed: Story = {
  args: {
    groupId: 'group-123',
    planId: 'plan-456',
    destinationId: 'destination-paris',
    isCollapsed: true,
  },
}; 