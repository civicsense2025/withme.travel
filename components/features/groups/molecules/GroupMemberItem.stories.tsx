import type { Meta, StoryObj } from '@storybook/react';
import { GroupMemberItem } from '@/components/features/groups/molecules/GroupMemberItem';

/**
 * Storybook stories for the GroupMemberItem molecule
 * Displays a group member row with avatar, name, role, and actions
 * @module features/groups/molecules/GroupMemberItem
 */
const meta: Meta<typeof GroupMemberItem> = {
  title: 'Features/Groups/Molecules/GroupMemberItem',
  component: GroupMemberItem,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupMemberItem>;

export const Default: Story = {
  args: {
    name: 'Jane Doe',
    role: 'member',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    isAdmin: false,
    onRemove: () => alert('Remove member'),
    onPromote: () => alert('Promote to admin'),
  },
};
export const AsAdmin: Story = {
  args: {
    ...Default.args,
    isAdmin: true,
  },
}; 