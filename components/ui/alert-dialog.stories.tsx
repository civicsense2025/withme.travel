import type { Meta, StoryObj } from '@storybook/react';
import { AlertDialog } from './alert-dialog';

/**
 * Storybook stories for the AlertDialog component
 * @module ui/AlertDialog
 */
const meta: Meta<typeof AlertDialog> = {
  title: 'UI/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  },
};

export const Destructive: Story = {
  args: {
    open: true,
    title: 'Delete item?',
    description: 'This will permanently delete the item.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'destructive',
  },
}; 