'use client';

import * as React from 'react';
import { DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSearch } from '@/contexts/search-context';
import { useRouter } from 'next/navigation';

export function SearchDialog({ ...props }: DialogProps) {
  const {
    isSearchOpen,
    closeSearch,
    searchQuery,
    setSearchQuery,
    searchHistory,
    addToSearchHistory,
  } = useSearch();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(isSearchOpen);
  }, [isSearchOpen]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      closeSearch();
    }
  };

  const handleSelect = (value: string) => {
    // Check if it's a navigation command
    if (value.startsWith('/')) {
      addToSearchHistory(value, 'command');
      router.push(value);
      closeSearch();
      return;
    }

    // Handle search queries
    addToSearchHistory(value, 'destination');
    router.push(`/search?q=${encodeURIComponent(value)}`);
    closeSearch();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} {...props}>
      <DialogContent className="p-0 max-w-2xl">
        <div className="flex flex-col h-full max-h-[80vh] overflow-hidden">
          <CommandPrimitive className="flex flex-col h-full overflow-hidden" shouldFilter={false}>
            <div className="flex items-center border-b standard-border-b px-4">
              <Search className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
              <CommandPrimitive.Input
                value={searchQuery}
                onValueChange={setSearchQuery}
                placeholder="Search destinations, trips, or type '/' for commands..."
                className="flex-1 h-11 bg-transparent outline-none placeholder:text-muted-foreground text-base"
              />
              <kbd className="hidden md:flex h-5 select-none items-center gap-1 rounded border standard-border bg-surface-subtle px-1.5 font-mono text-xs text-muted-foreground">
                Esc
              </kbd>
            </div>

            <CommandPrimitive.List className="flex-1 overflow-y-auto p-2">
              {searchQuery ? (
                <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </CommandPrimitive.Empty>
              ) : (
                <>
                  {searchHistory.length > 0 && (
                    <CommandPrimitive.Group heading="Recent Searches">
                      {searchHistory.map((item) => (
                        <CommandPrimitive.Item
                          key={`${item.query}-${item.timestamp}`}
                          value={item.query}
                          onSelect={handleSelect}
                          className={cn(
                            'flex items-center px-2 py-1 text-sm rounded-md cursor-pointer',
                            'aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                          {item.query}
                        </CommandPrimitive.Item>
                      ))}
                    </CommandPrimitive.Group>
                  )}

                  <CommandPrimitive.Group heading="Quick Navigation">
                    {[
                      { label: 'My Trips', value: '/trips' },
                      { label: 'Groups', value: '/groups' },
                      { label: 'Destinations', value: '/destinations' },
                      { label: 'Itineraries', value: '/itineraries' },
                      { label: 'Settings', value: '/settings' },
                    ].map((item) => (
                      <CommandPrimitive.Item
                        key={item.value}
                        value={item.value}
                        onSelect={handleSelect}
                        className={cn(
                          'flex items-center px-2 py-1 text-sm rounded-md cursor-pointer',
                          'aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <span className="mr-2 text-muted-foreground">→</span>
                        {item.label}
                      </CommandPrimitive.Item>
                    ))}
                  </CommandPrimitive.Group>
                </>
              )}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </div>
      </DialogContent>
    </Dialog>
  );
}
