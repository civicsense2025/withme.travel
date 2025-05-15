import React from 'react';
import type { Preview } from "@storybook/react";
import { ThemeProvider } from "../components/theme-provider";
import { fn } from '@storybook/test';
import { withThemeByClassName } from '@storybook/addon-themes';

// Import CSS files in the correct order
import "../app/globals.css";    // App-specific global styles second
import "./storybook.css";       // Storybook-specific styles last

// Create a simple decorator that wraps stories with the theme provider
const withThemeProvider = (Story) => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="storybook-theme">
      <div className="withme-storybook-wrapper">
        <Story />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    // Use individual actions instead of regex per Storybook recommendation
    actions: {
      handles: ['click', 'click .btn', 'mouseover', 'submit', 'change', 'select'],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    // Ensure docs are properly rendered
    docs: {
      story: {
        inline: true,
      },
    },
    // Prevent infinite loading with proper rendering
    renderer: {
      strict: true,
    },
  },
  decorators: [
    withThemeProvider,
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
  // Use explicit args mocking for actions
  argTypes: {
    onClick: { action: 'clicked' },
    onSubmit: { action: 'submitted' },
    onSelect: { action: 'selected' },
    onToggle: { action: 'toggled' },
  },
  // Set up default args for all stories to use the stable fn function
  args: {
    onClick: fn(),
    onSubmit: fn(),
    onSelect: fn(),
    onToggle: fn(),
  },
};

export default preview; 