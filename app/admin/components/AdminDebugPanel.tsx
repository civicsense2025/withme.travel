'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Bug, Terminal, RefreshCw, Database, Shield, Eye, ArrowRight } from 'lucide-react';
import { TABLES, ENUMS } from '@/utils/constants/database';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  initialTab = 'tables',
}: AdminDebugPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    tables: [],
    routes: {
      admin: Object.values(PAGE_ROUTES.ADMIN),
      api: [API_ROUTES.AUTH_ME, API_ROUTES.ADMIN_STATS, API_ROUTES.DEBUG_AUTH_STATUS],
    },
    environment: {
      'Node Environment': process.env.NODE_ENV || 'development',
      'Supabase URL': process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...' || 'Not set',
      'Using Supabase SSR': 'Yes',
    },
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchDebugInfo = useCallback(async () => {
    setIsLoading(true);

    try {
      // Get the important tables with row counts
      const tablePromises = Object.entries(TABLES)
        .filter(([key, tableName]) => {
          // Only include important tables and only those where tableName is a string
          const importantTables = [
            'PROFILES',
            'TRIPS',
            'DESTINATIONS',
            'ITINERARY_TEMPLATES',
            'ITINERARY_TEMPLATE_SECTIONS',
            'ITINERARY_TEMPLATE_ITEMS',
            'FEEDBACK',
          ];
          return importantTables.includes(key) && typeof tableName === 'string';
        })
        .map(async ([key, tableName]) => {
          try {
            const { count, error } = await supabase
              .from(tableName as string)
              .select('*', { count: 'exact', head: true });

            return {
              name: String(tableName),
              constant: key,
              rowCount: error ? null : count,
            };
          } catch (e) {
            console.error(`Error fetching count for ${tableName}:`, e);
            return {
              name: String(tableName),
              constant: key,
              rowCount: null,
            };
          }
        });

      const tablesWithCounts = await Promise.all(tablePromises);

      // Update state with the new debug info
      setDebugInfo((prev) => ({
        ...prev,
        tables: tablesWithCounts,
        environment: {
          ...prev.environment,
          'Database Connection': 'Connected',
          'API URL': process.env.NEXT_PUBLIC_API_URL || window.location.origin,
          'Current Timestamp': new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('Error fetching debug info:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setDebugInfo, supabase]);

  useEffect(() => {
    fetchDebugInfo();
  }, [fetchDebugInfo]);

  return (
    <Card className="w-full overflow-hidden border rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      {showHeader && (
        <CardHeader className="bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-primary" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDebugInfo}
              disabled={isLoading}
              className="rounded-full transition-all duration-300 hover:shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-5">
        <Tabs defaultValue={initialTab}>
          <TabsList className="grid grid-cols-4 mb-6 bg-muted/30 p-1 rounded-full">
            <TabsTrigger value="tables" className="rounded-full data-[state=active]:shadow-sm">
              <Database className="h-4 w-4 mr-2" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="routes" className="rounded-full data-[state=active]:shadow-sm">
              <Terminal className="h-4 w-4 mr-2" />
              Routes
            </TabsTrigger>
            <TabsTrigger value="env" className="rounded-full data-[state=active]:shadow-sm">
              <Bug className="h-4 w-4 mr-2" />
              Environment
            </TabsTrigger>
            <TabsTrigger value="enums" className="rounded-full data-[state=active]:shadow-sm">
              <Code className="h-4 w-4 mr-2" />
              Enums
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="tables" className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border backdrop-blur-sm max-h-[300px] overflow-y-auto shadow-sm"
              >
                <div className="grid grid-cols-3 gap-2 font-medium text-xs uppercase text-zinc-500 mb-2 px-2">
                  <div>Table Name</div>
                  <div>Constant</div>
                  <div>Row Count</div>
                </div>
                <ul className="space-y-2">
                  {debugInfo.tables.length > 0 ? (
                    debugInfo.tables.map((table, index) => (
                      <motion.li
                        key={`${table.constant}-${table.name}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="grid grid-cols-3 gap-2 py-2 px-2 border-b border-zinc-200 dark:border-zinc-800 last:border-0"
                      >
                        <span className="font-mono text-sm">{table.name}</span>
                        <span className="font-semibold text-sm">{table.constant}</span>
                        <span>
                          {table.rowCount !== null ? (
                            <Badge className="rounded-full">{table.rowCount}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-500 rounded-full">
                              Error
                            </Badge>
                          )}
                        </span>
                      </motion.li>
                    ))
                  ) : (
                    <div className="flex justify-center items-center py-4">
                      <RefreshCw
                        className={`h-5 w-5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`}
                      />
                      <span className="ml-2 text-zinc-500">
                        {isLoading ? 'Loading...' : 'No data available'}
                      </span>
                    </div>
                  )}
                </ul>
              </motion.div>
              <Alert className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <AlertDescription className="text-amber-800 dark:text-amber-300 text-xs">
                  Table constants are defined in{' '}
                  <code className="font-mono px-1 bg-white dark:bg-black rounded-md">
                    utils/constants/database.ts
                  </code>
                </AlertDescription>
              </Alert>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-full transition-all duration-300 hover:shadow-md"
                >
                  <Link href="/debug/schema-check">
                    <Shield className="h-4 w-4 mr-2" />
                    Run Schema Check
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <TabsContent value="routes">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Accordion>
                  {Object.entries(debugInfo.routes).map(([category, routes]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger>
                        <span className="capitalize">{category} Routes</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 mt-2">
                          {routes.map((route, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border shadow-sm"
                            >
                              <code className="text-xs text-zinc-500 block">{route}</code>
                            </motion.div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-full transition-all duration-300 hover:shadow-md"
                  >
                    <Link href="/api/debug/route-check">
                      <Eye className="h-4 w-4 mr-2" />
                      Check Routes
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <TabsContent value="env">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border shadow-sm"
              >
                <div className="space-y-2">
                  {Object.entries(debugInfo.environment).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="grid grid-cols-2 gap-4 py-2 px-2 border-b border-zinc-200 dark:border-zinc-800 last:border-0"
                    >
                      <span className="font-medium text-sm">{key}</span>
                      <code className="font-mono text-xs bg-white dark:bg-black px-2 py-1 rounded-md">
                        {value}
                      </code>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <TabsContent value="enums">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Accordion>
                  {Object.entries(ENUMS).map(([enumName, enumValues]) => (
                    <AccordionItem key={enumName} value={enumName}>
                      <AccordionTrigger>
                        <span className="font-mono text-sm">{enumName}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2 my-2 pl-2">
                          {Object.entries(enumValues as Record<string, string>).map(
                            ([key, value], index) => (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                className="flex justify-between bg-white dark:bg-black rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300"
                              >
                                <span className="font-medium text-xs text-primary">{key}</span>
                                <code className="font-mono text-xs text-zinc-500">{value}</code>
                              </motion.div>
                            )
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
}
