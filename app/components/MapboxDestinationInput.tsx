import React, { useState } from 'react';

interface MapboxDestinationInputProps {
  onSelect: (place: any) => void;
  placeholder?: string;
  className?: string;
}

export const MapboxDestinationInput: React.FC<MapboxDestinationInputProps> = ({
  onSelect,
  placeholder = 'Add a destination...',
  className,
}) => {
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
    <div className={`relative w-full ${className || ''}`}>
      <input
        value={query}
        onChange={handleInput}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
        onFocus={() => query.length > 1 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-2 max-h-72 overflow-auto transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          {results.map((place) => (
            <li
              key={place.id}
              className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl flex items-center gap-2"
              onMouseDown={() => handleSelect(place)}
            >
              <span className="text-gray-400 text-sm">📍</span>
              <span>{place.place_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
