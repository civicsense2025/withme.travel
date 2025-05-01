'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, AlertCircle, CheckCircle, Info, RefreshCw, UserCheck, Lock, Database, Server, Eye, Copy, Check } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import { TABLES, FIELDS } from '@/utils/constants/database';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';

// Types for status checks
type StatusCheck = {
  name: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  details?: string;
};

type ApiEndpointStatus = {
  endpoint: string;
  status: 'success' | 'error' | 'pending' | 'not_tested';
  duration?: number;
  response?: any;
  error?: string;
  code?: number;
};

type TripPermission = {
  tripId: string;
  hasAccess: boolean;
  role?: string;
  userId?: string;
};

export default function TripDebugDashboard() {
  // State for trip ID input and validation
  const [tripId, setTripId] = useState<string>('');
  const [isValidTripId, setIsValidTripId] = useState<boolean | null>(null);
  
  // State for loading, errors and overall status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tripLoadStatus, setTripLoadStatus] = useState<'not_loaded' | 'loading' | 'success' | 'error'>('not_loaded');

  // Auth and user state
  const { user, isLoading: authLoading } = useAuth();
  const [userDetails, setUserDetails] = useState<any>(null);
  
  // Permission state
  const [permissionStatus, setPermissionStatus] = useState<TripPermission | null>(null);
  
  // Status checks for different aspects
  const [authChecks, setAuthChecks] = useState<StatusCheck[]>([
    { name: 'Authentication', description: 'Checking authentication status', status: 'pending' },
    { name: 'Trip Access', description: 'Checking trip access permissions', status: 'pending' },
    { name: 'Role Verification', description: 'Verifying user role for trip', status: 'pending' },
  ]);
  
  const [dataLoadingChecks, setDataLoadingChecks] = useState<StatusCheck[]>([
    { name: 'Trip Details', description: 'Loading basic trip data', status: 'pending' },
    { name: 'Itinerary Items', description: 'Loading trip itinerary', status: 'pending' },
    { name: 'Trip Members', description: 'Loading trip members', status: 'pending' },
    { name: 'Trip Tags', description: 'Loading trip tags', status: 'pending' },
  ]);
  
  // API response tracking
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpointStatus[]>([
    { endpoint: 'trips/{id}', status: 'not_tested' },
    { endpoint: 'trips/{id}/itinerary', status: 'not_tested' },
    { endpoint: 'trips/{id}/members', status: 'not_tested' },
  ]);
  
  // Trip data state
  const [tripData, setTripData] = useState<any>(null);
  const [itineraryData, setItineraryData] = useState<any>(null);
  const [membersData, setMembersData] = useState<any>(null);
  
  // Diagnostics state
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [sentryBreadcrumbs, setSentryBreadcrumbs] = useState<any[]>([]);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('auth');
  
  // State for copy button and request tracking
  const [isCopying, setIsCopying] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const activeRequestRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  // Handler for trip ID input change
  const handleTripIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTripId = e.target.value.trim();
    setTripId(newTripId);
    
    // Validate UUID format (simple validation)
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newTripId);
    setIsValidTripId(newTripId ? isValidUuid : null);
  };

  // Log messages
  const addErrorLog = useCallback((message: string) => {
    setErrorLogs(prev => [
      `[${new Date().toISOString()}] ${message}`,
      ...prev
    ]);
  }, []);

  // Add a Sentry breadcrumb
  const addBreadcrumb = useCallback((message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', data?: any) => {
    const breadcrumb = {
      message,
      category,
      level,
      timestamp: new Date().toISOString(),
      data
    };
    
    // Add to our local state
    setSentryBreadcrumbs(prev => [breadcrumb, ...prev]);
    
    // Actually add to Sentry if available
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data
    });
  }, []);

  // Abort any active requests
  const abortActiveRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortActiveRequests();
    };
  }, [abortActiveRequests]);

  // Fetch trip data from API with timeout and abort capabilities
  const fetchTripData = useCallback(async () => {
    // Validate input
    if (!tripId || !isValidTripId) {
      addErrorLog('Cannot fetch with invalid trip ID');
      return;
    }
    
    // Abort any ongoing requests
    abortActiveRequests();
    
    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Generate unique request ID
    const currentRequestId = Date.now().toString();
    setRequestId(currentRequestId);
    activeRequestRef.current = currentRequestId;
    
    // Set global request timeout
    const timeoutId = setTimeout(() => {
      if (activeRequestRef.current === currentRequestId) {
        abortActiveRequests();
        setIsLoading(false);
        setTripLoadStatus('error');
        setError('Request timed out after 30 seconds');
        addErrorLog('Request timeout after 30 seconds');
        addBreadcrumb('Request timeout', 'trip-debug', 'error', { tripId });
      }
    }, 30000); // 30-second timeout
    
    // Update state for loading
    setIsLoading(true);
    setTripLoadStatus('loading');
    setError(null);
    
    // Reset all checks to pending
    setAuthChecks(prev => prev.map(check => ({ ...check, status: 'pending', details: undefined })));
    setDataLoadingChecks(prev => prev.map(check => ({ ...check, status: 'pending', details: undefined })));
    
    // Reset API endpoints
    setApiEndpoints([
      { endpoint: `trips/${tripId}`, status: 'pending' },
      { endpoint: `trips/${tripId}/itinerary`, status: 'pending' },
      { endpoint: `trips/${tripId}/members`, status: 'pending' },
    ]);
    
    // Add breadcrumb for the process start
    addBreadcrumb('Started trip data load debug', 'trip-debug', 'info', { tripId, requestId: currentRequestId });
    
    // 1. Check authentication status
    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Failed to create Supabase client');
      }
      
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        setAuthChecks(prev => 
          prev.map(check => 
            check.name === 'Authentication' 
              ? { ...check, status: 'warning', details: 'No user session found' } 
              : check
          )
        );
        addErrorLog('No authenticated user found');
        addBreadcrumb('No user session', 'auth', 'warning');
      } else {
        // User is authenticated
        setUserDetails(supabaseUser);
        setAuthChecks(prev => 
          prev.map(check => 
            check.name === 'Authentication' 
              ? { ...check, status: 'success', details: `Authenticated as ${supabaseUser?.email ?? 'Unknown Email'}` } 
              : check
          )
        );
        addBreadcrumb('User authenticated', 'auth', 'info', { userId: supabaseUser?.id });

        // 2. Check trip access permissions
        try {
          const accessCheckStart = performance.now();
          
          // First check if the trip exists
          const tripExistsCheck = await fetch(`/api/trips/${tripId}/get-permissions`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          const accessCheckEnd = performance.now();
          const accessCheckDuration = accessCheckEnd - accessCheckStart;

          // Update the API endpoint status
          setApiEndpoints(prev => 
            prev.map(endpoint => 
              endpoint.endpoint === `trips/${tripId}/get-permissions` 
                ? { 
                    ...endpoint, 
                    status: tripExistsCheck.ok ? 'success' : 'error',
                    duration: accessCheckDuration,
                    code: tripExistsCheck.status,
                    error: !tripExistsCheck.ok ? `HTTP ${tripExistsCheck.status}` : undefined
                  } 
                : endpoint
            )
          );

          if (!tripExistsCheck.ok) {
            if (tripExistsCheck.status === 404) {
              // Trip not found
              setAuthChecks(prev => 
                prev.map(check => 
                  check.name === 'Trip Access' 
                    ? { ...check, status: 'error', details: 'Trip not found (404)' } 
                    : check
                )
              );
              setPermissionStatus({
                tripId,
                hasAccess: false,
                userId: supabaseUser?.id || undefined
              });
              addErrorLog(`Trip not found: ${tripId}`);
              addBreadcrumb('Trip not found', 'permissions', 'error', { tripId });
            } else if (tripExistsCheck.status === 403) {
              // Trip exists but user doesn't have access
              setAuthChecks(prev => 
                prev.map(check => 
                  check.name === 'Trip Access' 
                    ? { ...check, status: 'error', details: 'Access denied (403)' } 
                    : check
                )
              );
              setPermissionStatus({
                tripId,
                hasAccess: false,
                userId: supabaseUser?.id || undefined
              });
              addErrorLog(`Access denied to trip: ${tripId}`);
              addBreadcrumb('Access denied', 'permissions', 'error', { tripId });
            } else {
              // Other error
              setAuthChecks(prev => 
                prev.map(check => 
                  check.name === 'Trip Access' 
                    ? { ...check, status: 'error', details: `Error checking access: ${tripExistsCheck.status}` } 
                    : check
                )
              );
              addErrorLog(`Error checking trip access: HTTP ${tripExistsCheck.status}`);
              addBreadcrumb('Access check error', 'permissions', 'error', { status: tripExistsCheck.status });
            }
          } else {
            // Trip exists and user has access, check role
            const permissionsData = await tripExistsCheck.json();
            
            setPermissionStatus({
              tripId,
              hasAccess: true,
              role: permissionsData.role,
              userId: supabaseUser?.id || undefined
            });
            
            setAuthChecks(prev => 
              prev.map(check => {
                if (check.name === 'Trip Access') {
                  return { ...check, status: 'success', details: 'Access granted' };
                }
                if (check.name === 'Role Verification') {
                  return { 
                    ...check, 
                    status: 'success', 
                    details: `Role: ${permissionsData.role || 'viewer'}` 
                  };
                }
                return check;
              })
            );
            
            addBreadcrumb('Access granted', 'permissions', 'info', { 
              tripId, 
              role: permissionsData.role 
            });
          }
        } catch (accessError) {
          console.error('Error checking trip access:', accessError);
          setAuthChecks(prev => 
            prev.map(check => 
              check.name === 'Trip Access' 
                ? { ...check, status: 'error', details: `Error: ${accessError instanceof Error ? accessError.message : 'Unknown error'}` } 
                : check
            )
          );
          addErrorLog(`Error checking trip access: ${accessError instanceof Error ? accessError.message : 'Unknown error'}`);
          addBreadcrumb('Access check error', 'permissions', 'error', { error: accessError });
        }
      }
      
      // 3. Load trip data from each endpoint
      if (permissionStatus?.hasAccess || !permissionStatus) {
        await Promise.allSettled([
          fetchAndProcessEndpoint(`/api/trips/${tripId}`, 'Trip Details', 0),
          fetchAndProcessEndpoint(`/api/trips/${tripId}/itinerary`, 'Itinerary Items', 1),
          fetchAndProcessEndpoint(`/api/trips/${tripId}/members`, 'Trip Members', 2)
        ]);
      }
      
    } catch (error) {
      console.error('Error during trip debugging:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addErrorLog(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addBreadcrumb('Unexpected error', 'trip-debug', 'error', { error });
      
      // Set trip load status to error
      setTripLoadStatus('error');
    } finally {
      // Only update state if this is still the active request
      if (activeRequestRef.current === currentRequestId) {
        setIsLoading(false);
        
        // Clean up
        abortControllerRef.current = null;
        clearTimeout(timeoutId);
      }
    }
  }, [tripId, isValidTripId, addErrorLog, addBreadcrumb, abortActiveRequests]);

  // Helper function to fetch from a specific endpoint and process results
  const fetchAndProcessEndpoint = useCallback(async (
    url: string, 
    checkName: string, 
    endpointIndex: number
  ) => {
    // Skip if this is not the active request
    if (activeRequestRef.current !== requestId) {
      console.log(`[TripDebug] Skipping ${checkName} fetch - no longer active request`);
      return;
    }
    
    const endpointName = url.replace(`/api/`, '');
    const startTime = performance.now();
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      // Update status to pending
      setDataLoadingChecks(prev => 
        prev.map(check => 
          check.name === checkName 
            ? { ...check, status: 'pending', details: 'Fetching data...' } 
            : check
        )
      );
      
      // Create endpoint-specific timeout
      timeoutId = setTimeout(() => {
        if (activeRequestRef.current === requestId) {
          console.warn(`[TripDebug] Endpoint timeout: ${url}`);
          abortControllerRef.current?.abort();
          
          // Update endpoint status
          setApiEndpoints(prev => {
            const newEndpoints = [...prev];
            const index = newEndpoints.findIndex(e => e.endpoint === endpointName);
            if (index >= 0) {
              newEndpoints[index] = {
                ...newEndpoints[index],
                status: 'error',
                error: 'Endpoint request timed out after 10 seconds'
              };
            }
            return newEndpoints;
          });
          
          // Update check status
          setDataLoadingChecks(prev => 
            prev.map(check => 
              check.name === checkName 
                ? { ...check, status: 'error', details: 'Request timed out after 10 seconds' } 
                : check
            )
          );
        }
      }, 10000); // 10-second timeout per endpoint
      
      // Make the API request with signal
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current?.signal
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Parse the response data if successful
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { error: 'Failed to parse response JSON' };
      }
      
      // Update the API endpoint status
      setApiEndpoints(prev => {
        const newEndpoints = [...prev];
        newEndpoints[endpointIndex] = {
          endpoint: endpointName,
          status: response.ok ? 'success' : 'error',
          duration,
          response: responseData,
          code: response.status,
          error: !response.ok ? `HTTP ${response.status}` : undefined
        };
        return newEndpoints;
      });
      
      // Store the data in the appropriate state
      if (response.ok) {
        if (checkName === 'Trip Details') {
          setTripData(responseData);
        } else if (checkName === 'Itinerary Items') {
          setItineraryData(responseData);
        } else if (checkName === 'Trip Members') {
          setMembersData(responseData);
        }
        
        // Update the check status
        setDataLoadingChecks(prev => 
          prev.map(check => 
            check.name === checkName 
              ? { 
                  ...check, 
                  status: 'success', 
                  details: `Loaded successfully (${(duration / 1000).toFixed(2)}s)` 
                } 
              : check
          )
        );
        
        addBreadcrumb(`${checkName} loaded`, 'trip-data', 'info', { 
          duration,
          status: response.status
        });
      } else {
        // Update the check status with error
        setDataLoadingChecks(prev => 
          prev.map(check => 
            check.name === checkName 
              ? { 
                  ...check, 
                  status: 'error', 
                  details: `Failed: HTTP ${response.status} (${(duration / 1000).toFixed(2)}s)` 
                } 
              : check
          )
        );
        
        addErrorLog(`Error loading ${checkName}: HTTP ${response.status}`);
        addBreadcrumb(`Error loading ${checkName}`, 'trip-data', 'error', { 
          status: response.status,
          duration,
          data: responseData
        });
      }
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`Error fetching ${checkName}:`, error);
      
      // Update the API endpoint status
      setApiEndpoints(prev => {
        const newEndpoints = [...prev];
        newEndpoints[endpointIndex] = {
          endpoint: endpointName,
          status: 'error',
          duration,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        return newEndpoints;
      });
      
      // Update the check status
      setDataLoadingChecks(prev => 
        prev.map(check => 
          check.name === checkName 
            ? { 
                ...check, 
                status: 'error', 
                details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
              } 
            : check
        )
      );
      
      addErrorLog(`Error fetching ${checkName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addBreadcrumb(`Error fetching ${checkName}`, 'trip-data', 'error', { error });
    } finally {
      // Clear the endpoint-specific timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }, [addErrorLog, addBreadcrumb, requestId, abortControllerRef]);

  // Handle running all checks
  const handleRunChecks = useCallback(() => {
    if (!tripId || !isValidTripId) {
      setError('Please enter a valid trip ID');
      return;
    }
    
    // Reset state
    setTripData(null);
    setItineraryData(null);
    setMembersData(null);
    setPermissionStatus(null);
    setErrorLogs([]);
    
    // Start the fetch process
    fetchTripData();
  }, [tripId, isValidTripId, fetchTripData]);
  
  // Determine overall trip load status based on checks
  useEffect(() => {
    if (isLoading) {
      setTripLoadStatus('loading');
      return;
    }
    
    // Check if any checks failed
    const authFailed = authChecks.some(check => check.status === 'error');
    const dataFailed = dataLoadingChecks.some(check => check.status === 'error');
    
    if (authFailed || dataFailed) {
      setTripLoadStatus('error');
    } else if (
      authChecks.some(check => check.status === 'success') &&
      dataLoadingChecks.some(check => check.status === 'success')
    ) {
      setTripLoadStatus('success');
    } else if (tripLoadStatus === 'loading') {
      // Keep loading status if it was set elsewhere
    } else {
      setTripLoadStatus('not_loaded');
    }
  }, [authChecks, dataLoadingChecks, isLoading, tripLoadStatus]);

  // Force clear all data and reset the state
  const handleClearData = useCallback(() => {
    // Abort any ongoing requests
    abortActiveRequests();
    
    // Reset all state
    setTripData(null);
    setItineraryData(null);
    setMembersData(null);
    setPermissionStatus(null);
    setError(null);
    setTripLoadStatus('not_loaded');
    setAuthChecks(prev => prev.map(check => ({ ...check, status: 'pending', details: undefined })));
    setDataLoadingChecks(prev => prev.map(check => ({ ...check, status: 'pending', details: undefined })));
    setApiEndpoints([
      { endpoint: 'trips/{id}', status: 'not_tested' },
      { endpoint: 'trips/{id}/itinerary', status: 'not_tested' },
      { endpoint: 'trips/{id}/members', status: 'not_tested' },
    ]);
    
    // Clear request IDs
    setRequestId('');
    activeRequestRef.current = '';
    
    // Add breadcrumb
    addBreadcrumb('Debug data cleared', 'trip-debug', 'info');
    
    toast({
      title: "Data cleared",
      description: "All trip data and logs have been cleared.",
      variant: "default"
    });
  }, [abortActiveRequests, addBreadcrumb, toast]);

  // Function to gather all debug data into a single object for copying
  const gatherDebugData = useCallback(() => {
    // Build complete debug data object
    const debugData = {
      timestamp: new Date().toISOString(),
      trip_id: tripId || null,
      trip_load_status: tripLoadStatus,
      authentication: {
        is_authenticated: !!userDetails,
        user_id: userDetails?.id || null,
        email: userDetails?.email || null,
        checks: authChecks
      },
      permissions: permissionStatus || null,
      data_loading: {
        checks: dataLoadingChecks,
        trip_data: tripData ? {
          id: tripData.id,
          name: tripData.name,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          privacy_setting: tripData.privacy_setting,
          destination: tripData.destination?.name || null,
          tags: tripData.tags || []
        } : null,
        itinerary_data: itineraryData ? {
          sections_count: Array.isArray(itineraryData.sections) ? itineraryData.sections.length : 0,
          items_count: Array.isArray(itineraryData.items) ? itineraryData.items.length : 0
        } : null,
        members_data: {
          count: Array.isArray(membersData) ? membersData.length : 0,
          roles: Array.isArray(membersData) ? 
            membersData.map(m => ({ 
              user_id: m.user_id, 
              role: m.role, 
              name: m.profile?.name || null 
            })) : []
        }
      },
      api_endpoints: apiEndpoints,
      error_logs: errorLogs,
      breadcrumbs: sentryBreadcrumbs
    };

    return debugData;
  }, [
    tripId, 
    tripLoadStatus, 
    userDetails, 
    authChecks, 
    permissionStatus, 
    dataLoadingChecks, 
    tripData, 
    itineraryData, 
    membersData, 
    apiEndpoints, 
    errorLogs, 
    sentryBreadcrumbs
  ]);

  const handleCopyDebugData = async () => {
    try {
      setIsCopying(true);
      
      // Gather all debug data
      const debugData = gatherDebugData();
      
      // Format as pretty JSON with 2-space indentation
      const debugJson = JSON.stringify(debugData, null, 2);
      
      // Copy to clipboard using Clipboard API
      await navigator.clipboard.writeText(debugJson);
      
      // Add breadcrumb
      addBreadcrumb('Debug data copied to clipboard', 'trip-debug', 'info');
      
      // Show success toast
      toast({
        title: "Debug data copied!",
        description: "All debugging information has been copied to your clipboard.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error copying debug data:', error);
      
      // Show error toast
      toast({
        title: "Failed to copy debug data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      
      // Add error to logs
      addErrorLog(`Failed to copy debug data: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsCopying(false);
    }
  };

  // Helper function to render status checks in a consistent way
  const renderStatusChecks = (checks: StatusCheck[]) => {
    return checks.map(check => (
      <div key={check.name} className="flex flex-col gap-1 py-2 border-b border-gray-100 last:border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {check.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {check.status === 'warning' && <AlertCircle className="h-4 w-4 text-amber-500" />}
            {check.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
            {check.status === 'pending' && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
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

  // Render the API response data in a readable format
  const renderApiResponseJson = (data: any) => {
    return (
      <pre className="p-4 bg-gray-50 rounded-md text-xs overflow-auto max-h-96">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trip Diagnostics</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyDebugData}
            disabled={isCopying || tripLoadStatus === 'not_loaded'}
            className="flex items-center gap-2"
          >
            {isCopying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Copying...</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Debug Data</span>
              </>
            )}
          </Button>
          <Badge variant={
            tripLoadStatus === 'success' ? 'secondary' :
            tripLoadStatus === 'error' ? 'destructive' :
            tripLoadStatus === 'loading' ? 'secondary' : 'outline'
          }>
            {tripLoadStatus === 'not_loaded' && 'Not Loaded'}
            {tripLoadStatus === 'loading' && 'Loading...'}
            {tripLoadStatus === 'success' && 'Success'}
            {tripLoadStatus === 'error' && 'Error'}
          </Badge>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        {/* Trip ID Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>
              Enter a Trip ID to diagnose data loading issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="tripId">Trip ID</Label>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input 
                      id="tripId"
                      placeholder="Enter trip UUID" 
                      value={tripId} 
                      onChange={handleTripIdChange}
                      className={
                        isValidTripId === false 
                          ? 'border-red-500 focus:ring-red-500' 
                          : isValidTripId === true 
                          ? 'border-green-500 focus:ring-green-500' 
                          : ''
                      }
                    />
                    <Button 
                      onClick={handleRunChecks} 
                      disabled={!isValidTripId || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleClearData}
                      disabled={isLoading}
                    >
                      Clear
                    </Button>
                  </div>
                  {isValidTripId === false && (
                    <p className="text-sm text-red-500 mt-1">Please enter a valid UUID format</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="auth">Authentication & Access</TabsTrigger>
            <TabsTrigger value="data">Trip Data</TabsTrigger>
            <TabsTrigger value="api">API Responses</TabsTrigger>
            <TabsTrigger value="logs">Error Logs</TabsTrigger>
          </TabsList>

          {/* Authentication & Access Tab */}
          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Authentication & Permissions</CardTitle>
                  <div className="flex items-center gap-2">
                    {userDetails ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        Authenticated
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Not Authenticated
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Verify authentication status and trip access permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderStatusChecks(authChecks)}

                {permissionStatus && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-2">Permission Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">User ID:</span>
                        <span className="font-mono">{permissionStatus.userId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trip ID:</span>
                        <span className="font-mono">{permissionStatus.tripId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Has Access:</span>
                        <span>{permissionStatus.hasAccess ? 'Yes' : 'No'}</span>
                      </div>
                      {permissionStatus.role && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Role:</span>
                          <Badge variant="outline">{permissionStatus.role}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trip Data Tab */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Trip Data Loading</CardTitle>
                  {tripData && (
                    <Badge variant="outline">
                      {tripData.name || tripData.id || 'Trip Loaded'}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Check trip data loading status from all required endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderStatusChecks(dataLoadingChecks)}

                {tripData && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-2">Trip Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span>{tripData.name || 'Unnamed Trip'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date Range:</span>
                        <span>
                          {tripData.start_date ? new Date(tripData.start_date).toLocaleDateString() : 'Not set'} 
                          {tripData.end_date ? ` - ${new Date(tripData.end_date).toLocaleDateString()}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Privacy Setting:</span>
                        <Badge variant="outline">
                          {tripData.privacy_setting || 'private'}
                        </Badge>
                      </div>
                      {/* Destination information */}
                      {tripData.destination && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Destination:</span>
                          <span>{tripData.destination.name || 'Unknown'}</span>
                        </div>
                      )}
                      {/* Member count */}
                      {membersData && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Member Count:</span>
                          <span>{Array.isArray(membersData) ? membersData.length : 0}</span>
                        </div>
                      )}
                      {/* Tags information */}
                      {tripData.tags && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tags:</span>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {tripData.tags.length > 0 ? 
                              tripData.tags.map((tag: any, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag.name || tag}
                                </Badge>
                              )) 
                              : 
                              <span className="text-gray-400">No tags</span>
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Itinerary information */}
                {itineraryData && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-2">Itinerary Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Sections:</span>
                        <span>{itineraryData.sections?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Items:</span>
                        <span>{itineraryData.items?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Members information */}
                {membersData && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-2">Members Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Members:</span>
                        <span>{Array.isArray(membersData) ? membersData.length : 0}</span>
                      </div>
                      {membersData.length > 0 && (
                        <div className="flex flex-col mt-2">
                          <span className="text-gray-500 mb-2">Member Roles:</span>
                          <ul className="list-disc pl-5 space-y-1">
                            {membersData.map((member: any, index: number) => (
                              <li key={index} className="text-xs">
                                {member.profile?.name || member.user_id} - <Badge variant="outline" className="text-xs">{member.role}</Badge>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Responses Tab */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Response Inspection</CardTitle>
                <CardDescription>
                  Examine raw API responses from trip-related endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {apiEndpoints.map((endpoint, index) => (
                    <AccordionItem key={index} value={`endpoint-${index}`}>
                      <AccordionTrigger className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <span>{endpoint.endpoint}</span>
                          {endpoint.status === 'success' && <Badge variant="secondary">Success</Badge>}
                          {endpoint.status === 'error' && <Badge variant="destructive">Error {endpoint.code}</Badge>}
                          {endpoint.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                          {endpoint.status === 'not_tested' && <Badge variant="outline">Not Tested</Badge>}
                        </div>
                        {endpoint.duration && (
                          <span className="text-xs text-gray-500">
                            {(endpoint.duration / 1000).toFixed(2)}s
                          </span>
                        )}
                      </AccordionTrigger>
                      <AccordionContent>
                        {endpoint.status === 'error' && endpoint.error && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{endpoint.error}</AlertDescription>
                          </Alert>
                        )}
                        {endpoint.response ? (
                          renderApiResponseJson(endpoint.response)
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                            No response data available
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Error Logs & Diagnostics</CardTitle>
                  <Badge variant="outline">{errorLogs.length} Entries</Badge>
                </div>
                <CardDescription>
                  Review error logs and diagnostic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  {/* Error Logs Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Error Logs</h3>
                    <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
                      {errorLogs.length > 0 ? (
                        <ul className="space-y-1 font-mono text-xs">
                          {errorLogs.map((log, index) => (
                            <li key={index} className="text-red-600">{log}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          No error logs recorded
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Breadcrumbs Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sentry Breadcrumbs</h3>
                    <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
                      {sentryBreadcrumbs.length > 0 ? (
                        <ul className="space-y-2">
                          {sentryBreadcrumbs.map((crumb, index) => (
                            <li key={index} className="border-b border-gray-200 pb-2 last:border-0 text-xs">
                              <div className="flex items-center gap-2">
                                {crumb.level === 'info' && <Info className="h-3 w-3 text-blue-500" />}
                                {crumb.level === 'warning' && <AlertCircle className="h-3 w-3 text-amber-500" />}
                                {crumb.level === 'error' && <AlertCircle className="h-3 w-3 text-red-500" />}
                                <span className="font-medium">{crumb.message}</span>
                                <Badge variant="outline" className="text-xs">{crumb.category}</Badge>
                                <span className="text-gray-500 text-[10px]">{new Date(crumb.timestamp).toLocaleTimeString()}</span>
                              </div>
                              {crumb.data && (
                                <pre className="ml-5 mt-1 text-[10px] text-gray-600 overflow-x-auto">
                                  {JSON.stringify(crumb.data, null, 2)}
                                </pre>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          No breadcrumbs recorded
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Debugging Actions */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Debugging Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setErrorLogs([]);
                          setSentryBreadcrumbs([]);
                          addBreadcrumb('Cleared logs', 'trip-debug', 'info');
                        }} 
                        size="sm"
                      >
                        Clear Logs
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          // Check if Sentry is available before using it
                          if (typeof window !== 'undefined' && Sentry) {
                            Sentry.captureMessage('Manual test event from Trip Debug Tool', {
                              level: 'debug',
                              tags: { source: 'trip_debug_tool', tripId: tripId || 'none' }
                            });
                            addBreadcrumb('Sent test event to Sentry', 'trip-debug', 'info');
                          } else {
                            addErrorLog('Sentry is not available in this environment');
                          }
                        }} 
                        size="sm"
                      >
                        Send Test Event
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          localStorage.removeItem(`trip-cache-${tripId}`);
                          addBreadcrumb('Cleared local storage cache', 'trip-debug', 'info');
                        }} 
                        size="sm"
                        disabled={!tripId}
                      >
                        Clear Cache
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (tripId) {
                            window.open(`/trips/${tripId}`, '_blank');
                          }
                        }} 
                        size="sm"
                        disabled={!tripId}
                      >
                        Open Trip Page
                      </Button>
                      
                      <Button 
                        variant="secondary" 
                        onClick={handleCopyDebugData}
                        disabled={isCopying}
                        size="sm"
                      >
                        {isCopying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Copying...
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy All Debug Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
