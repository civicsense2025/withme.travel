import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { CookieOptions } from "@supabase/ssr"

// Make cookieStore optional and use next/headers cookies as fallback
export function createServerClient(cookieStore?: any) {
  // If cookieStore is not provided, use the cookies() from next/headers
  const cookieHandler = cookieStore || cookies()

  return createServerClientSSR(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieHandler.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieHandler.set({ name, value, ...options })
        } catch (error) {
          // This will throw in middleware, but we can safely ignore it
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieHandler.set({ name, value: "", ...options })
        } catch (error) {
          // This will throw in middleware, but we can safely ignore it
        }
      },
    },
  })
}

// Also export the original function name for backward compatibility
export { createServerClient as createClient }
