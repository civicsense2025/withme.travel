import type { Meta, StoryObj } from '@storybook/react';
import { GroupsLandingPageClient } from './groups-landing-page-client';

const meta: Meta<typeof GroupsLandingPageClient> = {
  title: 'Features/Groups/Organisms/GroupsLandingPageClient',
  component: GroupsLandingPageClient,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupsLandingPageClient>;

export const Default: Story = {
  args: {
    initialGroups: [],
    isAuthenticated: false,
  },
}; 