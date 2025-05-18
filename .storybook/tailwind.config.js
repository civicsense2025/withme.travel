// Import the main tailwind config
const mainConfig = require('../tailwind.config.js');

/** @type {import('tailwindcss').Config} */
const config = {
  // Extend the main tailwind configuration
  ...mainConfig,
  // Override any Storybook-specific settings as needed
  content: [
    // Include Storybook files
    './.storybook/**/*.{js,ts,jsx,tsx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}',
    // Include all the usual app files
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Make sure purging doesn't remove CSS needed for stories
  safelist: [
    // Include common class patterns that might be dynamically generated
    {
      pattern: /^bg-/, // All background classes
      pattern: /^text-/, // All text classes
      pattern: /^border-/, // All border classes
      pattern: /^p-/, // All padding classes
      pattern: /^m-/, // All margin classes
      pattern: /^grid-/, // All grid classes
      pattern: /^flex-/, // All flex classes
    },
    // Specifically include any travel-branded classes
    'travel-purple',
    'travel-blue',
    'travel-pink',
    'travel-yellow',
    'travel-mint',
    'travel-peach',
  ],
};

module.exports = config;
