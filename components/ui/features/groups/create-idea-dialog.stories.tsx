import type { Meta, StoryObj } from '@storybook/react';
import { CreateIdeaDialog } from './create-idea-dialog';

const meta: Meta<typeof CreateIdeaDialog> = {
  title: 'Product/Features/CreateIdeaDialog',
  component: CreateIdeaDialog,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof CreateIdeaDialog>;

const mockProps = {
  groupId: 'group-1',
  planId: 'plan-1',
  open: true,
  onClose: () => alert('Dialog closed'),
  onIdeaCreated: (idea: any) => alert('Idea created: ' + JSON.stringify(idea)),
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
