import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';
import React, { useState } from 'react';

/**
 * Storybook stories for the Slider component
 * @module ui/Slider
 */
const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState(50);
    return (
      <div className="space-y-2">
        <Slider min={0} max={100} value={value} onChange={e => setValue(Number(e.target.value))} />
        <div>Value: {value}</div>
      </div>
    );
  },
}; 