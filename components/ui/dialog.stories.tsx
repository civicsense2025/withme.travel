import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Core UI/Overlay/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <button style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
          Open Dialog
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>This is a dialog description.</DialogDescription>
        </DialogHeader>
        <div style={{ padding: 8 }}>This is the dialog content.</div>
        <DialogFooter>
          <button style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>Close</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
