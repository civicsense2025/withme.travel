'use client';

import { useState, useEffect, useCallback } from 'react';
import type { City, TripCity } from '@/types/multi-city';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Plus, X, Calendar, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { DateRange } from '@/components/ui/date-picker';
import { TABLES } from '@/utils/constants/database-multi-city';
import { createBrowserClient } from '@supabase/ssr';

interface MultiCitySelectorProps {
  tripId: string;
  initialCities?: TripCity[];
  onChange?: (cities: TripCity[]) => void;
  readOnly?: boolean;
}

export function MultiCitySelector({
  tripId,
  initialCities = [],
  onChange,
  readOnly = false,
}: MultiCitySelectorProps) {
  const [cities, setCities] = useState<TripCity[]>(initialCities);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not set');
  }
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  // Fetch trip cities on mount
  useEffect(() => {
    if (initialCities.length === 0 && tripId) {
      fetchTripCities();
    }
  }, [tripId]);

  // Notify parent component when cities change
  useEffect(() => {
    if (onChange) {
      onChange(cities);
    }
  }, [cities, onChange]);

  // Fetch cities for this trip
  const fetchTripCities = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trips/${tripId}/cities`);

      if (!response.ok) {
        throw new Error('Failed to fetch trip cities');
      }

      const data = await response.json();
      setCities(data.cities || []);
    } catch (error) {
      console.error('Error fetching trip cities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search for cities
  const searchCities = useCallback(
    async (query: string): Promise<void> => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);

        // Search cities in the database
        const { data, error } = await supabase
          .from(TABLES.CITIES)
          .select('*')
          .or(`name.ilike.%${query}%, country.ilike.%${query}%`)
          .order('name')
          .limit(10);

        if (error) {
          throw error;
        }

        // Ensure data is an array before setting state
        if (data && Array.isArray(data)) {
          setSearchResults(data as City[]);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching cities:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [supabase]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const query = e.target.value;
    setSearchQuery(query);
    searchCities(query);
  };

  // Add a city to the trip
  const addCity = async (): Promise<void> => {
    if (!selectedCity) return;

    try {
      setLoading(true);

      const payload = {
        city_id: selectedCity.id,
        position: cities.length,
        arrival_date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        departure_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      };

      const response = await fetch(`/api/trips/${tripId}/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to add city to trip');
      }

      const data = await response.json();

      // Add the new city to the list
      setCities((prevCities) => [...prevCities, data.trip_city]);

      // Reset form
      setSelectedCity(null);
      setDateRange({ from: null, to: null });
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding city:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove a city from the trip
  const removeCity = async (cityId: string): Promise<void> => {
    if (readOnly) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/trips/${tripId}/cities/${cityId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove city from trip');
      }

      // Remove the city from the list
      setCities((prevCities) => prevCities.filter((city) => city.city_id !== cityId));
    } catch (error) {
      console.error('Error removing city:', error);
    } finally {
      setLoading(false);
    }
  };

  // Move a city up in the order
  const moveCity = async (index: number, direction: 'up' | 'down'): Promise<void> => {
    if (readOnly || loading) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // Validate new index
    if (newIndex < 0 || newIndex >= cities.length) return;

    // Create a copy of the cities array
    const newCities = [...cities];

    // Swap the cities
    [newCities[index], newCities[newIndex]] = [newCities[newIndex], newCities[index]];

    // Update the positions
    const cityIds = newCities.map((city) => city.city_id);

    try {
      setLoading(true);

      // Optimistically update the UI
      setCities(newCities);

      // Call the API to update the order
      const response = await fetch(`/api/trips/${tripId}/cities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city_ids: cityIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder cities');
      }
    } catch (error) {
      console.error('Error reordering cities:', error);
      // Revert to the original order on error
      fetchTripCities();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Trip Cities</h3>

        {!readOnly && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus size={16} />
                <span>Add City</span>
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add City to Trip</DialogTitle>
                <DialogDescription>
                  Search for a city to add to your trip itinerary.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div className="relative">
                  <div className="absolute left-2.5 top-2.5 text-gray-500">
                    <Search size={18} />
                  </div>

                  <Input
                    type="text"
                    placeholder="Search cities..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-9"
                  />
                </div>

                {searchLoading && (
                  <div className="flex justify-center p-4">
                    <Spinner size="md" />
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    {searchResults.map((city) => (
                      <div
                        key={city.id}
                        className={`p-3 cursor-pointer hover:bg-gray-100 transition ${
                          selectedCity?.id === city.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedCity(city)}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-500">
                          {city.region && `${city.region}, `}
                          {city.country}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length > 1 && searchResults.length === 0 && !searchLoading && (
                  <div className="text-center p-4 text-gray-500">
                    No cities found matching your search.
                  </div>
                )}

                {selectedCity && (
                  <div className="mt-4 border rounded-md p-4 bg-gray-50">
                    <div className="font-medium">{selectedCity.name}</div>
                    <div className="text-sm text-gray-500 mb-4">
                      {selectedCity.region && `${selectedCity.region}, `}
                      {selectedCity.country}
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium mb-1">
                        Arrival & Departure Dates
                      </label>
                      <DatePicker
                        date={dateRange}
                        setDate={setDateRange}
                        placeholder="Select date range"
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={addCity} disabled={!selectedCity || loading}>
                  {loading ? <Spinner size="sm" className="mr-2" /> : null}
                  Add to Trip
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading && cities.length === 0 ? (
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      ) : cities.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-gray-50">
          <p className="text-gray-500 mb-4">No cities have been added to this trip yet.</p>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus size={16} className="mr-1" />
              Add First City
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cities.map((tripCity, index) => (
            <Card key={tripCity.id} className="relative">
              {!readOnly && (
                <div className="absolute top-3 right-3 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveCity(index, 'up')}
                    disabled={index === 0}
                    className="h-7 w-7"
                  >
                    <ChevronUp size={16} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveCity(index, 'down')}
                    disabled={index === cities.length - 1}
                    className="h-7 w-7"
                  >
                    <ChevronDown size={16} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCity(tripCity.city_id)}
                    className="h-7 w-7 text-red-500"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}

              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {!readOnly && (
                    <div className="text-gray-400 mt-1">
                      <GripVertical size={16} />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex flex-col">
                      <h4 className="text-lg font-medium">{tripCity.city?.name}</h4>

                      <div className="text-sm text-gray-500">
                        {tripCity.city?.region && `${tripCity.city.region}, `}
                        {tripCity.city?.country}
                      </div>

                      {(tripCity.arrival_date || tripCity.departure_date) && (
                        <div className="flex gap-2 mt-2">
                          {tripCity.arrival_date && (
                            <Badge variant="outline" className="gap-1 text-sm">
                              <Calendar size={14} />
                              Arrival: {format(new Date(tripCity.arrival_date), 'MMM d, yyyy')}
                            </Badge>
                          )}

                          {tripCity.departure_date && (
                            <Badge variant="outline" className="gap-1 text-sm">
                              <Calendar size={14} />
                              Departure: {format(new Date(tripCity.departure_date), 'MMM d, yyyy')}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
