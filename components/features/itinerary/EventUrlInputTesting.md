# EventUrlInput Component - Testing Guide

This guide provides instructions for testing the EventUrlInput component after integrating it into your trip planning application.

## Prerequisites

Before beginning testing, ensure you have:

1. A working development environment with the component integrated
2. Admin/editor access to at least one trip in the system
3. Access to events websites you can test with (Eventbrite, Ticketmaster, etc.)
4. Browser developer tools available for debugging

## End-to-End Testing Scenarios

### Basic Functionality Tests

1. **URL Input Test**

   - Navigate to a trip's itinerary page
   - Locate the EventUrlInput component
   - Enter a valid event URL (e.g., `https://www.eventbrite.com/e/sample-event-123456`)
   - Verify that the "Get Event" button becomes enabled
   - Click the button and confirm loading state appears

2. **Successful Scraping Test**

   - Use a URL from a popular event site like Eventbrite or Ticketmaster
   - Verify that after clicking "Get Event", event details are displayed in the preview card
   - Check that the event title, description, and possibly image are shown correctly
   - Confirm the "Add to Itinerary" button is enabled

3. **Adding to Itinerary Test**
   - After successfully scraping an event, click "Add to Itinerary"
   - Verify loading state during submission
   - Confirm success toast appears after addition
   - Check the itinerary list to ensure the new item appears
   - Verify the item has the correct title, description, and category

### Error Handling Tests

1. **Invalid URL Test**

   - Enter an invalid URL like `not-a-url` or `http://`
   - Verify that appropriate validation error appears
   - Confirm the "Get Event" button remains disabled or shows validation error

2. **Inaccessible URL Test**

   - Enter a URL that doesn't exist (e.g., `https://www.eventbrite.com/e/non-existent-event-999999`)
   - Click "Get Event" and verify appropriate error message appears
   - Confirm the UI recovers gracefully and allows new input

3. **Permission Error Test**

   - Log in with a user account that doesn't have edit permissions for the trip
   - Verify the component doesn't appear or is disabled
   - If applicable, test API response by manually calling endpoint with developer tools

4. **Network Error Test**
   - Disable network connectivity (can use browser dev tools)
   - Try to scrape a URL and verify appropriate network error message appears
   - Re-enable network and verify the component works again

## Component-Specific Tests

1. **Clipboard Integration Test**

   - If implemented, test the "Paste URL" button functionality
   - Copy an event URL to clipboard
   - Click the paste button and verify URL is added to input
   - Verify scraping process begins automatically

2. **Day Number Selection Test**

   - If the component allows selecting a day, test changing the day selection
   - Add an event to a specific day
   - Verify the event appears in the correct day in the itinerary

3. **Preview Editing Test**

   - If implemented, test editing the scraped data before adding
   - Change the title, description, or other fields
   - Add to itinerary and verify edited data is preserved

4. **URL History Test**
   - If implemented, test the URL history feature
   - Add multiple events from different URLs
   - Verify recent URLs appear in the dropdown
   - Click a recent URL and verify it's populated and scraped

## Browser Compatibility Tests

Test the component in different browsers to ensure compatibility:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (if your application supports mobile)

## Performance Tests

1. **Response Time Test**

   - Measure scraping response time for various URLs
   - Ensure it's within acceptable limits (typically under 3 seconds)
   - Test with browser performance tools

2. **Multiple Rapid Requests Test**
   - Try scraping multiple URLs in quick succession
   - Verify that previous requests are properly canceled/managed
   - Check for any memory leaks or performance degradation

## Security Tests

1. **XSS Prevention Test**

   - Test with URLs containing script tags or other potentially malicious content
   - Verify that content is properly sanitized before display

2. **URL Validation Test**
   - Test with malformed URLs, extremely long URLs, and URLs with special characters
   - Verify proper validation and error handling

## Integration Tests

1. **State Management Test**

   - Add an event to the itinerary
   - Navigate away from the page and then back
   - Verify the updated itinerary still shows the added event

2. **Real-time Updates Test**
   - If your application supports real-time updates, test with multiple browser sessions
   - Add an event in one session and verify it appears in other sessions

## API Endpoint Testing

You can directly test the scraping API endpoint using tools like curl, Postman, or browser fetch:

```bash
# Example curl command
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.eventbrite.com/e/sample-event-123456"}' \
  http://localhost:3000/api/trips/YOUR_TRIP_ID/itinerary/scrape-url
```

Expected response format:

```json
{
  "title": "Sample Event Title",
  "description": "Event description text...",
  "imageUrl": "https://example.com/image.jpg",
  "scrapedUrl": "https://www.eventbrite.com/e/sample-event-123456"
}
```

## Debugging Tips

1. **Network Monitoring**

   - Use browser dev tools Network tab to monitor API requests and responses
   - Check for any failed requests or unexpected response formats

2. **Console Logging**

   - Check browser console for errors or warnings
   - Add temporary `console.log` statements in key component functions

3. **Component State Inspection**

   - Use React DevTools to inspect component state during testing
   - Verify state updates correctly after user actions

4. **API Response Inspection**
   - Check API response structure against expected ScrapedUrlData format
   - Verify all fields are present and correctly typed

## Reporting Issues

When reporting issues with the EventUrlInput component, include:

1. The exact URL used for testing
2. Screenshots of any errors or unexpected behavior
3. Browser and device information
4. Steps to reproduce the issue
5. Expected vs. actual behavior

## Compatibility Matrix

Create a compatibility matrix for popular event sites:

| Website         | Basic Data | Images | Dates | Location | Price | Notes                         |
| --------------- | ---------- | ------ | ----- | -------- | ----- | ----------------------------- |
| Eventbrite      | ✅         | ✅     | ✅    | ✅       | ❌    | Works best with public events |
| Ticketmaster    | ✅         | ✅     | ❌    | ✅       | ❌    | Requires public event pages   |
| Meetup          | ✅         | ✅     | ✅    | ✅       | ❌    | Public events only            |
| Facebook Events | ❌         | ❌     | ❌    | ❌       | ❌    | Restricted by FB security     |
| Bandsintown     | ✅         | ✅     | ✅    | ✅       | ❌    | Works with public events      |

## Common Issues & Solutions

1. **Issue**: No data scraped from URL
   **Solution**: Verify the URL is publicly accessible without login. Some sites block scraping.

2. **Issue**: Images not appearing in preview
   **Solution**: Some sites serve images with CORS restrictions. This is expected behavior.

3. **Issue**: Event added without proper formatting
   **Solution**: Check data parsing in the component, especially for dates and times.

4. **Issue**: Component not appearing for some users
   **Solution**: Verify permission settings. The component should only appear for users with edit permissions.

By following this testing guide, you can ensure the EventUrlInput component works correctly and provides a smooth user experience.
