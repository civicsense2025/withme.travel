import type { Meta, StoryObj } from '@storybook/react';
import { UserAvatar } from './user-avatar';

const meta: Meta<typeof UserAvatar> = {
  title: 'UI/UserAvatar',
  component: UserAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const Default: Story = {
  args: {
    src: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'John Doe',
  },
};

export const LightMode: Story = {
  args: {
    src: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'John Doe',
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: { description: { story: 'UserAvatar in light mode.' } },
  },
};

export const DarkMode: Story = {
  args: {
    src: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'John Doe',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'UserAvatar in dark mode.' } },
  },
};
