import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { EmojiPicker } from './EmojiPicker';

const meta: Meta<typeof EmojiPicker> = {
  title: 'Features/Groups/Atoms/EmojiPicker',
  component: EmojiPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmojiPicker>;

const EmojiPickerWithState = () => {
  const [emoji, setEmoji] = useState<string | null>('🏝️');
  return <EmojiPicker value={emoji} onChange={setEmoji} />;
};

export const Default: Story = {
  render: () => <EmojiPickerWithState />,
};

export const WithInitialValue: Story = {
  args: {
    value: '🧳',
    onChange: () => {},
  },
};

export const NoValue: Story = {
  args: {
    value: null,
    onChange: () => {},
  },
}; 