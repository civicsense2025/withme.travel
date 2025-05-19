import type { Meta, StoryObj } from '@storybook/react';
import { GroupMemberBadge } from '@/components/features/groups/atoms/GroupMemberBadge';

/**
 * Storybook stories for the GroupMemberBadge atom
 * Displays a badge for the group member's role/status
 * @module features/groups/atoms/GroupMemberBadge
 */
const meta: Meta<typeof GroupMemberBadge> = {
  title: 'Features/Groups/Atoms/GroupMemberBadge',
  component: GroupMemberBadge,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupMemberBadge>;

export const Admin: Story = {
  args: { role: 'admin' },
};
export const Member: Story = {
  args: { role: 'member' },
}; 