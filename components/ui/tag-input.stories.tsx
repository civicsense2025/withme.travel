import type { Meta, StoryObj } from '@storybook/react';
import { TagInput } from './tag-input';
import React, { useState } from 'react';

/**
 * Storybook stories for the TagInput component
 * @module ui/TagInput
 */
const meta: Meta<typeof TagInput> = {
  title: 'UI/TagInput',
  component: TagInput,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof TagInput>;

export const Default: Story = {
  render: () => {
    const [tags, setTags] = useState<string[]>([]);
    return <TagInput value={tags} onChange={setTags} />;
  },
};

export const WithInitialTags: Story = {
  render: () => {
    const [tags, setTags] = useState<string[]>(['travel', 'group', 'fun']);
    return <TagInput value={tags} onChange={setTags} />;
  },
}; 