import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './separator';

/**
 * Storybook stories for the Separator component
 * @module ui/Separator
 */
const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    style: { height: 100 },
  },
}; 