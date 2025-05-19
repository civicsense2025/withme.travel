import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from './dialog';

/**
 * Storybook stories for the Dialog component
 * @module ui/Dialog
 */
const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Dialog Title',
    description: 'Dialog description goes here.',
  },
};

export const CustomContent: Story = {
  args: {
    open: true,
    title: 'Custom Dialog',
    description: 'This is a custom dialog.',
    children: 'Custom dialog content.',
  },
}; 