import type { Meta, StoryObj } from '@storybook/react';
import { TripCardHeader } from './TripCardHeader';

const meta: Meta<typeof TripCardHeader> = {
  title: 'Trips/Molecules/TripCardHeader',
  component: TripCardHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['planning', 'active', 'completed', 'past', 'upcoming'],
    },
    isLiked: {
      control: 'boolean',
    },
    isClickable: {
      control: 'boolean',
    },
    showLikeButton: {
      control: 'boolean',
    },
    onLikeClick: { action: 'liked' },
    onClick: { action: 'clicked' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TripCardHeader>;

export const Default: Story = {
  args: {
    name: 'Weekend in Paris',
    destination: 'Paris, France',
    coverImageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
    isLiked: false,
    likesCount: 12,
    isClickable: true,
    showLikeButton: true,
  },
};

export const WithStatus: Story = {
  args: {
    ...Default.args,
    status: 'active',
  },
};

export const Liked: Story = {
  args: {
    ...Default.args,
    isLiked: true,
  },
};

export const NoCoverImage: Story = {
  args: {
    ...Default.args,
    coverImageUrl: null,
  },
};

export const NoLikeButton: Story = {
  args: {
    ...Default.args,
    showLikeButton: false,
  },
}; 