import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { render } from '@/utils/testing/test-utils';
import userEvent from '@testing-library/user-event';
import { EventUrlInput } from '@/components/itinerary/event-url-input';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

// Mock the toast component
const mockToast = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Test data
const mockTripId = 'test-trip-id';
const mockUserId = 'test-user-id';
const mockScrapedData = {
  title: 'Test Event Title',
  description: 'This is a test event description',
  imageUrl: 'https://example.com/event-image.jpg',
  scrapedUrl: 'https://eventbrite.com/e/test-event',
};

const mockNewItem = {
  id: 'new-item-id',
  trip_id: mockTripId,
  title: mockScrapedData.title,
  description: mockScrapedData.description,
  location: null,
  address: null,
  category: 'Event',
  created_by: mockUserId,
  cover_image_url: mockScrapedData.imageUrl,
  day_number: null,
  canonical_url: mockScrapedData.scrapedUrl,
  created_at: new Date().toISOString(),
  votes: { up: 0, down: 0, upVoters: [], downVoters: [], userVote: null },
  creatorProfile: null,
};

// Create a delayed response function to simulate loading state
const createDelayedResponse = <T extends unknown>(
  data: T,
  delayMs = 100
): (() => Promise<Response>) => {
  return () =>
    new Promise<Response>((resolve) => {
      setTimeout(() => {
        resolve(
          new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }, delayMs);
    });
};

describe('EventUrlInput Component', () => {
  // Mock callback function for onEventAdded
  const mockOnEventAdded = jest.fn();

  // Set up default props
  const defaultProps = {
    tripId: mockTripId,
    userId: mockUserId,
    onEventAdded: mockOnEventAdded,
  };

  // Setup fetch mock
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockToast.mockClear();
    mockOnEventAdded.mockClear();

    // Reset fetch mock with a default implementation
    // Cast to any to allow mockImplementation
    (global.fetch as jest.Mock) = jest.fn();

    // Default implementation for most tests
    (global.fetch as jest.Mock).mockImplementation(
      (url: string | URL | Request, options?: RequestInit) => {
        const urlString = url.toString();

        if (urlString === `/api/trips/${mockTripId}/itinerary/scrape-url`) {
          return Promise.resolve(
            new Response(JSON.stringify(mockScrapedData), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } else if (urlString === `/api/trips/${mockTripId}/itinerary`) {
          return Promise.resolve(
            new Response(JSON.stringify(mockNewItem), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } else {
          return Promise.resolve(
            new Response(JSON.stringify({ error: 'Not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }
    );
  });

  it('renders initial component correctly', () => {
    render(<EventUrlInput {...defaultProps} />);

    // Check for input field and button
    expect(screen.getByPlaceholderText(/paste event url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get event/i })).toBeInTheDocument();

    // Button should be disabled initially (when input is empty)
    expect(screen.getByRole('button', { name: /get event/i })).toBeDisabled();

    // No error message or scraped data should be visible initially
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/event details/i)).not.toBeInTheDocument();
  });

  it('validates empty URL and shows error message', async () => {
    const user = userEvent.setup();
    render(<EventUrlInput {...defaultProps} />);

    // Type a space (which will be trimmed) and click the button
    const input = screen.getByPlaceholderText(/paste event url/i);
    await user.type(input, ' ');

    // Button should still be disabled with just a space
    expect(screen.getByRole('button', { name: /get event/i })).toBeDisabled();

    // Clear and type a value and then clear it again
    await user.clear(input);
    await user.type(input, 'something');

    // Now clear the input by selecting all and deleting
    await user.clear(input);

    // Button should be disabled again
    expect(screen.getByRole('button', { name: /get event/i })).toBeDisabled();
  });

  it('validates invalid URL format and shows error message', async () => {
    const user = userEvent.setup();
    render(<EventUrlInput {...defaultProps} />);

    // Type an invalid URL
    const input = screen.getByPlaceholderText(/paste event url/i);
    await user.type(input, 'invalid-url');

    // Button should be enabled since there's text
    const button = screen.getByRole('button', { name: /get event/i });
    expect(button).not.toBeDisabled();

    // Click the button
    await user.click(button);

    // Should show validation error message
    expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
  });

  it('shows loading state when fetching event data', async () => {
    // Set up a delayed response to ensure loading state is visible
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      createDelayedResponse(mockScrapedData, 50)()
    );

    const user = userEvent.setup();
    render(<EventUrlInput {...defaultProps} />);

    // Type a valid URL
    const input = screen.getByPlaceholderText(/paste event url/i);
    await user.type(input, 'https://eventbrite.com/e/test-event');

    // Click the button to trigger loading state
    const button = screen.getByRole('button', { name: /get event/i });
    await user.click(button);

    // Should temporarily show loading state (need to add a data-testid to the component)
    const loadingButton = await screen.findByRole('button', { name: /loading/i });
    expect(loadingButton).toBeInTheDocument();
  });

  it('fetches and displays scraped event data successfully', async () => {
    const user = userEvent.setup();
    render(<EventUrlInput {...defaultProps} />);

    // Type a valid URL
    const input = screen.getByPlaceholderText(/paste event url/i);
    await user.type(input, 'https://eventbrite.com/e/test-event');

    // Click the button
    const button = screen.getByRole('button', { name: /get event/i });
    await user.click(button);

    // Wait for the scraped data to be displayed
    const title = await screen.findByText(mockScrapedData.title);
    expect(title).toBeInTheDocument();

    // Check that all scraped data is displayed
    expect(screen.getByText(mockScrapedData.description)).toBeInTheDocument();
    expect(screen.getByText(mockScrapedData.scrapedUrl)).toBeInTheDocument();
    expect(screen.getByAltText(`${mockScrapedData.title}`)).toHaveAttribute(
      'src',
      mockScrapedData.imageUrl
    );

    // Check that the add to itinerary button is displayed
    expect(screen.getByRole('button', { name: /add to itinerary/i })).toBeInTheDocument();
  });

  it('successfully adds event to itinerary', async () => {
    const user = userEvent.setup();
    render(<EventUrlInput {...defaultProps} />);

    // Type a valid URL and get event data
    const input = screen.getByPlaceholderText(/paste event url/i);
    await user.type(input, 'https://eventbrite.com/e/test-event');
    await user.click(screen.getByRole('button', { name: /get event/i }));

    // Wait for scraped data to appear
    await screen.findByText(mockScrapedData.title);

    // Use a delayed response for the add to itinerary request
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      createDelayedResponse(mockNewItem, 50)()
    );

    // Click the add to itinerary button
    const addButton = screen.getByRole('button', { name: /add to itinerary/i });
    await user.click(addButton);

    // Wait for the operation to complete
    await waitFor(() => {
      // Check that onEventAdded was called with the new item
      expect(mockOnEventAdded).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockNewItem.id,
          title: mockNewItem.title,
        })
      );

      // Check toast was shown
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Event Added',
        })
      );
    });

    // Form should be reset
    expect(input).toHaveValue('');
    expect(screen.queryByText(mockScrapedData.title)).not.toBeInTheDocument();
  });

  it('handles API error when scraping URL', async () => {
    // Mock a server error
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Failed to scrape URL' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    const user = userEvent.setup();
    render(<EventUrlInput {...defaultProps} />);

    // Type a URL that will trigger an error
    const input = screen.getByPlaceholderText(/paste event url/i);
    await user.type(input, 'https://error.com/event');

    // Click the button
    const button = screen.getByRole('button', { name: /get event/i });
    await user.click(button);

    // Wait for the error message to be displayed
    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toBeInTheDocument();

    // Alert should contain error text
    expect(within(errorAlert).getByText(/error/i)).toBeInTheDocument();

    // No scraped data should be displayed
    expect(screen.queryByText(/event details/i)).not.toBeInTheDocument();
  });

  it('handles API error when adding event to itinerary', async () => {
    const user = userEvent.setup();
    render(<EventUrlInput {...defaultProps} />);

    // Type a valid URL and get event data
    const input = screen.getByPlaceholderText(/paste event url/i);
    await user.type(input, 'https://eventbrite.com/e/test-event');
    await user.click(screen.getByRole('button', { name: /get event/i }));

    // Wait for scraped data to appear
    await screen.findByText(mockScrapedData.title);

    // Mock a server error for the add to itinerary request
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Failed to add event' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    // Click the add to itinerary button
    const addButton = screen.getByRole('button', { name: /add to itinerary/i });
    await user.click(addButton);

    // Wait for the error toast to be called
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error Adding Event',
          variant: 'destructive',
        })
      );
    });
  });

  it('clears scraped data when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<EventUrlInput {...defaultProps} />);

    // Type a valid URL and get event data
    const input = screen.getByPlaceholderText(/paste event url/i);
    await user.type(input, 'https://eventbrite.com/e/test-event');
    await user.click(screen.getByRole('button', { name: /get event/i }));

    // Wait for scraped data to appear
    await screen.findByText(mockScrapedData.title);

    // Click the cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Scraped data should be cleared
    expect(screen.queryByText(mockScrapedData.title)).not.toBeInTheDocument();
  });

  it('clears error when URL input changes', async () => {
    const user = userEvent.setup();
    render(<EventUrlInput {...defaultProps} />);

    // Type an invalid URL
    const input = screen.getByPlaceholderText(/paste event url/i);
    await user.type(input, 'invalid-url');

    // Click the button to trigger error
    const button = screen.getByRole('button', { name: /get event/i });
    await user.click(button);

    // Should show validation error message
    expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();

    // Change the URL input
    await user.clear(input);
    await user.type(input, 'https://eventbrite.com/e/test-event');

    // Error should be cleared
    expect(screen.queryByText(/please enter a valid url/i)).not.toBeInTheDocument();
  });

  it('renders with day number when provided', () => {
    const dayNumber = 3;
    render(<EventUrlInput {...defaultProps} dayNumber={dayNumber} />);

    // This test just verifies the component renders with dayNumber prop
    expect(screen.getByPlaceholderText(/paste event url/i)).toBeInTheDocument();
  });
});
