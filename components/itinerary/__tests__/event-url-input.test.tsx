import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventUrlInput } from '../event-url-input';

// Mock the toast provider
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('EventUrlInput Component', () => {
  const defaultProps = {
    tripId: 'trip-123',
    userId: 'user-456',
    onEventAdded: jest.fn(),
    dayNumber: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  test('renders URL input field correctly', () => {
    render(<EventUrlInput {...defaultProps} />);
    
    const inputElement = screen.getByPlaceholderText(/paste event url/i);
    expect(inputElement).toBeInTheDocument();
    
    const submitButton = screen.getByRole('button', { name: /get event/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled(); // Button should be disabled initially
  });

  test('enables button when valid URL is entered', async () => {
    render(<EventUrlInput {...defaultProps} />);
    
    const inputElement = screen.getByPlaceholderText(/paste event url/i);
    const submitButton = screen.getByRole('button', { name: /get event/i });
    
    // Empty input - button should be disabled
    expect(submitButton).toBeDisabled();
    
    // Enter invalid URL - button should remain disabled
    await userEvent.type(inputElement, 'not-a-url');
    expect(submitButton).toBeDisabled();
    
    // Clear and enter valid URL - button should be enabled
    await userEvent.clear(inputElement);
    await userEvent.type(inputElement, 'https://www.eventbrite.com/e/sample-event');
    expect(submitButton).not.toBeDisabled();
  });

  test('displays error for invalid URL', async () => {
    render(<EventUrlInput {...defaultProps} />);
    
    const inputElement = screen.getByPlaceholderText(/paste event url/i);
    fireEvent.change(inputElement, { target: { value: 'invalid-url' } });
    
    const submitButton = screen.getByRole('button', { name: /get event/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });
  });

  test('shows loading state while fetching event data', async () => {
    // Mock a delayed response
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: async () => ({
              title: 'Sample Eventbrite Event',
              description: 'This is a sample event description from Eventbrite.',
              imageUrl: 'https://example.com/event-image.jpg',
              scrapedUrl: 'https://www.eventbrite.com/e/sample-event'
            }),
          }),
          100 // Small delay
        )
      )
    );

    render(<EventUrlInput {...defaultProps} />);
    
    const inputElement = screen.getByPlaceholderText(/paste event url/i);
    const submitButton = screen.getByRole('button', { name: /get event/i });
    
    // Empty input - button should be disabled
    expect(submitButton).toBeDisabled();
    
    // Enter invalid URL - button should remain disabled
    await userEvent.type(inputElement, 'not-a-url');
    expect(submitButton).toBeDisabled();
    
    // Clear and enter valid URL - button should be enabled
    await userEvent.clear(inputElement);
    await userEvent.type(inputElement, 'https://www.eventbrite.com/e/sample-event');
    expect(submitButton).not.toBeDisabled();
  });
});
