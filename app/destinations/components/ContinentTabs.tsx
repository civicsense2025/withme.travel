import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface ContinentTabsProps {
  continents: string[];
  selectedContinent: string;
  onSelect: (continent: string) => void;
}

// Custom scrollbar-hide utility
const scrollbarHide =
  'scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent [&::-webkit-scrollbar]:hidden';

export function ContinentTabs({ continents, selectedContinent, onSelect }: ContinentTabsProps) {
  // Filter out 'Unknown' and 'Other'
  const filteredContinents = continents.filter(
    (c) => c.toLowerCase() !== 'unknown' && c.toLowerCase() !== 'other'
  );
  const allTabs = ['All', ...filteredContinents];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full mb-10"
    >
      <Tabs value={selectedContinent} onValueChange={onSelect} className="w-full">
        <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide no-scrollbar px-1 md:px-2">
          <TabsList
            className="flex flex-nowrap justify-start gap-x-2 whitespace-nowrap min-w-fit border-b"
            style={{ minWidth: 'max-content' }}
          >
            {allTabs.map((continent) => (
              <TabsTrigger
                key={continent}
                value={continent}
                className="capitalize text-sm font-medium"
              >
                {continent}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
    </motion.div>
  );
}
