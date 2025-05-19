# EventUrlInput Component - User Experience Best Practices

When implementing the EventUrlInput component in your trip planning interface, consider the following best practices to ensure an optimal user experience:

## Input Experience

1. **Auto-Detection**: Consider implementing real-time URL detection as the user types or pastes a URL.

   ```tsx
   // Enhanced URL input detection
   const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.value;
     setUrl(value);

     // Clear previous data and errors
     if (scrapedData) setScrapedData(null);
     if (error) setError(null);

     // Auto-detect valid URLs as the user types and trigger scraping automatically
     try {
       // Basic validation of URL format
       if (
         value.match(
           /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
         )
       ) {
         // Debounce the scraping request to avoid too many API calls
         if (scrapeTimeoutRef.current) clearTimeout(scrapeTimeoutRef.current);
         scrapeTimeoutRef.current = setTimeout(() => {
           handleScrapeUrl();
         }, 800);
       }
     } catch (err) {
       // Don't show errors during typing, only handle success cases
     }
   };
   ```

2. **Paste Handling**: Add a dedicated "Paste URL" button for mobile users or those who prefer clicking.
   ```tsx
   <Button
     variant="outline"
     onClick={async () => {
       try {
         const text = await navigator.clipboard.readText();
         setUrl(text);
         handleScrapeUrl();
       } catch (err) {
         toast({
           title: 'Clipboard access denied',
           description: 'Please paste the URL manually.',
           variant: 'destructive',
         });
       }
     }}
     className="flex-shrink-0"
   >
     <Clipboard className="h-4 w-4 mr-2" />
     Paste URL
   </Button>
   ```

## Preview Experience

1. **Rich Preview**: Enhance the preview with more context-specific information depending on the event type.

   ```tsx
   {
     scrapedData && (
       <div className="space-y-2 text-sm">
         {scrapedData.imageUrl && (
           <div className="aspect-video w-full rounded-md overflow-hidden">
             <img src={scrapedData.imageUrl} alt="" className="object-cover w-full h-full" />
           </div>
         )}
         <div className="flex items-center text-muted-foreground">
           <Calendar className="h-4 w-4 mr-1" />
           <span>Event date will be extracted when available</span>
         </div>
         {/* Add conditional rendering for location, price, etc. */}
       </div>
     );
   }
   ```

2. **Preview Editing**: Allow users to edit the scraped data before adding it to their itinerary.

   ```tsx
   const [editedTitle, setEditedTitle] = useState<string>('');

   useEffect(() => {
     if (scrapedData?.title) {
       setEditedTitle(scrapedData.title);
     }
   }, [scrapedData]);

   // In the preview card
   <Input
     value={editedTitle}
     onChange={(e) => setEditedTitle(e.target.value)}
     className="font-medium text-lg"
     placeholder="Event Title"
   />;
   ```

## Loading and Error States

1. **Progressive Loading**: Show partial information as it becomes available.

   ```tsx
   <div className="space-y-4">
     {isLoading && (
       <div className="animate-pulse space-y-3">
         <div className="h-6 bg-muted rounded w-3/4"></div>
         <div className="h-4 bg-muted rounded w-1/2"></div>
         <div className="h-32 bg-muted rounded"></div>
       </div>
     )}

     {/* Show partial data even while loading the rest */}
     {url && !error && (
       <div className="text-xs text-muted-foreground">
         <LinkIcon className="h-3 w-3 inline mr-1" />
         {url}
       </div>
     )}
   </div>
   ```

2. **Helpful Error Messages**: Provide specific, actionable error messages.
   ```tsx
   // Enhanced error handling with specific messages
   if (response.status === 404) {
     throw new Error("We couldn't access this page. Please check the URL or try a different one.");
   } else if (response.status === 403) {
     throw new Error('This page is restricted. Try a publicly accessible event page.');
   } else if (!response.ok) {
     // Parse error message from API if available
     const errorData = await response.json().catch(() => ({}));
     throw new Error(
       errorData.error || `Error code ${response.status}: Failed to load event details.`
     );
   }
   ```

