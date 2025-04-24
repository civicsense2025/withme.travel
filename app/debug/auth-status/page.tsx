"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function AuthDebugPage() {
  const { user, profile, isLoading, error } = useAuth();
  const [storageData, setStorageData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [clientLoaded, setClientLoaded] = useState(false);
  const [allStorageKeys, setAllStorageKeys] = useState<string[]>([]);

  useEffect(() => {
    // Get data from localStorage
    if (typeof window !== "undefined") {
      try {
        // Get all localStorage keys
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) keys.push(key);
        }
        setAllStorageKeys(keys);
        
        const authToken = localStorage.getItem("supabase.auth.token");
        setStorageData(authToken ? JSON.parse(authToken) : null);
      } catch (e) {
        console.error("Error parsing auth token:", e);
        setStorageData({ error: String(e) });
      }

      // Create a Supabase client and check session
      const fetchSession = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.getSession();
          setSessionData({ session: data.session, error });
        } catch (e) {
          console.error("Error getting session:", e);
          setSessionData({ error: String(e) });
        }
        setClientLoaded(true);
      };

      fetchSession();
    }
  }, []);
  
  // Function to create a simulated session in localStorage for testing
  const createTestSession = () => {
    if (typeof window === 'undefined') return;
    
    const fakeUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'authenticated',
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };
    
    const fakeSession = {
      provider_token: null,
      provider_refresh_token: null,
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: fakeUser
    };
    
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: fakeSession,
      expiresAt: Math.floor(Date.now() / 1000) + 3600
    }));
    
    alert('Test session created! Reloading page...');
    window.location.reload();
  };

  if (!clientLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Auth Debug Information</h1>
      
      <div className="bg-muted p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Auth Provider State</h2>
        <pre className="bg-card p-3 rounded overflow-auto max-h-[300px]">
          {JSON.stringify({ user, profile, isLoading, error }, null, 2)}
        </pre>
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">All localStorage Keys</h2>
        <pre className="bg-card p-3 rounded overflow-auto max-h-[300px]">
          {JSON.stringify(allStorageKeys, null, 2)}
        </pre>
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">localStorage Data</h2>
        <pre className="bg-card p-3 rounded overflow-auto max-h-[300px]">
          {JSON.stringify(storageData, null, 2)}
        </pre>
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Supabase Session</h2>
        <pre className="bg-card p-3 rounded overflow-auto max-h-[300px]">
          {JSON.stringify(sessionData, null, 2)}
        </pre>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <Link 
          href="/login" 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Login
        </Link>
        <button 
          onClick={() => {
            localStorage.removeItem("supabase.auth.token");
            window.location.reload();
          }}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
        >
          Clear localStorage
        </button>
        <button 
          onClick={() => {
            fetch("/api/auth/clear-cookies")
              .then(() => window.location.reload())
              .catch(e => console.error("Error clearing cookies:", e));
          }}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
        >
          Clear Cookies
        </button>
        <button 
          onClick={createTestSession}
          className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-400"
        >
          Create Test Session
        </button>
        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400"
        >
          Try Dashboard
        </button>
      </div>
    </div>
  );
} 