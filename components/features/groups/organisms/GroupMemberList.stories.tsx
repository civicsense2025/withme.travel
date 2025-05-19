import type { Meta, StoryObj } from '@storybook/react';
import { GroupMemberList } from './GroupMemberList';

/**
 * Storybook stories for the GroupMemberList organism
 * Displays the full list of group members with actions
 * @module features/groups/organisms/GroupMemberList
 */
const meta: Meta<typeof GroupMemberList> = {
  title: 'Features/Groups/Organisms/GroupMemberList',
  component: GroupMemberList,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupMemberList>;

const members = [
  {
    id: '1',
    name: 'Jane Doe',
    role: 'admin',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '2',
    name: 'John Smith',
    role: 'member',
    avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
];

export const Default: Story = {
  args: {
    members,
    onRemove: (id: string) => alert(`Remove member ${id}`),
    onPromote: (id: string) => alert(`Promote member ${id}`),
  },
}; 