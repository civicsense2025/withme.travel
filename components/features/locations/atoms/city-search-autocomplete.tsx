import { useState, useEffect } from 'react';

interface CitySearchAutocompleteProps {
  onSelect: (city: any) => void;
  value: string;
  onChange: (v: string) => void;
}

export function CitySearchAutocomplete({ onSelect, value, onChange }: CitySearchAutocompleteProps) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!value) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    setError(null);
    const timeout = setTimeout(() => {
      fetch(`/api/cities/search?q=${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.cities || []);
          setShowDropdown(true);
        })
        .catch(() => setError('Failed to search cities'))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="relative">
      <input
        className="w-full border p-2 rounded"
        placeholder="Search any city in the world…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />
      {loading && <div className="absolute left-0 right-0 bg-white p-2 text-sm">Loading…</div>}
      {error && (
        <div className="absolute left-0 right-0 bg-white p-2 text-red-500 text-sm">{error}</div>
      )}
      {showDropdown && results.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded shadow z-10 max-h-60 overflow-y-auto">
          {results.map((city) => (
            <li
              key={city.id}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onMouseDown={() => {
                onSelect(city);
                setShowDropdown(false);
              }}
            >
              <span className="flex-1">
                {city.name}, {city.country}
                {city.admin_name ? `, ${city.admin_name}` : ''}
              </span>
              {city.is_destination && (
                <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  Featured
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
