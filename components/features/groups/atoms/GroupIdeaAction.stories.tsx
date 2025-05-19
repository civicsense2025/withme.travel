import type { Meta, StoryObj } from '@storybook/react';
import { GroupIdeaAction } from '@/components/features/groups/atoms/GroupIdeaAction';

  /**
 * Storybook stories for the GroupIdeaAction atom
 * Displays an action button (edit/delete) for group ideas
 * @module features/groups/atoms/GroupIdeaAction
 */
const meta: Meta<typeof GroupIdeaAction> = {
  title: 'Features/Groups/Atoms/GroupIdeaAction',
  component: GroupIdeaAction,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupIdeaAction>;

export const Edit: Story = {
  args: {
    action: 'edit',
    onClick: () => alert('Edit idea'),
  },
};
export const Delete: Story = {
  args: {
    action: 'delete',
    onClick: () => alert('Delete idea'),
  },
}; 