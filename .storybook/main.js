import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type { import('@storybook/nextjs').StorybookConfig } */
const config = {
  stories: [
    "../src/**/*.mdx",
    // Only include tsx/jsx/mdx files to avoid duplicates
    "../src/**/*.stories.@(tsx|jsx|mdx)",
    "../components/**/*.stories.@(tsx|jsx|mdx)",
    "../app/**/*.stories.@(tsx|jsx|mdx)",
    "../stories/**/*.stories.@(tsx|jsx|mdx)",
    "../stories/**/*.mdx"
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
    "@storybook/addon-themes"
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: "tag",
  },
  async viteFinal(config, { configType }) {
    // Add any custom Vite configuration here

    // Make sure postcss and tailwind are properly configured
    if (!config.css) {
      config.css = {};
    }
    
    if (!config.css.postcss) {
      config.css.postcss = {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ]
      };
    }

    // Define necessary environment variables but not the entire process.env
    config.define = {
      ...config.define,
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        STORYBOOK: JSON.stringify('true'),
        // Add other specific environment variables you need
      },
    };

    // Add specific resolve aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '..'),
      '@components': path.resolve(__dirname, '../components'),
      '@app': path.resolve(__dirname, '../app'),
      '@utils': path.resolve(__dirname, '../utils'),
      '@hooks': path.resolve(__dirname, '../hooks'),
      '@types': path.resolve(__dirname, '../types'),
    };

    return config;
  },
};

export default config; 