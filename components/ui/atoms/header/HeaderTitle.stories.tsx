/**
 * Header Title Stories
 * 
 * Storybook stories for the HeaderTitle component
 * 
 * @module ui/atoms/header
 */

import type { Meta, StoryObj } from '@storybook/react';
import { HeaderTitle } from './HeaderTitle';

const meta: Meta<typeof HeaderTitle> = {
  title: 'UI/Atoms/Header/HeaderTitle',
  component: HeaderTitle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    centered: {
      control: 'boolean',
      description: 'Whether to center the title',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HeaderTitle>;

/**
 * Default header title
 */
export const Default: Story = {
  args: {
    children: 'Page Title',
    centered: false,
  },
};

/**
 * Centered header title
 */
export const Centered: Story = {
  args: {
    children: 'Centered Title',
    centered: true,
  },
};

/**
 * Long header title
 */
export const LongTitle: Story = {
  args: {
    children: 'This is a very long page title that should wrap to multiple lines on smaller screens',
    centered: false,
  },
}; 