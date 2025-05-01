// Optional: configure or set up a testing framework before each test
// if you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for TextEncoder and TextDecoder which are required by MSW
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Web API polyfills needed for MSW
import { Response, Request, Headers, fetch } from 'node-fetch';

global.Response = Response;
global.Request = Request;
global.Headers = Headers;
global.fetch = fetch;

// Mock BroadcastChannel
global.BroadcastChannel = class BroadcastChannel {
  constructor(name) {
    this.name = name;
  }
  postMessage() {}
  addEventListener() {}
  removeEventListener() {}
  close() {}
};

// Mock localStorage and sessionStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

// Mock window.location
delete window.location;
window.location = {
  assign: jest.fn(),
  pathname: '/',
  search: '',
  hash: '',
  replace: jest.fn(),
  reload: jest.fn(),
  toString: jest.fn(() => 'https://example.com/'),
  origin: 'https://example.com',
  protocol: 'https:',
  host: 'example.com',
  hostname: 'example.com',
  port: '',
  href: 'https://example.com/',
};

// Mock window.matchMedia
global.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
});

// Import and setup MSW
const { server } = require('./mocks/server');

// Initialize MSW before all tests
beforeAll(() => {
  // Check if we need to set up MSW for browser or node environment
  if (typeof window === 'undefined') {
    // We're in a Node.js environment - use server
    server.listen({ onUnhandledRequest: 'warn' });
  } else {
    // We're in a browser environment - use worker
    // Import using dynamic import to avoid issues in Node.js environment
    import('./mocks/browser.js').then(({ worker }) => {
      worker.start({ onUnhandledRequest: 'warn' });
    });
  }
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();

  // Clear all mocks between tests
  jest.clearAllMocks();
});

// Clean up after all tests are done
afterAll(() => {
  server.close();
});
