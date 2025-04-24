import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { 
  DB_TABLES, 
  DB_FIELDS 
} from "@/utils/constants"

// Realistic fallback data based on schema and available images
const mockDestinations = [
  {
    id: "d4b1f0a0-9f8c-4e1a-8d3b-1a2b3c4d5e6f", // Generated UUID
    city: "Paris",
    country: "France",
    continent: "Europe",
    emoji: "🇫🇷",
    image_url: "/destinations/paris-eiffel-tower.jpg", // Assuming this image exists or use one from the list
    popularity: 90,
    travelers_count: 4200,
    avg_days: 4,
    description: "The city of lights, known for its art, fashion, and culture.",
    country_code: "FR",
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: "Europe/Paris",
    languages: ["French"],
    currency: "EUR",
    safety_rating: 4,
    walkability: 5,
    family_friendly: 4,
    nightlife_rating: 4,
    beach_quality: null,
    shopping_rating: 5,
    winter_rating: 3,
    wifi_connectivity: 4,
    public_transportation: 5,
    eco_friendly_options: 3,
    outdoor_activities: 3,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 3,
    state_province: null, // Added missing optional field
  },
  {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef", // Generated UUID
    city: "Tokyo",
    country: "Japan",
    continent: "Asia",
    emoji: "🇯🇵",
    image_url: "/destinations/kyoto-bamboo-forest.jpg", // Using Kyoto image for Tokyo example
    popularity: 92,
    travelers_count: 3200,
    avg_days: 7,
    description: "A vibrant metropolis blending ultramodern and traditional.",
    country_code: "JP",
    latitude: 35.6895,
    longitude: 139.6917,
    timezone: "Asia/Tokyo",
    languages: ["Japanese"],
    currency: "JPY",
    safety_rating: 5,
    walkability: 4,
    family_friendly: 4,
    nightlife_rating: 5,
    beach_quality: null,
    shopping_rating: 5,
    winter_rating: 3,
    wifi_connectivity: 5,
    public_transportation: 5,
    eco_friendly_options: 4,
    outdoor_activities: 3,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 4,
    state_province: null,
  },
  {
    id: "f0e9d8c7-b6a5-4321-fedc-ba9876543210", // Generated UUID
    city: "Rome",
    country: "Italy",
    continent: "Europe",
    emoji: "🇮🇹",
    image_url: "/destinations/rome-colosseum.jpg",
    popularity: 87,
    travelers_count: 3100,
    avg_days: 4,
    description: "Ancient history meets stunning art and vibrant street life.",
    country_code: "IT",
    latitude: 41.9028,
    longitude: 12.4964,
    timezone: "Europe/Rome",
    languages: ["Italian"],
    currency: "EUR",
    safety_rating: 4,
    walkability: 5,
    family_friendly: 4,
    nightlife_rating: 3,
    beach_quality: null,
    shopping_rating: 4,
    winter_rating: 2,
    wifi_connectivity: 4,
    public_transportation: 4,
    eco_friendly_options: 3,
    outdoor_activities: 3,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 3,
    state_province: null,
  },
  {
    id: "12345678-90ab-cdef-1234-567890abcdef", // Generated UUID
    city: "New York",
    country: "USA",
    continent: "North America",
    emoji: "🇺🇸",
    image_url: "/destinations/new-york-skyline.jpg", // Assuming this exists
    popularity: 88,
    travelers_count: 3800,
    avg_days: 6,
    description: "The city that never sleeps, famous for landmarks and diversity.",
    country_code: "US",
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: "America/New_York",
    languages: ["English"],
    currency: "USD",
    safety_rating: 3,
    walkability: 5,
    family_friendly: 4,
    nightlife_rating: 5,
    beach_quality: 2, // Coney Island etc.
    shopping_rating: 5,
    winter_rating: 3,
    wifi_connectivity: 4,
    public_transportation: 5,
    eco_friendly_options: 3,
    outdoor_activities: 3,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 4,
    state_province: "NY", // Added state
  },
   {
    id: "abcdef12-3456-7890-abcd-ef1234567890", // Generated UUID
    city: "London",
    country: "UK",
    continent: "Europe",
    emoji: "🇬🇧",
    image_url: "/destinations/london-big-ben.jpg",
    popularity: 89,
    travelers_count: 3500,
    avg_days: 5,
    description: "A historic global hub with iconic landmarks and diverse culture.",
    country_code: "GB",
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: "Europe/London",
    languages: ["English"],
    currency: "GBP",
    safety_rating: 4,
    walkability: 5,
    family_friendly: 4,
    nightlife_rating: 4,
    beach_quality: null,
    shopping_rating: 5,
    winter_rating: 2,
    wifi_connectivity: 4,
    public_transportation: 5,
    eco_friendly_options: 3,
    outdoor_activities: 3,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 4,
    state_province: null,
  },
  {
    id: "fedcba98-7654-3210-fedc-ba9876543210", // Generated UUID
    city: "Barcelona",
    country: "Spain",
    continent: "Europe",
    emoji: "🇪🇸",
    image_url: "/destinations/barcelona-park-guell.jpg", // Assuming this exists
    popularity: 95,
    travelers_count: 4800,
    avg_days: 5,
    description: "Known for unique architecture, vibrant street life, and beaches.",
    country_code: "ES",
    latitude: 41.3851,
    longitude: 2.1734,
    timezone: "Europe/Madrid",
    languages: ["Spanish", "Catalan"],
    currency: "EUR",
    safety_rating: 4,
    walkability: 5,
    family_friendly: 4,
    nightlife_rating: 5,
    beach_quality: 4,
    shopping_rating: 4,
    winter_rating: 3,
    wifi_connectivity: 4,
    public_transportation: 5,
    eco_friendly_options: 3,
    outdoor_activities: 4,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 4,
    state_province: "Catalonia",
  },
  {
    id: "aabbccdd-eeff-0011-2233-445566778899", // Generated UUID
    city: "Sydney",
    country: "Australia",
    continent: "Oceania",
    image_url: "/destinations/sydney-opera-house.jpg",
    popularity: 85,
    travelers_count: 2600,
    avg_days: 9,
    description: "Iconic harbour city with stunning beaches and vibrant culture.",
    country_code: "AU",
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: "Australia/Sydney",
    languages: ["English"],
    currency: "AUD",
    safety_rating: 5,
    walkability: 4,
    family_friendly: 5,
    nightlife_rating: 4,
    beach_quality: 5,
    shopping_rating: 4,
    winter_rating: 4, // Milder winters
    wifi_connectivity: 4,
    public_transportation: 4,
    eco_friendly_options: 4,
    outdoor_activities: 5,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 4,
    state_province: "New South Wales",
  },
  {
    id: "ccddeeff-0011-2233-4455-66778899aabb", // Generated UUID
    city: "Amsterdam",
    country: "Netherlands",
    continent: "Europe",
    image_url: "/destinations/amsterdam-canals.jpg",
    popularity: 84,
    travelers_count: 2400,
    avg_days: 4,
    description: "Famous for its canals, historic houses, and lively atmosphere.",
    country_code: "NL",
    latitude: 52.3676,
    longitude: 4.9041,
    timezone: "Europe/Amsterdam",
    languages: ["Dutch"],
    currency: "EUR",
    safety_rating: 4,
    walkability: 5,
    family_friendly: 4,
    nightlife_rating: 4,
    beach_quality: null,
    shopping_rating: 4,
    winter_rating: 2,
    wifi_connectivity: 5,
    public_transportation: 5,
    eco_friendly_options: 4,
    outdoor_activities: 3,
    instagram_worthy_spots: 5,
    off_peak_appeal: 3,
    digital_nomad_friendly: 4,
    state_province: "North Holland",
  },
  {
    id: "eeff0011-2233-4455-6677-8899aabbccdd", // Generated UUID
    city: "Bangkok",
    country: "Thailand",
    continent: "Asia",
    image_url: "/destinations/bangkok-grand-palace.jpg",
    popularity: 86,
    travelers_count: 2800,
    avg_days: 8,
    description: "A bustling city known for ornate shrines and vibrant street life.",
    country_code: "TH",
    latitude: 13.7563,
    longitude: 100.5018,
    timezone: "Asia/Bangkok",
    languages: ["Thai"],
    currency: "THB",
    safety_rating: 3,
    walkability: 3,
    family_friendly: 3,
    nightlife_rating: 5,
    beach_quality: null,
    shopping_rating: 5,
    winter_rating: 5, // Dry season is popular
    wifi_connectivity: 4,
    public_transportation: 4,
    eco_friendly_options: 3,
    outdoor_activities: 2,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 4,
    state_province: null,
  },
  {
    id: "00112233-4455-6677-8899-aabbccddeeff", // Generated UUID
    city: "Rio de Janeiro",
    country: "Brazil",
    continent: "South America",
    image_url: "/destinations/rio-christ-redeemer.jpg",
    popularity: 83,
    travelers_count: 2200,
    avg_days: 6,
    description: "Famous for Copacabana beach, Christ the Redeemer, and Carnival.",
    country_code: "BR",
    latitude: -22.9068,
    longitude: -43.1729,
    timezone: "America/Sao_Paulo",
    languages: ["Portuguese"],
    currency: "BRL",
    safety_rating: 2,
    walkability: 3,
    family_friendly: 3,
    nightlife_rating: 5,
    beach_quality: 5,
    shopping_rating: 3,
    winter_rating: 4, // Winter is dry season
    wifi_connectivity: 3,
    public_transportation: 3,
    eco_friendly_options: 3,
    outdoor_activities: 5,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 3,
    state_province: "Rio de Janeiro",
  },
  {
    id: "22334455-6677-8899-aabb-ccddeeff0011", // Generated UUID
    city: "Cape Town",
    country: "South Africa",
    continent: "Africa",
    image_url: "/destinations/cape-town-table-mountain.jpg", // Assuming this exists
    popularity: 82,
    travelers_count: 1900,
    avg_days: 7,
    description: "Stunning port city with Table Mountain and diverse wildlife.",
    country_code: "ZA",
    latitude: -33.9249,
    longitude: 18.4241,
    timezone: "Africa/Johannesburg",
    languages: ["Afrikaans", "English", "Xhosa"],
    currency: "ZAR",
    safety_rating: 2,
    walkability: 3,
    family_friendly: 4,
    nightlife_rating: 4,
    beach_quality: 5,
    shopping_rating: 4,
    winter_rating: 3, // Mediterranean climate
    wifi_connectivity: 3,
    public_transportation: 3,
    eco_friendly_options: 4,
    outdoor_activities: 5,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 3,
    state_province: "Western Cape",
  },
  {
    id: "44556677-8899-aabb-ccdd-eeff00112233", // Generated UUID
    city: "Dubai",
    country: "UAE",
    continent: "Asia",
    image_url: "/destinations/dubai-skyline.jpg",
    popularity: 81,
    travelers_count: 3000,
    avg_days: 5,
    description: "A futuristic city known for luxury shopping and ultramodern architecture.",
    country_code: "AE",
    latitude: 25.276987,
    longitude: 55.296249,
    timezone: "Asia/Dubai",
    languages: ["Arabic", "English"],
    currency: "AED",
    safety_rating: 5,
    walkability: 2,
    family_friendly: 5,
    nightlife_rating: 4,
    beach_quality: 4,
    shopping_rating: 5,
    winter_rating: 5, // Peak season
    wifi_connectivity: 5,
    public_transportation: 4,
    eco_friendly_options: 3,
    outdoor_activities: 3,
    instagram_worthy_spots: 5,
    off_peak_appeal: 3,
    digital_nomad_friendly: 4,
    state_province: "Dubai",
  },
  {
    id: "66778899-aabb-ccdd-eeff-001122334455", // Generated UUID
    city: "Vancouver",
    country: "Canada",
    continent: "North America",
    image_url: "/destinations/vancouver-skyline.jpg", // Assuming this exists
    popularity: 80,
    travelers_count: 2100,
    avg_days: 6,
    description: "A bustling seaport city surrounded by mountains, known for its art scene.",
    country_code: "CA",
    latitude: 49.2827,
    longitude: -123.1207,
    timezone: "America/Vancouver",
    languages: ["English", "French"],
    currency: "CAD",
    safety_rating: 4,
    walkability: 4,
    family_friendly: 5,
    nightlife_rating: 4,
    beach_quality: 3,
    shopping_rating: 4,
    winter_rating: 3, // Skiing nearby
    wifi_connectivity: 5,
    public_transportation: 4,
    eco_friendly_options: 4,
    outdoor_activities: 5,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 4,
    state_province: "British Columbia",
  },
   {
    id: "8899aabb-ccdd-eeff-0011-223344556677", // Generated UUID
    city: "San Francisco",
    country: "USA",
    continent: "North America",
    emoji: "🇺🇸",
    image_url: "/destinations/san-francisco-golden-gate.jpg",
    popularity: 85, // Adjust as needed
    travelers_count: 3300, // Adjust as needed
    avg_days: 5,
    description: "Iconic city known for the Golden Gate Bridge, Alcatraz, and tech.",
    country_code: "US",
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: "America/Los_Angeles",
    languages: ["English"],
    currency: "USD",
    safety_rating: 3,
    walkability: 5,
    family_friendly: 4,
    nightlife_rating: 4,
    beach_quality: 2,
    shopping_rating: 4,
    winter_rating: 3,
    wifi_connectivity: 5,
    public_transportation: 4,
    eco_friendly_options: 4,
    outdoor_activities: 4,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 5,
    state_province: "CA",
  },
  {
    id: "aabbccdd-eeff-1122-3344-5566778899aa", // Generated UUID
    city: "Los Angeles",
    country: "USA",
    continent: "North America",
    emoji: "🇺🇸",
    image_url: "/destinations/los-angeles-united-states.jpg",
    popularity: 86, // Adjust as needed
    travelers_count: 3600, // Adjust as needed
    avg_days: 7,
    description: "Sprawling city famous for Hollywood, beaches, and entertainment.",
    country_code: "US",
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: "America/Los_Angeles",
    languages: ["English", "Spanish"],
    currency: "USD",
    safety_rating: 3,
    walkability: 2,
    family_friendly: 4,
    nightlife_rating: 5,
    beach_quality: 4,
    shopping_rating: 5,
    winter_rating: 4,
    wifi_connectivity: 4,
    public_transportation: 3,
    eco_friendly_options: 3,
    outdoor_activities: 4,
    instagram_worthy_spots: 5,
    off_peak_appeal: 4,
    digital_nomad_friendly: 4,
    state_province: "CA",
  },
];

