import React, { useState } from 'react';

interface MapboxDestinationInputProps {
  onSelect: (place: any) => void;
  placeholder?: string;
  className?: string;
}

export const MapboxDestinationInput: React.FC<MapboxDestinationInputProps> = ({ onSelect, placeholder = 'Add a destination...', className }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&types=place,locality,region,country`
      );
      const data = await res.json();
      setResults(data.features || []);
      setShowDropdown(true);
    } catch (err) {
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(place: any) {
    setQuery(place.place_name);
    setShowDropdown(false);
    setResults([]);
    onSelect(place);
  }

  return (
    <div className={`relative ${className || ''}`}>
      <input
        value={query}
        onChange={handleInput}
        placeholder={placeholder}
        className="input w-full border rounded px-3 py-2"
        onFocus={() => query.length > 1 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        autoComplete="off"
      />
      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 max-h-60 overflow-auto">
          {results.map((place) => (
            <li
              key={place.id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              onMouseDown={() => handleSelect(place)}
            >
              {place.place_name}
            </li>
          ))}
        </ul>
      )}
      {loading && <div className="absolute right-2 top-2 text-xs text-gray-400">Loading...</div>}
    </div>
  );
}; 