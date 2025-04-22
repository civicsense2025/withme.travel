import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Fallback mock data in case of database issues
const mockDestinations = [
  {
    id: "1",
    city: "Barcelona",
    country: "Spain",
    continent: "Europe",
    image_url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop",
    popularity: 95,
    travelers_count: 4800,
    avg_days: 5
  },
  {
    id: "2",
    city: "Tokyo",
    country: "Japan",
    continent: "Asia",
    image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop",
    popularity: 92,
    travelers_count: 3200,
    avg_days: 7
  },
  {
    id: "3",
    city: "Paris",
    country: "France",
    continent: "Europe",
    image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
    popularity: 90,
    travelers_count: 4200,
    avg_days: 4
  },
  {
    id: "4",
    city: "London",
    country: "UK",
    continent: "Europe",
    image_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
    popularity: 89,
    travelers_count: 3500,
    avg_days: 5
  },
  {
    id: "5",
    city: "New York",
    country: "USA",
    continent: "North America",
    image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop",
    popularity: 88,
    travelers_count: 3800,
    avg_days: 6
  },
  {
    id: "6",
    city: "Rome",
    country: "Italy",
    continent: "Europe",
    image_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
    popularity: 87,
    travelers_count: 3100,
    avg_days: 4
  }
];

// Create a simple memory cache for this route
let destinationsCache: { data: any, timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trending = searchParams.get("trending") === "true"
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    
    // Check if we have valid cached data
    const now = Date.now();
    if (destinationsCache && (now - destinationsCache.timestamp < CACHE_DURATION)) {
      console.log("Using cached destinations data");
      const cachedData = destinationsCache.data;
      
      // Apply limit if requested
      const limitedData = limit ? cachedData.slice(0, limit) : cachedData;
      return NextResponse.json({ destinations: limitedData });
    }

    try {
      // Try to fetch from Supabase
      const cookieStore = cookies();
      const supabase = createServerClient(cookieStore);
      
      let query = supabase.from("destinations").select("*");
      
      if (trending) {
        query = query.order("popularity", { ascending: false });
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      // Process data to add traveler counts for trending destinations if needed
      if (trending && data) {
        const travelersMap: Record<string, number> = {
          Barcelona: 4800,
          Tokyo: 3200,
          California: 2900,
          Paris: 4200,
          "New York": 3800,
          London: 3500,
          Bangkok: 2800,
          Rome: 3100,
          Sydney: 2600,
          Amsterdam: 2400,
        };

        const avgDaysMap: Record<string, number> = {
          Barcelona: 5,
          Tokyo: 7,
          California: 10,
          Paris: 4,
          "New York": 6,
          London: 5,
          Bangkok: 8,
          Rome: 4,
          Sydney: 9,
          Amsterdam: 4,
        };

        data.forEach((destination) => {
          destination.travelers_count = travelersMap[destination.city] || Math.floor(Math.random() * 3000) + 1000;
          destination.avg_days = avgDaysMap[destination.city] || Math.floor(Math.random() * 7) + 3;
        });
      }
      
      // Cache the results
      destinationsCache = {
        data: data,
        timestamp: now
      };
      
      return NextResponse.json({ destinations: data });
    } catch (error) {
      console.error("Error fetching from Supabase, using mock data:", error);
      
      // Fallback to mock data
      destinationsCache = {
        data: mockDestinations,
        timestamp: now
      };
      
      const limitedMockData = limit ? mockDestinations.slice(0, limit) : mockDestinations;
      return NextResponse.json({ destinations: limitedMockData });
    }
  } catch (error: any) {
    console.error("Unexpected error in destinations fetch:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
