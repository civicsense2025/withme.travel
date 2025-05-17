import type { Meta, StoryObj } from '@storybook/react';
import { CreateIdeaForm } from './create-idea-form';

const meta: Meta<typeof CreateIdeaForm> = {
  title: 'UI/Features/groups/create-idea-form',
  component: CreateIdeaForm,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof CreateIdeaForm>;

const mockProps = {
  groupId: 'group-1',
  planId: 'plan-1',
  onSubmit: (idea: any) => alert('Idea submitted: ' + JSON.stringify(idea)),
  onCancel: () => alert('Form cancelled'),
  loading: false,
  error: undefined,
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
