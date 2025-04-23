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
      console.error("Authentication error in trip creation:", authError);
      return NextResponse.json(
        { error: authError?.message || "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { tripData, userId } = await req.json();
    
    // Validate that the user ID from the request matches the authenticated user
    if (userId !== user.id) {
      console.warn(`Unauthorized attempt to create trip. User ID: ${user.id}, Provided ID: ${userId}`);
      return NextResponse.json(
        { error: "Unauthorized - user ID mismatch" },
        { status: 403 }
      );
    }
    
    // Log the data being sent to the RPC function
    console.log(`Calling create_trip_with_owner for user ${userId} with data:`, JSON.stringify(tripData, null, 2));
    
    // Start a transaction to handle both trip creation and member assignment
    const { data, error } = await supabase.rpc('create_trip_with_owner', {
      trip_data: tripData,
      owner_id: userId
    });
    
    if (error) {
      // Log the detailed RPC error
      console.error("Error response from create_trip_with_owner RPC:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          error: error.message || "Failed to execute trip creation procedure.",
          details: error.details || null, // Pass details if available
          code: error.code || null // Pass code if available
        },
        { status: 500 }
      );
    }
    
    // Check if the RPC itself indicated failure (based on our SQL function structure)
    if (!data || !data.success) {
      console.error("RPC call create_trip_with_owner did not succeed or return expected data:", data);
      return NextResponse.json(
        { error: data?.error || "Failed to create trip after calling RPC." },
        { status: 400 } // Use 400 for known failures from the function
      );
    }
    
    // Success case
    console.log(`Trip created successfully. ID: ${data.trip_id}, Slug: ${data.slug}`);
    return NextResponse.json({ 
      tripId: data.trip_id,
      slug: data.slug, // Pass the potentially updated slug back
      redirectUrl: `/trips/${data.trip_id}` // Simpler redirect URL
    }, { status: 201 });
  } catch (error: any) {
    console.error("Unhandled error in trip creation API route:", error);
    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
} 