'use client';

import { useState, useRef, useCallback } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useMapContext } from './map-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

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
};

type GoogleMapsImportProps = {
  onImport: (places: Place[]) => void;
  onClose: () => void;
};

export default function GoogleMapsImport({ onImport, onClose }: GoogleMapsImportProps) {
  const { isLoaded, loadError } = useMapContext();
  const [searchInput, setSearchInput] = useState('');
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  
  const mapRef = useRef<google.maps.Map>();
  const placesServiceRef = useRef<google.maps.places.PlacesService>();
  
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    placesServiceRef.current = new google.maps.places.PlacesService(map);
  }, []);
  
  const handleSearch = () => {
    if (!placesServiceRef.current) return;
    
    const request = {
      query: searchInput,
      fields: ['name', 'geometry', 'formatted_address', 'place_id', 'types']
    };
    
    placesServiceRef.current.findPlaceFromQuery(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setSearchResults(results);
        
        if (results.length > 0 && results[0].geometry?.location) {
          setMapCenter({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          });
        }
      }
    });
  };
  
  const addPlace = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location || !place.place_id) return;
    
    const newPlace: Place = {
      id: place.place_id,
      name: place.name || 'Unnamed Place',
      address: place.formatted_address || '',
      location: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      },
      placeId: place.place_id,
      types: place.types || []
    };
    
    setSelectedPlaces(prev => {
      if (prev.some(p => p.id === newPlace.id)) return prev;
      return [...prev, newPlace];
    });
  };
  
  const removePlace = (placeId: string) => {
    setSelectedPlaces(prev => prev.filter(p => p.id !== placeId));
  };
  
  const handleImport = () => {
    onImport(selectedPlaces);
  };
  
  if (loadError) return <div>Error loading Google Maps: {loadError.message}</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-11/12 max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Import Places from Google Maps</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>
        
        <div className="flex gap-2 mb-4">
          <Input 
            value={searchInput} 
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search for places..."
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          <div className="md:col-span-2 h-[400px]">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={14}
              onLoad={onMapLoad}
            >
              {selectedPlaces.map(place => (
                <Marker
                  key={place.id}
                  position={place.location}
                  title={place.name}
                />
              ))}
            </GoogleMap>
          </div>
          
          <div className="flex flex-col h-[400px] overflow-hidden">
            <div className="font-medium mb-2">Search Results</div>
            <div className="overflow-y-auto flex-1 border rounded p-2">
              {searchResults.map(place => (
                <div 
                  key={place.place_id} 
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => addPlace(place)}
                >
                  <div className="font-medium">{place.name}</div>
                  <div className="text-sm text-gray-600">{place.formatted_address}</div>
                </div>
              ))}
              {searchResults.length === 0 && (
                <div className="text-gray-500 text-sm p-2">
                  Search for places to add to your itinerary
                </div>
              )}
            </div>
            
            <div className="font-medium my-2">Selected Places ({selectedPlaces.length})</div>
            <div className="overflow-y-auto flex-1 border rounded p-2">
              {selectedPlaces.map(place => (
                <div key={place.id} className="p-2 flex justify-between items-start border-b last:border-0">
                  <div>
                    <div className="font-medium">{place.name}</div>
                    <div className="text-sm text-gray-600">{place.address}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => removePlace(place.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {selectedPlaces.length === 0 && (
                <div className="text-gray-500 text-sm p-2">
                  No places selected yet
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleImport}
            disabled={selectedPlaces.length === 0}
          >
            Import {selectedPlaces.length} Places
          </Button>
        </div>
      </div>
    </div>
  );
} 