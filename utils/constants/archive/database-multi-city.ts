/**
 * Database Constants for Multi-City Feature
 *
 * This file contains constants for the multi-city database tables and fields.
 * These will be merged with the main database constants.
 */

/**
 * Table Names
 */
export const TABLES = {
  CITIES: 'cities',
  TRIP_CITIES: 'trip_cities',
};

/**
 * Field Names
 * Structured by table for easy access
 */
export const FIELDS = {
  CITIES: {
    ID: 'id',
    NAME: 'name',
    COUNTRY: 'country',
    ADMIN_NAME: 'admin_name',
    CONTINENT: 'continent',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    MAPBOX_ID: 'mapbox_id',
    POPULATION: 'population',
    TIMEZONE: 'timezone',
    COUNTRY_CODE: 'country_code',
    METADATA: 'metadata',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },

  TRIP_CITIES: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    CITY_ID: 'city_id',
    POSITION: 'position',
    ARRIVAL_DATE: 'arrival_date',
    DEPARTURE_DATE: 'departure_date',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },

  // Extensions to existing tables
  DESTINATIONS: {
    CITY_ID: 'city_id',
    IS_CITY_DEPRECATED: 'is_city_deprecated',
  },

  ITINERARY_SECTIONS: {
    TRIP_CITY_ID: 'trip_city_id',
  },
};

/**
 * Query snippets for multi-city features
 */
export const QUERY_SNIPPETS = {
  // Get all cities for a trip with basic city data
  GET_TRIP_CITIES: `
    id,
    trip_id,
    city_id,
    position,
    arrival_date,
    departure_date,
    city:cities(
      id,
      name,
      country,
      admin_name,
      continent,
      latitude,
      longitude
    )
  `,

  // Get all sections for a trip city
  GET_TRIP_CITY_SECTIONS: `
    id,
    trip_id,
    trip_city_id,
    day_number,
    date,
    title,
    position,
    items:itinerary_items(
      id,
      title,
      description,
      start_time,
      end_time,
      position,
      category,
      status
    )
  `,

  // Get a destination with its canonical city
  GET_DESTINATION_WITH_CITY: `
    id,
    name,
    city,
    country,
    city_id,
    is_city_deprecated,
    canonical_city:cities(
      id,
      name,
      country,
      admin_name
    )
  `,
};

/**
 * Table Relationships
 * Used for Supabase queries
 */
export const RELATIONSHIPS = {
  TRIP_CITIES: {
    CITY: {
      foreignTable: TABLES.CITIES,
      queryName: 'city',
    },
    TRIP: {
      foreignTable: 'trips',
      queryName: 'trip',
    },
    SECTIONS: {
      foreignTable: 'itinerary_sections',
      queryName: 'sections',
    },
  },

  ITINERARY_SECTIONS: {
    TRIP_CITY: {
      foreignTable: TABLES.TRIP_CITIES,
      queryName: 'trip_city',
    },
  },

  DESTINATIONS: {
    CITY: {
      foreignTable: TABLES.CITIES,
      queryName: 'city',
    },
  },
};
