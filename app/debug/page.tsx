import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Debug Dashboard | withme.travel',
  description: 'Debug tools and system information for withme.travel',
};

export default function DebugPage() {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Debug Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/debug/system-status">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>View system health, configurations, and diagnostics</CardDescription>
            </CardHeader>
            <CardContent>
              Check server configuration, environment variables, API endpoints, 
              and system performance metrics.
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/debug/auth-status">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Debug authentication and session information</CardDescription>
            </CardHeader>
            <CardContent>
              View current session state, tokens, cookies, and test authentication flows.
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/test-auth">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Auth Testing</CardTitle>
              <CardDescription>Test authentication flows</CardDescription>
            </CardHeader>
            <CardContent>
              Test login, logout, and other authentication operations with configurable options.
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/debug/component-sandbox">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Component Sandbox</CardTitle>
              <CardDescription>Test and debug UI components</CardDescription>
            </CardHeader>
            <CardContent>
              Visualize and interact with UI components in isolation for easier debugging.
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 