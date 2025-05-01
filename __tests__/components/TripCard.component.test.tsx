import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/utils/testing/test-utils';
import { generateTestTrip } from '@/utils/testing/test-data';
import { mockSupabaseSuccess } from '@/utils/testing/mock-supabase';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';

// Component to test - this is just a mockup, replace with your actual component import
// import TripCard from '@/components/trip/TripCard';

// Mock component for testing purposes
const TripCard = ({ tripId }: { tripId: string }) => {
  const [trip, setTrip] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(`/api/trips/${tripId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trip');
        }
        const data = await response.json();
        setTrip(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;
  if (!trip) return <div data-testid="not-found">Trip not found</div>;

  return (
    <div data-testid="trip-card">
      <h2 data-testid="trip-title">{trip.title}</h2>
      <p data-testid="trip-destination">{trip.destination}</p>
      <p data-testid="trip-dates">
        {new Date(trip.start_date).toLocaleDateString()} -
        {new Date(trip.end_date).toLocaleDateString()}
      </p>
      {trip.image_url && (
        <img
          src={trip.image_url}
          alt={trip.title}
          data-testid="trip-image"
          width={300}
          height={200}
        />
      )}
    </div>
  );
};

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => {
      const testTrip = generateTestTrip({
        id: 'mock-trip-id',
        title: 'Beach Vacation',
        destination: 'Hawaii',
      });
      return mockSupabaseSuccess(testTrip);
    }),
  })),
}));

describe('TripCard Component', () => {
  const testTrip = generateTestTrip({
    id: 'test-trip-id',
    title: 'Test Trip Title',
    destination: 'Paris, France',
    image_url: 'https://example.com/paris.jpg',
  });

  // Set up MSW handler for this specific test
  beforeEach(() => {
    // Reset handlers before each test
    server.resetHandlers(
      // Mock the API response for fetching a trip
      http.get('/api/trips/:tripId', ({ params }) => {
        return HttpResponse.json(testTrip);
      })
    );
  });

  it('renders loading state initially', () => {
    render(<TripCard tripId="test-trip-id" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders trip data after successful fetch', async () => {
    render(<TripCard tripId="test-trip-id" />);

    // First it should show loading
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Then it should show the trip data
    await waitFor(() => {
      expect(screen.getByTestId('trip-card')).toBeInTheDocument();
    });

    expect(screen.getByTestId('trip-title')).toHaveTextContent('Test Trip Title');
    expect(screen.getByTestId('trip-destination')).toHaveTextContent('Paris, France');
    expect(screen.getByTestId('trip-image')).toHaveAttribute(
      'src',
      'https://example.com/paris.jpg'
    );
  });

  it('renders error message when fetch fails', async () => {
    // Override the handler to return an error
    server.use(
      http.get('/api/trips/:tripId', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<TripCard tripId="test-trip-id" />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch trip');
  });

  it('renders not found message when trip is null', async () => {
    // Override the handler to return null data
    server.use(
      http.get('/api/trips/:tripId', () => {
        return HttpResponse.json(null);
      })
    );

    render(<TripCard tripId="test-trip-id" />);

    await waitFor(() => {
      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });
  });

  // Example of snapshot testing
  it('matches snapshot', async () => {
    const { container } = render(<TripCard tripId="test-trip-id" />);

    await waitFor(() => {
      expect(screen.getByTestId('trip-card')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
