"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DB_TABLES } from "@/utils/constants";
// Export the context so it can be imported by the hook
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClientComponentClient();
    // Fetch profile associated with a user ID
    const fetchProfile = useCallback(async (userId) => {
        if (!userId)
            return null;
        try {
            const { data, error } = await supabase
                .from(DB_TABLES.PROFILES)
                .select('id, name, avatar_url, username, is_admin') // Adjust fields as needed
                .eq('id', userId)
                .single();
            if (error) {
                console.error("Error fetching profile:", error);
                // Don't set auth error state here, just return null profile
                return null;
            }
            return data;
        }
        catch (e) {
            console.error("Exception fetching profile:", e);
            return null;
        }
    }, [supabase]); // Depend on supabase client instance
    useEffect(() => {
        // Get the initial session with error handling
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
            setUser((session === null || session === void 0 ? void 0 : session.user) ? Object.assign(Object.assign({}, session.user), { profile: session.user.user_metadata.profile }) : null);
            setIsLoading(false);
        })
            .catch((error) => {
            console.error('Error getting initial session:', error);
            setUser(null);
            setIsLoading(false);
        });
        // Listen for auth state changes with try/catch
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            try {
                setUser((session === null || session === void 0 ? void 0 : session.user) ? Object.assign(Object.assign({}, session.user), { profile: session.user.user_metadata.profile }) : null);
            }
            catch (error) {
                console.error('Error in auth state change listener:', error);
                setUser(null);
            }
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase]);
    // --- Auth Methods using Supabase Client --- 
    const signIn = async (email, password) => {
        try {
            setIsLoading(true);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error)
                throw error;
            // State will update via onAuthStateChange listener
            setIsLoading(false); // Set loading false after call
        }
        catch (error) {
            console.error("Sign in error:", error);
            setIsLoading(false);
            throw error;
        }
    };
    const signUp = async (email, password, username) => {
        try {
            setIsLoading(true);
            // Add additional data like username during signup
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username, // Pass username here
                        // name: username // Optionally set name as well if desired
                    }
                }
            });
            if (error)
                throw error;
            // State will update via onAuthStateChange listener 
            setIsLoading(false); // Set loading false after call
        }
        catch (error) {
            console.error("Sign up error:", error);
            setIsLoading(false);
            throw error;
        }
    };
    const signOut = async () => {
        try {
            setIsLoading(true);
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setIsLoading(false);
        }
        catch (error) {
            console.error("Sign out error:", error);
            setIsLoading(false);
            throw error;
        }
    };
    // Memoize context value, including profile
    const value = useMemo(() => ({
        supabase,
        user: user,
        profile: profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        error: null,
    }), [supabase, user, profile, isLoading, signIn, signUp, signOut]);
    return (<AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>);
}
// Keep useAuth hook as is, it consumes the context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
