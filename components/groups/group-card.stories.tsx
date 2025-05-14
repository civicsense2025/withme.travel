import type { Meta, StoryObj } from '@storybook/react';
import { GroupCard } from './group-card';

const meta: Meta<typeof GroupCard> = {
  title: 'Product/Features/GroupCard',
  component: GroupCard,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof GroupCard>;

const mockProps = {
  group: {
    id: 'group-1',
    name: 'Travel Buddies',
    memberCount: 5,
    tripCount: 2,
  },
  isSelectable: false,
  isSelected: false,
  onEdit: (id: string) => alert('Edit group: ' + id),
  onDelete: (id: string) => alert('Delete group: ' + id),
};

export const Default: Story = { args: { ...mockProps } };
export const LightMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'light' } },
};
export const DarkMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'dark' } },
};
