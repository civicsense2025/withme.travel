'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface City {
  id: string;
  name: string;
  country: string;
  admin_name?: string;
  is_destination?: boolean;
}

interface CityChipInputProps {
  selectedCities: City[];
  onAdd?: (city: City) => void;
  onRemove?: (cityId: string) => void;
  disabled?: boolean;
  label?: string;
}

export function CityChipInput({
  selectedCities = [],
  onAdd,
  onRemove,
  disabled = false,
  label = 'Cities to Visit',
}: CityChipInputProps) {
  return (
    <div className="space-y-2">
      {label && <Label className="block">{label}</Label>}
      <div className="border rounded-md p-2 bg-background min-h-[80px]">
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedCities.map((city) => (
            <Badge
              key={city.id}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 h-auto text-sm"
            >
              {city.is_destination && <span className="text-yellow-500">★</span>}
              {city.name}, {city.country}
              {!disabled && (
                <button
                  type="button"
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                  onClick={() => onRemove?.(city.id)}
                  aria-label={`Remove ${city.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {selectedCities.length === 0 && (
            <div className="text-muted-foreground text-sm p-1">
              No cities selected yet. Add cities from the popular destinations or use the search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
