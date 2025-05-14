// Simple mock implementation for browser usage
// This is a simplified version that doesn't rely on msw/browser
import { handlers } from './handlers';

// Mock worker for browser environment
export const worker = {
  start: () => {
    console.log('Mock browser worker started');
  },
  stop: () => {
    console.log('Mock browser worker stopped');
  },
  resetHandlers: () => {
    console.log('Mock browser handlers reset');
  },
  use: (...mockHandlers) => {
    console.log('Added handlers to mock browser worker');
  },
};

// Make the worker available in the browser for debugging if it exists
if (typeof window !== 'undefined') {
  window.msw = { worker };
}
