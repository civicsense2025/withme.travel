import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    rows: {
      control: { type: 'number', min: 2, max: 20 },
      description: 'Number of visible text lines',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the textarea is read-only',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the textarea',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
    rows: 4,
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState(
      'This textarea has some initial content that can be edited.'
    );
    return <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4} />;
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small textarea...',
    rows: 3,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large textarea...',
    rows: 5,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled',
    disabled: true,
    rows: 4,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 'This content cannot be edited because the textarea is read-only.',
    readOnly: true,
    rows: 4,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
        Feedback
      </label>
      <Textarea id="feedback" placeholder="Tell us what you think..." rows={4} />
    </div>
  ),
};

export const WithCharacterCount: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const maxLength = 200;
    return (
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Describe your trip..."
          rows={4}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
        />
        <div className="text-sm text-gray-500 flex justify-end">
          {value.length}/{maxLength} characters
        </div>
      </div>
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (newValue.length > 0 && newValue.length < 10) {
        setError('Description must be at least 10 characters long');
      } else {
        setError('');
      }
    };

    return (
      <div className="space-y-2">
        <label htmlFor="validation" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="validation"
          placeholder="Enter at least 10 characters..."
          rows={4}
          value={value}
          onChange={handleChange}
          className={error ? 'border-red-500' : ''}
        />
        {error && <div className="text-sm text-red-500">{error}</div>}
      </div>
    );
  },
};
