'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { 
  AlertCircle, 
  CheckCircle, 
  Database, 
  Server, 
  User, 
  Info,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Table,
  LayoutGrid,
  Map,
  Settings,
  FileCode,
  Wifi
} from 'lucide-react';

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
  
  // Create Supabase client instance once
  const supabase = createClient();

  // Auth checks
  const checkAuth = async () => {
    try {
      // Update auth checks status
      setAuthChecks((prev) => 
        prev.map(check => 
          check.name === 'Session' ? { ...check, status: 'pending', details: 'Checking session...' } : check
        )
      );
      
      // Use the existing supabase client
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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession(); // Renamed variables
      
      if (sessionError) {
        setAuthChecks((prev) => 
          prev.map(check => 
            check.name === 'Session' 
              ? { ...check, status: 'error', details: `Auth error: ${sessionError.message}` } 
              : check
          )
        );
        setAuthStatus('unauthenticated');
        return;
      }
      
      if (!sessionData.session) {
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
            ? { ...check, status: 'success', details: `Valid session (expires ${new Date(sessionData.session!.expires_at! * 1000).toLocaleString()})` } 
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
      
      setUser(sessionData.session.user);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
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
              ? { ...check, status: 'success', details: `Profile found for ${profileData.name || sessionData.session?.user.email}` } 
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
      
      // Use the existing supabase client
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
      setWebSocketStatus('disconnected'); // Ensure status reflects error
      setPresenceStatus('unavailable');  // Ensure status reflects error
    }
  };

  // Database checks - Moved outside checkWebSocket
  const checkDatabase = async () => {
    try {
      // Update DB checks status
      setDbChecks((prev) => 
        prev.map(check => 
          check.name === 'Connection' ? { ...check, status: 'pending', details: 'Connecting...' } : check
        )
      );
      
      // Use the existing supabase client
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
      // Renamed variables to avoid conflict
      const { error: dbError, count: dbCount } = await supabase // Changed to get count
        .from('profiles')
        .select('*', { count: 'exact', head: true }); // Correct count syntax
      
      if (dbError) {
        setDbChecks((prev) => 
          prev.map(check => 
            check.name === 'Connection' 
              ? { ...check, status: 'error', details: `Database error: ${dbError.message}` } 
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
            // Use existing supabase client
            const { error: tableError, count: tableCount } = await supabase // Changed to get count
              .from(table)
              .select('*', { count: 'exact', head: true }); // Correct count syntax
            return { table, exists: !tableError, error: tableError?.message };
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

  // Add this after the checkDatabase function
  const schemaLinks = [
    {
      title: 'Schema Check & Update',
      description: 'Validate database schema and update constants',
      href: '/debug/schema-update',
      icon: Database
    }
  ];

  // Perform all checks on initial mount
  useEffect(() => {
    const runChecks = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear previous errors
        
        // Reset all statuses to checking
        setAuthStatus('checking');
        setWebSocketStatus('checking');
        setDbStatus('checking');
        setPresenceStatus('checking');

        // Reset check details
        setAuthChecks(prevChecks => prevChecks.map(check => ({ ...check, status: 'pending', details: undefined })));
        setWebSocketChecks(prevChecks => prevChecks.map(check => ({ ...check, status: 'pending', details: undefined })));
        setDbChecks(prevChecks => prevChecks.map(check => ({ ...check, status: 'pending', details: undefined })));

        // Run checks sequentially or in parallel as needed
        await checkAuth(); 
        await checkWebSocket();
        await checkDatabase(); // Now called correctly
        
      } catch (err) {
        setError(`Unexpected error during checks: ${err instanceof Error ? err.message : String(err)}`);
        // Set statuses to error state if a general error occurs
        setAuthStatus(authStatus === 'checking' ? 'unauthenticated' : authStatus); // Avoid overwriting successful checks
        setWebSocketStatus(webSocketStatus === 'checking' ? 'disconnected' : webSocketStatus);
        setDbStatus(dbStatus === 'checking' ? 'disconnected' : dbStatus);
        setPresenceStatus(presenceStatus === 'checking' ? 'unavailable' : presenceStatus);
      } finally {
        setIsLoading(false);
      }
    };
    
    runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []); // Run only on mount
  
  // Handle forced refresh of all checks
  const handleRefreshChecks = () => {
    setIsLoading(true);
    setError(null);
    
    // Reset all checks to pending
    setAuthChecks(prevChecks => prevChecks.map(check => ({ ...check, status: 'pending', details: undefined })));
    setWebSocketChecks(prevChecks => prevChecks.map(check => ({ ...check, status: 'pending', details: undefined })));
    setDbChecks(prevChecks => prevChecks.map(check => ({ ...check, status: 'pending', details: undefined })));
    
    // Reset statuses
    setAuthStatus('checking');
    setWebSocketStatus('checking');
    setDbStatus('checking');
    setPresenceStatus('checking');

    // Run all checks again
    Promise.all([checkAuth(), checkWebSocket(), checkDatabase()]) // Now calling correct function
      .catch(err => {
        setError(`Error refreshing checks: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  // Render status check items
  const renderStatusChecks = (checks: StatusCheck[]) => {
    return checks.map(check => {
      return (
        <div key={check.name} className="flex flex-col gap-1 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {check.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {check.status === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
              {check.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
              {check.status === 'pending' && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
              <span className="font-medium">{check.name}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{check.description}</span>
          </div>
          {check.details && (
            <div className="text-sm ml-6 text-gray-600 dark:text-gray-300">{check.details}</div>
          )}
        </div>
      );
    });
  };

  // Main component return
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">System Diagnostics</h1>
          <p className="text-muted-foreground">Monitor system health and debug WithMe.Travel components</p>
        </div>
        <Button onClick={handleRefreshChecks} disabled={isLoading} variant="outline" size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Checks'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Debug Links</CardTitle>
          <CardDescription>Access specific debugging tools and pages.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link href="/debug/auth-status" passHref>
            <Button variant="outline" className="w-full justify-start text-left h-auto py-2">
              <User className="h-4 w-4 mr-2 flex-shrink-0"/>
              <div>
                <p className="font-medium">Auth Status</p>
                <p className="text-xs text-muted-foreground">View current session</p>
              </div>
            </Button>
          </Link>
          <Link href="/debug/schema-update" passHref>
            <Button variant="outline" className="w-full justify-start text-left h-auto py-2">
              <Table className="h-4 w-4 mr-2 flex-shrink-0"/>
               <div>
                <p className="font-medium">Schema Check</p>
                <p className="text-xs text-muted-foreground">Verify DB structure</p>
              </div>
            </Button>
          </Link>
          <Link href="/debug/trips" passHref>
            <Button variant="outline" className="w-full justify-start text-left h-auto py-2">
               <LayoutGrid className="h-4 w-4 mr-2 flex-shrink-0"/>
               <div>
                <p className="font-medium">Trip Debugger</p>
                <p className="text-xs text-muted-foreground">Diagnose trip loading</p>
              </div>
            </Button>
          </Link>
          <Link href="/design-sandbox" passHref>
            <Button variant="outline" className="w-full justify-start text-left h-auto py-2">
               <Settings className="h-4 w-4 mr-2 flex-shrink-0"/>
               <div>
                <p className="font-medium">Design Sandbox</p>
                <p className="text-xs text-muted-foreground">Test UI components</p>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Authentication Status
              </CardTitle>
              <span className={
                authStatus === 'authenticated' 
                  ? 'px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full flex items-center gap-1'
                  : authStatus === 'checking' 
                  ? 'px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300 text-xs rounded-full flex items-center gap-1'
                  : 'px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs rounded-full flex items-center gap-1'
              }>
                {authStatus === 'authenticated' && <CheckCircle className="h-3 w-3" />}
                {authStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                {authStatus === 'unauthenticated' && <AlertCircle className="h-3 w-3" />}
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
            {user && authStatus === 'authenticated' && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium">Authenticated User:</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
             <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/debug/auth-status'}
                className="text-xs"
              >
                Auth Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                WebSocket Status
              </CardTitle>
              <span className={
                webSocketStatus === 'connected' 
                  ? 'px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full flex items-center gap-1'
                  : webSocketStatus === 'checking' 
                  ? 'px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300 text-xs rounded-full flex items-center gap-1'
                  : 'px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs rounded-full flex items-center gap-1'
              }>
                {webSocketStatus === 'connected' && <CheckCircle className="h-3 w-3" />}
                {webSocketStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                {webSocketStatus === 'disconnected' && <AlertCircle className="h-3 w-3" />}
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Database Status
              </CardTitle>
              <span className={
                dbStatus === 'connected' 
                  ? 'px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full flex items-center gap-1'
                  : dbStatus === 'checking' 
                  ? 'px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300 text-xs rounded-full flex items-center gap-1'
                  : 'px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs rounded-full flex items-center gap-1'
              }>
                {dbStatus === 'connected' && <CheckCircle className="h-3 w-3" />}
                {dbStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                {dbStatus === 'disconnected' && <AlertCircle className="h-3 w-3" />}
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
            
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-medium mb-2">Database Tools</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {schemaLinks.map((link, index) => (
                  <Link href={link.href} key={index} passHref>
                    <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto py-2">
                      {link.icon && <link.icon className="h-4 w-4 mr-2 flex-shrink-0" />}
                      <div>
                        <p className="font-medium text-xs">{link.title}</p>
                        <p className="text-xs text-muted-foreground">{link.description}</p>
                      </div>
              </Button>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
} 