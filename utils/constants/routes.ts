/**
 * Route-related constants
 * 
 * This file contains all route-related constants including page routes
 * and path construction helpers.
 */

export const PAGE_ROUTES = {
  HOME: '/',
  TRIPS: '/trips',
  TRIP_DETAILS: (id: string) => `/trips/${id}`,
  CREATE_TRIP: '/trips/create',
  EDIT_TRIP: (id: string) => `/trips/${id}/edit`,
  TRIP_ADD_ITEM: (id: string) => `/trips/${id}/add-item`,
  TRIP_INVITE: (id: string) => `/invite/${id}`,
  PROFILE: (username: string) => `/profile/${username}`,
  SETTINGS: '/settings',
  DESTINATIONS: '/destinations',
  DESTINATION_DETAILS: (id: string) => `/destinations/${id}`,
  LIBRARY: '/library',
  LIBRARY_TEMPLATE: (id: string) => `/library/${id}`,
  LOGIN: '/login',
  SIGNUP: '/signup',
  PUBLIC_TRIP: (slug: string) => `/trips/public/${slug}`,
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    TRIPS: '/admin/trips',
    TEMPLATES: '/admin/templates',
    DESTINATIONS: '/admin/destinations',
  }
} as const;

// Route helpers for constructing paths with params
export const ROUTE_HELPERS = {
  addQueryParams: (base: string, params: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    const queryString = searchParams.toString();
    return queryString ? `${base}?${queryString}` : base;
  },
  
  // Helper to validate route params
  validateRouteParams: (params: Record<string, string>) => {
    return Object.entries(params).every(([_, value]) => 
      typeof value === 'string' && value.length > 0
    );
  }
} as const;

