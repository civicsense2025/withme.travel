'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';

// Types for status checks
type StatusCheck = {
  name: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  details?: string;
};

export default function DebugDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'authenticated' | 'unauthenticated' | 'checking'>('checking');
  const [webSocketStatus, setWebSocketStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [presenceStatus, setPresenceStatus] = useState<'available' | 'unavailable' | 'checking'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Status checks for each section
  const [authChecks, setAuthChecks] = useState<StatusCheck[]>([
    { name: 'Session', description: 'Checking for valid session', status: 'pending' },
    { name: 'Cookies', description: 'Checking auth cookies', status: 'pending' },
    { name: 'User Profile', description: 'Checking user profile data', status: 'pending' },
  ]);
  
  const [dbChecks, setDbChecks] = useState<StatusCheck[]>([
    { name: 'Connection', description: 'Checking database connection', status: 'pending' },
    { name: 'Schema', description: 'Checking schema validity', status: 'pending' },
    { name: 'Tables', description: 'Checking required tables', status: 'pending' },
  ]);
  
  const [webSocketChecks, setWebSocketChecks] = useState<StatusCheck[]>([
    { name: 'Connection', description: 'Checking WebSocket connection', status: 'pending' },
    { name: 'Channels', description: 'Testing channel creation', status: 'pending' },
    { name: 'Presence', description: 'Testing presence feature', status: 'pending' },
  ]);
  
  // Perform all checks
  useEffect(() => {
    const runChecks = async () => {
      try {
        setIsLoading(true);
        
        // Check auth
        await checkAuth();
        
        // Check WebSocket
        await checkWebSocket();
        
        // Check database
        await checkDatabase();
        
      } catch (err) {
        setError(`Unexpected error during checks: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    runChecks();
  }, []);
  
  // Auth checks
  const checkAuth = async () => {
    try {
      // Update auth checks status
      setAuthChecks((prev) => 
        prev.map(check => 
          check.name === 'Session' ? { ...check, status: 'pending', details: 'Checking session...' } : check
        )
      );
      
      const supabase = createClient();
      
      if (!supabase) {
        setAuthChecks((prev) => 
          prev.map(check => 
            check.name === 'Session' 
              ? { ...check, status: 'error', details: 'Failed to create Supabase client' } 
              : check
          )
        );
        setAuthStatus('unauthenticated');
        return;
      }
      
      // Check session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setAuthChecks((prev) => 
          prev.map(check => 
            check.name === 'Session' 
              ? { ...check, status: 'error', details: `Auth error: ${error.message}` } 
              : check
          )
        );
        setAuthStatus('unauthenticated');
        return;
      }
      
      if (!data.session) {
        setAuthChecks((prev) => 
          prev.map(check => 
            check.name === 'Session' 
              ? { ...check, status: 'warning', details: 'No active session found' } 
              : check
          )
        );
        setAuthStatus('unauthenticated');
        return;
      }
      
      // Session is valid
      setAuthChecks((prev) => 
        prev.map(check => 
          check.name === 'Session' 
            ? { ...check, status: 'success', details: `Valid session (expires ${new Date(data.session.expires_at! * 1000).toLocaleString()})` } 
            : check
        )
      );
      
      // Check cookies
      setAuthChecks((prev) => 
        prev.map(check => 
          check.name === 'Cookies' ? { ...check, status: 'pending', details: 'Checking cookies...' } : check
        )
      );
      
      // Check for auth cookies
      const cookies = document.cookie;
      const hasAuthCookies = cookies.includes('sb-') || cookies.includes('supabase');
      
      setAuthChecks((prev) => 
        prev.map(check => 
          check.name === 'Cookies' 
            ? { 
                ...check, 
                status: hasAuthCookies ? 'success' : 'warning',
                details: hasAuthCookies 
                  ? 'Auth cookies found' 
                  : 'No auth cookies found, may affect persistence'
              } 
            : check
        )
      );
      
      // Check user profile
      setAuthChecks((prev) => 
        prev.map(check => 
          check.name === 'User Profile' ? { ...check, status: 'pending', details: 'Loading profile...' } : check
        )
      );
      
      setUser(data.session.user);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      
      if (profileError) {
        setAuthChecks((prev) => 
          prev.map(check => 
            check.name === 'User Profile' 
              ? { ...check, status: 'warning', details: `Profile error: ${profileError.message}` } 
              : check
          )
        );
      } else if (!profileData) {
        setAuthChecks((prev) => 
          prev.map(check => 
            check.name === 'User Profile' 
              ? { ...check, status: 'warning', details: 'No profile found for user' } 
              : check
          )
        );
      } else {
        setAuthChecks((prev) => 
          prev.map(check => 
            check.name === 'User Profile' 
              ? { ...check, status: 'success', details: `Profile found for ${profileData.name || data.session?.user.email}` } 
              : check
          )
        );
      }
      
      setAuthStatus('authenticated');
      
    } catch (err) {
      setError(`Auth check error: ${err instanceof Error ? err.message : String(err)}`);
      setAuthStatus('unauthenticated');
    }
  };
  
  // WebSocket checks
  const checkWebSocket = async () => {
    try {
      // Update WebSocket checks status
      setWebSocketChecks((prev) => 
        prev.map(check => 
          check.name === 'Connection' ? { ...check, status: 'pending', details: 'Testing connection...' } : check
        )
      );
      
      const supabase = createClient();
      
      if (!supabase) {
        setWebSocketChecks((prev) => 
          prev.map(check => 
            check.name === 'Connection' 
              ? { ...check, status: 'error', details: 'Failed to create Supabase client' } 
              : check
          )
        );
        setWebSocketStatus('disconnected');
        return;
      }
      
      // Test basic channel creation
      setWebSocketChecks((prev) => 
        prev.map(check => 
          check.name === 'Channels' ? { ...check, status: 'pending', details: 'Creating test channel...' } : check
        )
      );
      
      let channelConnected = false;
      
      try {
        // Create a test channel
        const channel = supabase.channel('test-debug-channel');
        
        // Create a promise that resolves on subscription or rejects on timeout
        const subscriptionPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Channel subscription timeout')), 5000);
          
          channel.subscribe((status) => {
            clearTimeout(timeout);
            if (status === 'SUBSCRIBED') {
              channelConnected = true;
              resolve(true);
            } else if (status === 'CHANNEL_ERROR') {
              reject(new Error(`Channel error: ${status}`));
            }
          });
        });
        
        // Wait for subscription or timeout
        await subscriptionPromise;
        
        // Clean up
        await channel.unsubscribe();
        
        setWebSocketChecks((prev) => 
          prev.map(check => {
            if (check.name === 'Connection') {
              return { ...check, status: 'success', details: 'WebSocket connection successful' };
            }
            if (check.name === 'Channels') {
              return { ...check, status: 'success', details: 'Channel creation successful' };
            }
            return check;
          })
        );
        
        // Test presence
        setWebSocketChecks((prev) => 
          prev.map(check => 
            check.name === 'Presence' ? { ...check, status: 'pending', details: 'Testing presence...' } : check
          )
        );
        
        // Test presence
        const presenceChannel = supabase.channel('presence-debug-test', {
          config: {
            presence: {
              key: 'debug-user',
            },
          },
        });
        
        let presenceWorking = false;
        
        // Create a promise that resolves on presence sync or rejects on timeout
        const presencePromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Presence timeout')), 5000);
          
          presenceChannel
            .on('presence', { event: 'sync' }, () => {
              clearTimeout(timeout);
              presenceWorking = true;
              resolve(true);
            })
            .subscribe(async (status) => {
              if (status === 'SUBSCRIBED') {
                // Track presence
                await presenceChannel.track({
                  user_id: 'debug-user',
                  online_at: new Date().toISOString(),
                });
              } else if (status === 'CHANNEL_ERROR') {
                clearTimeout(timeout);
                reject(new Error(`Presence channel error: ${status}`));
              }
            });
        });
        
        try {
          // Wait for presence sync or timeout
          await presencePromise;
          
          setWebSocketChecks((prev) => 
            prev.map(check => 
              check.name === 'Presence' 
                ? { ...check, status: 'success', details: 'Presence feature working' } 
                : check
            )
          );
          
          setPresenceStatus('available');
        } catch (presenceError) {
          setWebSocketChecks((prev) => 
            prev.map(check => 
              check.name === 'Presence' 
                ? { 
                    ...check, 
                    status: 'error', 
                    details: `Presence error: ${presenceError instanceof Error ? presenceError.message : String(presenceError)}` 
                  } 
                : check
            )
          );
          
          setPresenceStatus('unavailable');
        } finally {
          // Clean up
          await presenceChannel.unsubscribe();
        }
        
        setWebSocketStatus('connected');
      } catch (channelError) {
        setWebSocketChecks((prev) => 
          prev.map(check => {
            if (check.name === 'Connection') {
              return { 
                ...check, 
                status: 'error', 
                details: `WebSocket error: ${channelError instanceof Error ? channelError.message : String(channelError)}` 
              };
            }
            if (check.name === 'Channels') {
              return { 
                ...check, 
                status: 'error', 
                details: `Channel error: ${channelError instanceof Error ? channelError.message : String(channelError)}` 
              };
            }
            if (check.name === 'Presence') {
              return { ...check, status: 'error', details: 'Presence not tested due to channel error' };
            }
            return check;
          })
        );
        
        setWebSocketStatus('disconnected');
        setPresenceStatus('unavailable');
      }
      
    } catch (err) {
      setError(`WebSocket check error: ${err instanceof Error ? err.message : String(err)}`);
      setWebSocketStatus('disconnected');
    }
  };
  
  // Database checks
  const checkDatabase = async () => {
    try {
      // Update database checks status
      setDbChecks((prev) => 
        prev.map(check => 
          check.name === 'Connection' ? { ...check, status: 'pending', details: 'Testing connection...' } : check
        )
      );
      
      const supabase = createClient();
      
      if (!supabase) {
        setDbChecks((prev) => 
          prev.map(check => 
            check.name === 'Connection' 
              ? { ...check, status: 'error', details: 'Failed to create Supabase client' } 
              : check
          )
        );
        setDbStatus('disconnected');
        return;
      }
      
      // Test database connection with a simple query
      const { data, error } = await supabase.from('profiles').select('count(*)', { count: 'exact' }).limit(1);
      
      if (error) {
        setDbChecks((prev) => 
          prev.map(check => 
            check.name === 'Connection' 
              ? { ...check, status: 'error', details: `Database error: ${error.message}` } 
              : check
          )
        );
        setDbStatus('disconnected');
        return;
      }
      
      setDbChecks((prev) => 
        prev.map(check => 
          check.name === 'Connection' 
            ? { ...check, status: 'success', details: 'Database connection successful' } 
            : check
        )
      );
      
      // Check schema via API endpoint
      setDbChecks((prev) => 
        prev.map(check => 
          check.name === 'Schema' ? { ...check, status: 'pending', details: 'Checking schema...' } : check
        )
      );
      
      try {
        const schemaResponse = await fetch('/api/debug/schema-check');
        
        if (!schemaResponse.ok) {
          const errorData = await schemaResponse.json();
          setDbChecks((prev) => 
            prev.map(check => 
              check.name === 'Schema' 
                ? { ...check, status: 'warning', details: `Schema check error: ${errorData.error || 'Unknown error'}` } 
                : check
            )
          );
        } else {
          const schemaData = await schemaResponse.json();
          
          setDbChecks((prev) => 
            prev.map(check => 
              check.name === 'Schema' 
                ? { ...check, status: 'success', details: `Schema valid (${schemaData.tables?.length || 0} tables found)` } 
                : check
            )
          );
        }
      } catch (schemaError) {
        setDbChecks((prev) => 
          prev.map(check => 
            check.name === 'Schema' 
              ? { 
                  ...check, 
                  status: 'warning', 
                  details: `Schema check failed: ${schemaError instanceof Error ? schemaError.message : String(schemaError)}` 
                } 
              : check
          )
        );
      }
      
      // Check required tables
      setDbChecks((prev) => 
        prev.map(check => 
          check.name === 'Tables' ? { ...check, status: 'pending', details: 'Checking tables...' } : check
        )
      );
      
      // List of essential tables
      const essentialTables = [
        'profiles',
        'trips',
        'trip_members',
        'user_presence',
        'itinerary_items'
      ];
      
      const tableChecks = await Promise.all(
        essentialTables.map(async (table) => {
          try {
            const { data, error } = await supabase.from(table).select('count(*)', { count: 'exact' }).limit(1);
            return { table, exists: !error, error: error?.message };
          } catch (err) {
            return { table, exists: false, error: err instanceof Error ? err.message : String(err) };
          }
        })
      );
      
      const missingTables = tableChecks.filter(check => !check.exists);
      
      if (missingTables.length > 0) {
        setDbChecks((prev) => 
          prev.map(check => 
            check.name === 'Tables' 
              ? { 
                  ...check, 
                  status: 'warning', 
                  details: `Missing tables: ${missingTables.map(t => t.table).join(', ')}` 
                } 
              : check
          )
        );
      } else {
        setDbChecks((prev) => 
          prev.map(check => 
            check.name === 'Tables' 
              ? { ...check, status: 'success', details: `All required tables exist` } 
              : check
          )
        );
      }
      
      setDbStatus('connected');
      
    } catch (err) {
      setError(`Database check error: ${err instanceof Error ? err.message : String(err)}`);
      setDbStatus('disconnected');
    }
  };
  
  // Handle forced refresh of all checks
  const handleRefreshChecks = () => {
    setIsLoading(true);
    setError(null);
    
    // Reset all checks to pending
    setAuthChecks(prevChecks => prevChecks.map(check => ({ ...check, status: 'pending', details: undefined })));
    setWebSocketChecks(prevChecks => prevChecks.map(check => ({ ...check, status: 'pending', details: undefined })));
    setDbChecks(prevChecks => prevChecks.map(check => ({ ...check, status: 'pending', details: undefined })));
    
    // Run all checks again
    Promise.all([checkAuth(), checkWebSocket(), checkDatabase()])
      .catch(err => {
        setError(`Error refreshing checks: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  // Render status check items
  const renderStatusChecks = (checks: StatusCheck[]) => {
    return checks.map(check => (
      <div key={check.name} className="flex flex-col gap-1 py-2 border-b border-gray-100 last:border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {check.status === 'success' && <span className="text-green-500 text-xl">✓</span>}
            {check.status === 'warning' && <span className="text-amber-500 text-xl">⚠</span>}
            {check.status === 'error' && <span className="text-red-500 text-xl">✗</span>}
            {check.status === 'pending' && <span className="text-gray-400 text-xl">⋯</span>}
            <span className="font-medium">{check.name}</span>
          </div>
          <span className="text-sm text-gray-500">{check.description}</span>
        </div>
        {check.details && (
          <div className="text-sm ml-7 text-gray-600">{check.details}</div>
        )}
      </div>
    ));
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Diagnostics</h1>
        <Button 
          onClick={handleRefreshChecks}
          disabled={isLoading}
        >
          {isLoading ? 'Checking...' : 'Refresh Checks'}
        </Button>
      </div>
      
      {error && (
        <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Authentication Status</CardTitle>
              <span className={
                authStatus === 'authenticated' ? 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full' : 
                authStatus === 'checking' ? 'px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full' :
                'px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full'
              }>
                {authStatus === 'authenticated' ? 'Authenticated' : 
                 authStatus === 'checking' ? 'Checking...' : 'Not Authenticated'}
              </span>
            </div>
            <CardDescription>
              Check if your authentication is working properly
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStatusChecks(authChecks)}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/debug/auth-check'}
                className="text-xs"
              >
                Detailed Auth Check
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>WebSocket Status</CardTitle>
              <span className={
                webSocketStatus === 'connected' ? 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full' : 
                webSocketStatus === 'checking' ? 'px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full' :
                'px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full'
              }>
                {webSocketStatus === 'connected' ? 'Connected' : 
                 webSocketStatus === 'checking' ? 'Checking...' : 'Disconnected'}
              </span>
            </div>
            <CardDescription>
              Check WebSocket connection and presence feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStatusChecks(webSocketChecks)}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/debug/websocket-test'}
                className="text-xs"
              >
                WebSocket Test Tool
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Database Status</CardTitle>
              <span className={
                dbStatus === 'connected' ? 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full' : 
                dbStatus === 'checking' ? 'px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full' :
                'px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full'
              }>
                {dbStatus === 'connected' ? 'Connected' : 
                 dbStatus === 'checking' ? 'Checking...' : 'Disconnected'}
              </span>
            </div>
            <CardDescription>
              Check database connection and schema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStatusChecks(dbChecks)}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/debug/schema-check'}
                className="text-xs"
              >
                Schema Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 