/**
 * Page Header Stories
 * 
 * Storybook stories for the PageHeader component
 * 
 * @module ui/molecules/header
 */

import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const meta: Meta<typeof PageHeader> = {
  title: 'UI/Molecules/Header/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The title text to display',
    },
    description: {
      control: 'text',
      description: 'Optional description text',
    },
    centered: {
      control: 'boolean',
      description: 'Whether to center the content',
    },
    actions: {
      control: { disable: true },
      description: 'Optional action buttons',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

/**
 * Default page header with title only
 */
export const Default: Story = {
  args: {
    title: 'Page Title',
    centered: false,
  },
};

/**
 * Page header with description
 */
export const WithDescription: Story = {
  args: {
    title: 'Page Title',
    description: 'This is a description for the page that explains what the user can expect to find or do on this page.',
    centered: false,
  },
};

/**
 * Page header with actions
 */
export const WithActions: Story = {
  args: {
    title: 'Page Title',
    description: 'This is a description for the page that explains what the user can expect to find or do on this page.',
    centered: false,
    actions: (
      <Button size="sm">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add New
      </Button>
    ),
  },
};

/**
 * Centered page header
 */
export const Centered: Story = {
  args: {
    title: 'Centered Page Title',
    description: 'This is a centered description for the page that explains what the user can expect to find or do on this page.',
    centered: true,
  },
};

/**
 * Page header with long content
 */
export const WithLongContent: Story = {
  args: {
    title: 'Very Long Page Title That Demonstrates How Text Wraps When It Exceeds The Available Width',
    description: 'This is a very long description for the page that explains in great detail what the user can expect to find or do on this page. It should demonstrate how the text wraps when it exceeds the available width.',
    centered: false,
    actions: (
      <div className="flex space-x-2">
        <Button size="sm" variant="outline">Secondary Action</Button>
        <Button size="sm">Primary Action</Button>
      </div>
    ),
  },
}; 