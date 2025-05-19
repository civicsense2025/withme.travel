import type { Meta, StoryObj } from '@storybook/react';
import { GroupIdeaVoteCount } from './group-idea-vote-count';

/**
 * Storybook stories for the GroupIdeaVoteCount atom
 * Displays the up/down vote count for a group idea
 * @module features/groups/atoms/GroupIdeaVoteCount
 */
const meta: Meta<typeof GroupIdeaVoteCount> = {
  title: 'Features/Groups/Atoms/GroupIdeaVoteCount',
  component: GroupIdeaVoteCount,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupIdeaVoteCount>;

export const Default: Story = {
  args: {
    upVotes: 12,
    downVotes: 2,
    userVote: 'up',
  },
};
export const NoVotes: Story = {
  args: {
    upVotes: 0,
    downVotes: 0,
    userVote: undefined,
  },
}; 