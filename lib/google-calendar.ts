import { supabase } from "./supabase/client"

export interface CalendarEvent {
  summary: string
  description: string
  location?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
}

export async function exportToGoogleCalendar(events: CalendarEvent[]) {
  try {
    // Get the current user's session
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData?.session) {
      throw new Error("No active session found")
    }

    // Check if the user has connected their Google account
    const provider = sessionData.session.user.app_metadata?.provider

    if (provider !== "google") {
      throw new Error("Google account not connected. Please sign in with Google to use this feature.")
    }

    // Get the access token
    const {
      data: { session },
    } = await supabase.auth.refreshSession()
    const accessToken = session?.provider_token

    if (!accessToken) {
      throw new Error("Google access token not found. Please sign in with Google again.")
    }

    // Create a batch request to add all events
    const responses = await Promise.all(
      events.map((event) =>
        fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }),
      ),
    )

    // Check for errors
    const results = await Promise.all(
      responses.map(async (response) => {
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Google Calendar API error: ${errorData.error?.message || response.statusText}`)
        }
        return response.json()
      }),
    )

    return {
      success: true,
      events: results,
    }
  } catch (error: any) {
    console.error("Error exporting to Google Calendar:", error)
    return {
      success: false,
      error: error.message || "Failed to export to Google Calendar",
    }
  }
}
