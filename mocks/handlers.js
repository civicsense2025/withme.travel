import { http, HttpResponse } from 'msw';

export const handlers = [
  // Example handlers for common API endpoints
  http.post('/api/trips/:tripId/itinerary/scrape-url', async ({ request, params }) => {
    const { url } = await request.json();

    if (url.includes('eventbrite.com')) {
      return HttpResponse.json({
        title: 'Sample Eventbrite Event',
        description: 'This is a sample event description from Eventbrite.',
        imageUrl: 'https://example.com/event-image.jpg',
        scrapedUrl: url,
      });
    } else if (url.includes('ticketmaster.com')) {
      return HttpResponse.json({
        title: 'Sample Ticketmaster Event',
        description: 'This is a sample event description from Ticketmaster.',
        imageUrl: 'https://example.com/concert-image.jpg',
        scrapedUrl: url,
      });
    } else if (url.includes('error')) {
      return new HttpResponse(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (url.includes('forbidden')) {
      return new HttpResponse(
        JSON.stringify({ error: 'You do not have permission to access this resource' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    } else if (url.includes('notfound')) {
      return new HttpResponse(JSON.stringify({ error: 'URL not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return HttpResponse.json({
        title: 'Generic Event',
        description: 'Generic event description',
        imageUrl: null,
        scrapedUrl: url,
      });
    }
  }),

  http.post('/api/trips/:tripId/itinerary', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-item-id',
      ...body,
      created_at: new Date().toISOString(),
      votes: { up: 0, down: 0, upVoters: [], downVoters: [], userVote: null },
      creatorProfile: null,
    });
  }),
];
