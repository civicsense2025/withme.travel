import type { Meta, StoryObj } from '@storybook/react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './sheet';

const meta: Meta<typeof Sheet> = {
  title: 'Core UI/Overlay/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <button style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
          Open Sheet
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>This is a sheet description.</SheetDescription>
        </SheetHeader>
        <div style={{ padding: 8 }}>This is the sheet content.</div>
      </SheetContent>
    </Sheet>
  ),
};

export const LightMode: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <button style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
          Open Sheet
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>This is a sheet description.</SheetDescription>
        </SheetHeader>
        <div style={{ padding: 8 }}>This is the sheet content.</div>
      </SheetContent>
    </Sheet>
  ),
  parameters: {
    backgrounds: { default: 'light' },
    docs: { description: { story: 'Sheet in light mode.' } },
  },
};

export const DarkMode: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <button
          style={{
            padding: 8,
            border: '1px solid #888',
            borderRadius: 4,
            background: '#222',
            color: '#fff',
          }}
        >
          Open Sheet
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>This is a sheet description.</SheetDescription>
        </SheetHeader>
        <div style={{ padding: 8, color: '#fff', background: '#222' }}>
          This is the sheet content.
        </div>
      </SheetContent>
    </Sheet>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Sheet in dark mode.' } },
  },
};
