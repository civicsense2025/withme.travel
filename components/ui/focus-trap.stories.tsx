import type { Meta, StoryObj } from '@storybook/react';
import { FocusTrap } from './focus-trap';

/**
 * Storybook stories for the FocusTrap component
 * @module ui/FocusTrap
 */
const meta: Meta<typeof FocusTrap> = {
  title: 'UI/FocusTrap',
  component: FocusTrap,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof FocusTrap>;

export const Default: Story = {
  args: {
    children: <button>Focusable Button</button>,
  },
};

export const Active: Story = {
  args: {
    active: true,
    autoFocus: true,
    children: <input type="text" placeholder="Auto-focused input" />,
  },
}; 