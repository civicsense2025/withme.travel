import type { Meta, StoryObj } from '@storybook/react';
import { ExampleComponent } from './example-component';
import React from 'react';

const meta: Meta<typeof ExampleComponent> = {
  title: 'Design System/ExampleComponent',
  component: ExampleComponent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the example component',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the component',
    },
  },
  args: {
    title: 'Design System Example',
  },
};

export default meta;
type Story = StoryObj<typeof ExampleComponent>;

// Default story with all examples
export const Default: Story = {
  args: {},
};

// Light mode specific example
export const LightMode: Story = {
  args: {
    title: 'Light Mode Example',
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
};

// Dark mode specific example
export const DarkMode: Story = {
  args: {
    title: 'Dark Mode Example',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      story: {
        inline: false,
        height: '600px',
      },
    },
  },
};

// With custom class
export const WithCustomClass: Story = {
  args: {
    title: 'Custom Styling Example',
    className: 'bg-accent/10 border-accent',
  },
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
