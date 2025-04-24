'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast'; // Assuming you use Shadcn toasts
export function PlaceAutocomplete({ onPlaceSelect, placeholder = "Search for a location", initialValue = "", className }) {
    const placesLibrary = useMapsLibrary('places');
    const inputRef = useRef(null);
    const [autoComplete, setAutoComplete] = useState(null);
    const [inputValue, setInputValue] = useState(initialValue);
    const { toast } = useToast(); // Get toast function
    // Initialize the Autocomplete service
    useEffect(() => {
        if (!placesLibrary || !inputRef.current) {
            return;
        }
        try {
            const options = {
                fields: ["address_components", "geometry", "icon", "name", "formatted_address", "place_id", "types"],
                // Optionally add componentRestrictions, bounds, types etc.
                // types: ['address'], // Example: restrict to addresses
            };
            const newAutoComplete = new placesLibrary.Autocomplete(inputRef.current, options);
            setAutoComplete(newAutoComplete);
            // Add listener for place changes
            newAutoComplete.addListener('place_changed', () => {
                handlePlaceChanged(newAutoComplete);
            });
        }
        catch (error) {
            console.error("Error initializing Google Places Autocomplete:", error);
            // Handle initialization error (e.g., API key issue, network error)
        }
        // Cleanup listener on component unmount
        return () => {
            if (autoComplete) {
                google.maps.event.clearInstanceListeners(autoComplete);
            }
        };
        // Re-run effect only if placesLibrary changes (should only happen once)
        // Intentionally excluding autoComplete from dependencies to avoid re-binding listener
    }, [placesLibrary]);
    // Handler for when a place is selected from the dropdown
    const handlePlaceChanged = useCallback((acInstance) => {
        var _a;
        const googlePlace = acInstance.getPlace();
        if ((_a = googlePlace === null || googlePlace === void 0 ? void 0 : googlePlace.geometry) === null || _a === void 0 ? void 0 : _a.location) {
            console.log("Google Place Selected:", googlePlace);
            // Update the input field visually
            setInputValue(googlePlace.formatted_address || googlePlace.name || "");
            // Construct a basic Place object (adapt based on your Place type)
            const placeDetails = {
                id: googlePlace.place_id || '', // Use place_id as our internal ID? Or generate one?
                name: googlePlace.name || 'Unknown Place',
                address: googlePlace.formatted_address || '',
                latitude: googlePlace.geometry.location.lat(),
                longitude: googlePlace.geometry.location.lng(),
                // Map other relevant fields if needed (types, etc.)
                google_place_id: googlePlace.place_id, // Store original ID if needed
                // Initialize other fields based on your Place type definition
                description: '',
                rating: 0,
                rating_count: 0,
                price_level: 0,
                tags: googlePlace.types || [],
                is_verified: false, // Default? Or derive?
                destination_id: '', // Needs context if required
            };
            onPlaceSelect(placeDetails, googlePlace);
        }
        else {
            console.warn("Selected place details incomplete or invalid:", googlePlace);
            onPlaceSelect(null, googlePlace); // Pass null if invalid
        }
    }, [onPlaceSelect]);
    // Handle manual input changes
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
        // Optionally clear selection if user types manually after selecting?
        // onPlaceSelect(null); 
    };
    // Sync input value with initialValue prop changes
    useEffect(() => {
        setInputValue(initialValue);
    }, [initialValue]);
    return (<div className={`relative ${className}`}>
      <Input ref={inputRef} value={inputValue} onChange={handleInputChange} placeholder={placeholder} type="text"/>
      {/* Add any necessary loading spinner or error handling */}
    </div>);
}
