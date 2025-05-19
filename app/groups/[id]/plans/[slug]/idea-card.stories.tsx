import type { Meta, StoryObj } from '@storybook/react';
import IdeaCard from './idea-card';

const meta: Meta<typeof IdeaCard> = {
  title: 'Features/Trip/IdeaCard',
  component: IdeaCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'IdeaCard is the atomic card for a single idea in the whiteboard or idea board.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    idea: { control: 'object', description: 'Idea object' },
    onDelete: { action: 'onDelete', description: 'Delete handler' },
    onEdit: { action: 'onEdit', description: 'Edit handler' },
    selected: { control: 'boolean', description: 'Is selected' },
    onSelect: { action: 'onSelect', description: 'Select handler' },
    selectedIdeasCount: { control: 'number', description: 'Selected ideas count' },
    position: { control: 'object', description: 'Idea position' },
    onPositionChange: { action: 'onPositionChange', description: 'Position change handler' },
    userId: { control: 'text', description: '-ser ID' },
    isAuthenticated: { control: 'boolean', description: 'Is Authenticated' },
    groupId: { control: 'text', description: 'Group ID' },
  },
};

export default meta;
type Story = StoryObj<typeof IdeaCard>;

export const Default: Story = {
  args: {
    idea: {
      id: 'ideaU1',
      group_id: 'groupU123',
      created_by: 'userU1',
      guest_token: null,
      title: 'Try a tapas crawl',
      description: 'Sample idea for a group trip',
      type: 'activity',
      comment_count: 2,
      updated_at: new Date().toISOString(),
      position: { columnId: 'activity', index: 0 },
      link: '',
      link_meta: null,
      votes_up: 0,
      votes_down: 0,
      selected: false,
      meta: {},
      created_at: new Date().toISOString(),
    },
    onDelete: () => {},
    onEdit: () => {},
    selected: false,
    onSelect: () => {},
    selectedIdeasCount: 0,
    position: { columnId: 'activity', index: 0 },
    onPositionChange: () => {},
    userId: 'userU1',
    isAuthenticated: true,
    groupId: 'groupU123',
  },
};
