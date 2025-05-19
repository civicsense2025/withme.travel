import type { Meta, StoryObj } from '@storybook/react';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import React, { useState } from 'react';

/**
 * Storybook stories for the ToggleGroup and ToggleGroupItem components
 * @module ui/ToggleGroup
 */
const meta: Meta<typeof ToggleGroup> = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Single: Story = {
  render: () => {
    const [value, setValue] = useState('bold');
    return (
      <ToggleGroup type="single" value={value} onValueChange={setValue}>
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
      </ToggleGroup>
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['bold']);
    return (
      <ToggleGroup type="multiple" value={value} onValueChange={setValue}>
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
      </ToggleGroup>
    );
  },
}; 