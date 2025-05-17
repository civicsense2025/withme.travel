import type { Meta, StoryObj } from '@storybook/react';
import { ActivityGeneratorWidget } from './ActivityGeneratorWidget';

const meta: Meta<typeof ActivityGeneratorWidget> = {
  title: 'UI/Features/trips/ActivityGeneratorWidget',
  component: ActivityGeneratorWidget,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof ActivityGeneratorWidget>;

const mockProps = {
  groupId: 'group-1',
  planId: 'plan-1',
  onActivityGenerated: (activity: string) => alert('Generated activity: ' + activity),
};

export const Default: Story = { args: { ...mockProps } };
export const LightMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'light' } },
};
export const DarkMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'dark' } },
};
