'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, CircleF } from '@react-google-maps/api';
import { useMapContext } from './map-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Info, Map, MapPin, Search, X, List, Plus, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

// Types
type Place = {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  placeId: string;
  types: string[];
  notes?: string;
  selected?: boolean;
};

type MapSearchMode = 'bounds' | 'radius' | 'text';

type GoogleMapsImportProps = {
  onImport: (places: Place[]) => void;
  onClose: () => void;
};

// Helper function to categorize Google Maps place types
function categorizePlace(types: string[]): string {
  if (!types || types.length === 0) return 'attraction';
  
  if (types.some(t => t.includes('lodg') || t.includes('hotel') || t === 'campground')) {
    return 'accommodation';
  }
  
  if (types.some(t => t.includes('restaurant') || t.includes('food') || t === 'cafe' || t === 'bakery')) {
    return 'restaurant';
  }
  
  if (types.some(t => t.includes('museum') || t.includes('tourist') || t === 'point_of_interest')) {
    return 'attraction';
  }
  
  if (types.some(t => t.includes('airport') || t.includes('station') || t.includes('transit'))) {
    return 'transportation';
  }
  
  if (types.some(t => t.includes('park') || t.includes('outdoor') || t.includes('natural'))) {
    return 'activity';
  }
  
  if (types.some(t => t === 'bar' || t === 'night_club')) {
    return 'nightlife';
  }
  
  return 'activity';
}

