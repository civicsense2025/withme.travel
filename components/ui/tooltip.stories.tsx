import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';
import React from 'react';

/**
 * Storybook stories for the Tooltip and related components
 * @module ui/Tooltip
 */
const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <button>Hover me</button>
        </TooltipTrigger>
        <TooltipContent side="top">Tooltip content</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}; 