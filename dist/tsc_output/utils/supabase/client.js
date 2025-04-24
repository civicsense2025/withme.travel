import { createBrowserClient } from "@supabase/ssr";
// Constants for Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Default cookie options 
const DEFAULT_COOKIE_OPTIONS = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
};
// Removed singleton logic
// let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;
/**
 * Creates and returns a new Supabase browser client instance.
 * This should ideally be called once and the instance shared via context.
 */
export const createClient = () => {
    console.log("[Supabase Client] Creating new browser client instance."); // Log instance creation
    // Removed singleton check
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            get(name) {
                if (typeof document === 'undefined')
                    return null;
                try {
                    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
                    if (match && match[2]) {
                        return decodeURIComponent(match[2]);
                    }
                }
                catch (e) {
                    console.error("Error getting cookie:", name, e);
                }
                return null;
            },
            set(name, value, options) {
                if (typeof document === 'undefined')
                    return;
                try {
                    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
                    const finalOptions = Object.assign(Object.assign({}, DEFAULT_COOKIE_OPTIONS), options);
                    if (finalOptions.maxAge) {
                        const d = new Date();
                        d.setTime(d.getTime() + (finalOptions.maxAge * 1000));
                        cookieString += `; expires=${d.toUTCString()}`;
                    }
                    cookieString += `; path=${finalOptions.path}`;
                    cookieString += `; sameSite=${finalOptions.sameSite}`;
                    if (finalOptions.secure) {
                        cookieString += `; secure`;
                    }
                    document.cookie = cookieString;
                }
                catch (e) {
                    console.error("Error setting cookie:", name, e);
                }
            },
            remove(name, options) {
                if (typeof document === 'undefined')
                    return;
                try {
                    const finalOptions = Object.assign(Object.assign({}, DEFAULT_COOKIE_OPTIONS), options);
                    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${finalOptions.path}; sameSite=${finalOptions.sameSite}${finalOptions.secure ? '; secure' : ''}`;
                }
                catch (e) {
                    console.error("Error removing cookie:", name, e);
                }
            }
        },
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        }
    });
};
// Removed direct export of supabase instance
// Removed export of getSupabaseBrowserClient (use createClient instead)
// Removed export of createBrowserSupabaseClient to prevent non-singleton creation
// Removed export of resetSupabaseClient unless specifically needed for testing elsewhere 
