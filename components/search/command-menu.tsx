'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  MapPin,
  Calendar,
  User,
  LifeBuoy,
  LogIn,
  Search,
  CommandIcon,
  Heart,
  Moon,
  Sun,
  ChevronRight,
  Users,
  Settings,
  UserPlus,
} from 'lucide-react';
import { useSearch } from '@/contexts/search-context';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn } from '@/lib/utils';

type SearchResult = {
  id: string;
  title: string;
  type: 'destination' | 'trip' | 'command';
  url?: string;
  icon?: React.ReactNode;
  description?: string;
};

// Define SearchHistoryItem type (adjust if defined elsewhere)
interface SearchHistoryItem {
  query: string;
  type: string;
}

export function CommandMenu() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const {
    isSearchOpen,
    closeSearch,
    searchQuery,
    setSearchQuery,
    searchHistory,
    addToSearchHistory,
  } = useSearch();

  const [showTooltip, setShowTooltip] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const firstOpenRef = useRef(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Check if it's the first time opening the command menu
  useEffect(() => {
    if (isSearchOpen && !firstOpenRef.current) {
      const hasSeenTooltip = localStorage.getItem('withme-cmd-tooltip-seen');
      if (!hasSeenTooltip) {
        setShowTooltip(true);
        localStorage.setItem('withme-cmd-tooltip-seen', 'true');

        // Hide tooltip after 8 seconds
        tooltipTimerRef.current = setTimeout(() => setShowTooltip(false), 8000);

        firstOpenRef.current = true;
      }
    }

    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, [isSearchOpen]);

  // Detect if user is on Mac
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Search for destinations when query changes
  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Search destinations
        const destinationsResponse = await fetch(
          `/api/destinations/search?query=${encodeURIComponent(debouncedSearchQuery)}`
        );
        const destinationsData = await destinationsResponse.json();

        // Format destination results
        const destinationResults: SearchResult[] = (destinationsData.destinations || []).map(
          (dest: any) => ({
            id: `destination-${dest.id || dest.city}`,
            title: `${dest.city}${dest.state_province ? `, ${dest.state_province}` : ''}, ${dest.country}`,
            type: 'destination',
            url: `/destinations/${dest.city ? dest.city.toLowerCase().replace(/\s+/g, '-') : `destination-${dest.id}`}`,
            icon: <MapPin className="h-5 w-5 text-primary" />,
            description: dest.description || `Explore ${dest.city}`,
          })
        );

        // TODO: Add trip search when API is available
        const tripResults: SearchResult[] = [];

        // Combine results
        setResults([...destinationResults, ...tripResults]);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: 'Search failed',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [debouncedSearchQuery, toast]);

  const handleSelect = (value: string) => {
    if (value === 'support-us') {
      router.push('/support');
      closeSearch();
      return;
    }

    if (value === 'toggle-theme') {
      setTheme(theme === 'dark' ? 'light' : 'dark');
      return;
    }

    // Handle destination results
    if (value.startsWith('destination-')) {
      const result = results.find((r: SearchResult) => r.id === value);
      if (result && result.url) {
        router.push(result.url);
        addToSearchHistory(result.title, 'destination');
        closeSearch();
        return;
      }
    }

    switch (value) {
      case 'browse-destinations':
        router.push('/destinations');
        addToSearchHistory('Browse destinations', 'command');
        break;
      case 'plan-trip':
        // Redirect to login if not logged in
        if (!user) {
          router.push('/login?redirect=/trips/create');
          toast({
            title: 'Login required',
            description: 'Please log in to plan a trip',
          });
        } else {
          router.push('/trips/create');
          addToSearchHistory('Plan a trip', 'command');
        }
        break;
      case 'my-trips':
        // Redirect to login if not logged in
        if (!user) {
          router.push('/login?redirect=/trips');
          toast({
            title: 'Login required',
            description: 'Please log in to view your trips',
          });
        } else {
          router.push('/trips');
          addToSearchHistory('My trips', 'command');
        }
        break;
      case 'support':
        router.push('/support');
        addToSearchHistory('Get support', 'command');
        break;
      case 'login':
        router.push('/login');
        addToSearchHistory('Log in', 'command');
        break;
      case 'signup':
        router.push('/signup');
        addToSearchHistory('Sign up', 'command');
        break;
      default:
        if (value.startsWith('search:')) {
          const query = value.replace('search:', '');
          router.push(`/search?q=${encodeURIComponent(query)}`);
          addToSearchHistory(query, 'destination');
        } else if (value.startsWith('history:')) {
          const query = value.replace('history:', '');
          router.push(`/search?q=${encodeURIComponent(query)}`);
          addToSearchHistory(query, 'destination');
        }
    }
    closeSearch();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    addToSearchHistory(searchQuery, 'destination');
    closeSearch();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  return (
    <Dialog open={isSearchOpen} onOpenChange={(open: boolean) => !open && closeSearch()}>
      <DialogTrigger>{/* Placeholder for the children prop */}</DialogTrigger>
      <DialogContent className="p-0 gap-0 max-w-[650px] rounded-xl border-0 shadow-2xl bg-background/95 backdrop-blur-lg">
        <VisuallyHidden>
          <DialogTitle>Search Menu</DialogTitle>
        </VisuallyHidden>
        {showTooltip && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-travel-purple text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            <p className="text-sm font-medium">
              Pro tip: Press {isMac ? '⌘K' : 'Ctrl+K'} anytime to open this menu
            </p>
          </div>
        )}

        <Command
          className="rounded-xl overflow-hidden border-0 shadow-none bg-transparent"
          shouldFilter={false}
        >
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border-b border-border/30 px-5 py-4 w-full bg-gradient-to-r from-background to-muted/30">
              <Search className="mr-3 h-5 w-5 shrink-0 text-travel-purple" />
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search destinations, trips..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </form>

          <CommandList className="max-h-[400px] overflow-auto py-3 command-menu-scrollbar">
            {/* Support Us - Pinned at top */}
            <div className="px-4 mb-2">
              <CommandItem
                value="support-us"
                onSelect={handleSelect}
                className="py-3 px-3 cursor-pointer flex items-center rounded-xl hover:bg-travel-purple/10"
              >
                <Heart className="mr-2 h-5 w-5 text-rose-500" />
                <span className="text-sm font-medium tracking-tight">Support us</span>
              </CommandItem>
            </div>

            <CommandSeparator className="bg-muted/50" />

            {/* Search Results */}
            {results.length > 0 && (
              <CommandGroup heading="Search Results" className="py-2 px-3">
                {results.map((result: SearchResult) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={handleSelect}
                    className="py-3 px-4 cursor-pointer rounded-xl hover:bg-travel-purple/10 transition-colors"
                  >
                    <div className="flex items-center w-full">
                      <div className="mr-3 text-travel-purple">{result.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium tracking-tight">{result.title}</p>
                        {result.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-travel-purple opacity-70 ml-2" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="py-8 text-center text-sm">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2 align-middle"></div>
                <span className="text-muted-foreground">Searching...</span>
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchQuery && results.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
              </div>
            )}

            {/* Quick Actions - Only show when no search query or no results */}
            {(!searchQuery || (!isLoading && results.length === 0)) && (
              <CommandGroup heading="Quick Actions" className="py-2 px-3">
                <CommandItem
                  value="browse-destinations"
                  onSelect={handleSelect}
                  className="py-3 px-4 cursor-pointer rounded-xl hover:bg-travel-purple/10 transition-colors"
                >
                  <div className="flex items-center w-full">
                    <MapPin className="mr-3 h-5 w-5 text-travel-purple" />
                    <div className="flex-1">
                      <p className="font-medium tracking-tight">Browse destinations</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Explore travel destinations
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-travel-purple opacity-70 ml-2" />
                  </div>
                </CommandItem>

                <CommandItem
                  value="plan-trip"
                  onSelect={handleSelect}
                  className="py-3 px-4 cursor-pointer rounded-xl hover:bg-travel-purple/10 transition-colors"
                >
                  <div className="flex items-center w-full">
                    <Calendar className="mr-3 h-5 w-5 text-travel-purple" />
                    <div className="flex-1">
                      <p className="font-medium tracking-tight">Plan a new trip</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Start planning your next adventure
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-travel-purple opacity-70 ml-2" />
                  </div>
                </CommandItem>

                <CommandItem
                  value="my-trips"
                  onSelect={handleSelect}
                  className="py-3 px-4 cursor-pointer rounded-xl hover:bg-travel-purple/10 transition-colors"
                >
                  <div className="flex items-center w-full">
                    <User className="mr-3 h-5 w-5 text-travel-purple" />
                    <div className="flex-1">
                      <p className="font-medium tracking-tight">My trips</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        View your planned trips
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-travel-purple opacity-70 ml-2" />
                  </div>
                </CommandItem>

                <CommandItem
                  value="support"
                  onSelect={handleSelect}
                  className="py-3 px-4 cursor-pointer rounded-xl hover:bg-travel-purple/10 transition-colors"
                >
                  <div className="flex items-center w-full">
                    <LifeBuoy className="mr-3 h-5 w-5 text-travel-purple" />
                    <div className="flex-1">
                      <p className="font-medium tracking-tight">Get support</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Contact our support team
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-travel-purple opacity-70 ml-2" />
                  </div>
                </CommandItem>
              </CommandGroup>
            )}

            {/* Search History - Only show when no search query and no results */}
            {!searchQuery && !isLoading && results.length === 0 && searchHistory.length > 0 && (
              <CommandGroup heading="Recent Searches" className="py-2 px-3">
                {searchHistory.map((item: SearchHistoryItem) => (
                  <CommandItem
                    key={item.query}
                    value={`history:${item.query}`}
                    onSelect={handleSelect}
                    className="py-3 px-4 cursor-pointer rounded-xl hover:bg-travel-purple/10 transition-colors"
                  >
                    <div className="flex items-center w-full">
                      <Search className="mr-3 h-4 w-4 text-travel-purple" />
                      <span className="tracking-tight flex-1">{item.query}</span>
                      <ChevronRight className="h-4 w-4 text-travel-purple opacity-70 ml-2" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>

          <div className="border-t border-border/30 py-3 px-5 bg-gradient-to-r from-background to-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <button
                  onClick={() => handleSelect('toggle-theme')}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center space-x-1.5 py-1 px-2 rounded-md hover:bg-accent transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                  <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </button>

                {/* Login Link - Only show when not logged in */}
                {!user && (
                  <button
                    onClick={() => handleSelect('login')}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center space-x-1.5 py-1 px-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Log in</span>
                  </button>
                )}
              </div>

              {/* Keyboard Shortcut */}
              <div className="text-xs text-muted-foreground flex items-center">
                <kbd className="px-1.5 py-0.5 bg-muted border border-border/30 rounded text-[10px] font-mono mr-1">
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-muted border border-border/30 rounded text-[10px] font-mono">
                  K
                </kbd>
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
