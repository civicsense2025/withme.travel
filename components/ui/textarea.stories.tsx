import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Core UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message...',
    value: 'Sample text',
    onChange: () => {},
    rows: 3,
  },
};

export const LightMode: Story = {
  args: {
    placeholder: 'Type your message...',
    value: 'Sample text',
    onChange: () => {},
    rows: 3,
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: { description: { story: 'Textarea in light mode.' } },
  },
};

export const DarkMode: Story = {
  args: {
    placeholder: 'Type your message...',
    value: 'Sample text',
    onChange: () => {},
    rows: 3,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Textarea in dark mode.' } },
  },
};
