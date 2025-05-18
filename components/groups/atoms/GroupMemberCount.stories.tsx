import type { Meta, StoryObj } from '@storybook/react';
import { Heart, UserCheck } from 'lucide-react';
import { GroupMemberCount } from './GroupMemberCount';

const meta: Meta<typeof GroupMemberCount> = {
  title: 'Groups/Atoms/GroupMemberCount',
  component: GroupMemberCount,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    count: { control: 'number' },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    showLabel: { control: 'boolean' },
    icon: { control: 'none' },
  },
};

export default meta;
type Story = StoryObj<typeof GroupMemberCount>;

export const Default: Story = {
  args: {
    count: 5,
  },
};

export const SingleMember: Story = {
  args: {
    count: 1,
  },
};

export const Small: Story = {
  args: {
    count: 8,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    count: 12,
    size: 'lg',
  },
};

export const NoLabel: Story = {
  args: {
    count: 23,
    showLabel: false,
  },
};

export const CustomIcon: Story = {
  args: {
    count: 7,
    icon: <UserCheck className="h-4 w-4 text-green-500" />,
  },
}; 