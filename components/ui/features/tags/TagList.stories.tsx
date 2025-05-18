import type { Meta, StoryObj } from '@storybook/react';
import { TagList } from './TagList';

/**
 * `TagList` is a molecule component that displays multiple Tag atoms as a group with
 * filtering, count display, and tag removal functionality.
 * 
 * This component is used when displaying multiple tags associated with an entity,
 * such as a trip, task, or destination.
 */
const meta: Meta<typeof TagList> = {
  title: 'UI/Molecules/TagList',
  component: TagList,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component for displaying multiple tags with filtering and grouping capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tags: {
      control: 'object',
      description: 'Array of tags to display',
    },
    removable: {
      control: 'boolean',
      description: 'Whether to allow removing tags',
    },
    onRemove: {
      action: 'tag removed',
      description: 'Handler for tag removal',
    },
    isRemoving: {
      control: 'object',
      description: 'Function to determine if a tag is being removed',
    },
    maxVisible: {
      control: { type: 'number', min: 0 },
      description: 'Max number of tags to display before showing a "+X more" button',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    showCount: {
      control: 'boolean',
      description: 'Whether to show a tag count badge',
    },
  },
};

export default meta;

type Story = StoryObj<typeof TagList>;

// Sample tags for stories
const sampleTags = [
  { name: 'Travel', id: '1' },
  { name: 'Adventure', id: '2' },
  { name: 'Beach', id: '3' },
  { name: 'Mountains', id: '4' },
  { name: 'Food', id: '5' },
  { name: 'Culture', id: '6' },
  { name: 'Relaxation', id: '7' },
];

/**
 * Default tag list with multiple tags.
 */
export const Default: Story = {
  args: {
    tags: sampleTags.slice(0, 4),
  },
};

/**
 * Tag list with remove functionality.
 */
export const Removable: Story = {
  args: {
    tags: sampleTags.slice(0, 4),
    removable: true,
    onRemove: (tagName) => console.log(`Tag removed: ${tagName}`),
  },
};

/**
 * Tag list with limited visible tags and a "show more" button.
 */
export const WithMaxVisible: Story = {
  args: {
    tags: sampleTags,
    maxVisible: 3,
  },
};

/**
 * Tag list with a count indicator.
 */
export const WithCount: Story = {
  args: {
    tags: sampleTags.slice(0, 5),
    showCount: true,
  },
};

/**
 * Tag list with loading state on removal.
 */
export const WithLoadingStates: Story = {
  args: {
    tags: sampleTags.slice(0, 4),
    removable: true,
    onRemove: (tagName) => console.log(`Tag removed: ${tagName}`),
    isRemoving: (tagName) => tagName === 'Beach',
  },
};

/**
 * Empty tag list.
 */
export const Empty: Story = {
  args: {
    tags: [],
  },
}; 