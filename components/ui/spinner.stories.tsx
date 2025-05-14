import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Core UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const LightMode: StoryObj<typeof Spinner> = {
  parameters: {
    backgrounds: { default: 'light' },
    docs: { description: { story: 'Spinner in light mode.' } },
  },
};

export const DarkMode: StoryObj<typeof Spinner> = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Spinner in dark mode.' } },
  },
};
