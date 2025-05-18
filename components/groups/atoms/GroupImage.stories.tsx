import type { Meta, StoryObj } from '@storybook/react';
import { GroupImage } from './GroupImage';

const meta: Meta<typeof GroupImage> = {
  title: 'Groups/Atoms/GroupImage',
  component: GroupImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    imageUrl: { control: 'text' },
    groupName: { control: 'text' },
    emoji: { control: 'text' },
    aspectRatio: {
      control: { type: 'select' },
      options: ['square', 'video', 'wide'],
    },
    withGradient: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof GroupImage>;

export const WithImage: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1527169369729-82254ff9f5f2',
    groupName: 'Travel Buddies',
    className: 'w-72',
  },
};

export const WithEmoji: Story = {
  args: {
    imageUrl: null,
    groupName: 'Beach Trip',
    emoji: '🏖️',
    className: 'w-72',
  },
};

export const WithInitials: Story = {
  args: {
    imageUrl: null,
    groupName: 'Mountain Hikers',
    emoji: null,
    className: 'w-72',
  },
};

export const WithGradient: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83',
    groupName: 'Adventure Seekers',
    withGradient: true,
    className: 'w-72',
  },
};

export const SquareRatio: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    groupName: 'Food Enthusiasts',
    aspectRatio: 'square',
    className: 'w-72',
  },
}; 