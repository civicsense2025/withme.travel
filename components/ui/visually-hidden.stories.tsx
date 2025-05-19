import type { Meta, StoryObj } from '@storybook/react';
import { VisuallyHidden } from './visually-hidden';

/**
 * Storybook stories for the VisuallyHidden component
 * @module ui/VisuallyHidden
 */
const meta: Meta<typeof VisuallyHidden> = {
  title: 'UI/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {
  args: {
    children: 'This text is only visible to screen readers.',
  },
}; 