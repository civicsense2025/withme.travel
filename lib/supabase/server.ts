import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { CookieOptions } from "@supabase/ssr"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cache for database queries
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds
const queryCache = new Map<string, { data: any; timestamp: number }>()

// Make cookieStore optional and use next/headers cookies as fallback
export function createServerClient(cookieStore?: any) {
  // If cookieStore is not provided, use the cookies() from next/headers
  const cookieHandler = cookieStore || cookies()

  const client = createServerClientSSR(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        try {
          const cookie = cookieHandler.get(name)
          return cookie?.value
        } catch (error) {
          // Handle errors from cookie access
          console.error("Error accessing cookie:", error)
          return undefined
        }
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieHandler.set({ name, value, ...options })
        } catch (error) {
          // This will throw in middleware, but we can safely ignore it
          console.error("Error setting cookie:", error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieHandler.set({ name, value: "", ...options })
        } catch (error) {
          // This will throw in middleware, but we can safely ignore it
          console.error("Error removing cookie:", error)
        }
      },
    },
  })

  // Enhance the client with caching capability
  const originalFrom = client.from
  client.from = function(table: string) {
    const builder = originalFrom.call(this, table)
    const originalSelect = builder.select

    // Override select method to add caching
    builder.select = function(...args: any[]) {
      const selectBuilder = originalSelect.apply(this, args)
      const originalThen = selectBuilder.then

      // Add caching to the promise chain
      selectBuilder.then = function(onfulfilled: any, onrejected: any) {
        const cacheKey = `${table}:${JSON.stringify(args)}:${JSON.stringify(selectBuilder.query)}`
        const cached = queryCache.get(cacheKey)
        
        // Return cached result if it's still valid
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          console.log(`Using cached data for ${cacheKey}`)
          return Promise.resolve(cached.data).then(onfulfilled, onrejected)
        }

        // Otherwise fetch from DB and cache the result
        return originalThen.call(this, (result: any) => {
          if (!result.error) {
            queryCache.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            })
          }
          return onfulfilled ? onfulfilled(result) : result
        }, onrejected)
      }

      return selectBuilder
    }

    return builder
  }

  return client
}

// Clear cache when needed
export function clearQueryCache() {
  queryCache.clear()
}

// Clear specific table's cache
export function clearTableCache(table: string) {
  for (const key of queryCache.keys()) {
    if (key.startsWith(`${table}:`)) {
      queryCache.delete(key)
    }
  }
}

// Also export the original function name for backward compatibility
export { createServerClient as createClient }
