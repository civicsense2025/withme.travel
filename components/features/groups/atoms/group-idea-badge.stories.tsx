import type { Meta, StoryObj } from '@storybook/react';
import { GroupIdeaBadge } from './group-idea-badge';

/**
 * Storybook stories for the GroupIdeaBadge atom
 * Displays a badge for the group idea category/type
 * @module features/groups/atoms/GroupIdeaBadge
 */
const meta: Meta<typeof GroupIdeaBadge> = {
  title: 'Features/Groups/Atoms/GroupIdeaBadge',
  component: GroupIdeaBadge,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupIdeaBadge>;

export const Destination: Story = {
  args: { type: 'destination' },
};
export const Date: Story = {
  args: { type: 'date' },
};
export const Activity: Story = {
  args: { type: 'activity' },
};
export const Budget: Story = {
  args: { type: 'budget' },
};
export const Other: Story = {
  args: { type: 'other' },
}; 