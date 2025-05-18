import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from './Tag';

/**
 * `Tag` is an atom component used to display a single tag with optional removal functionality.
 * 
 * Tags are used throughout the application to categorize and filter content, allowing users
 * to quickly navigate and understand relationships between items.
 */
const meta: Meta<typeof Tag> = {
  title: 'UI/Atoms/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A basic tag component for displaying a tag with optional removal functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'The display text of the tag',
    },
    onRemove: {
      action: 'removed',
      description: 'Handler called when the remove button is clicked',
    },
    isRemoving: {
      control: 'boolean',
      description: 'Whether the tag is in a removing state (loading)',
    },
    id: {
      control: 'text',
      description: 'Optional ID for internal tracking',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tag>;

/**
 * Default tag display with no additional functionality.
 */
export const Default: Story = {
  args: {
    name: 'Travel',
  },
};

/**
 * Tag with removal functionality. Hover to reveal the removal icon.
 */
export const Removable: Story = {
  args: {
    name: 'Adventure',
    onRemove: () => console.log('Tag removed'),
  },
};

/**
 * Tag in loading state when being removed.
 */
export const RemovingState: Story = {
  args: {
    name: 'Food',
    onRemove: () => console.log('Tag removed'),
    isRemoving: true,
  },
};

/**
 * Examples of tags with different lengths.
 */
export const Variations: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag name="Short" />
      <Tag name="Medium Length" />
      <Tag name="A very long tag name that might wrap" />
      <Tag name="Removable" onRemove={() => console.log('Removed')} />
      <Tag name="Loading" onRemove={() => console.log('Removed')} isRemoving={true} />
    </div>
  ),
}; 