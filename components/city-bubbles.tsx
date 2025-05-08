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
  'bg-sky-100/20 hover:bg-sky-100/30 border-sky-300/40',     // light blue
  'bg-pink-100/20 hover:bg-pink-100/30 border-pink-300/40',   // light pink
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
    <DestinationContext.Provider value={{ setDestination }}>
      {children}
    </DestinationContext.Provider>
  );
}

// Chat bubble with tail component
const ChatBubble = ({ bubble, onClick }: { bubble: CityBubble; onClick: () => void }) => {
  return (
    <motion.div
      className={`
        ${bubble.color} ${bubble.sizeClass} 
        cursor-pointer 
        ${bubble.tailPosition === 'left' ? 'rounded-bl-none' : 'rounded-br-none'} rounded-2xl
        flex items-center justify-center px-4 py-3 
        text-center backdrop-blur-sm hover:shadow-sm 
        transition-all relative
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
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
    >
      <span className="text-sm font-medium text-black/70 dark:text-white/80">{bubble.text}</span>
    </motion.div>
  );
};

export function CityBubbles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });
  const { setDestination } = useContext(DestinationContext);
  const router = useRouter();
  const [clickedCity, setClickedCity] = useState<string | null>(null);
  
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

  // Update the handleBubbleClick function to create a guest trip directly
  const handleBubbleClick = async (cityName: string) => {
    try {
      setClickedCity(cityName);
      
      // Create a guest trip directly using the API instead of just setting the destination
      const response = await fetch('/api/trips/create-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: cityName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create trip');
      }
      
      const data = await response.json();
      
      if (data?.tripId) {
        // Redirect directly to the new trip
        router.push(`/trips/${data.tripId}`);
      } else {
        // Fallback to just setting the destination
        setDestination(cityName);
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      // Fallback to just setting the destination
      setDestination(cityName);
    }
  };

  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-10 mx-auto max-w-5xl py-6"
      ref={containerRef}
    >
      {bubbles.map((bubble) => (
        <ChatBubble 
          key={bubble.id}
          bubble={bubble}
          onClick={() => handleBubbleClick(bubble.cityName)}
        />
      ))}
    </div>
  );
}
