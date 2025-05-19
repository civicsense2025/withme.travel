import type { Meta, StoryObj } from '@storybook/react';
import { GroupIdeaCard } from './GroupIdeaCard';

const idea = {
  id: '1',
  title: 'Go to Bali',
  description: 'A fun group trip to Bali!',
  type: 'place',
  created_at: new Date().toISOString(),
  votes_up: 5,
  votes_down: 1,
  comment_count: 2,
};

const meta: Meta<typeof GroupIdeaCard> = {
  title: 'Features/Groups/Molecules/GroupIdeaCard',
  component: GroupIdeaCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupIdeaCard>;

export const Default: Story = {
  args: {
    idea,
    showActions: true,
  },
};

export const Selected: Story = {
  args: {
    idea,
    selected: true,
    showActions: true,
  },
};

export const WithActions: Story = {
  args: {
    idea,
    showActions: true,
    onEdit: () => alert('Edit'),
    onDelete: () => alert('Delete'),
    onVoteUp: () => alert('Vote Up'),
    onVoteDown: () => alert('Vote Down'),
  },
}; 