// Create a simple memory cache for this route
let destinationsCache: { data: any, timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trending = searchParams.get("trending") === "true"
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    
    const supabase = createClient()
    
    // Start with the base query
    let query = supabase
      .from(DB_TABLES.DESTINATIONS)
      .select("*")
    
    // Always sort by city name for consistency unless trending is requested
    if (trending) {
      query = query.order(DB_FIELDS.DESTINATIONS.POPULARITY, { ascending: false })
    } else {
      query = query.order(DB_FIELDS.DESTINATIONS.CITY, { ascending: true })
    }
    
    // Apply limit if requested
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching destinations:', error)
      // Only fall back to mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockData = limit ? mockDestinations.slice(0, limit) : mockDestinations
        return NextResponse.json({ destinations: mockData })
      }
      throw error
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ 
        destinations: [], 
        message: "No destinations found" 
      })
    }
    
    // Process data to add traveler counts for trending destinations
    const processedData = data.map(destination => {
      if (trending) {
        // Add realistic traveler counts based on city popularity
        const baseCount = Math.floor(destination.popularity * 50)
        const randomVariation = Math.floor(Math.random() * 500)
        destination.travelers_count = baseCount + randomVariation
        
        // Add average days based on continent and distance
        const continentAvgDays: Record<string, number> = {
          'Europe': 5,
          'Asia': 7,
          'North America': 6,
          'South America': 8,
          'Africa': 8,
          'Oceania': 9
        }
        destination.avg_days = continentAvgDays[destination.continent as string] || 5
      }
      
      // Ensure image_url is properly formatted
      if (destination.image_url && !destination.image_url.startsWith('http') && !destination.image_url.startsWith('/')) {
        destination.image_url = `/${destination.image_url}`
      }
      
      return destination
    })
    
    return NextResponse.json({ destinations: processedData })
    
  } catch (error: any) {
    console.error('Error in destinations API:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
