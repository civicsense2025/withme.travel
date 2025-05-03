'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StateInspector } from '@/components/debug';
import { ArrowLeft, ExternalLink } from 'lucide-react';

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
  };
  publicVars: Record<string, string>;
}

interface ApiStatus {
  [key: string]: {
    status: string;
    statusCode?: number;
    latency: number | null;
    error?: string;
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
    },
    publicVars: {},
  });

  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    auth: { status: 'unknown', latency: null },
    trips: { status: 'unknown', latency: null },
    cities: { status: 'unknown', latency: null },
  });

  // Collect system info on mount
  useEffect(() => {
    // Get Next.js version
    fetch('/_next/static/chunks/webpack.js')
      .then((response) => response.text())
      .then((text) => {
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
      })
      .catch((err) => console.error('Failed to detect Next.js version', err));

    // Safely access extended browser APIs
    const navigatorExt = navigator as ExtendedNavigator;
    const performanceExt = performance as ExtendedPerformance;

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
      }
    };

    // Collect all public environment variables
    const publicVars: Record<string, string> = {};
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        publicVars[key] = process.env[key] || '';
      }
    });

    setSystemInfo((prev) => ({
      ...prev,
      runtime,
      publicVars,
    }));

    // Check API endpoints
    const endpoints = [
      { name: 'auth', url: '/api/auth/me' },
      { name: 'trips', url: '/api/trips' },
      { name: 'cities', url: '/api/cities' },
    ];

    endpoints.forEach(({ name, url }) => {
      const startTime = performance.now();
      fetch(url)
        .then((response) => {
          const endTime = performance.now();
          setApiStatus((prev) => ({
            ...prev,
            [name]: {
              status: response.ok ? 'healthy' : 'error',
              statusCode: response.status,
              latency: Math.round(endTime - startTime),
            },
          }));
        })
        .catch((error) => {
          setApiStatus((prev) => ({
            ...prev,
            [name]: {
              status: 'error',
              error: error.message,
              latency: null,
            },
          }));
        });
    });
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/debug" className="mr-2">
          <ArrowLeft className="h-4 w-4 inline-block" />
        </Link>
        <h1 className="text-3xl font-bold">System Status</h1>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
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
                <CardHeader>
                  <CardTitle className="capitalize">{name} API</CardTitle>
                  <CardDescription>
                    Status:{' '}
                    <span className={info.status === 'healthy' ? 'text-green-500' : 'text-red-500'}>
                      {info.status}
                    </span>
                    {info.latency && <span className="ml-2">({info.latency}ms)</span>}
                  </CardDescription>
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