// The main component
export default function GoogleMapsImport({ onImport, onClose }: GoogleMapsImportProps) {
  const { isLoaded, loadError } = useMapContext();
  const { toast } = useToast();
  
  // State
  const [searchInput, setSearchInput] = useState('');
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [mapZoom, setMapZoom] = useState(12);
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [searchMode, setSearchMode] = useState<MapSearchMode>('text');
  const [searchRadius, setSearchRadius] = useState(1000); // meters
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [showSelected, setShowSelected] = useState(false);
  const [nearbySearchInProgress, setNearbySearchInProgress] = useState(false);
  const [textSearchInProgress, setTextSearchInProgress] = useState(false);
  
  // Refs
  const mapRef = useRef<google.maps.Map>();
  const placesServiceRef = useRef<google.maps.places.PlacesService>();
  const searchCircleRef = useRef<google.maps.Circle>();
  
  // Memoized values
  const filteredResults = useMemo(() => {
    return showSelected 
      ? selectedPlaces 
      : searchResults.map(place => ({
          id: place.place_id || `temp-${Math.random()}`,
          name: place.name || 'Unnamed Place',
          address: place.formatted_address || place.vicinity || '',
          location: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
          },
          placeId: place.place_id || '',
          types: place.types || [],
          selected: selectedPlaces.some(p => p.placeId === place.place_id)
        }));
  }, [searchResults, selectedPlaces, showSelected]);
  
  // Map load handler
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    placesServiceRef.current = new google.maps.places.PlacesService(map);
  }, []);
  
  // Map bounds changed handler
  const onBoundsChanged = useCallback(() => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    if (center) {
      setMapCenter({
        lat: center.lat(),
        lng: center.lng()
      });
    }
    setMapZoom(mapRef.current.getZoom() || 12);
  }, []);
  
  // Use browser geolocation to set initial map location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Fallback if geolocation fails - keep default
        }
      );
    }
  }, []);
  
  // Text search handler
  const handleTextSearch = useCallback(() => {
    if (!placesServiceRef.current || !searchInput.trim()) return;
    
    setTextSearchInProgress(true);
    setSearchResults([]);
    
    const request = {
      query: searchInput,
      fields: ['name', 'geometry', 'formatted_address', 'place_id', 'types', 'vicinity', 'photos'],
    };
    
    placesServiceRef.current.findPlaceFromQuery(request, (results, status) => {
      setTextSearchInProgress(false);
      
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        setSearchResults(results);
        
        // Center map on first result
        if (results[0].geometry?.location) {
          setMapCenter({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        }
        
        toast({
          title: "Places Found",
          description: `Found ${results.length} places matching "${searchInput}"`,
        });
      } else {
        toast({
          title: "No Places Found",
          description: "Try a different search term or location",
          variant: "destructive",
        });
      }
    });
  }, [searchInput, toast]);
  
  // Nearby search handler
  const handleNearbySearch = useCallback(() => {
    if (!placesServiceRef.current) return;
    
    setNearbySearchInProgress(true);
    setSearchResults([]);
    
    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(mapCenter.lat, mapCenter.lng),
      radius: searchRadius,
      type: searchInput ? searchInput as any : undefined,
      keyword: searchInput || undefined
    };
    
    placesServiceRef.current.nearbySearch(request, (results, status) => {
      setNearbySearchInProgress(false);
      
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setSearchResults(results);
        
        toast({
          title: "Places Found",
          description: `Found ${results.length} places nearby`,
        });
      } else {
        toast({
          title: "No Places Found",
          description: "Try a different search term or location",
          variant: "destructive",
        });
      }
    });
  }, [mapCenter, searchRadius, searchInput, toast]);
  
  // Add place handler
  const addPlace = useCallback((place: google.maps.places.PlaceResult | Place) => {
    if ('placeId' in place) {
      // Already in our format
      setSelectedPlaces(prev => {
        if (prev.some(p => p.placeId === place.placeId)) return prev;
        return [...prev, { ...place, selected: true }];
      });
      return;
    }
    
    if (!place.geometry?.location || !place.place_id) return;
    
    const newPlace: Place = {
      id: place.place_id,
      name: place.name || 'Unnamed Place',
      address: place.formatted_address || place.vicinity || '',
      location: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      },
      placeId: place.place_id,
      types: place.types || [],
      selected: true
    };
    
    setSelectedPlaces(prev => {
      if (prev.some(p => p.placeId === newPlace.placeId)) return prev;
      return [...prev, newPlace];
    });
    
    toast({
      title: "Place Added",
      description: `Added "${newPlace.name}" to your selection`
    });
  }, [toast]);
  
  // Remove place handler
  const removePlace = useCallback((placeId: string) => {
    setSelectedPlaces(prev => prev.filter(p => p.placeId !== placeId));
    
    toast({
      title: "Place Removed",
      description: `Removed place from your selection`
    });
  }, [toast]);
  
  // Import handler
  const handleImport = useCallback(() => {
    if (selectedPlaces.length === 0) {
      toast({
        title: "No Places Selected",
        description: "Please select at least one place to import",
        variant: "destructive"
      });
      return;
    }
    
    onImport(selectedPlaces);
  }, [selectedPlaces, onImport, toast]);
  
  // Key press handler for search input
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchMode === 'text') {
        handleTextSearch();
      } else if (searchMode === 'radius') {
        handleNearbySearch();
      }
    }
  }, [searchMode, handleTextSearch, handleNearbySearch]);
  
  // Update place notes
  const updatePlaceNotes = useCallback((placeId: string, notes: string) => {
    setSelectedPlaces(prev => 
      prev.map(place => 
        place.placeId === placeId 
          ? { ...place, notes } 
          : place
      )
    );
  }, []);
  
  // Toggle selected state
  const toggleSelected = useCallback((placeId: string) => {
    const placeInSelection = selectedPlaces.find(p => p.placeId === placeId);
    
    if (placeInSelection) {
      removePlace(placeId);
    } else {
      const place = searchResults.find(r => r.place_id === placeId);
      if (place) addPlace(place);
    }
  }, [selectedPlaces, searchResults, addPlace, removePlace]);
  
  if (loadError) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Error Loading Google Maps</h2>
          <p className="text-red-600 mb-4">{loadError.message}</p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Loading Google Maps</h2>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-11/12 max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Import Places from Google Maps</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
          <TabsList className="self-start mb-4">
            <TabsTrigger value="map" className="flex items-center gap-1">
              <Map className="h-4 w-4" /> Map Search
            </TabsTrigger>
            <TabsTrigger value="selected" className="flex items-center gap-1">
              <List className="h-4 w-4" /> Selected Places ({selectedPlaces.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="flex-grow flex flex-col overflow-hidden">
            <div className="flex flex-col gap-4 h-full">
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-grow min-w-[200px]">
                  <Label htmlFor="searchInput">Search for places</Label>
                  <div className="flex gap-2">
                    <Input
                      id="searchInput"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder={searchMode === 'text' ? "Search for places..." : "Search keyword (optional)"}
                      onKeyDown={handleKeyPress}
                      disabled={textSearchInProgress || nearbySearchInProgress}
                    />
                    <Button 
                      onClick={searchMode === 'text' ? handleTextSearch : handleNearbySearch} 
                      disabled={searchMode === 'text' ? textSearchInProgress : nearbySearchInProgress}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {searchMode === 'text' ? 
                        (textSearchInProgress ? "Searching..." : "Search") : 
                        (nearbySearchInProgress ? "Searching..." : "Find Nearby")}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="search-mode" className="text-sm whitespace-nowrap">Search mode:</Label>
                    <select 
                      id="search-mode"
                      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={searchMode}
                      onChange={(e) => setSearchMode(e.target.value as MapSearchMode)}
                    >
                      <option value="text">Text Search</option>
                      <option value="radius">Nearby Places</option>
                    </select>
                  </div>
                  
                  {searchMode === 'radius' && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="radius" className="text-sm whitespace-nowrap">Radius (m):</Label>
                      <select
                        id="radius"
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number(e.target.value))}
                      >
                        <option value="500">500m</option>
                        <option value="1000">1km</option>
                        <option value="2000">2km</option>
                        <option value="5000">5km</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow min-h-0">
                <div className="lg:col-span-2 min-h-[400px] h-full">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={mapZoom}
                    onLoad={onMapLoad}
                    onBoundsChanged={onBoundsChanged}
                    options={{
                      mapTypeControl: false,
                      fullscreenControl: false,
                      streetViewControl: false
                    }}
                  >
                    {searchMode === 'radius' && (
                      <CircleF
                        center={mapCenter}
                        radius={searchRadius}
                        options={{
                          fillColor: '#4285F4',
                          fillOpacity: 0.2,
                          strokeColor: '#4285F4',
                          strokeOpacity: 0.8,
                          strokeWeight: 2
                        }}
                      />
                    )}
                    
                    {filteredResults.map((place) => (
                      <Marker
                        key={place.id}
                        position={place.location}
                        title={place.name}
                        onClick={() => setActiveInfoWindow(place.id)}
                        icon={selectedPlaces.some(p => p.placeId === place.placeId) ? {
                          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                        } : undefined}
                      >
                        {activeInfoWindow === place.id && (
                          <InfoWindow
                            position={place.location}
                            onCloseClick={() => setActiveInfoWindow(null)}
                          >
                            <div className="max-w-xs">
                              <h3 className="font-medium text-base">{place.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{place.address}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {place.types?.slice(0, 3).map((type) => (
                                  <Badge key={type} variant="outline" className="text-xs">
                                    {type.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                              <Button
                                size="sm"
                                variant={selectedPlaces.some(p => p.placeId === place.placeId) ? "destructive" : "default"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelected(place.placeId);
                                }}
                                className="w-full mt-1"
                              >
                                {selectedPlaces.some(p => p.placeId === place.placeId) ? (
                                  <>
                                    <X className="h-3 w-3 mr-1" /> Remove
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-3 w-3 mr-1" /> Add to Trip
                                  </>
                                )}
                              </Button>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    ))}
                  </GoogleMap>
                </div>
                
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">
                      {showSelected ? "Selected Places" : "Search Results"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="show-selected" className="text-sm">
                        Show selected
                      </Label>
                      <Switch
                        id="show-selected"
                        checked={showSelected}
                        onCheckedChange={setShowSelected}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-grow border rounded-md overflow-hidden">
                    <ScrollArea className="h-full">
                      {filteredResults.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          {showSelected 
                            ? "No places selected yet. Search and add places from the map." 
                            : "No search results. Try a different search term or location."}
                        </div>
                      ) : (
                        <ul className="divide-y">
                          {filteredResults.map((place) => (
                            <li
                              key={place.id}
                              className="p-3 hover:bg-muted flex gap-3 items-start"
                            >
                              <div className="flex-shrink-0 mt-1">
                                <MapPin className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <h4 className="font-medium truncate">{place.name}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {place.address}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <Badge className="text-xs">
                                    {categorizePlace(place.types)}
                                  </Badge>
                                  {place.types?.slice(0, 2).map((type) => (
                                    <Badge key={type} variant="outline" className="text-xs">
                                      {type.replace(/_/g, ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={selectedPlaces.some(p => p.placeId === place.placeId) ? "destructive" : "default"}
                                onClick={() => toggleSelected(place.placeId)}
                                className="flex-shrink-0"
                              >
                                {selectedPlaces.some(p => p.placeId === place.placeId) ? (
                                  <>
                                    <X className="h-3 w-3 mr-1" /> Remove
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-3 w-3 mr-1" /> Add
                                  </>
                                )}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="selected" className="flex-grow overflow-hidden flex flex-col">
            <div className="overflow-auto flex-grow">
              {selectedPlaces.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">No Places Selected</h3>
                  <p>Search for places on the map tab and add them to your itinerary.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('map')}
                  >
                    <Map className="h-4 w-4 mr-2" /> Go to Map Search
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {selectedPlaces.map((place) => (
                    <Card key={place.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base line-clamp-1">{place.name}</CardTitle>
                        <CardDescription className="line-clamp-1">{place.address}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge className="text-xs">
                            {categorizePlace(place.types)}
                          </Badge>
                          {place.types?.slice(0, 2).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                        <div className="mb-3">
                          <Label htmlFor={`notes-${place.id}`} className="text-xs">Notes</Label>
                          <Textarea
                            id={`notes-${place.id}`}
                            placeholder="Add notes about this place..."
                            className="resize-none h-20"
                            value={place.notes || ''}
                            onChange={(e) => updatePlaceNotes(place.placeId, e.target.value)}
                          />
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => removePlace(place.placeId)}
                        >
                          <X className="h-3 w-3 mr-1" /> Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between border-t mt-4 pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-1" />
            <span>{selectedPlaces.length} places selected</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={selectedPlaces.length === 0}
              className="gap-1"
            >
              Import {selectedPlaces.length > 0 ? selectedPlaces.length : ''} Places
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
