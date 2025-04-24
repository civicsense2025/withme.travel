"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { API_ROUTES } from "@/utils/constants";
export function LocationSearch({ onLocationSelect, placeholder = "Search city, state, or country...", className = "", containerClassName = "", initialValue = "", onClear, }) {
    const [searchQuery, setSearchQuery] = useState(initialValue);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const searchRef = useRef(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    // Reset error when query changes
    useEffect(() => {
        setSearchError(null);
    }, [searchQuery]);
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    useEffect(() => {
        async function fetchDestinations(retryCount = 0) {
            if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            try {
                setSearchError(null);
                setIsSearching(true);
                const response = await fetch(API_ROUTES.DESTINATION_SEARCH(debouncedSearchQuery));
                if (!response.ok) {
                    // If we get a 5xx error and haven't retried too many times, retry
                    if (response.status >= 500 && retryCount < 2) {
                        console.warn(`Destination search failed with status ${response.status}, retrying...`);
                        setTimeout(() => fetchDestinations(retryCount + 1), 1000);
                        return;
                    }
                    throw new Error(`Failed to fetch destinations: ${response.status}`);
                }
                const data = await response.json();
                setSearchResults(data.destinations || []);
            }
            catch (error) {
                console.error("Error fetching destinations:", error);
                setSearchResults([]);
                setSearchError("Unable to search destinations. Please try again later.");
            }
            finally {
                setIsSearching(false);
            }
        }
        fetchDestinations();
    }, [debouncedSearchQuery]);
    const handleSelectLocation = (location) => {
        const displayValue = `${location.city}, ${location.country}`;
        setSearchQuery(displayValue);
        setSearchResults([]);
        onLocationSelect(location);
    };
    const handleClear = () => {
        setSearchQuery("");
        setSearchResults([]);
        if (onClear) {
            onClear();
        }
    };
    return (<div className={`relative ${containerClassName}`} ref={searchRef}>
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"/>
        <Input type="text" placeholder={placeholder} className={`pl-10 pr-4 py-2 ${className}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        {searchQuery && onClear && (<button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" aria-label="Clear search">
             &times;
          </button>)}
        {isSearching && !(searchQuery && onClear) && (<div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
          </div>)}
      </div>

      {searchError && (<div className="mt-1 text-sm text-destructive">
          {searchError}
        </div>)}

      {searchResults.length > 0 && (<div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((place) => (<div key={place.id} className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer" onClick={() => handleSelectLocation(place)}>
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
              <div>
                <p className="font-medium">{place.city}</p>
                <p className="text-xs text-muted-foreground">
                  {place.state_province ? `${place.state_province}, ` : ""}
                  {place.country} • {place.continent}
                </p>
              </div>
            </div>))}
        </div>)}
    </div>);
}
