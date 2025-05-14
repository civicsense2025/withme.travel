// This is a template for creating new component stories
// Copy this file and replace ComponentName with your component name

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// Replace this with your actual component
const ComponentName = ({
  variant = 'default',
  size = 'md',
  mode = 'light',
  children,
  ...props
}: {
  variant?: 'default' | 'alternative';
  size?: 'sm' | 'md' | 'lg';
  mode?: 'light' | 'dark';
  children: React.ReactNode;
  [key: string]: any;
}) => {
  const styles = {
    padding: size === 'sm' ? '0.5rem' : size === 'md' ? '1rem' : '1.5rem',
    backgroundColor: mode === 'light' ? '#fff' : '#222',
    color: mode === 'light' ? '#333' : '#fff',
    border: variant === 'default' ? 'none' : '1px solid #ccc',
    borderRadius: '0.25rem',
  };

  return (
    <div style={styles} {...props}>
      {children}
    </div>
  );
};

const meta: Meta<typeof ComponentName> = {
  title: 'Design System/Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'alternative'],
      description: 'Component variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Component size',
    },
    mode: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Theme mode (overrides system theme)',
    },
    children: {
      control: 'text',
      description: 'Component content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    children: 'Default Component',
  },
};

export const Alternative: Story = {
  args: {
    variant: 'alternative',
    children: 'Alternative Component',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Component',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Component',
  },
};

export const DarkMode: Story = {
  args: {
    mode: 'dark',
    children: 'Dark Mode Component',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <ComponentName variant="default">Default</ComponentName>
        <ComponentName variant="alternative">Alternative</ComponentName>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <ComponentName size="sm">Small</ComponentName>
        <ComponentName size="md">Medium</ComponentName>
        <ComponentName size="lg">Large</ComponentName>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <ComponentName mode="light">Light Mode</ComponentName>
        <ComponentName mode="dark">Dark Mode</ComponentName>
      </div>
    </div>
  ),
};
