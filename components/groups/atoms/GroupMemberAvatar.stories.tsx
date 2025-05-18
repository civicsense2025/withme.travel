import type { Meta, StoryObj } from '@storybook/react';
import { GroupMemberAvatar } from './GroupMemberAvatar';

const meta: Meta<typeof GroupMemberAvatar> = {
  title: 'Groups/Atoms/GroupMemberAvatar',
  component: GroupMemberAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof GroupMemberAvatar>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
};

export const WithAvatar: Story = {
  args: {
    name: 'Alice Smith',
    avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Smith&background=0D8ABC&color=fff',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    name: 'John Doe',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    name: 'John Doe',
    size: 'lg',
  },
};

export const MultipleInitials: Story = {
  args: {
    name: 'Jane Maria Doe',
    size: 'md',
  },
}; 