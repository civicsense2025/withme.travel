import type { Meta, StoryObj } from '@storybook/react';
import { VoteButton } from './vote-button';

const meta = {
  title: 'Atoms/Inputs & Controls/VoteButton',
  component: VoteButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'vote changed' },
  },
} satisfies Meta<typeof VoteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'none',
    count: 42,
    size: 'md',
  },
};

export const Upvoted: Story = {
  args: {
    value: 'up',
    count: 42,
    size: 'md',
  },
};

export const Downvoted: Story = {
  args: {
    value: 'down',
    count: -12,
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    value: 'none',
    count: 42,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    value: 'none',
    count: 42,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    value: 'none',
    count: 42,
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    value: 'none',
    count: 42,
    disabled: true,
    size: 'md',
  },
};

export const SingleButtonUp: Story = {
  args: {
    value: 'none',
    count: 24,
    singleButton: true,
    buttonType: 'up',
    size: 'md',
  },
};

export const SingleButtonDown: Story = {
  args: {
    value: 'none',
    count: 8,
    singleButton: true,
    buttonType: 'down',
    size: 'md',
  },
};

export const IconOnly: Story = {
  args: {
    value: 'none',
    count: 42,
    iconOnly: true,
    size: 'md',
  },
}; 