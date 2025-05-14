import type { Meta, StoryObj } from '@storybook/react';
import { TagInput } from './tag-input';

const meta: Meta<typeof TagInput> = {
  title: 'Core UI/Inputs/TagInput',
  component: TagInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TagInput>;

export const Default: Story = {
  args: {
    value: ['beach', 'adventure', 'food'],
    onChange: (tags: string[]) => alert('Tags: ' + tags.join(', ')),
    placeholder: 'Add a tag...',
  },
};

export const LightMode: Story = {
  args: {
    value: ['beach', 'adventure', 'food'],
    onChange: (tags: string[]) => alert('Tags: ' + tags.join(', ')),
    placeholder: 'Add a tag...',
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: { description: { story: 'TagInput in light mode.' } },
  },
};

export const DarkMode: Story = {
  args: {
    value: ['beach', 'adventure', 'food'],
    onChange: (tags: string[]) => alert('Tags: ' + tags.join(', ')),
    placeholder: 'Add a tag...',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'TagInput in dark mode.' } },
  },
};
