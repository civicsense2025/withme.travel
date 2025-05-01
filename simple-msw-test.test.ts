import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Create MSW server with a simple handler
const server = setupServer(
  http.get('/test', () => {
    return new HttpResponse('Test response', {
      status: 200,
    });
  })
);

// Standard MSW setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Simple MSW Test', () => {
  test('Server can be set up', () => {
    expect(server).toBeDefined();
  });
});
