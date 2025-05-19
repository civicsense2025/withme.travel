import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';

/**
 * Storybook stories for the Progress component
 * @module ui/Progress
 */
const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const Partial: Story = {
  args: {
    value: 25,
    max: 200,
  },
}; 