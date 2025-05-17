/**
 * Storybook stories for Text component
 * 
 * @module ui/features/core/atoms/Text.stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'UI/Features/core/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['body', 'caption', 'large', 'small', 'label'],
      description: 'Typography style variant'
    },
    weight: {
      control: 'select',
      options: ['regular', 'medium', 'semibold', 'bold'],
      description: 'Font weight'
    },
    color: {
      control: 'select',
      options: ['TEXT', 'PRIMARY', 'SECONDARY', 'MUTED', 'INFO', 'SUCCESS', 'WARNING'],
      description: 'Text color from theme'
    },
    spacing: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Bottom margin spacing'
    },
    responsive: {
      control: 'boolean',
      description: 'Enable responsive sizing'
    }
  }
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Body: Story = {
  args: {
    children: 'This is standard body text, the default style for content.',
    variant: 'body',
    weight: 'regular'
  }
};

export const Large: Story = {
  args: {
    children: 'This is large text, used for important content.',
    variant: 'large',
    weight: 'regular'
  }
};

export const Small: Story = {
  args: {
    children: 'This is small text, used for supporting content or notes.',
    variant: 'small',
    weight: 'regular'
  }
};

export const Caption: Story = {
  args: {
    children: 'This is caption text, used for image captions or supplementary info.',
    variant: 'caption',
    weight: 'regular'
  }
};

export const Label: Story = {
  args: {
    children: 'This is label text, used for form labels and UI elements.',
    variant: 'label',
    weight: 'medium'
  }
};

export const Bold: Story = {
  args: {
    children: 'This is bold body text for added emphasis.',
    variant: 'body',
    weight: 'bold'
  }
};

export const NoSpacing: Story = {
  args: {
    children: 'This text has no bottom margin spacing.',
    variant: 'body',
    spacing: 'none'
  }
};

export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-2">
      <Text color="PRIMARY">Primary text color</Text>
      <Text color="SECONDARY">Secondary text color</Text>
      <Text color="MUTED">Muted text color</Text>
      <Text color="INFO">Info text color</Text>
      <Text color="SUCCESS">Success text color</Text>
      <Text color="WARNING">Warning text color</Text>
    </div>
  )
}; 