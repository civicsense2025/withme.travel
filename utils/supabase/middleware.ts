import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware function to refresh the Supabase session cookie.
 * Ensures server components and API routes have up-to-date auth state.
 */
export async function updateSession(request: NextRequest) {
  // This will refresh the session cookie if needed
  // by calling `createServerClient` inside `createClient` 
  // which reads and writes cookies via the Next.js cookies() function.
  const supabase = createClient();
  await supabase.auth.getUser();

  // Continue the request chain
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

// No need to manage cookies explicitly here anymore.
// The `createClient` from `@/utils/supabase/server` handles cookie 
// interactions automatically using the `cookies()` function from `next/headers`. 