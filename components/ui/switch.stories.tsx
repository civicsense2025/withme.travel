import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './switch';
import React, { useState } from 'react';

/**
 * Storybook stories for the Switch component
 * @module ui/Switch
 */
const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Switch checked={checked} onCheckedChange={setChecked} />;
  },
};

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch checked={checked} onCheckedChange={setChecked} />;
  },
};

export const WithLabelRight: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Switch 
        checked={checked} 
        onCheckedChange={setChecked}
        label="Enable notifications"
        labelPosition="right"
      />
    );
  },
};

export const WithLabelLeft: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Switch 
        checked={checked} 
        onCheckedChange={setChecked}
        label="Enable notifications"
        labelPosition="left"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <Switch disabled checked={false} label="Disabled (off)" />
      <Switch disabled checked={true} label="Disabled (on)" />
    </div>
  ),
}; 