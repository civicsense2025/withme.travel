import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

/**
 * Storybook stories for the Skeleton component
 * @module ui/Skeleton
 */
const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {},
};

export const CustomSize: Story = {
  args: {
    style: { width: 200, height: 32 },
  },
}; 