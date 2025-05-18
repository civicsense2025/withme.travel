import type { Meta, StoryObj } from '@storybook/react';
import { GroupCard } from './GroupCard';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof GroupCard> = {
  title: 'Groups/Molecules/GroupCard',
  component: GroupCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    group: { control: 'object' },
    isSelectable: { control: 'boolean' },
    isSelected: { control: 'boolean' },
    onSelect: { action: 'selected' },
    onDelete: { action: 'deleted' },
    onEdit: { action: 'edited' },
    bulkMode: { control: 'boolean' },
    showActions: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof GroupCard>;

const defaultGroup = {
  id: 'group-1',
  name: 'Adventure Seekers',
  description: 'A group for people who love outdoor adventures and exploring new places.',
  emoji: '🏔️',
  memberCount: 8,
  tripCount: 3,
  createdAt: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    group: defaultGroup,
    onSelect: action('selected'),
    onDelete: action('deleted'),
    onEdit: action('edited'),
  },
};

export const WithImage: Story = {
  args: {
    group: {
      ...defaultGroup,
      name: 'Beach Lovers',
      description: 'Sun, sand, and relaxation.',
      emoji: '🏖️',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    },
    onSelect: action('selected'),
    onDelete: action('deleted'),
    onEdit: action('edited'),
  },
};

export const Selected: Story = {
  args: {
    group: defaultGroup,
    isSelectable: true,
    isSelected: true,
    onSelect: action('selected'),
    onDelete: action('deleted'),
    onEdit: action('edited'),
  },
};

export const BulkMode: Story = {
  args: {
    group: defaultGroup,
    isSelectable: true,
    bulkMode: true,
    onSelect: action('selected'),
  },
};

export const NoActions: Story = {
  args: {
    group: defaultGroup,
    showActions: false,
  },
};

export const WithClickHandler: Story = {
  args: {
    group: defaultGroup,
    onClick: action('clicked'),
  },
}; 