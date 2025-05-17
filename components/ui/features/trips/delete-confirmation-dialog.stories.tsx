import type { Meta, StoryObj } from '@storybook/react';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

const meta: Meta<typeof DeleteConfirmationDialog> = {
  title: 'UI/Features/trips/delete-confirmation-dialog',
  component: DeleteConfirmationDialog,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof DeleteConfirmationDialog>;

const mockProps = {
  open: true,
  title: 'Delete Group',
  description: 'Are you sure you want to delete this group? This action cannot be undone.',
  onConfirm: () => alert('Confirmed delete'),
  onCancel: () => alert('Cancelled delete'),
  loading: false,
};

export const Default: Story = { args: { ...mockProps } };
export const LightMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'light' } },
};
export const DarkMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'dark' } },
};
