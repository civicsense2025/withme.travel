import type { Meta, StoryObj } from '@storybook/react';
import { GroupPlanList } from './group-plan-list';

/**
 * Storybook stories for the GroupPlanList organism
 * Displays a list of group plans with voting and actions
 * @module features/groups/organisms/GroupPlanList
 */
const meta: Meta<typeof GroupPlanList> = {
  title: 'Features/Groups/Organisms/GroupPlanList',
  component: GroupPlanList,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupPlanList>;

const plans = [
  {
    id: 'plan-1',
    title: 'Florence Food Tour',
    status: 'active',
    icon: 'food',
    votes: 8,
  },
  {
    id: 'plan-2',
    title: 'Tuscan Wine Tasting',
    status: 'pending',
    icon: 'wine',
    votes: 5,
  },
];

export const Default: Story = {
  args: {
    plans,
    onVote: (id: string) => alert(`Vote for plan ${id}`),
    onClick: (id: string) => alert(`Open plan ${id}`),
  },
}; 