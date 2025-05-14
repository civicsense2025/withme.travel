import { useEffect } from 'react';
import { Destination } from '../constants';
import { DestinationsCarousel } from './DestinationsCarousel';
import { motion } from 'framer-motion';

interface CountrySectionProps {
  country: string;
  emoji?: string | null;
  destinations: Destination[];
  onViewAll?: () => void;
}

export function CountrySection({ country, emoji, destinations, onViewAll }: CountrySectionProps) {
  // Add debugging log for destination count
  useEffect(() => {
    console.log(`[CountrySection] Country: ${country}, Destinations: ${destinations.length}`);
    if (destinations.length > 0) {
      console.log(
        `[CountrySection] First destination: ${destinations[0].name || destinations[0].city}`
      );
    }
  }, [country, destinations]);

  return (
    <motion.section
      className="mb-8 md:mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-1 md:gap-2 mb-3 md:mb-6">
        {emoji && <span className="text-xl md:text-2xl">{emoji}</span>}
        <h2 className="text-xl md:text-3xl font-medium tracking-tight">{country}</h2>
      </div>
      <DestinationsCarousel destinations={destinations} onViewAll={onViewAll} />
    </motion.section>
  );
}
