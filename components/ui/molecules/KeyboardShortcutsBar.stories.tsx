import type { Meta, StoryObj } from '@storybook/react';
import KeyboardShortcutsBar from './KeyboardShortcutsBar';

const meta: Meta<typeof KeyboardShortcutsBar> = {
  title: 'Features/Trip/KeyboardShortcutsBar',
  component: KeyboardShortcutsBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'KeyboardShortcutsBar displays keyboard shortcuts for the ideas whiteboard. Use the onHide prop to control visibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onHide: { action: 'onHide', description: 'Hide handler' },
  },
};

export default meta;
type Story = StoryObj<typeof KeyboardShortcutsBar>;

export const Default: Story = {
  args: {
    onHide: () => {},
  },
};
