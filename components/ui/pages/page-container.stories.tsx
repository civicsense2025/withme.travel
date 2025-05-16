import type { Meta, StoryObj } from '@storybook/react';
import { PageContainer } from './page-container';
import { PageHeader } from './page-header';

const COMPONENT_CATEGORIES = {
  LAYOUT: 'Layout',
  UI: 'UI',
};

const meta: Meta<typeof PageContainer> = {
  title: 'Layout/PageContainer',
  component: PageContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    header: { control: false, description: 'Header node (ReactNode)' },
    children: { control: false, description: 'Main content' },
    fullWidth: { control: 'boolean', description: 'Full width layout' },
  },
};

export default meta;
type Story = StoryObj<typeof PageContainer>;

export const Default: Story = {
  args: {
    children: <div style={{ padding: 32 }}>This is the main content area.</div>,
    fullWidth: false,
  },
};

export const WithHeader: Story = {
  args: {
    header: (
      <PageHeader
        title="Header Title"
        description="Header description goes here."
        centered={true}
      />
    ),
    children: <div style={{ padding: 32 }}>This is the main content area below the header.</div>,
    fullWidth: false,
  },
};
