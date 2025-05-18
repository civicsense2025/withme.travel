import type { Meta, StoryObj } from '@storybook/react';
import { GroupPlanCard } from './GroupPlanCard';

const meta: Meta<typeof GroupPlanCard> = {
  title: 'Groups/Organisms/GroupPlanCard',
  component: GroupPlanCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['draft', 'active', 'completed'],
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof GroupPlanCard>;

export const Draft: Story = {
  args: {
    id: 'plan1',
    title: 'Summer Europe Trip Planning',
    description: 'Planning our summer adventure across multiple European cities',
    status: 'draft',
    voteCount: 5,
    participantCount: 4,
    location: 'Multiple cities in Europe',
    dateRange: {
      start: '2024-06-15',
      end: '2024-07-10',
    },
  },
};

export const Active: Story = {
  args: {
    id: 'plan2',
    title: 'Bali Beach Retreat',
    description: 'Finalizing details for our relaxing beach getaway in Bali',
    status: 'active',
    voteCount: 12,
    participantCount: 6,
    location: 'Bali, Indonesia',
    dateRange: {
      start: '2024-09-05',
      end: '2024-09-19',
    },
  },
};

export const Completed: Story = {
  args: {
    id: 'plan3',
    title: 'NYC Weekend Getaway',
    description: 'Our quick weekend trip to the Big Apple',
    status: 'completed',
    voteCount: 8,
    participantCount: 3,
    location: 'New York City, USA',
    dateRange: {
      start: '2024-03-10',
      end: '2024-03-12',
    },
  },
};

export const WithDueDate: Story = {
  args: {
    id: 'plan4',
    title: 'Japan Cherry Blossom Tour',
    description: 'Planning for our trip to see cherry blossoms across Japan',
    status: 'draft',
    voteCount: 3,
    participantCount: 5,
    location: 'Japan',
    dateRange: {
      start: '2025-03-20',
      end: '2025-04-05',
    },
    dueDate: '2024-12-31',
  },
};

export const MinimalInfo: Story = {
  args: {
    id: 'plan5',
    title: 'Hiking Trip',
    status: 'active',
    voteCount: 2,
    participantCount: 3,
  },
}; 