import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Simple test component
const TestComponent = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-travel-purple">Test Component</h2>
    <p className="mt-2">
      This is a simple test component to verify that Storybook is loading correctly.
    </p>
    <button className="mt-4 px-4 py-2 bg-travel-blue text-white rounded hover:bg-travel-blue-dark">
      Test Button
    </button>
  </div>
);

// Define and export the meta object properly
const meta = {
  title: 'Test/TestComponent',
  component: TestComponent,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TestComponent>;

export default meta;
type Story = StoryObj<typeof TestComponent>;

// Export the story
export const Default: Story = {}; 