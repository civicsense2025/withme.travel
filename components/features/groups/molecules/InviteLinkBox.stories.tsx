import type { Meta, StoryObj } from '@storybook/react';
import { InviteLinkBox } from './InviteLinkBox';

const meta: Meta<typeof InviteLinkBox> = {
  title: 'Features/Groups/Molecules/InviteLinkBox',
  component: InviteLinkBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InviteLinkBox>;

export const Default: Story = {
  args: {
    groupId: 'abc123',
  },
};

export const MockedGroup: Story = {
  args: {
    groupId: 'summer-trip-2024',
  },
}; 