'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageDebug, LayoutDebug, DebugBoundary, StateInspector } from '@/components/debug';
import { ArrowLeft } from 'lucide-react';

export default function ComponentSandboxPage() {
  const [count, setCount] = useState(0);
  const [testState, setTestState] = useState({
    name: 'Test User',
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en',
    },
    history: [
      { id: 1, action: 'login', timestamp: new Date().toISOString() },
      { id: 2, action: 'view_profile', timestamp: new Date().toISOString() },
    ],
  });

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/debug" className="mr-2">
          <ArrowLeft className="h-4 w-4 inline-block" />
        </Link>
        <h1 className="text-3xl font-bold">Component Sandbox</h1>
      </div>

      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
        <p>
          This page demonstrates the debug components available in the{' '}
          <code>@/components/debug</code> directory. Use these tools to debug UI components, layout
          issues, and state management problems.
        </p>
      </div>

      <Tabs defaultValue="layout">
        <TabsList className="mb-4">
          <TabsTrigger value="layout">Layout Debug</TabsTrigger>
          <TabsTrigger value="image">Image Debug</TabsTrigger>
          <TabsTrigger value="state">State Inspector</TabsTrigger>
          <TabsTrigger value="boundary">Debug Boundary</TabsTrigger>
        </TabsList>

        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>Layout Debug</CardTitle>
              <CardDescription>
                Test and debug layout issues with visual overlays and outlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LayoutDebug title="Example Layout Debug" className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-blue-100 p-4 rounded">Box 1</div>
                  <div className="bg-green-100 p-4 rounded">Box 2</div>
                  <div className="bg-red-100 p-4 rounded">Box 3</div>
                  <div className="bg-yellow-100 p-4 rounded md:col-span-2">
                    Box 4 (span 2 cols on md)
                  </div>
                  <div className="bg-purple-100 p-4 rounded">Box 5</div>
                </div>
              </LayoutDebug>

              <div className="mt-4 bg-gray-100 p-3 rounded text-sm">
                <p>
                  The <code>LayoutDebug</code> component adds toggleable controls to display
                  outlines and grid overlays. Click the buttons in the top right to toggle different
                  debugging visualizations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>Image Debug</CardTitle>
              <CardDescription>Debug image rendering and properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">Example Image</h3>
                  <div className="mb-4">
                    <Image
                      src="/placeholder.jpg"
                      width={300}
                      height={200}
                      alt="Example image"
                      className="rounded-md"
                    />
                  </div>

                  <ImageDebug
                    src="/placeholder.jpg"
                    width={300}
                    height={200}
                    alt="Example image"
                    quality={80}
                    priority={false}
                  />
                </div>

                <div className="mt-4 bg-gray-100 p-3 rounded text-sm">
                  <p>
                    The <code>ImageDebug</code> component displays all props passed to an image
                    component for debugging. Use it alongside your <code>{'<Image>'}</code>{' '}
                    component to inspect its properties.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="state">
          <Card>
            <CardHeader>
              <CardTitle>State Inspector</CardTitle>
              <CardDescription>
                Interactive state inspector for debugging complex state objects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Button onClick={() => setCount(count + 1)}>Increment</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTestState((prev) => ({
                          ...prev,
                          history: [
                            ...prev.history,
                            {
                              id: prev.history.length + 1,
                              action: 'button_click',
                              timestamp: new Date().toISOString(),
                            },
                          ],
                        }));
                      }}
                    >
                      Add History Item
                    </Button>
                  </div>

                  <StateInspector
                    data={{
                      count,
                      testState,
                      complexObject: {
                        nestedArray: [1, 2, 3, { test: true }],
                        nestedObject: { a: 1, b: 2, c: { d: 4 } },
                        nullValue: null,
                        undefinedValue: undefined,
                        functionValue: function () {
                          return 'test';
                        },
                      },
                    }}
                    title="Interactive State"
                    expanded={true}
                  />
                </div>

                <div className="mt-4 bg-gray-100 p-3 rounded text-sm">
                  <p>
                    The <code>StateInspector</code> component creates an interactive tree view of
                    any state object. It automatically handles different data types, undefined/null
                    values, and deep nested structures. Click on the expand/collapse icons to
                    explore the object tree.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boundary">
          <Card>
            <CardHeader>
              <CardTitle>Debug Boundary</CardTitle>
              <CardDescription>
                Visually annotate components with colored boundaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <DebugBoundary label="Parent Boundary" color="purple">
                  <div className="p-6">
                    <p className="mb-4">This is the parent component with a purple boundary</p>

                    <div className="flex gap-4">
                      <DebugBoundary label="Child 1" color="blue">
                        <div className="p-4">
                          <p>Child component with blue boundary</p>
                        </div>
                      </DebugBoundary>

                      <DebugBoundary label="Child 2" color="green">
                        <div className="p-4">
                          <p>Child component with green boundary</p>

                          <DebugBoundary label="Nested Child" color="yellow">
                            <div className="p-3 mt-2">
                              <p>Deeply nested component</p>
                            </div>
                          </DebugBoundary>
                        </div>
                      </DebugBoundary>
                    </div>
                  </div>
                </DebugBoundary>

                <div className="mt-4 bg-gray-100 p-3 rounded text-sm">
                  <p>
                    The <code>DebugBoundary</code> component wraps any content in a colored, labeled
                    boundary. Use it to visually identify component boundaries and nesting
                    relationships. Click the X button to remove a boundary during debugging.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          These debug components are found in{' '}
          <code className="text-xs bg-gray-100 p-0.5 rounded">components/debug/</code>
          and can be imported with{' '}
          <code className="text-xs bg-gray-100 p-0.5 rounded">
            import {'{ ComponentName }'} from &apos;@/components/debug&apos;
          </code>
          .
        </p>
      </div>
    </div>
  );
}
