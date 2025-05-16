import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { checkAdminAuth } from './utils/auth';
import { redirect } from 'next/navigation';

/**
 * Admin dashboard main page with server-side admin verification
 */
export default async function AdminPage() {
  // Server-side admin check to ensure redirect happens correctly
  const { isAdmin } = await checkAdminAuth();
  
  // Redirect if not admin - this ensures the server-side redirect works
  if (!isAdmin) {
    redirect('/login?redirectTo=/admin');
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats components would go here */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Stats content would go here */}
            <p className="text-2xl font-bold">Loading stats...</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold">Admin Tools</h2>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Manage destination content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/admin/destinations">Destinations</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/content-manager">Content Manager</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/places">Places</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/itineraries">Itineraries</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Research</CardTitle>
            <CardDescription>Manage surveys and research</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/admin/surveys">Surveys</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/research">Research</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/feedback">Feedback</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics & Users</CardTitle>
            <CardDescription>Manage users and view analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/admin/analytics">Analytics</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/users">Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>Manage images and media</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/admin/media">Media Library</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Integrations</CardTitle>
            <CardDescription>Manage external API integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/admin/viator">Viator API</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
