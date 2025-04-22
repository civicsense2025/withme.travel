import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies();
          return cookieStore.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies();
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch (error) {
                // Ignore errors from trying to set cookies in RSC
                // See: https://github.com/vercel/next.js/discussions/49408
              }
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component or Route Handler.
            // This can be ignored if you have middleware refreshing user sessions.
            // Log error for debugging?
            // console.error("Error in setAll cookies:", error);
          }
        },
      },
    },
  );
}; 