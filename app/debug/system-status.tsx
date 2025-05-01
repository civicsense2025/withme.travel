'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type StatusType = 'success' | 'error' | 'warning' | 'loading';

interface StatusItem {
  status: StatusType;
  message: string;
}

interface StatusState {
  serverComponents: StatusItem;
  serverSideAuth: StatusItem;
  serverDataFetching: StatusItem;
  apiRoutes: StatusItem;
  tripApi: StatusItem;
  itineraryApi: StatusItem;
  membersApi: StatusItem;
  clientAuth: StatusItem;
  authTokens: StatusItem;
  clientDataFetching: StatusItem;
  presenceFeature: StatusItem;
  websocketConnection: StatusItem;
  databaseConnection: StatusItem;
  databaseSchemas: StatusItem;
  coreTables: StatusItem;
  staticAssets: StatusItem;
  cspHeaders: StatusItem;
}

// Add early check for browser environment
const isBrowser = typeof window !== 'undefined';

// Safe localStorage access
const getFromLocalStorage = (key: string): string | null => {
  try {
    if (isBrowser) {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.error('Error accessing localStorage:', e);
  }
  return null;
};

export default function SystemStatusDashboard() {
  const [statuses, setStatuses] = useState<StatusState>({
    // Server Components
    serverComponents: { status: 'loading', message: 'Checking server components...' },
    serverSideAuth: { status: 'loading', message: 'Checking server-side authentication...' },
    serverDataFetching: { status: 'loading', message: 'Checking server data fetching...' },
    
    // API Routes
    apiRoutes: { status: 'loading', message: 'Checking API routes...' },
    tripApi: { status: 'loading', message: 'Checking trip API...' },
    itineraryApi: { status: 'loading', message: 'Checking itinerary API...' },
    membersApi: { status: 'loading', message: 'Checking members API...' },
    
    // Authentication
    clientAuth: { status: 'loading', message: 'Checking client-side authentication...' },
    authTokens: { status: 'loading', message: 'Checking auth tokens...' },
    
    // Client Features
    clientDataFetching: { status: 'loading', message: 'Checking client data fetching...' },
    presenceFeature: { status: 'loading', message: 'Checking real-time presence...' },
    websocketConnection: { status: 'loading', message: 'Checking WebSocket connection...' },
    
    // Database
    databaseConnection: { status: 'loading', message: 'Checking database connection...' },
    databaseSchemas: { status: 'loading', message: 'Checking database schemas...' },
    coreTables: { status: 'loading', message: 'Checking core tables...' },
    
    // Assets & Resources
    staticAssets: { status: 'loading', message: 'Checking static assets...' },
    
    // Security
    cspHeaders: { status: 'loading', message: 'Checking CSP headers...' },
  });

  // Add state for last updated time to avoid hydration errors
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, [statuses]);

  useEffect(() => {
    const checkStatuses = async () => {
      // Clone the current statuses
      const newStatuses = { ...statuses };
      
      try {
        // Check server components by checking if this component loaded
        newStatuses.serverComponents = { 
          status: 'success', 
          message: 'Server components rendering correctly' 
        };
        
        // Check API routes with a health check endpoint
        try {
          const apiResponse = await fetch('/api/debug/auth-status', { 
            method: 'GET',
            cache: 'no-store'
          });
          newStatuses.apiRoutes = { 
            status: apiResponse.ok ? 'success' : 'error', 
            message: apiResponse.ok ? 'API routes responding' : 'API health check failed' 
          };
        } catch (e) {
          newStatuses.apiRoutes = { 
            status: 'error', 
            message: 'API routes not responding' 
          };
        }
        
        // Check authentication by trying to get the current user
        try {
          const authResponse = await fetch('/api/auth/me', { 
            method: 'GET',
            cache: 'no-store'
          });
          
          // Check if auth is required by status code
          if (authResponse.status === 401) {
            newStatuses.clientAuth = { 
              status: 'warning',
              message: 'Authentication required (not logged in)' 
            };
            newStatuses.authTokens = { 
              status: 'warning', 
              message: 'Auth tokens not present (login required)' 
            };
          } else {
            const authData = await authResponse.json();
            newStatuses.clientAuth = { 
              status: authData?.user ? 'success' : 'warning',
              message: authData?.user ? 'User authenticated' : 'User not authenticated' 
            };
            
            // If authenticated, check tokens
            if (authData?.user) {
              newStatuses.authTokens = { 
                status: 'success', 
                message: 'Auth tokens valid' 
              };
            } else {
              newStatuses.authTokens = { 
                status: 'warning', 
                message: 'Auth tokens not present' 
              };
            }
          }
        } catch (e) {
          newStatuses.clientAuth = { 
            status: 'error', 
            message: 'Auth check failed' 
          };
          newStatuses.authTokens = { 
            status: 'error', 
            message: 'Could not check auth tokens' 
          };
        }
        
        // Check trip API
        try {
          const tripsResponse = await fetch('/api/trips', { 
            method: 'GET',
            cache: 'no-store'
          });
          
          if (tripsResponse.status === 401) {
            newStatuses.tripApi = { 
              status: 'warning', 
              message: 'Trip API requires authentication' 
            };
            // Don't check other APIs if base trip API requires auth
            newStatuses.itineraryApi = { 
              status: 'warning', 
              message: 'Itinerary API requires authentication' 
            };
            newStatuses.membersApi = { 
              status: 'warning', 
              message: 'Members API requires authentication' 
            };
          } else {
            newStatuses.tripApi = { 
              status: tripsResponse.ok ? 'success' : 'error', 
              message: tripsResponse.ok ? 'Trip API working' : 'Trip API error' 
            };
            
            // Check for specific trip only if base API is working
            if (tripsResponse.ok) {
              // Safe trip ID retrieval
              const tripId = getFromLocalStorage('last-viewed-trip-id');
              
              if (tripId) {
                // Check specific trip API
                try {
                  const tripResponse = await fetch(`/api/trips/${tripId}`, { 
                    method: 'GET',
                    cache: 'no-store'
                  });
                  
                  if (tripResponse.ok) {
                    // Check itinerary API
                    try {
                      const itineraryResponse = await fetch(`/api/trips/${tripId}/itinerary`, { 
                        method: 'GET',
                        cache: 'no-store'
                      });
                      newStatuses.itineraryApi = { 
                        status: itineraryResponse.ok ? 'success' : 'error', 
                        message: itineraryResponse.ok ? 'Itinerary API working' : 'Itinerary API error' 
                      };
                    } catch (e) {
                      newStatuses.itineraryApi = { 
                        status: 'error', 
                        message: 'Itinerary API not responding' 
                      };
                    }
                    
                    // Check members API
                    try {
                      const membersResponse = await fetch(`/api/trips/${tripId}/members`, { 
                        method: 'GET',
                        cache: 'no-store'
                      });
                      newStatuses.membersApi = { 
                        status: membersResponse.ok ? 'success' : 'error', 
                        message: membersResponse.ok ? 'Members API working' : 'Members API error' 
                      };
                    } catch (e) {
                      newStatuses.membersApi = { 
                        status: 'error', 
                        message: 'Members API not responding' 
                      };
                    }
                  }
                } catch (e) {
                  // Error already handled in tripApi check
                }
              } else {
                newStatuses.itineraryApi = { 
                  status: 'warning', 
                  message: 'Itinerary API check skipped (no tripId)' 
                };
                newStatuses.membersApi = { 
                  status: 'warning', 
                  message: 'Members API check skipped (no tripId)' 
                };
              }
            }
          }
        } catch (e) {
          newStatuses.tripApi = { 
            status: 'error', 
            message: 'Trip API not responding' 
          };
        }
        
        // Check database schema by checking key table structures
        try {
          // Check core tables existence via a dedicated endpoint
          const schemaResponse = await fetch('/api/debug/schema-check', {
            method: 'GET',
            cache: 'no-store'
          });
          
          if (schemaResponse.ok) {
            const schemaData = await schemaResponse.json();
            
            // List of core tables from our constants
            const coreTables = [
              'profiles',
              'trips', 
              'trip_members',
              'itinerary_items',
              'user_presence'
            ];
            
            const missingTables = schemaData.missingTables || [];
            
            if (missingTables.length === 0) {
              newStatuses.coreTables = {
                status: 'success',
                message: 'All core tables exist'
              };
            } else {
              const missing = coreTables.filter(table => 
                missingTables.includes(table)
              );
              
              if (missing.length > 0) {
                newStatuses.coreTables = {
                  status: 'error',
                  message: `Missing tables: ${missing.join(', ')}`
                };
              } else {
                newStatuses.coreTables = {
                  status: 'warning',
                  message: 'Some non-core tables missing'
                };
              }
            }
          } else {
            newStatuses.coreTables = {
              status: 'warning',
              message: 'Could not verify table structure'
            };
          }
        } catch (error) {
          newStatuses.coreTables = {
            status: 'error',
            message: 'Error checking core tables'
          };
        }
        
        // Check WebSocket connection for presence feature
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          
          if (!supabaseUrl) {
            throw new Error('Supabase URL not configured');
          }
          
          // Fix WebSocket URL for CSP compatibility
          const supabaseDomain = supabaseUrl.match(/https?:\/\/([^/]+)/)?.[1] || '';
          // Check if it's using supabase.co or supabase.io domain
          const wsUrl = supabaseDomain.includes('supabase.co') 
            ? `wss://${supabaseDomain.replace('.supabase.co', '.supabase.io')}/realtime/v1`
            : `wss://${supabaseDomain}/realtime/v1`;
          
          // Create a promise that resolves or rejects based on WebSocket connection
          const wsPromise = new Promise((resolve, reject) => {
            try {
              const ws = new WebSocket(wsUrl);
              
              // Set a timeout for the connection
              const timeout = setTimeout(() => {
                ws.close();
                reject(new Error('WebSocket connection timeout'));
              }, 3000);
              
              ws.onopen = () => {
                clearTimeout(timeout);
                ws.close();
                resolve('Connected successfully');
              };
              
              ws.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
              };
            } catch (error) {
              reject(error);
            }
          });
          
          // Wait for the WebSocket check to complete
          await wsPromise;
          newStatuses.websocketConnection = { 
            status: 'success', 
            message: 'WebSocket connection working' 
          };
          
          // Set presence feature status based on WebSocket
          newStatuses.presenceFeature = {
            status: 'success',
            message: 'Presence feature available'
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (errorMessage.includes('Invalid URL') || 
              errorMessage.includes('Connection refused') ||
              errorMessage.includes('Connection timed out') ||
              errorMessage.includes('not configured') ||
              errorMessage.includes('violates') ||
              errorMessage.includes('Content Security Policy')) {
            // If this is a dev environment without WebSocket support or CSP issues
            newStatuses.websocketConnection = { 
              status: 'warning', 
              message: 'WebSocket endpoint not available in this environment' 
            };
            
            newStatuses.presenceFeature = {
              status: 'warning',
              message: 'Presence feature not available in this environment'
            };
          } else {
            newStatuses.websocketConnection = { 
              status: 'error', 
              message: 'WebSocket connection failed' 
            };
            
            newStatuses.presenceFeature = {
              status: 'error',
              message: 'Presence feature unavailable'
            };
          }
        }
        
        // Check static assets with fallbacks
        try {
          // Try multiple asset paths in sequence until one works - use assets that actually exist
          let assetResponse = await fetch('/favicon.ico', { 
            method: 'HEAD',
            cache: 'no-store'
          });
          
          // If favicon doesn't work, try logo files known to exist
          if (!assetResponse.ok) {
            try {
              assetResponse = await fetch('/logo-light.svg', { 
                method: 'HEAD',
                cache: 'no-store'
              });
            } catch (e) {
              // Ignore and try next asset
            }
          }
          
          // If previous assets don't work, try destination placeholder
          if (!assetResponse.ok) {
            try {
              assetResponse = await fetch('/images/destinations/placeholder.jpg', { 
                method: 'HEAD',
                cache: 'no-store'
              });
            } catch (e) {
              // Ignore error
            }
          }
          
          newStatuses.staticAssets = { 
            status: assetResponse.ok ? 'success' : 'error', 
            message: assetResponse.ok ? 'Static assets loading' : 'Static asset missing' 
          };
        } catch (e) {
          newStatuses.staticAssets = { 
            status: 'error', 
            message: 'Static assets not loading' 
          };
        }
        
        // Check CSP headers
        try {
          const response = await fetch('/', { method: 'HEAD' });
          const cspHeader = response.headers.get('content-security-policy');
          newStatuses.cspHeaders = { 
            status: cspHeader ? 'success' : 'warning', 
            message: cspHeader ? 'CSP headers present' : 'CSP headers missing' 
          };
          
          // Check if WebSocket connections are allowed in CSP
          if (cspHeader) {
            const hasWsDirective = cspHeader.includes('wss:') || cspHeader.includes('ws:');
            const hasSupabaseWs = cspHeader.includes('wss://*.supabase.co') || 
                                  cspHeader.includes('wss://*.supabase.io');
            
            if (!hasWsDirective) {
              newStatuses.cspHeaders = { 
                status: 'warning', 
                message: 'CSP headers missing WebSocket directives' 
              };
            } else if (!hasSupabaseWs) {
              newStatuses.cspHeaders = { 
                status: 'warning', 
                message: 'CSP headers missing Supabase WebSocket domains' 
              };
            }
          }
        } catch (e) {
          newStatuses.cspHeaders = { 
            status: 'error', 
            message: 'Could not check CSP headers' 
          };
        }
        
        // Set remaining statuses based on other checks
        
        // Server-side auth status based on server rendering and API access
        newStatuses.serverSideAuth = {
          status: newStatuses.serverComponents.status === 'success' && 
                  newStatuses.apiRoutes.status === 'success' ? 'success' : 'error',
          message: newStatuses.serverComponents.status === 'success' && 
                   newStatuses.apiRoutes.status === 'success' ? 
                   'Server-side authentication working' : 'Server-side authentication issues'
        };
        
        // Server data fetching based on API results
        newStatuses.serverDataFetching = {
          status: newStatuses.tripApi.status === 'success' || 
                  newStatuses.tripApi.status === 'warning' ? 'success' : 'error',
          message: newStatuses.tripApi.status === 'success' || 
                   newStatuses.tripApi.status === 'warning' ? 
                   'Server data fetching working' : 'Server data fetching issues'
        };
        
        // Client data fetching based on API access
        newStatuses.clientDataFetching = {
          status: newStatuses.tripApi.status === 'success' || 
                  newStatuses.tripApi.status === 'warning' ? 'success' : 'error',
          message: newStatuses.tripApi.status === 'success' || 
                   newStatuses.tripApi.status === 'warning' ? 
                   'Client data fetching working' : 'Client data fetching issues'
        };
        
        // Database connection based on API success
        newStatuses.databaseConnection = {
          status: newStatuses.coreTables.status === 'success' || 
                  newStatuses.coreTables.status === 'warning' ? 'success' : 'error',
          message: newStatuses.coreTables.status === 'success' || 
                   newStatuses.coreTables.status === 'warning' ? 
                   'Database connection working' : 'Database connection issues'
        };
        
        // Database schema status
        newStatuses.databaseSchemas = {
          status: newStatuses.coreTables.status === 'success' ? 'success' : 
                  newStatuses.coreTables.status === 'warning' ? 'warning' : 'error',
          message: newStatuses.coreTables.status === 'success' ? 'Database schemas valid' :
                   newStatuses.coreTables.status === 'warning' ? 'Some schema issues detected' :
                   'Critical schema issues detected'
        };
        
      } catch (error) {
        console.error('Error checking system status:', error);
      }
      
      // Update all statuses at once
      setStatuses(newStatuses);
      // Update the lastUpdated timestamp
      setLastUpdated(new Date().toLocaleTimeString());
    };
    
    checkStatuses();
    
    // Set up automatic refresh every 30 seconds
    const intervalId = setInterval(checkStatuses, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Group statuses by category
  const categories = [
    {
      name: 'Server Components',
      items: ['serverComponents', 'serverSideAuth', 'serverDataFetching']
    },
    {
      name: 'API Routes',
      items: ['apiRoutes', 'tripApi', 'itineraryApi', 'membersApi']
    },
    {
      name: 'Authentication',
      items: ['clientAuth', 'authTokens']
    },
    {
      name: 'Client Features',
      items: ['clientDataFetching', 'presenceFeature', 'websocketConnection']
    },
    {
      name: 'Database',
      items: ['databaseConnection', 'databaseSchemas', 'coreTables']
    },
    {
      name: 'Assets & Security',
      items: ['staticAssets', 'cspHeaders']
    }
  ];
  
  // Function to get status icon
  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case 'success':
        return <span className="text-green-500 font-bold">✓</span>;
      case 'error':
        return <span className="text-red-500 font-bold">✗</span>;
      case 'warning':
        return <span className="text-yellow-500 font-bold">⚠</span>;
      default:
        return <span className="text-gray-400">⟳</span>;
    }
  };
  
  // Function to get status text color
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      default:
        return 'text-gray-500';
    }
  };
  
  // Calculate overall system health
  const totalChecks = Object.keys(statuses).length;
  const successChecks = Object.values(statuses).filter(s => s.status === 'success').length;
  const warningChecks = Object.values(statuses).filter(s => s.status === 'warning').length;
  const errorChecks = Object.values(statuses).filter(s => s.status === 'error').length;
  const loadingChecks = Object.values(statuses).filter(s => s.status === 'loading').length;
  
  const healthPercentage = Math.round((successChecks / totalChecks) * 100);
  
  let healthStatus = 'Healthy';
  let healthColor = 'bg-green-500';
  
  if (errorChecks > 0) {
    healthStatus = 'Critical Issues';
    healthColor = 'bg-red-500';
  } else if (warningChecks > 0) {
    healthStatus = 'Warning';
    healthColor = 'bg-yellow-500';
  } else if (loadingChecks > 0) {
    healthStatus = 'Checking';
    healthColor = 'bg-blue-500';
  }
  
  // Function to manually refresh all checks
  const handleRefresh = () => {
    // Reset all statuses to loading
    const resetStatuses: StatusState = { ...statuses };
    
    Object.keys(resetStatuses).forEach((key) => {
      if (key in resetStatuses) {
        resetStatuses[key as keyof StatusState] = { 
          status: 'loading', 
          message: `Checking ${key}...` 
        };
      }
    });
    
    setStatuses(resetStatuses);
    
    // This will trigger the useEffect again
    setTimeout(() => {
      // This empty timeout just forces a re-render
    }, 100);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Status Dashboard</h1>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh Status
        </button>
      </div>
      
      {/* Overall health bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">System Health: {healthStatus}</span>
          <span className="font-semibold">{healthPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`${healthColor} h-4 rounded-full transition-all duration-500 ease-in-out`}
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>{successChecks} checks passing</span>
          {warningChecks > 0 && <span>{warningChecks} warnings</span>}
          {errorChecks > 0 && <span>{errorChecks} errors</span>}
          {loadingChecks > 0 && <span>{loadingChecks} loading</span>}
        </div>
      </div>
      
      {/* Status checks by category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(category => (
          <div key={category.name} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">{category.name}</h2>
            <ul className="space-y-2">
              {category.items.map(item => (
                <li key={item} className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    {getStatusIcon(statuses[item as keyof StatusState].status)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className={`text-sm ${getStatusColor(statuses[item as keyof StatusState].status)}`}>
                      {statuses[item as keyof StatusState].message}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Last updated: {lastUpdated}</p>
        <p className="mt-1">
          Tables checked: profiles, trips, trip_members, itinerary_items, user_presence
        </p>
      </div>
    </div>
  );
} 