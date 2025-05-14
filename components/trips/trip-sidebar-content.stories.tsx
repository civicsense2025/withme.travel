import type { Meta, StoryObj } from '@storybook/react';
import TripSidebarContent from './trip-sidebar-content';

const meta: Meta<typeof TripSidebarContent> = {
  title: 'Product/Features/TripSidebarContent',
  component: TripSidebarContent,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof TripSidebarContent>;

const mockProps = {
  description: 'A fun group trip to Paris!',
  privacySetting: 'private',
  startDate: '2024-07-01',
  endDate: '2024-07-10',
  tags: [
    { id: '1', name: 'adventure' },
    { id: '2', name: 'food' },
  ],
  canEdit: true,
  userRole: 'admin',
  accessRequests: [],
  members: [
    { id: '1', user_id: '1', profiles: { name: 'Alice', avatar_url: null } },
    { id: '2', user_id: '2', profiles: { name: 'Bob', avatar_url: null } },
  ],
  onEdit: () => alert('Edit clicked'),
  onManageAccessRequest: (id: string, approve: boolean) =>
    alert(`Access request ${id} ${approve ? 'approved' : 'denied'}`),
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
