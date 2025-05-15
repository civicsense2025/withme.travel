import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

interface ButtonProps {
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'danger';
  /**
   * Is the button disabled?
   */
  disabled?: boolean;
}

/**
 * Primary UI component for user interaction
 */
const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  // Tailwind class mapping for variants
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <button
      className={`px-4 py-2 rounded font-medium transition-colors ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

const meta: Meta<typeof Button> = {
  title: 'Examples/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Default button with primary styling
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Button',
  },
};

/**
 * Secondary button with less visual prominence
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Button',
  },
};

/**
 * Danger button for destructive actions
 */
export const Danger: Story = {
  args: {
    variant: 'danger',
    label: 'Delete',
  },
};

/**
 * Disabled button state
 */
export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
}; 