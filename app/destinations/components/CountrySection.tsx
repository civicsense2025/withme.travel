import { Destination } from '../constants';
import { DestinationsCarousel } from './DestinationsCarousel';

interface CountrySectionProps {
  country: string;
  emoji?: string | null;
  destinations: Destination[];
  onViewAll?: () => void;
}

export function CountrySection({ country, emoji, destinations, onViewAll }: CountrySectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        {emoji && <span className="text-xl">{emoji}</span>}
        <span>{country}</span>
      </h2>
      <DestinationsCarousel destinations={destinations} onViewAll={onViewAll} />
    </section>
  );
} 