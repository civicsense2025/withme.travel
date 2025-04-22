import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Only update the session. 
  // Handling last_sign_in_at here adds complexity and potential issues.
  // It's better handled via DB triggers or specific API calls if needed.
  return await updateSession(request);
}

// Keep the existing config
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (can be handled by server client directly)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 