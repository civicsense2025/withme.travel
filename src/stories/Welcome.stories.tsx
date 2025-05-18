import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Simple welcome component for Storybook
 */
const Welcome: React.FC = () => {
  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Welcome to Withme.travel Storybook</h1>
      <p className="mb-4">
        This is a collection of UI components and design patterns used throughout the application.
      </p>
      <p className="text-gray-600">Use the sidebar to navigate through different components.</p>
    </div>
  );
};

const meta: Meta<typeof Welcome> = {
  title: 'Welcome',
  component: Welcome,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Welcome>;

export const Default: Story = {};
