import type { Meta, StoryObj } from '@storybook/react';
import { IdeaCard } from './idea-card';

const meta: Meta<typeof IdeaCard> = {
  title: 'Product/Features/IdeaCard',
  component: IdeaCard,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof IdeaCard>;

const mockProps = {
  idea: {
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
  groupId: 'group-1',
  planId: 'plan-1',
  onVote: (ideaId: string, voteType: 'up' | 'down') =>
    alert(`Voted ${voteType} on idea: ${ideaId}`),
  onEdit: (ideaId: string) => alert('Edit idea: ' + ideaId),
  onDelete: (ideaId: string) => alert('Delete idea: ' + ideaId),
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
