import type { Meta, StoryObj } from '@storybook/react';
import { GroupPlanCard } from './group-plan-card';

/**
 * Storybook stories for the GroupPlanCard molecule
 * Displays a group plan card with icon, badge, and voting
 * @module features/groups/molecules/GroupPlanCard
 */
const meta: Meta<typeof GroupPlanCard> = {
  title: 'Features/Groups/Molecules/GroupPlanCard',
  component: GroupPlanCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupPlanCard>;

export const Default: Story = {
  args: {
    title: 'Florence Food Tour',
    status: 'active',
    icon: 'food',
    votes: 8,
    onVote: () => alert('Vote!'),
    onClick: () => alert('Open plan'),
  },
}; 