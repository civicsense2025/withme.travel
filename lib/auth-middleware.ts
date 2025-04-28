import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { errorResponse } from "./api-utils";

/**
 * Authentication result interface
 */
export interface AuthResult {
  authorized: boolean;
  user?: any;
  error?: string;
  response?: NextResponse;
}

/**
 * Middleware to require authentication
 * Returns user data if authenticated or error response if not
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { 
        authorized: false, 
        error: error?.message || "Unauthorized",
        response: errorResponse("Unauthorized", 401)
      };
    }
    
    return { authorized: true, user };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return {
      authorized: false,
      error: "Internal server error during authentication",
      response: errorResponse("Internal server error", 500)
    };
  }
}

/**
 * Check if current user has admin privileges
 */
export async function requireAdmin(): Promise<AuthResult> {
  const authResult = await requireAuth();
  
  if (!authResult.authorized) {
    return authResult;
  }
  
  try {
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authResult.user.id)
      .single();
    
    if (error || !profile || !profile.is_admin) {
      return {
        authorized: false,
        error: "Admin access required",
        response: errorResponse("Admin access required", 403)
      };
    }
    
    return { authorized: true, user: authResult.user };
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return {
      authorized: false,
      error: "Internal server error during authorization",
      response: errorResponse("Internal server error", 500)
    };
  }
}

/**
 * Helper to handle auth within route handlers
 * @param handler - The function to run if authenticated
 */
export async function withAuth<T>(
  handler: (user: any) => Promise<T>
): Promise<T | NextResponse> {
  const result = await requireAuth();
  if (!result.authorized) {
    return result.response as NextResponse;
  }
  return handler(result.user);
}

/**
 * Helper to handle admin auth within route handlers
 * @param handler - The function to run if an admin
 */
export async function withAdmin<T>(
  handler: (user: any) => Promise<T>
): Promise<T | NextResponse> {
  const result = await requireAdmin();
  if (!result.authorized) {
    return result.response as NextResponse;
  }
  return handler(result.user);
} 