import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from './alert';

// Import icons for the examples
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const meta: Meta<typeof Alert> = {
  title: 'UI/Molecules/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'select',
      options: ['info', 'warning', 'success', 'none'],
      mapping: {
        info: <InfoIcon />,
        warning: <WarningIcon />,
        success: <SuccessIcon />,
        none: null,
      },
      description: 'The icon to display in the alert',
    },
    title: {
      control: 'text',
      description: 'The alert title',
    },
    description: {
      control: 'text',
      description: 'The alert description',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    title: 'Alert Title',
    description: 'Alert description with important information.',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <InfoIcon />,
    title: 'Information',
    description: 'This is an informational alert with an icon.',
  },
};

export const WarningAlert: Story = {
  args: {
    icon: <WarningIcon />,
    title: 'Warning',
    description: 'This action cannot be undone.',
    className: 'border-yellow-500 bg-yellow-50',
  },
};

export const SuccessAlert: Story = {
  args: {
    icon: <SuccessIcon />,
    title: 'Success',
    description: 'Your changes have been saved successfully.',
    className: 'border-green-500 bg-green-50',
  },
};

export const WithChildren: Story = {
  args: {
    title: 'Alert with custom content',
  },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Custom Title Component</AlertTitle>
      <AlertDescription>
        This alert uses the AlertTitle and AlertDescription components.
      </AlertDescription>
      <div className="mt-3">
        <button className="px-3 py-1 text-sm bg-primary text-white rounded">Action Button</button>
      </div>
    </Alert>
  ),
};
