import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem, RadioGroupLabel } from './radio-group';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Molecules/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'The name attribute for the radio group',
    },
    value: {
      control: 'text',
      description: 'The currently selected value',
    },
    onChange: {
      action: 'changed',
      description: 'Handler for when the selection changes',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('option1');
    return (
      <RadioGroup name="radio-group-example" value={value} onChange={setValue}>
        <RadioGroupItem value="option1" label="Option 1" />
        <RadioGroupItem value="option2" label="Option 2" />
        <RadioGroupItem value="option3" label="Option 3" />
      </RadioGroup>
    );
  },
};

export const WithLabels: Story = {
  render: () => {
    const [value, setValue] = useState('apple');
    return (
      <div className="space-y-4">
        <RadioGroupLabel>Favorite Fruit</RadioGroupLabel>
        <RadioGroup name="fruit-options" value={value} onChange={setValue}>
          <RadioGroupItem value="apple" label="Apple" />
          <RadioGroupItem value="orange" label="Orange" />
          <RadioGroupItem value="banana" label="Banana" />
          <RadioGroupItem value="strawberry" label="Strawberry" />
        </RadioGroup>
      </div>
    );
  },
};

export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = useState('sm');
    return (
      <div className="space-y-4">
        <RadioGroupLabel>Choose a size</RadioGroupLabel>
        <RadioGroup
          name="size-options"
          value={value}
          onChange={setValue}
          className="flex flex-row gap-4"
        >
          <RadioGroupItem value="sm" label="Small" />
          <RadioGroupItem value="md" label="Medium" />
          <RadioGroupItem value="lg" label="Large" />
        </RadioGroup>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState('active');
    return (
      <RadioGroup name="status-options" value={value} onChange={setValue}>
        <RadioGroupItem value="active" label="Active" />
        <RadioGroupItem value="inactive" label="Inactive" />
        <RadioGroupItem value="pending" label="Pending" disabled />
        <RadioGroupItem value="archived" label="Archived" disabled />
      </RadioGroup>
    );
  },
};

export const WithDescriptions: Story = {
  render: () => {
    const [value, setValue] = useState('basic');
    return (
      <div className="space-y-4">
        <RadioGroupLabel>Select a plan</RadioGroupLabel>
        <RadioGroup name="plan-options" value={value} onChange={setValue} className="space-y-3">
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="basic" />
            <div>
              <div className="font-medium">Basic Plan</div>
              <div className="text-sm text-gray-500">5 projects, 2GB storage</div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="pro" />
            <div>
              <div className="font-medium">Pro Plan</div>
              <div className="text-sm text-gray-500">Unlimited projects, 10GB storage</div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="enterprise" />
            <div>
              <div className="font-medium">Enterprise Plan</div>
              <div className="text-sm text-gray-500">Unlimited projects, Unlimited storage</div>
            </div>
          </div>
        </RadioGroup>
      </div>
    );
  },
};

export const WithCards: Story = {
  render: () => {
    const [value, setValue] = useState('monthly');
    return (
      <div className="space-y-4">
        <RadioGroupLabel>Billing Cycle</RadioGroupLabel>
        <RadioGroup
          name="billing-options"
          value={value}
          onChange={setValue}
          className="grid grid-cols-2 gap-4"
        >
          <label
            className={`
            p-4 border rounded-md cursor-pointer
            ${value === 'monthly' ? 'border-primary bg-primary/5' : 'border-gray-200'}
          `}
          >
            <div className="flex justify-between">
              <div className="font-medium">Monthly</div>
              <RadioGroupItem value="monthly" />
            </div>
            <div className="mt-1 text-sm text-gray-500">$10 per month</div>
          </label>

          <label
            className={`
            p-4 border rounded-md cursor-pointer
            ${value === 'annual' ? 'border-primary bg-primary/5' : 'border-gray-200'}
          `}
          >
            <div className="flex justify-between">
              <div className="font-medium">Annual</div>
              <RadioGroupItem value="annual" />
            </div>
            <div className="mt-1 text-sm text-gray-500">$100 per year (Save $20)</div>
          </label>
        </RadioGroup>
      </div>
    );
  },
};
