'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

type CityBubble = {
  id: number;
  text: string;
  citySlug: string;
  color: string;
  sizeClass: string;
  x: string;
  y: string;
  delay: number;
};

// Define city data at the module level to avoid recreation
const cityPhrases = [
  '🗽 weekend in nyc?',
  '👙 down 4 miami?',
  '🇯🇵 tokyo adventure?',
  '🇫🇷 paris getaway?',
  '🧘🏽 bali retreat?',
  '🫓 barcelona tapas?',
  '💂 london calling?',
  '🇮🇹 rome holiday?',
];

const bubbleColors = [
  'bg-travel-blue text-blue-900',
  'bg-travel-pink text-pink-900',
  'bg-travel-yellow text-amber-900',
  'bg-travel-purple text-purple-900',
];

const createCitySlug = (text: string): string => {
  const cityMatch = text.match(/\b(nyc|miami|tokyo|paris|bali|barcelona|london|rome)\b/i);
  if (cityMatch && cityMatch[0]) {
    return cityMatch[0].toLowerCase().replace(/\s+/g, '-');
  }
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 20);
};

// Memoized BubbleItem component to reduce re-renders
const BubbleItem = React.memo(function BubbleItem({
  bubble,
  isInView,
}: {
  bubble: CityBubble;
  isInView: boolean;
}) {
  const animations = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 0.95,
      transition: {
        delay: bubble.delay,
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <Link key={bubble.id} href={`/destinations/${bubble.citySlug}`} passHref>
      <motion.div
        className={`
          absolute rounded-full lowercase font-medium
          shadow-sm cursor-pointer hover:scale-105 transition-transform
          whitespace-nowrap flex items-center justify-center text-center
          ${bubble.color} ${bubble.sizeClass}
        `}
        style={{
          left: bubble.x,
          top: bubble.y,
        }}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={animations}
        whileHover={{
          scale: 1.1,
          opacity: 1,
          transition: { duration: 0.2 },
        }}
      >
        {bubble.text}
      </motion.div>
    </Link>
  );
});

export function CityBubbles() {
  const [windowWidth, setWindowWidth] = useState(0);
  const bubblesRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(bubblesRef, { once: false, amount: 0.3 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth || 0);

      // Debounce resize handler to avoid excessive re-renders
      let resizeTimer: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => setWindowWidth(window.innerWidth || 0), 250);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer);
      };
    }
  }, []);

  // Memoize bubbles array to avoid unnecessary recalculations
  const bubbles = useMemo(() => {
    // Return empty array during SSR or initial render
    if (windowWidth === 0) return [];

    // Deterministic random selection instead of shuffling
    // This avoids full recalculation on every render
    const isMobile = windowWidth < 768;
    const maxBubbles = isMobile ? 4 : 6;

    // Use predetermined positions - fewer variations
    const positions = isMobile
      ? [
          { x: '40%', y: '10%' },
          { x: '40%', y: '30%' },
          { x: '40%', y: '50%' },
          { x: '40%', y: '70%' },
        ]
      : [
          { x: '15%', y: '20%' },
          { x: '40%', y: '15%' },
          { x: '65%', y: '25%' },
          { x: '20%', y: '60%' },
          { x: '45%', y: '70%' },
          { x: '70%', y: '55%' },
        ];

    // Use limited number of phrases based on screen size
    const selectedPhrases = cityPhrases.slice(0, maxBubbles);

    // Create bubbles with deterministic properties
    return selectedPhrases.map((text, index) => {
      // Simplify size classes - just two options
      const sizeClass = index % 2 === 0 ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';

      // Get position with slight offset
      const position = positions[index];
      const xOffset = index % 2 === 0 ? -2 : 2;
      const yOffset = index % 2 === 0 ? -1 : 1;

      return {
        id: index,
        text,
        citySlug: createCitySlug(text),
        color: bubbleColors[index % bubbleColors.length],
        sizeClass,
        x: `calc(${position.x} + ${xOffset}%)`,
        y: `calc(${position.y} + ${yOffset}%)`,
        delay: index * 0.1, // Shorter delays between animations
      };
    });
  }, [windowWidth]);

  return (
    <div ref={bubblesRef} className="relative w-full mx-auto overflow-hidden py-12 md:py-16">
      <div className="relative w-full min-h-[300px] md:min-h-[200px] h-full px-4 md:px-6">
        {bubbles.map((bubble) => (
          <BubbleItem key={bubble.id} bubble={bubble} isInView={isInView} />
        ))}
      </div>
    </div>
  );
}
