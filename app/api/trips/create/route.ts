import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { API_ROUTES } from "@/utils/constants";

export async function POST(req: Request) {
  try {
    // Initialize Supabase client
    const supabase = createClient();
    
    // Authenticate request using Supabase getUser for better security
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: authError?.message || "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { tripData, userId } = await req.json();
    
    // Validate that the user ID from the request matches the authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - user ID mismatch" },
        { status: 403 }
      );
    }
    
    // Start a transaction to handle both trip creation and member assignment
    const { data, error } = await supabase.rpc('create_trip_with_owner', {
      trip_data: tripData,
      owner_id: userId
    });
    
    if (error) {
      console.error("Error in create_trip_with_owner RPC:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // If the RPC fails but without a proper error, provide a fallback
    if (!data || !data.trip_id) {
      console.error("No data returned from create_trip_with_owner RPC");
      return NextResponse.json(
        { error: "Failed to create trip" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      tripId: data.trip_id,
      redirectUrl: `${API_ROUTES.TRIP_DETAILS(data.trip_id)}` 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in trip creation API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 