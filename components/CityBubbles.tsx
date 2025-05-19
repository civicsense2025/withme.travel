'use client';
import React, { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';

type CityBubble = {
  id: number;
  text: string;
  cityName: string;
  color: string;
  sizeClass: string;
  rotate: number;
  scale: number;
  delay: number;
  tailPosition: 'left' | 'right'; // Add tail position property
};

// Create a context to share destination setting functionality
export const DestinationContext = React.createContext<{
  setDestination: (city: string) => void;
}>({
  setDestination: () => {},
});

// Define city data
const cityPhrases = [
  { text: '🗽 weekend in nyc?', city: 'New York' },
  { text: '👙 down 4 miami?', city: 'Miami' },
  { text: '🇯🇵 tokyo adventure?', city: 'Tokyo' },
  { text: '🇫🇷 paris getaway?', city: 'Paris' },
  { text: '🧘🏽 bali retreat?', city: 'Bali' },
  { text: '🥘 barcelona tapas?', city: 'Barcelona' },
  { text: '🇬🇧 london calling?', city: 'London' },
  { text: '🍕 rome holiday?', city: 'Rome' },
  { text: '🏔 swiss alps?', city: 'Switzerland' },
  { text: '🚲 amsterdam canals?', city: 'Amsterdam' },
  { text: '🍺 berlin nightlife?', city: 'Berlin' },
  { text: '🏝 santorini views?', city: 'Santorini' },
];

// Color scheme for bubbles - very faded colors (10-20% opacity)
const colors = [
  'bg-sky-100/20 hover:bg-sky-100/30 border-sky-300/40', // light blue
  'bg-pink-100/20 hover:bg-pink-100/30 border-pink-300/40', // light pink
  'bg-amber-100/20 hover:bg-amber-100/30 border-amber-300/40', // light yellow
  'bg-violet-100/20 hover:bg-violet-100/30 border-violet-300/40', // light purple
  'bg-emerald-100/20 hover:bg-emerald-100/30 border-emerald-300/40', // light mint
  'bg-orange-100/20 hover:bg-orange-100/30 border-orange-300/40', // light peach
];

// Size classes for bubbles - making bubbles more consistent in size
const sizeClasses = [
  'w-[170px] md:w-[190px]',
  'w-[150px] md:w-[170px]',
  'w-[170px] md:w-[190px]',
  'w-[150px] md:w-[170px]',
];

// Provider component to pass down destination setting function
export function CityBubblesProvider({
  children,
  setDestination,
}: {
  children: React.ReactNode;
  setDestination: (city: string) => void;
}) {
  return (
    <DestinationContext.Provider value={{ setDestination }}>{children}</DestinationContext.Provider>
  );
}

// Chat bubble with tail component
const ChatBubble = ({
  bubble,
  onClick,
  isLoading,
  clickedCity,
}: {
  bubble: CityBubble;
  onClick: () => void;
  isLoading: boolean;
  clickedCity: string | null;
}) => {
  // Check if this specific bubble is loading
  const isBubbleLoading = isLoading && bubble.cityName === clickedCity;

  return (
    <motion.div
      className={`
        ${bubble.color} ${bubble.sizeClass} 
        cursor-pointer 
        ${bubble.tailPosition === 'left' ? 'rounded-bl-none' : 'rounded-br-none'} rounded-2xl
        flex items-center justify-center px-4 py-3 
        text-center backdrop-blur-sm hover:shadow-sm 
        transition-all relative
        ${isBubbleLoading ? 'opacity-80 pointer-events-none bg-accent-purple/10 border border-accent-purple/40' : ''}
      `}
      style={{
        rotate: `${bubble.rotate}deg`,
        transformOrigin: 'center',
        scale: bubble.scale,
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: bubble.delay,
        ease: [0.23, 1, 0.32, 1], // Cubic bezier for Apple-like animation
      }}
      whileHover={{
        scale: bubble.scale * 1.05,
        rotate: `${bubble.rotate / 2}deg`,
        transition: { duration: 0.2 },
      }}
      onClick={onClick}
    >
      <span className="text-sm font-medium text-black/70 dark:text-white/80 flex items-center gap-2">
        {isBubbleLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-accent-purple"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Creating trip...</span>
          </>
        ) : (
          bubble.text
        )}
      </span>
    </motion.div>
  );
};

export function CityBubbles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });
  const { setDestination } = useContext(DestinationContext);
  const router = useRouter();
  const [clickedCity, setClickedCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate bubbles with randomized properties
  const bubbles = useMemo(() => {
    return cityPhrases.map((phrase, index) => ({
      id: index,
      text: phrase.text,
      cityName: phrase.city,
      color: colors[index % colors.length],
      sizeClass: sizeClasses[index % sizeClasses.length],
      rotate: Math.random() * 14 - 7, // Less rotation: -7 to 7 degrees
      scale: 0.88 + Math.random() * 0.24, // Scale between 0.88 and 1.12
      delay: 0.1 + (index % 4) * 0.1, // Stagger delay by row position
      tailPosition: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right', // Cast to the correct type
    }));
  }, []);

  // Create a trip directly when a bubble is clicked
  const handleBubbleClick = async (cityName: string) => {
    if (isLoading) return; // Prevent multiple clicks

    setError(null);
    setClickedCity(cityName);
    setIsLoading(true);
    console.log(`[CityBubbles] Creating trip for: ${cityName}`);

    try {
      // Create a guest trip directly using the API
      const response = await fetch('/api/trips/create-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: cityName,
          customName: `Trip to ${cityName}`,
        }),
      });

      // Get the response data regardless of success/failure for better logging
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('[CityBubbles] Failed to parse response JSON:', jsonError);
        throw new Error('Failed to parse server response');
      }

      // If we got a response but it's not OK, check if we still got a tripId
      if (!response.ok) {
        console.warn(
          '[CityBubbles] Server returned error but checking for valid trip ID:',
          responseData
        );

        // If we still received a tripId despite the error, we can use it
        if (responseData && responseData.tripId) {
          console.log(
            '[CityBubbles] Found valid tripId despite error, proceeding:',
            responseData.tripId
          );
          router.push(`/trips/${responseData.tripId}`);
          return;
        }

        // Otherwise throw the error to be caught by the catch block
        console.error('[CityBubbles] Failed to create trip:', responseData);
        throw new Error(responseData.error || 'Failed to create trip');
      }

      console.log('[CityBubbles] Trip created successfully:', responseData);

      if (responseData?.tripId) {
        // Redirect directly to the new trip
        router.push(`/trips/${responseData.tripId}`);
      } else {
        throw new Error('No trip ID returned from API');
      }
    } catch (error) {
      console.error('[CityBubbles] Error creating trip:', error);
      setError(error instanceof Error ? error.message : 'Failed to create trip');
      setIsLoading(false);
      setClickedCity(null);

      // Only use setDestination as fallback if there's an error
      // This will update the input field instead of creating a trip directly
      if (cityName) {
        setDestination(cityName);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-10 mx-auto max-w-5xl py-6"
        ref={containerRef}
      >
        {bubbles.map((bubble) => (
          <ChatBubble
            key={bubble.id}
            bubble={bubble}
            onClick={() => handleBubbleClick(bubble.cityName)}
            isLoading={isLoading}
            clickedCity={clickedCity}
          />
        ))}
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
