import type { Meta, StoryObj } from '@storybook/react';
import { TripCoverImage } from './TripCoverImage';

const meta: Meta<typeof TripCoverImage> = {
  title: 'Trips/Atoms/TripCoverImage',
  component: TripCoverImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    borderRadius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
    },
    aspectRatio: {
      control: 'select',
      options: ['16:9', '4:3', '1:1', '3:2'],
    },
    showPlaceholder: {
      control: 'boolean',
    },
    onLoad: { action: 'loaded' },
    onError: { action: 'error' },
  },
};

export default meta;
type Story = StoryObj<typeof TripCoverImage>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1534430480872-3498386e7856',
    alt: 'Beach sunset',
    width: 400,
    height: 225,
    borderRadius: 'md',
    aspectRatio: '16:9',
    showPlaceholder: true,
  },
};

export const Square: Story = {
  args: {
    ...Default.args,
    aspectRatio: '1:1',
    width: 300,
    height: 300,
  },
};

export const RoundedFull: Story = {
  args: {
    ...Square.args,
    borderRadius: 'full',
  },
};

export const NoImage: Story = {
  args: {
    ...Default.args,
    src: null,
  },
};

export const ErrorImage: Story = {
  args: {
    ...Default.args,
    src: 'https://example.com/nonexistent-image.jpg',
  },
}; 