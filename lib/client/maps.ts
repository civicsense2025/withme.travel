// Maps API Client (scaffold)
// Typed client wrappers for map/geocoding-related API endpoints
import type { Result } from '@/lib/client/result';

export async function geocode(query: string): Promise<Result<any>> {
  // TODO: Implement fetch to /api/mapbox/search or similar
  return Promise.resolve({ success: false, error: 'Not implemented' });
}

export async function reverseGeocode(lat: number, lng: number): Promise<Result<any>> {
  // TODO: Implement fetch to /api/mapbox/reverse-geocode or similar
  return Promise.resolve({ success: false, error: 'Not implemented' });
}

export async function getDirections(origin: [number, number], destination: [number, number]): Promise<Result<any>> {
  // TODO: Implement fetch to /api/maps/directions or similar
  return Promise.resolve({ success: false, error: 'Not implemented' });
} 