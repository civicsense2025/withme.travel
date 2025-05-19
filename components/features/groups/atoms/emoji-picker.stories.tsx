import type { Meta, StoryObj } from '@storybook/react';
import EmojiPicker from './emoji-picker';
import { useState } from 'react';

const meta: Meta<typeof EmojiPicker> = {
  title: 'Features/Groups/Atoms/EmojiPicker',
  component: EmojiPicker,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof EmojiPicker>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return <EmojiPicker value={value} onChange={setValue} />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('🌴');
    return <EmojiPicker value={value} onChange={setValue} />;
  },
}; 