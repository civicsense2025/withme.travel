import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />;
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

export const WithLabel: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Accept terms and conditions
        </label>
      </div>
    );
  },
};

export const CheckboxGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    const handleChange = (value: string) => {
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    };

    return (
      <div className="space-y-2">
        <div className="font-medium text-sm mb-3">Select your interests</div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="travel"
            checked={selected.includes('travel')}
            onChange={() => handleChange('travel')}
          />
          <label htmlFor="travel" className="text-sm">
            Travel
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="photography"
            checked={selected.includes('photography')}
            onChange={() => handleChange('photography')}
          />
          <label htmlFor="photography" className="text-sm">
            Photography
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="food"
            checked={selected.includes('food')}
            onChange={() => handleChange('food')}
          />
          <label htmlFor="food" className="text-sm">
            Food & Dining
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="adventure"
            checked={selected.includes('adventure')}
            onChange={() => handleChange('adventure')}
          />
          <label htmlFor="adventure" className="text-sm">
            Adventure
          </label>
        </div>
      </div>
    );
  },
};
