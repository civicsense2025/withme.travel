import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import clsx from 'clsx';

interface ContinentTabsProps {
  continents: string[];
  selectedContinent: string;
  onSelect: (continent: string) => void;
}

const NEON_ACTIVE_BG = 'bg-[#7DF9FF]/80'; // Neon cyan, adjust as needed

// Custom scrollbar-hide utility
const scrollbarHide = 'scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent [&::-webkit-scrollbar]:hidden';

export function ContinentTabs({ continents, selectedContinent, onSelect }: ContinentTabsProps) {
  // Filter out 'Unknown' and 'Other'
  const filteredContinents = continents.filter(
    (c) => c.toLowerCase() !== 'unknown' && c.toLowerCase() !== 'other'
  );
  const allTabs = ['All', ...filteredContinents];

  return (
    <Tabs value={selectedContinent} onValueChange={onSelect} className="w-full mb-8">
      <div className={clsx('overflow-x-auto', scrollbarHide)}>
        <TabsList
          className="flex flex-nowrap gap-x-4 gap-y-2 justify-start px-4 py-3 rounded-full border border-muted-foreground/30 bg-background/80 whitespace-nowrap min-w-fit"
          style={{ minWidth: 'max-content' }}
        >
          {allTabs.map((continent) => (
            <TabsTrigger
              key={continent}
              value={continent}
              className={clsx(
                'capitalize rounded-full px-5 py-2 transition-colors duration-150',
                selectedContinent === continent
                  ? '!bg-[#7DF9FF]/80 !text-black !font-semibold'
                  : 'bg-transparent text-muted-foreground hover:bg-muted/40'
              )}
            >
              {continent}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
} 