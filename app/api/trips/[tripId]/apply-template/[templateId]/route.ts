import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { TRIP_ROLES, DB_TABLES, DB_FIELDS } from "@/utils/constants"

// Re-use or import checkTripAccess function
async function checkTripAccess(
    supabase: ReturnType<typeof createClient>,
    tripId: string,
    userId: string,
    allowedRoles: string[]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
    // (Implementation is the same as in reorder/route.ts - copy or import)
    const { data: member, error } = await supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
        .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
        .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
        .maybeSingle();
    if (error) return { allowed: false, error: error.message, status: 500 };
    if (!member) return { allowed: false, error: "Not a member", status: 403 };
    if (!allowedRoles.includes(member.role)) return { allowed: false, error: "Insufficient permissions", status: 403 };
    return { allowed: true };
}

// Basic interfaces for template structure (define more accurately based on schema)
interface TemplateActivity {
    title: string;
    description?: string | null;
    location?: string | null;
    duration_minutes?: number | null;
    start_time?: string | null;
    position?: number | null;
    category?: string | null;
    // Add other fields as needed from template_activities table
}

interface TemplateSection {
    day_number?: number | null;
    template_activities: TemplateActivity[];
    // Add other fields as needed from template_sections table
}

// Helper function to check user permissions (modify as needed)
async function checkUserPermission(supabase: any, tripId: string, userId: string) {
   // Example: Allow only admins/editors
   const { data, error } = await supabase.rpc('is_trip_member_with_role', { 
        _trip_id: tripId, 
        _user_id: userId, 
        _roles: ['admin', 'editor'] 
    });
    if (error) throw new Error("Permission check failed");
    return data;
}

// POST /api/trips/[tripId]/apply-template/[templateId] - Apply an itinerary template to a trip
export async function POST(
  request: Request,
  props: { params: { tripId: string; templateId: string } }
) {
  // Extract params properly
  const { tripId, templateId } = props.params;

  if (!tripId || !templateId) {
      return NextResponse.json({ error: "Trip ID and Template ID are required" }, { status: 400 });
  }

  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user has permission to edit the trip
    const access = await checkTripAccess(supabase, tripId, user.id, [
        TRIP_ROLES.ADMIN,
        TRIP_ROLES.EDITOR,
        TRIP_ROLES.CONTRIBUTOR,
    ]);
    if (!access.allowed) {
        return NextResponse.json({ error: access.error }, { status: access.status });
    }

    // 1. Fetch the template details (sections and activities)
    const { data: templateData, error: templateError } = await supabase
        .from(DB_TABLES.ITINERARY_TEMPLATES)
        .select(`
            ${DB_FIELDS.ITINERARY_TEMPLATES.ID},
            ${DB_FIELDS.ITINERARY_TEMPLATES.DURATION_DAYS},
            ${DB_FIELDS.ITINERARY_TEMPLATES.VERSION},
            ${DB_TABLES.TEMPLATE_SECTIONS} (
                *,
                ${DB_TABLES.TEMPLATE_ACTIVITIES} (*)
            )
        `)
        .eq(DB_FIELDS.ITINERARY_TEMPLATES.ID, templateId)
         // Add check for is_published or user ownership if needed for access control
        .maybeSingle();

    if (templateError) {
        console.error("Error fetching itinerary template:", templateError);
        return NextResponse.json({ error: "Failed to fetch template details." }, { status: 500 });
    }

    if (!templateData) {
        return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    // Optional: Update trip duration if template duration is longer?
    // Consider adding this logic based on product requirements.
    // const tripUpdateData = {};
    // if (templateData.duration_days && templateData.duration_days > currentTripDuration) {
    //     tripUpdateData[DB_FIELDS.TRIPS.DURATION_DAYS] = templateData.duration_days;
    //     // Update trip duration... 
    // }

    // 2. Prepare new itinerary items based on template activities
    const itemsToInsert: any[] = [];
    (templateData?.template_sections as TemplateSection[] | undefined)?.forEach(section => {
        const dayNumber = section.day_number ?? 1; // Default to day 1 if not specified
        section.template_activities?.forEach((activity: TemplateActivity) => {
            itemsToInsert.push({
                trip_id: tripId,
                created_by: user.id,
                title: activity.title,
                description: activity.description,
                location: activity.location,
                duration_minutes: activity.duration_minutes,
                start_time: activity.start_time,
                // end_time: Calculate based on start_time and duration? (Optional)
                day_number: dayNumber,
                position: activity.position ?? 0, // Use template position
                category: activity.category,
                // Map other relevant fields from activity to itinerary_items
                // e.g., address, lat/lng if available on template activity
                status: 'suggested', // Default status when applying template
            });
        });
    });

    if (itemsToInsert.length === 0) {
         return NextResponse.json({ message: "Template has no activities to apply." }, { status: 200 });
    }

    // 3. Insert new items
    // Consider deleting existing items for the affected days or merging?
    // For now, we just add the template items.
    const { data: newItems, error: insertError } = await supabase
        .from(DB_TABLES.ITINERARY_ITEMS)
        .insert(itemsToInsert)
        .select();

    if (insertError) {
        console.error("Error inserting template items:", insertError);
        return NextResponse.json({ error: "Failed to apply template items." }, { status: 500 });
    }
    
    // 4. Record template usage (Optional but recommended)
    if (templateData?.version) {
      await supabase
        .from(DB_TABLES.TRIP_TEMPLATE_USES)
        .insert({
          trip_id: tripId,
          template_id: templateId,
          applied_by: user.id,
          version_used: templateData.version,
        });
     } else {
         console.warn(`Template ${templateId} does not have a version field. Skipping usage record.`);
     }

    return NextResponse.json({ message: "Template applied successfully.", count: newItems?.length ?? 0 }, { status: 200 });

  } catch (error: any) {
    console.error("Unexpected error applying template:", error);
    return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
    );
  }
} 