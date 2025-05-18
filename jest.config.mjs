import 'dotenv/config'; // Load .env, .env.local, .env.test automatically
import nextJest from 'next/jest.js';
// jest.setup.js

// Providing the path to your Next.js app to load next.config.js and .env files in your test environment
const createJestConfig = nextJest({
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],

  // Handle React server components that use the "use client" directive
  transformIgnorePatterns: [
    '/node_modules/(?!(@radix-ui|tailwindcss|class-variance-authority|react-day-picker)/)',
  ],

  // Ignore app/package.json to avoid Haste module naming collision
  modulePathIgnorePatterns: ['<rootDir>/app/package.json'],

  // Ignore e2e tests
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '/playwright/'],

  // Enable module mapping for @ imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/styles/(.*)$': '<rootDir>/styles/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
  },

  testEnvironment: 'jest-environment-jsdom',

  // Use ts-jest for TypeScript files
  preset: 'ts-jest',

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/public/',
    '/.qodo/', // Assuming .qodo is project specific tooling/config
    '/migrations/', // Ignore database migrations
    // Add any other paths to ignore here (e.g., config files, specific utilities)
    'postcss.config.mjs',
    'tailwind.config.ts',
    'next.config.mjs',
    'components.json',
    'jest.config.mjs',
    'jest.setup.js',
    'lib/db.ts', // Example: Ignore direct DB interaction layer for unit tests
    'lib/google-calendar.ts', // Example: Ignore external API integrations
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'text', 'lcov', 'clover'],

  // Automatically reset mock state before every test
  resetMocks: true,

  // Automatically restore mock state and implementation before every test
  restoreMocks: true,

  // The root directory that Jest should scan for tests and modules within
  rootDir: '.',

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Transform ESM modules
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', { configFile: './babel.config.test.json' }],
  },

  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
