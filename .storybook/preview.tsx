import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../components/theme-provider';
import '../app/globals.css'; // Ensure global styles are loaded
import { helveticaNeue } from '../app/fonts';

// Viewport presets for responsive testing
const viewports = {
  mobile: {
    name: 'Mobile',
    styles: {
      width: '375px',
      height: '667px',
    },
  },
  tablet: {
    name: 'Tablet',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  desktop: {
    name: 'Desktop',
    styles: {
      width: '1280px',
      height: '800px',
    },
  },
  largeDesktop: {
    name: 'Large Desktop',
    styles: {
      width: '1920px',
      height: '1080px',
    },
  },
};

// Custom decorator to apply our theme properly to stories
const withThemeProvider = (Story, context) => {
  // Get the current theme from Storybook context
  const { globals } = context;
  const theme = globals.theme || 'system';
  
  return (
    <ThemeProvider
      defaultTheme={theme}
      enableSystem={false}
      storageKey="withme-theme" // Use the same key as in our app theme provider
    >
      <div className={`${helveticaNeue.variable} font-sans min-h-screen p-4`}>
        <Story />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'system',
      toolbar: {
        // Show theme selection in Storybook toolbar
        icon: 'paintbrush',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
          { value: 'system', icon: 'computer', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Add viewport options for responsive testing
    viewport: {
      viewports,
      defaultViewport: 'desktop',
    },
    // Set this to 'padded' to allow for spacing around components
    layout: 'padded',
    // Better docs layout
    docs: {
      story: {
        inline: true,
        height: 'auto',
      },
    },
    backgrounds: {
      disable: true, // Disable Storybook backgrounds in favor of our theme
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [withThemeProvider],
};

export default preview;
