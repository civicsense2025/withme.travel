// Cities API Client (scaffold)
// Typed client wrappers for city-related API endpoints
import type { Result } from '@/lib/client/result';

export async function searchCities(query: string, limit = 15): Promise<Result<any>> {
  // TODO: Implement fetch to /api/cities/search
  return Promise.resolve({ success: false, error: 'Not implemented' });
}

export async function getCityById(cityId: string): Promise<Result<any>> {
  // TODO: Implement fetch to /api/cities/[id]
  return Promise.resolve({ success: false, error: 'Not implemented' });
}

export async function listTripCities(tripId: string): Promise<Result<any>> {
  // TODO: Implement fetch to /api/trips/[tripId]/cities
  return Promise.resolve({ success: false, error: 'Not implemented' });
}

/**
 * Type guard to check if an object is a City
 */
export function isCity(obj: any): obj is City {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
} 