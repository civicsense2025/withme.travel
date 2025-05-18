/**
 * Trip Card Footer Stories
 * 
 * Storybook stories for the TripCardFooter component
 * 
 * @module trips/atoms
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TripCardFooter } from './TripCardFooter';

const meta: Meta<typeof TripCardFooter> = {
  title: 'Trips/Atoms/TripCardFooter',
  component: TripCardFooter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Text to display as the call to action',
    },
    showHoverEffect: {
      control: 'boolean',
      description: 'Whether to show hover effect on the footer',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '280px', padding: '16px', background: 'white' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TripCardFooter>;

export const Default: Story = {
  args: {
    text: 'View trip details',
    showHoverEffect: true,
  },
};

export const CustomText: Story = {
  args: {
    text: 'Explore this adventure',
    showHoverEffect: true,
  },
};

export const WithoutHoverEffect: Story = {
  args: {
    text: 'View trip details',
    showHoverEffect: false,
  },
};

export const LongText: Story = {
  args: {
    text: 'Click here to explore all details about this amazing trip',
    showHoverEffect: true,
  },
};

export const ShortText: Story = {
  args: {
    text: 'View',
    showHoverEffect: true,
  },
}; 