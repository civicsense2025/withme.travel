'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { StateInspector } from '@/components/debug';
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clientGuestUtils } from '@/utils/guest';

// Extend Navigator interface to include non-standard properties
interface ExtendedNavigator extends Navigator {
  deviceMemory?: number;
  pdfViewerEnabled: boolean;
}

// Extend Performance interface to include non-standard properties
interface ExtendedPerformance extends Performance {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

interface SystemInfo {
  nextjs: {
    version: string;
    runtime: string;
    isDev: boolean;
    isProduction: boolean;
    mode: string;
  };
  environment: {
    nodeEnv: string;
    vercelEnv: string;
    basePath: string;
    isVercel: boolean;
  };
  build: {
    buildId: string;
    buildTime: string;
    gitCommit: string;
  };
  runtime: {
    memory: Record<string, unknown>;
    heap: Record<string, unknown>;
    performance: Record<string, unknown>;
    navigator: Record<string, unknown>;
    screen: Record<string, unknown>;
  };
  features: {
    supabase: boolean;
    mapbox: boolean;
    analytics: boolean;
    notifications: boolean;
    guestMode: boolean;
  };
  auth: {
    session: boolean;
    guestToken: boolean;
    guestInfo: any;
  };
  publicVars: Record<string, string>;
}

interface ApiStatus {
  [key: string]: {
    status: string;
    statusCode?: number;
    latency: number | null;
    error?: string;
    data?: any;
  };
}

export default function SystemStatusPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    nextjs: {
      version: '',
      runtime: '',
      isDev: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      mode: process.env.NODE_ENV || 'unknown',
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || 'local',
      basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
      isVercel: !!process.env.NEXT_PUBLIC_VERCEL_ENV,
    },
    build: {
      buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'dev',
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown',
      gitCommit: process.env.NEXT_PUBLIC_GIT_COMMIT || 'unknown',
    },
    runtime: {
      memory: {},
      heap: {},
      performance: {},
      navigator: {},
      screen: {},
    },
    features: {
      supabase: true,
      mapbox: true,
      analytics: false,
      notifications: false,
      guestMode: true,
    },
    auth: {
      session: false,
      guestToken: false,
      guestInfo: null,
    },
    publicVars: {},
  });

  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    auth: { status: 'unknown', latency: null },
    trips: { status: 'unknown', latency: null },
    cities: { status: 'unknown', latency: null },
    schema: { status: 'unknown', latency: null },
    guest: { status: 'unknown', latency: null },
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Collect system info on mount
  useEffect(() => {
    async function collectInfo() {
      setIsRefreshing(true);

      // Get Next.js version
      try {
        const response = await fetch('/_next/static/chunks/webpack.js');
        const text = await response.text();
        const versionMatch = text.match(/webpack compiled successfully in (\d+)/i);
        if (versionMatch) {
          setSystemInfo((prev) => ({
            ...prev,
            nextjs: {
              ...prev.nextjs,
              version: 'Next.js 15',
            },
          }));
        }
      } catch (err) {
        console.error('Failed to detect Next.js version', err);
      }

      // Safely access extended browser APIs
      const navigatorExt = navigator as ExtendedNavigator;
      const performanceExt = performance as ExtendedPerformance;

      // Check for guest token
      const guestToken = clientGuestUtils.getToken();
      let guestInfo = null;

      if (guestToken) {
        try {
          const response = await fetch('/api/guest/token');
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              guestInfo = data.guest;
            }
          }
        } catch (error) {
          console.error('Error fetching guest info:', error);
        }
      }

      // Collect runtime info
      const runtime: SystemInfo['runtime'] = {
        memory: navigatorExt.deviceMemory ? { deviceMemory: navigatorExt.deviceMemory } : {},
        heap: {},
        performance: {
          now: performance.now(),
          memory: performanceExt.memory
            ? {
                jsHeapSizeLimit: Math.round(performanceExt.memory.jsHeapSizeLimit / (1024 * 1024)),
                totalJSHeapSize: Math.round(performanceExt.memory.totalJSHeapSize / (1024 * 1024)),
                usedJSHeapSize: Math.round(performanceExt.memory.usedJSHeapSize / (1024 * 1024)),
              }
            : 'Not available',
        },
        navigator: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          languages: navigator.languages,
          onLine: navigator.onLine,
          hardwareConcurrency: navigator.hardwareConcurrency,
          pdfViewerEnabled: navigatorExt.pdfViewerEnabled,
        },
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight,
          colorDepth: window.screen.colorDepth,
          pixelDepth: window.screen.pixelDepth,
          devicePixelRatio: window.devicePixelRatio,
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        },
      };

      // Collect all public environment variables
      const publicVars: Record<string, string> = {};
      Object.keys(process.env).forEach((key) => {
        if (key.startsWith('NEXT_PUBLIC_')) {
          publicVars[key] = process.env[key] || '';
        }
      });

      // Check for auth session
      let hasSession = false;
      try {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          const data = await response.json();
          hasSession = data.authenticated === true;
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }

      setSystemInfo((prev) => ({
        ...prev,
        runtime,
        publicVars,
        auth: {
          session: hasSession,
          guestToken: !!guestToken,
          guestInfo,
        },
      }));

      // Check API endpoints
      const endpoints = [
        { name: 'auth', url: '/api/auth/me' },
        { name: 'trips', url: '/api/trips' },
        { name: 'cities', url: '/api/cities/search?q=test' },
        { name: 'schema', url: '/api/debug/schema-check' },
        { name: 'guest', url: '/api/guest/token' },
      ];

      const newApiStatus: ApiStatus = { ...apiStatus };

      for (const { name, url } of endpoints) {
        try {
          const startTime = performance.now();
          const response = await fetch(url);
          const endTime = performance.now();
          const latency = Math.round(endTime - startTime);

          try {
            const data = await response.json();
            newApiStatus[name] = {
              status: response.ok ? 'healthy' : 'error',
              statusCode: response.status,
              latency,
              data: data,
            };
          } catch (jsonError) {
            newApiStatus[name] = {
              status: response.ok ? 'healthy' : 'error',
              statusCode: response.status,
              latency,
              error: 'Invalid JSON response',
            };
          }
        } catch (error: any) {
          newApiStatus[name] = {
            status: 'error',
            error: error.message || 'Unknown error',
            latency: null,
          };
        }
      }

      setApiStatus(newApiStatus);
      setIsRefreshing(false);
    }

    collectInfo();
  }, [apiStatus]);

  // Function to refresh data
  const refreshData = async () => {
    setIsRefreshing(true);

    // Update only the timestamp to trigger the effect
    setSystemInfo((prev) => ({
      ...prev,
      build: {
        ...prev.build,
        buildTime: new Date().toISOString(),
      },
    }));
  };

  // Render a status badge
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'healthy') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Healthy
        </Badge>
      );
    } else if (status === 'error') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" /> Error
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <AlertCircle className="h-3 w-3 mr-1" /> Unknown
        </Badge>
      );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/debug" className="mr-2">
          <ArrowLeft className="h-4 w-4 inline-block" />
        </Link>
        <h1 className="text-3xl font-bold">System Status</h1>

        <div className="ml-auto">
          <Button
            onClick={refreshData}
            variant="outline"
            disabled={isRefreshing}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700 text-sm flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">Debugging Information</p>
          <p className="mt-1">
            This page displays system status, environment information, and API health checks. Use
            this to diagnose issues with the application's core services and configuration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Authentication</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>User Session:</span>
                <Badge variant={systemInfo.auth.session ? 'default' : 'outline'}>
                  {systemInfo.auth.session ? 'Active' : 'None'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Guest Token:</span>
                <Badge variant={systemInfo.auth.guestToken ? 'secondary' : 'outline'}>
                  {systemInfo.auth.guestToken ? 'Present' : 'None'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Environment</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Mode:</span>
                <Badge variant="outline">{systemInfo.environment.nodeEnv}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Next.js:</span>
                <Badge variant="outline">{systemInfo.nextjs.version || 'Unknown'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">API Health</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(apiStatus).map(([name, info]) => (
                <div key={name} className="flex justify-between items-center">
                  <span className="capitalize">{name}:</span>
                  <StatusBadge status={info.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Runtime and environment details</CardDescription>
              </CardHeader>
              <CardContent>
                <StateInspector data={systemInfo} title="System Info" expanded={true} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Status</CardTitle>
                <CardDescription>Health check for backend services</CardDescription>
              </CardHeader>
              <CardContent>
                <StateInspector data={apiStatus} title="API Status" expanded={true} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environment">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Public environment configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <StateInspector
                data={systemInfo.publicVars}
                title="Public Variables"
                expanded={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis">
          <div className="grid gap-6">
            {Object.entries(apiStatus).map(([name, info]) => (
              <Card key={name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="capitalize">{name} API</CardTitle>
                    <CardDescription>
                      {info.latency && <span>Response time: {info.latency}ms</span>}
                    </CardDescription>
                  </div>
                  <StatusBadge status={info.status} />
                </CardHeader>
                <CardContent>
                  <StateInspector data={info} title={`${name} Details`} expanded={true} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Browser and runtime performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <StateInspector
                data={systemInfo.runtime}
                title="Runtime Performance"
                expanded={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Status</CardTitle>
                <CardDescription>Current auth state details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-md ${systemInfo.auth.session ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
                  >
                    <h3 className="text-lg font-medium mb-2">User Session</h3>
                    <p>
                      {systemInfo.auth.session ? 'User is authenticated' : 'No active user session'}
                    </p>
                    <div className="mt-4">
                      <Link href="/debug/auth-status">
                        <Button variant="outline" size="sm">
                          View Full Auth Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-md ${systemInfo.auth.guestToken ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
                  >
                    <h3 className="text-lg font-medium mb-2">Guest Token</h3>
                    <p>
                      {systemInfo.auth.guestToken ? 'Guest token is present' : 'No guest token'}
                    </p>
                    {systemInfo.auth.guestToken && systemInfo.auth.guestInfo && (
                      <div className="mt-2">
                        <StateInspector
                          data={systemInfo.auth.guestInfo}
                          title="Guest Info"
                          expanded={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Debug tools are only available in development mode. Add additional system checks in{' '}
          <code className="text-xs bg-gray-100 p-0.5 rounded">
            app/debug/system-status/page.tsx
          </code>
        </p>
      </div>
    </div>
  );
}
