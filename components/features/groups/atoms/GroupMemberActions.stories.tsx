import type { Meta, StoryObj } from '@storybook/react';
import { GroupMemberActions } from '@/components/features/groups/atoms/GroupMemberActions';

/**
 * Storybook stories for the GroupMemberActions atom
 * Displays action buttons for a group member (remove, promote, etc.)
 * @module features/groups/atoms/GroupMemberActions
 */
const meta: Meta<typeof GroupMemberActions> = {
  title: 'Features/Groups/Atoms/GroupMemberActions',
  component: GroupMemberActions,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupMemberActions>;

export const Default: Story = {
  args: {
    onRemove: () => alert('Remove member'),
    onPromote: () => alert('Promote to admin'),
    isAdmin: false,
  },
};
export const AsAdmin: Story = {
  args: {
    ...Default.args,
    isAdmin: true,
  },
}; 