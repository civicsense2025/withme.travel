import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Core UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
            Hover me
          </button>
        </TooltipTrigger>
        <TooltipContent>Tooltip message</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
