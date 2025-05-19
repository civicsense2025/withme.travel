import type { Meta, StoryObj } from '@storybook/react';
import { GroupMemberAvatar } from './group-member-avatar';

/**
 * Storybook stories for the GroupMemberAvatar atom
 * Displays a group member's avatar
 * @module features/groups/atoms/GroupMemberAvatar
 */
const meta: Meta<typeof GroupMemberAvatar> = {
  title: 'Features/Groups/Atoms/GroupMemberAvatar',
  component: GroupMemberAvatar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupMemberAvatar>;

export const Default: Story = {
  args: {
    name: 'Jane Doe',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
};
export const NoAvatar: Story = {
  args: {
    name: 'John Smith',
    avatarUrl: undefined,
  },
}; 