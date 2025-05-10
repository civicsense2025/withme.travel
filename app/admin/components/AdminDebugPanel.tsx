'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Bug, Terminal, RefreshCw, Database, Shield, Eye, ArrowRight } from 'lucide-react';
import { TABLES, ENUMS } from '@/utils/constants/database';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
import Link from 'next/link';

interface DebugInfo {
  tables: {
    name: string;
    constant: string;
    rowCount: number | null;
  }[];
  routes: Record<string, string[]>;
  environment: Record<string, string>;
}

interface AdminDebugPanelProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
  initialTab?: string;
}

export function AdminDebugPanel({
  title = 'Debug Information',
  description = 'Technical details for troubleshooting',
  showHeader = true,
  initialTab = 'tables'
}: AdminDebugPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    tables: [],
    routes: {
      'admin': Object.values(PAGE_ROUTES.ADMIN),
      'api': [
        API_ROUTES.AUTH_ME,
        API_ROUTES.ADMIN_STATS,
        API_ROUTES.DEBUG_AUTH_STATUS
      ],
    },
    environment: {
      'Node Environment': process.env.NODE_ENV || 'development',
      'Supabase URL': process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...' || 'Not set',
      'Using Supabase SSR': 'Yes'
    }
  });
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchDebugInfo();
  }, []);
  
  const fetchDebugInfo = async () => {
    setIsLoading(true);
    
    try {
      // Get the important tables with row counts
      const tablePromises = Object.entries(TABLES)
        .filter(([key]) => {
          // Only include important tables to avoid overwhelming the UI
          const importantTables = [
            'PROFILES', 'TRIPS', 'DESTINATIONS', 
            'ITINERARY_TEMPLATES', 'ITINERARY_TEMPLATE_SECTIONS', 'ITINERARY_TEMPLATE_ITEMS', 'FEEDBACK'
          ];
          return importantTables.includes(key);
        })
        .map(async ([key, tableName]) => {
          try {
            const { count, error } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });
            
            return {
              name: tableName,
              constant: key,
              rowCount: error ? null : count
            };
          } catch (e) {
            console.error(`Error fetching count for ${tableName}:`, e);
            return {
              name: tableName,
              constant: key,
              rowCount: null
            };
          }
        });
      
      const tablesWithCounts = await Promise.all(tablePromises);
      
      // Update state with the new debug info
      setDebugInfo(prev => ({
        ...prev,
        tables: tablesWithCounts,
        environment: {
          ...prev.environment,
          'Database Connection': 'Connected',
          'API URL': process.env.NEXT_PUBLIC_API_URL || window.location.origin,
          'Current Timestamp': new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error fetching debug info:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDebugInfo} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        <Tabs defaultValue={initialTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="tables">
              <Database className="h-4 w-4 mr-2" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="routes">
              <Terminal className="h-4 w-4 mr-2" />
              Routes
            </TabsTrigger>
            <TabsTrigger value="env">
              <Bug className="h-4 w-4 mr-2" />
              Environment
            </TabsTrigger>
            <TabsTrigger value="enums">
              <Code className="h-4 w-4 mr-2" />
              Enums
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tables" className="space-y-3">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-4 border max-h-[300px] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 font-medium text-xs uppercase text-zinc-500 mb-2 px-2">
                <div>Table Name</div>
                <div>Constant</div>
                <div>Row Count</div>
              </div>
              <ul className="space-y-2">
                {debugInfo.tables.length > 0 ? (
                  debugInfo.tables.map((table) => (
                    <li key={`${table.constant}-${table.name}`} className="grid grid-cols-3 gap-2 py-2 px-2 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
                      <span className="font-mono text-sm">{table.name}</span>
                      <span className="font-semibold text-sm">{table.constant}</span>
                      <span>
                        {table.rowCount !== null ? (
                          <Badge>{table.rowCount}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-500">Error</Badge>
                        )}
                      </span>
                    </li>
                  ))
                ) : (
                  <div className="flex justify-center items-center py-4">
                    <RefreshCw className={`h-5 w-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="ml-2 text-zinc-500">{isLoading ? 'Loading...' : 'No data available'}</span>
                  </div>
                )}
              </ul>
            </div>
            <Alert className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertDescription className="text-amber-800 dark:text-amber-300 text-xs">
                Table constants are defined in <code className="font-mono px-1 bg-white dark:bg-black rounded">utils/constants/database.ts</code>
              </AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href="/debug/schema-check">
                  <Shield className="h-4 w-4 mr-2" />
                  Run Schema Check
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="routes">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(debugInfo.routes).map(([category, routes]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="py-3">
                    <span className="capitalize">{category} Routes</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 mt-2">
                      {routes.map((route, index) => (
                        <div key={index} className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 border">
                          <code className="text-xs text-zinc-500 block">{route}</code>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href="/api/debug/route-check">
                  <Eye className="h-4 w-4 mr-2" />
                  Test API Routes
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="env">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-4 border">
              <div className="space-y-3">
                {Object.entries(debugInfo.environment).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{key}</span>
                    <span className="text-sm text-zinc-500 font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href="/debug/system-status">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Full System Status
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="enums">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-4 border max-h-[300px] overflow-y-auto">
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(ENUMS).map(([enumName, enumValues]) => (
                  <AccordionItem key={enumName} value={enumName}>
                    <AccordionTrigger className="py-2">
                      <code className="text-sm font-semibold">{enumName}</code>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(enumValues as Record<string, string>).map(([key, value]) => (
                          <div key={key} className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded border border-zinc-200 dark:border-zinc-700">
                            <span className="text-xs font-semibold">{key}:</span>
                            <code className="text-xs ml-2 text-zinc-500">{value}</code>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 