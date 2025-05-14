import type { Meta, StoryObj } from '@storybook/react';
import { Drawer, DrawerTrigger, DrawerContent } from './drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Core UI/Overlay/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <button style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
          Open Drawer
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div style={{ padding: 16 }}>This is the drawer content.</div>
      </DrawerContent>
    </Drawer>
  ),
};

export const Light: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <button style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
          Open Drawer
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div style={{ padding: 16 }}>This is the drawer content.</div>
      </DrawerContent>
    </Drawer>
  ),
  parameters: {
    backgrounds: { default: 'light' },
  },
};

export const Dark: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <button style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
          Open Drawer
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div style={{ padding: 16 }}>This is the drawer content.</div>
      </DrawerContent>
    </Drawer>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
