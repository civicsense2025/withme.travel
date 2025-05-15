import React from 'react';
import type { Preview } from "@storybook/react";
import { ThemeProvider } from "../components/theme-provider";
import { fn } from '@storybook/test';
import { withThemeByClassName } from '@storybook/addon-themes';
import { themes } from '@storybook/theming';

// Import CSS files in the correct order
import "../app/globals.css";    // App-specific global styles second
import "./storybook.css";       // Storybook-specific styles last

// Create the wrapper with storybook-specific class
const StorybookWrapper = ({ theme, children }: { theme: 'light' | 'dark', children: React.ReactNode }) => (
  <div className={`withme-storybook-wrapper storybook-container ${theme}`}>
    {children}
  </div>
);

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
    darkMode: {
      current: 'light',
      dark: { ...themes.dark },
      light: { ...themes.light }
    },
    backgrounds: {
      disable: true,
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
    (Story, context) => {
      const { theme } = context.globals;
      
      return (
        <ThemeProvider
          attribute="class"
          defaultTheme={theme || 'light'}
          enableSystem={false}
          disableTransitionOnChange
        >
          <StorybookWrapper theme={theme || 'light'}>
            <Story />
          </StorybookWrapper>
        </ThemeProvider>
      );
    },
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
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
};

export default preview; 