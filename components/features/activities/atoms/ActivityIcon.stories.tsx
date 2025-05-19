import type { Meta, StoryObj } from '@storybook/react';
import { ActivityIcon } from './ActivityIcon';

const meta: Meta<typeof ActivityIcon> = {
  title: 'Features/Activities/Atoms/ActivityIcon',
  component: ActivityIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['comment', 'create', 'update', 'delete', 'join', 'leave'],
      description: 'Type of activity to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the icon',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityIcon>;

export const Comment: Story = {
  args: {
    type: 'comment',
    size: 'md',
  },
};

export const Create: Story = {
  args: {
    type: 'create',
    size: 'md',
  },
};

export const Update: Story = {
  args: {
    type: 'update',
    size: 'md',
  },
};

export const Delete: Story = {
  args: {
    type: 'delete',
    size: 'md',
  },
};

export const Join: Story = {
  args: {
    type: 'join',
    size: 'md',
  },
};

export const Leave: Story = {
  args: {
    type: 'leave',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    type: 'comment',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    type: 'comment',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    type: 'comment',
    size: 'lg',
  },
}; 