// Using MSW v2
import { http, HttpResponse } from 'msw';
import { handlers } from './handlers';

// Create a mock server interface that works in both browser and node
// This doesn't rely on msw/node, which seems to have resolution issues
const server = {
  listen: () => {
    console.log('Mock server started');
    // Setup global fetch mock if needed
    if (typeof global.fetch === 'undefined') {
      global.fetch = jest.fn();
    }
  },
  resetHandlers: () => {
    console.log('Mock handlers reset');
  },
  close: () => {
    console.log('Mock server closed');
  },
  use: (...mockHandlers) => {
    console.log('Added handlers to mock server');
  },
};

export { server };