## Adding to Itinerary Experience

1. **Success Feedback**: Provide clear confirmation when an event is added.

   ```tsx
   const handleAddEvent = async () => {
     // ... existing implementation

     try {
       // After successful addition
       toast({
         title: 'Event Added',
         description: (
           <div className="flex items-start space-x-2">
             <div className="flex-1">
               <p>"{scrapedData?.title}" was added to your itinerary.</p>
               <Button
                 variant="link"
                 className="p-0 h-auto text-xs"
                 onClick={() => {
                   // Implementation to scroll to the added item
                   document
                     .getElementById(`item-${newItem.id}`)
                     ?.scrollIntoView({ behavior: 'smooth' });
                 }}
               >
                 View in itinerary
               </Button>
             </div>
           </div>
         ),
       });
     } catch (err) {
       // Error handling
     }
   };
   ```

2. **Default Day Selection**: Default to user's context (current active day) when adding an event.

   ```tsx
   // In a parent component that uses EventUrlInput
   const [activeDay, setActiveDay] = useState<number | null>(null);

   // Pass the active day to EventUrlInput
   <EventUrlInput
     tripId={tripId}
     userId={userId}
     onEventAdded={handleItemAdded}
     dayNumber={activeDay}
   />;
   ```

## Additional Features

1. **URL History**: Add a dropdown showing recently used event URLs for quick re-use.

   ```tsx
   // Store recently used URLs in localStorage
   const addToRecentUrls = (url: string) => {
     const recentUrls = JSON.parse(localStorage.getItem('recentEventUrls') || '[]');
     const newRecentUrls = [url, ...recentUrls.filter((u: string) => u !== url)].slice(0, 5);
     localStorage.setItem('recentEventUrls', JSON.stringify(newRecentUrls));
   };
   ```

2. **URL Suggestions**: Recommend popular event sites if the user hasn't entered anything.

   ```tsx
   const popularEventSites = [
     { name: 'Eventbrite', url: 'https://www.eventbrite.com/' },
     { name: 'Ticketmaster', url: 'https://www.ticketmaster.com/' },
     { name: 'Meetup', url: 'https://www.meetup.com/' },
   ];

   // In the component
   {
     !url && (
       <div className="mt-2">
         <p className="text-xs text-muted-foreground mb-1">Popular event sites:</p>
         <div className="flex flex-wrap gap-2">
           {popularEventSites.map((site) => (
             <Button
               key={site.name}
               variant="outline"
               size="xs"
               onClick={() => window.open(site.url, '_blank')}
             >
               {site.name}
             </Button>
           ))}
         </div>
       </div>
     );
   }
   ```

3. **Smart Category Detection**: Automatically categorize events based on content.

   ```tsx
   // Helper function to detect event type
   const detectEventCategory = (title: string, description: string): string => {
     const lowerTitle = title.toLowerCase();
     const lowerDesc = description.toLowerCase();
     const text = `${lowerTitle} ${lowerDesc}`;

     if (text.includes('concert') || text.includes('music') || text.includes('festival')) {
       return 'Concert';
     } else if (text.includes('conference') || text.includes('convention')) {
       return 'Conference';
     } else if (text.includes('workshop') || text.includes('class')) {
       return 'Workshop';
     }
     // Default
     return 'Event';
   };
   ```

4. **Context Awareness**: Adapt the component based on where it's being used within the application.
   ```tsx
   <EventUrlInput
     tripId={tripId}
     userId={userId}
     onEventAdded={handleItemAdded}
     dayNumber={dayNumber}
     variant={isInMobileView ? 'compact' : 'full'} // Adapt UI based on context
     defaultCategory={activePage === 'activities' ? 'Activity' : 'Event'} // Context-aware defaults
   />
   ```

By implementing these best practices, you'll create a more intuitive and user-friendly experience for adding events to trip itineraries.
