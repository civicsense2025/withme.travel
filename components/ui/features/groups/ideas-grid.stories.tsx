import type { Meta, StoryObj } from '@storybook/react';
import { IdeasGrid } from './ideas-grid';

const meta: Meta<typeof IdeasGrid> = {
  title: 'UI/Features/groups/ideas-grid',
  component: IdeasGrid,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof IdeasGrid>;

const mockProps = {
  groupId: 'group-1',
  planId: 'plan-1',
  initialIdeas: [
    {
      id: 'idea-1',
      title: 'Sunset Picnic',
      description: "Let's have a picnic at the park and watch the sunset together.",
      type: 'activity',
      created_by: 'user-1',
      created_at: '2024-07-01T18:00:00Z',
      votes_up: 7,
      votes_down: 1,
      user_vote: null,
      meta: null,
      creator: { id: 'user-1', name: 'Alice' },
      reactions: [],
    },
    {
      id: 'idea-2',
      title: 'Museum Day',
      description: 'Visit the city museum and explore the new exhibits.',
      type: 'activity',
      created_by: 'user-2',
      created_at: '2024-07-02T10:00:00Z',
      votes_up: 3,
      votes_down: 0,
      user_vote: null,
      meta: null,
      creator: { id: 'user-2', name: 'Bob' },
      reactions: [],
    },
  ],
};

export const Default: Story = { args: { ...mockProps } };
export const LightMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'light' } },
};
export const DarkMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'dark' } },
};
