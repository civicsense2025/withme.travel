import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

const meta: Meta<typeof Popover> = {
  title: 'Core UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <button style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
          Open Popover
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div style={{ padding: 8 }}>This is the popover content.</div>
      </PopoverContent>
    </Popover>
  ),
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
