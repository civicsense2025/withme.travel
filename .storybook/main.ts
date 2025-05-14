import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirnameESM = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    '../.storybook/pages/**/*.mdx',
    '../components/ui/DesignSystem.mdx',
    '../components/**/*.mdx',
    '../components/**/*.stories.@(js|jsx|ts|tsx)',
    '../app/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirnameESM, '..'),
      };
    }
    return config;
  },
  staticDirs: ['../public'],
};
export default config;
