import type { Meta, StoryObj } from '@storybook/react';
import { GroupPlanCard } from './group-plan-card';

const meta = {
  title: 'UI/group-plan-card',
  component: GroupPlanCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GroupPlanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: '1',
    title: 'Paris Trip',
    description: 'A wonderful weekend in Paris',
    status: 'active',
    voteCount: 5,
    participantCount: 4,
    location: 'Paris, France',
    dateRange: {
      start: '2023-09-15',
      end: '2023-09-18'
    },
    onClick: (id: string) => {
      console.log(`Clicked plan ${id}`);
    },
  },
};

export const WithDueDate: Story = {
  args: {
    id: '2',
    title: 'London Weekend',
    description: 'Quick trip to London',
    status: 'draft',
    voteCount: 2,
    participantCount: 3,
    location: 'London, UK',
    dateRange: {
      start: '2023-10-20',
      end: '2023-10-22'
    },
    dueDate: '2023-09-30',
    onClick: (id: string) => {
      console.log(`Clicked plan ${id}`);
    },
  },
};

export const CompletedPlan: Story = {
  args: {
    id: '3',
    title: 'Rome Adventure',
    description: 'Our amazing trip to Italy',
    status: 'completed',
    voteCount: 8,
    participantCount: 6,
    location: 'Rome, Italy',
    dateRange: {
      start: '2023-06-10',
      end: '2023-06-17'
    },
    onClick: (id: string) => {
      console.log(`Clicked plan ${id}`);
    },
  },
}; 