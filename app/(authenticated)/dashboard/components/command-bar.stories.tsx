import type { Meta, StoryObj } from '@storybook/react';
import { CommandBar } from './command-bar';

const meta: Meta<typeof CommandBar> = {
  title: 'Dashboard/CommandBar',
  component: CommandBar,
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CommandBar>;

export const Default: Story = {
  args: {
    className: '',
  },
}; 