import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'UI/Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'The input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the input',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter your text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
  },
};

export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    type: 'text',
    placeholder: 'Small input',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    type: 'text',
    placeholder: 'Large input',
    size: 'lg',
  },
};

export const WithIcon: Story = {
  render: () => (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <Input type="search" placeholder="Search..." className="pl-10" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
        Email address
      </label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
        Password
      </label>
      <Input id="password" type="password" placeholder="Enter your password" />
      <p className="text-sm text-gray-500">Password must be at least 8 characters long.</p>
    </div>
  ),
};
