import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './avatar';

/**
 * Storybook stories for the Avatar component
 * @module ui/Avatar
 */
const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    name: 'Jane Doe',
  },
};

export const WithImage: Story = {
  args: {
    name: 'Jane Doe',
    src: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
};

export const WithInitials: Story = {
  args: {
    name: 'John Smith',
  },
}; 