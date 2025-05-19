'use client';

import React from 'react';
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

  // Debug user authentication state
  useEffect(() => {
    console.log('[CommandMenu] Auth state updated:', user ? 'Logged in' : 'Not logged in');
  }, [user]);

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
            icon: <MapPin className="h-5 w-5 text-travel-purple" />,
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

    const isLoggedIn = !!user;
    console.log(
      '[CommandMenu] Handle select action:',
      value,
      isLoggedIn ? 'Logged in' : 'Not logged in'
    );

    switch (value) {
      case 'browse-destinations':
        router.push('/destinations');
        addToSearchHistory('Browse destinations', 'command');
        break;
      case 'plan-trip':
        // Redirect to login if not logged in
        if (!isLoggedIn) {
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
        if (!isLoggedIn) {
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
      case 'my-groups':
        // Redirect to login if not logged in
        if (!isLoggedIn) {
          router.push('/login?redirect=/groups');
          toast({
            title: 'Login required',
            description: 'Please log in to view your groups',
          });
        } else {
          router.push('/groups');
          addToSearchHistory('My groups', 'command');
        }
        break;
      case 'settings':
        // Redirect to login if not logged in
        if (!isLoggedIn) {
          router.push('/login?redirect=/settings');
          toast({
            title: 'Login required',
            description: 'Please log in to access settings',
          });
        } else {
          router.push('/settings');
          addToSearchHistory('Settings', 'command');
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

  // Get login status safely
  const isLoggedIn = !!user;

  return (
    <Dialog open={isSearchOpen} onOpenChange={(open: boolean) => !open && closeSearch()}>
      <DialogTrigger>{/* Placeholder for the children prop */}</DialogTrigger>
      <DialogContent
        className="p-0 gap-0 max-w-[750px] rounded-xl border-[1px] shadow-2xl backdrop-blur-[var(--cmd-backdrop-blur)] apple-glass z-50"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh',
        }}
      >
        <VisuallyHidden>
          <DialogTitle>Search Menu</DialogTitle>
        </VisuallyHidden>
        {showTooltip && (
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-5 py-2.5 rounded-xl shadow-lg animate-fade-in backdrop-blur-lg">
            <p className="text-sm font-medium">
              Press {isMac ? '⌘K' : 'Ctrl+K'} anytime to open this menu
            </p>
          </div>
        )}

        <Command
          className="rounded-xl overflow-hidden border-0 shadow-none bg-transparent"
          shouldFilter={false}
        >
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border-b backdrop-blur-md border-[hsl(var(--cmd-border))] px-8 py-6 w-full">
              <Search className="mr-4 h-6 w-6 shrink-0 text-[hsl(var(--cmd-text))]" />
              <input
                className="flex h-12 w-full rounded-md bg-transparent py-4 text-lg outline-none placeholder:text-[hsl(var(--cmd-text-muted))] text-[hsl(var(--cmd-text))] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search destinations, trips, or commands..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </form>

          <CommandList className="max-h-[480px] overflow-auto py-5 command-menu-scrollbar">
            {/* Search Results */}
            {results.length > 0 && (
              <CommandGroup heading="Search Results" className="py-2 px-6">
                {results.map((result: SearchResult) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={handleSelect}
                    className="py-4 px-4 cursor-pointer rounded-xl hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200 my-1"
                  >
                    <div className="flex items-center w-full">
                      <p className="font-medium tracking-tight text-[hsl(var(--cmd-text))]">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-sm text-[hsl(var(--cmd-text-muted))] mt-1">
                          {result.description}
                        </p>
                      )}
                      <ChevronRight className="h-4 w-4 text-[hsl(var(--cmd-text-muted))] ml-3 flex-shrink-0" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="py-10 text-center text-sm">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[hsl(var(--cmd-text))] border-t-transparent mr-2 align-middle"></div>
                <span className="text-[hsl(var(--cmd-text-muted))]">Searching...</span>
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchQuery && results.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-base text-[hsl(var(--cmd-text-muted))]">
                  No results found for "{searchQuery}"
                </p>
              </div>
            )}

            {/* Quick Actions - Only show when no search query or no results */}
            {(!searchQuery || (!isLoading && results.length === 0)) && (
              <CommandGroup heading="Navigation" className="py-2 px-6">
                <CommandItem
                  value="browse-destinations"
                  onSelect={handleSelect}
                  className="py-4 px-4 cursor-pointer rounded-xl hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200 my-1"
                >
                  <div className="flex items-center w-full">
                    <div className="flex-1">
                      <p className="font-medium tracking-tight text-[hsl(var(--cmd-text))]">
                        🗺️ Browse destinations
                      </p>
                      <p className="text-sm text-[hsl(var(--cmd-text-muted))] mt-1">
                        Explore travel destinations
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--cmd-text-muted))] ml-3 flex-shrink-0" />
                  </div>
                </CommandItem>

                <CommandItem
                  value="plan-trip"
                  onSelect={handleSelect}
                  className="py-4 px-4 cursor-pointer rounded-xl hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200 my-1"
                >
                  <div className="flex items-center w-full">
                    <div className="flex-1">
                      <p className="font-medium tracking-tight text-[hsl(var(--cmd-text))]">
                        ✈️ Plan a new trip
                      </p>
                      <p className="text-sm text-[hsl(var(--cmd-text-muted))] mt-1">
                        Start planning your next adventure
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--cmd-text-muted))] ml-3 flex-shrink-0" />
                  </div>
                </CommandItem>

                <CommandItem
                  value="my-trips"
                  onSelect={handleSelect}
                  className="py-4 px-4 cursor-pointer rounded-xl hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200 my-1"
                >
                  <div className="flex items-center w-full">
                    <div className="flex-1">
                      <p className="font-medium tracking-tight text-[hsl(var(--cmd-text))]">
                        🧳 My trips
                      </p>
                      <p className="text-sm text-[hsl(var(--cmd-text-muted))] mt-1">
                        View your planned trips
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--cmd-text-muted))] ml-3 flex-shrink-0" />
                  </div>
                </CommandItem>

                <CommandItem
                  value="my-groups"
                  onSelect={handleSelect}
                  className="py-4 px-4 cursor-pointer rounded-xl hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200 my-1"
                >
                  <div className="flex items-center w-full">
                    <div className="flex-1">
                      <p className="font-medium tracking-tight text-[hsl(var(--cmd-text))]">
                        👥 My groups
                      </p>
                      <p className="text-sm text-[hsl(var(--cmd-text-muted))] mt-1">
                        View your travel groups
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--cmd-text-muted))] ml-3 flex-shrink-0" />
                  </div>
                </CommandItem>

                <CommandItem
                  value="settings"
                  onSelect={handleSelect}
                  className="py-4 px-4 cursor-pointer rounded-xl hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200 my-1"
                >
                  <div className="flex items-center w-full">
                    <div className="flex-1">
                      <p className="font-medium tracking-tight text-[hsl(var(--cmd-text))]">
                        ⚙️ Settings
                      </p>
                      <p className="text-sm text-[hsl(var(--cmd-text-muted))] mt-1">
                        Manage your account settings
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--cmd-text-muted))] ml-3 flex-shrink-0" />
                  </div>
                </CommandItem>

                <CommandItem
                  value="support-us"
                  onSelect={handleSelect}
                  className="py-4 px-4 cursor-pointer rounded-xl hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200 my-1"
                >
                  <div className="flex items-center w-full">
                    <div className="flex-1">
                      <p className="font-medium tracking-tight text-[hsl(var(--cmd-text))]">
                        ❤️ Support WithMe
                      </p>
                      <p className="text-sm text-[hsl(var(--cmd-text-muted))] mt-1">
                        Help us build better travel planning tools
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--cmd-text-muted))] ml-3 flex-shrink-0" />
                  </div>
                </CommandItem>

                <CommandItem
                  value="support"
                  onSelect={handleSelect}
                  className="py-4 px-4 cursor-pointer rounded-xl hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200 my-1"
                >
                  <div className="flex items-center w-full">
                    <div className="flex-1">
                      <p className="font-medium tracking-tight text-[hsl(var(--cmd-text))]">
                        🆘 Get help
                      </p>
                      <p className="text-sm text-[hsl(var(--cmd-text-muted))] mt-1">
                        Contact our support team
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--cmd-text-muted))] ml-3 flex-shrink-0" />
                  </div>
                </CommandItem>
              </CommandGroup>
            )}

            {/* Search History - Only show when no search query and no results */}
            {!searchQuery && !isLoading && results.length === 0 && searchHistory.length > 0 && (
              <CommandGroup heading="Recent Searches" className="py-2 px-6 mt-2">
                {searchHistory.map((item: SearchHistoryItem) => (
                  <CommandItem
                    key={item.query}
                    value={`history:${item.query}`}
                    onSelect={handleSelect}
                    className="py-3 px-4 cursor-pointer rounded-xl hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200 my-1"
                  >
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 w-8 flex justify-center">
                        <Search className="h-4 w-4 text-[hsl(var(--cmd-text))]" />
                      </div>
                      <span className="tracking-tight flex-1 text-[hsl(var(--cmd-text))]">
                        {item.query}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[hsl(var(--cmd-text-muted))] ml-3 flex-shrink-0" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>

          <div className="border-t border-[hsl(var(--cmd-border))] py-4 px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <button
                  onClick={() => handleSelect('toggle-theme')}
                  className="text-sm text-[hsl(var(--cmd-text))] flex items-center space-x-1.5 py-1.5 px-3 rounded-md hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 mr-1.5 text-[hsl(var(--cmd-text))]" />
                  ) : (
                    <Moon className="h-4 w-4 mr-1.5 text-[hsl(var(--cmd-text))]" />
                  )}
                  <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </button>

                {/* Login Link - Only show when not logged in */}
                {!isLoggedIn && (
                  <button
                    onClick={() => handleSelect('login')}
                    className="text-sm text-[hsl(var(--cmd-text))] flex items-center space-x-1.5 py-1.5 px-3 rounded-md hover:bg-[hsl(var(--cmd-item-hover))] transition-all duration-200"
                  >
                    <LogIn className="h-4 w-4 mr-1.5 text-[hsl(var(--cmd-text))]" />
                    <span>Log in</span>
                  </button>
                )}
              </div>

              {/* Keyboard Shortcut */}
              <div className="text-xs text-[hsl(var(--cmd-text))] flex items-center">
                <kbd className="px-2 py-1 bg-[hsl(var(--cmd-item-hover))] border border-[hsl(var(--cmd-border))] rounded-md text-xs font-mono mr-1.5">
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className="px-2 py-1 bg-[hsl(var(--cmd-item-hover))] border border-[hsl(var(--cmd-border))] rounded-md text-xs font-mono">
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
