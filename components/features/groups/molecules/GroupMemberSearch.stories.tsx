import type { Meta, StoryObj } from '@storybook/react';
import { GroupMemberSearch } from '@/components/features/groups/molecules/GroupMemberSearch';

/**
 * Storybook stories for the GroupMemberSearch molecule
 * Provides a search input for finding group members
 * @module features/groups/molecules/GroupMemberSearch
 */
const meta: Meta<typeof GroupMemberSearch> = {
  title: 'Features/Groups/Molecules/GroupMemberSearch',
  component: GroupMemberSearch,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupMemberSearch>;

export const Default: Story = {
  args: {
    value: '',
    onChange: (val: string) => alert(`Search: ${val}`),
    placeholder: 'Search members...',
  },
}; 