import { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bug,
  Code,
  FileCode,
  Server,
  Cpu,
  User,
  UserCheck,
  Database,
  Layout,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Debug Tools | withme.travel',
  description: 'Debug and development tools for withme.travel',
};

export default function DebugPage() {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">Debug & Development Tools</h1>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Development Mode
          </Badge>
        </div>
      </div>

      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700 text-sm flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">Development Tools</p>
          <p className="mt-1">
            These tools are only available in development mode and help diagnose issues with the
            application. Use them to check system status, verify authentication, and test
            components.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              <CardTitle>Authentication</CardTitle>
            </div>
            <CardDescription>Debug authentication state and test user flows</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                User authentication status
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Guest token management
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Cookie/localStorage inspection
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/debug/auth-status" className="w-full">
              <Button variant="default" className="w-full">
                Auth Status
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-indigo-500" />
              <CardTitle>System Status</CardTitle>
            </div>
            <CardDescription>Monitor system health and API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                API health checks
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Environment variables
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Runtime performance
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/debug/system-status" className="w-full">
              <Button variant="default" className="w-full">
                System Status
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-amber-500" />
              <CardTitle>Schema Check</CardTitle>
            </div>
            <CardDescription>Validate database schema and data integrity</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Schema validation
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Data type checking
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Migration status
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/api/debug/schema-check" className="w-full">
              <Button variant="outline" className="w-full flex items-center">
                Check Schema <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Layout className="h-5 w-5 text-purple-500" />
              <CardTitle>Component Sandbox</CardTitle>
            </div>
            <CardDescription>Test UI components in isolation</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Interactive component testing
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Visual debugging
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Prop manipulation
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/debug/component-sandbox" className="w-full">
              <Button variant="default" className="w-full">
                Component Sandbox
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-emerald-500" />
              <CardTitle>API Routes</CardTitle>
            </div>
            <CardDescription>Test and debug API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Auth-related endpoints
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Data retrieval APIs
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Guest token endpoints
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Link href="/api/auth/me" className="flex-1">
              <Button variant="outline" className="w-full flex items-center justify-center">
                /auth/me <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
            <Link href="/api/auth/status" className="flex-1">
              <Button variant="outline" className="w-full flex items-center justify-center">
                /auth/status <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-rose-500" />
              <CardTitle>User Testing</CardTitle>
            </div>
            <CardDescription>User testing and onboarding flows</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Test user signup flows
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                User feedback collection
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Onboarding experiences
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/user-testing" className="w-full">
              <Button variant="default" className="w-full">
                User Testing Hub
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 border-t pt-6">
        <h2 className="text-lg font-medium mb-4">External Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full flex items-center justify-center">
              <FileCode className="h-4 w-4 mr-2" />
              Next.js Documentation
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </Link>
          <Link href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full flex items-center justify-center">
              <Database className="h-4 w-4 mr-2" />
              Supabase Documentation
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </Link>
          <Link href="https://github.com/withmetravel" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full flex items-center justify-center">
              <Bug className="h-4 w-4 mr-2" />
              Report an Issue
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Debug tools are only available in development mode and should not be exposed in
          production.
        </p>
      </div>
    </div>
  );
}
