import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../utils/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Lock, Users, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Security Settings | Admin Panel',
  description: 'Manage security settings for withme.travel',
};

export default async function AdminSecurityPage() {
  const { isAdmin, supabase, error } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/security');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Get security metrics
  const { count: adminCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_admin', true);

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Security Management</h1>
        <p className="text-gray-500 mt-2">
          Manage security settings and permissions for the withme.travel platform
        </p>
      </div>

      <Alert className="mb-8 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-600">Security Notice</AlertTitle>
        <AlertDescription>
          Changes to security settings can significantly impact the platform. Always review changes
          carefully.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Admin Users</CardTitle>
            <CardDescription>Users with admin privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 flex">
              <Users className="mr-2 h-7 w-7 text-purple-500" />
              {adminCount || 0}
            </div>
            <p className="text-sm text-gray-500">With full system access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>RLS Policies</CardTitle>
            <CardDescription>Row-level security policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 flex">
              <Shield className="mr-2 h-7 w-7 text-blue-500" />
              25
            </div>
            <p className="text-sm text-gray-500">Active across all tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Auth Settings</CardTitle>
            <CardDescription>Authentication configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 flex">
              <Lock className="mr-2 h-7 w-7 text-green-500" />
              Active
            </div>
            <p className="text-sm text-gray-500">Email & social providers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="administrators" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="administrators">Administrators</TabsTrigger>
          <TabsTrigger value="rls">RLS Policies</TabsTrigger>
          <TabsTrigger value="auth">Auth Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="administrators">
          <Card>
            <CardHeader>
              <CardTitle>Administrator Management</CardTitle>
              <CardDescription>Manage users with administrator privileges</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                This section allows you to view and manage admin users. You can grant or revoke
                admin privileges from users.
              </p>
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  View Admins
                </Button>
                <Button>Add Admin</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rls">
          <Card>
            <CardHeader>
              <CardTitle>Row-Level Security Policies</CardTitle>
              <CardDescription>Configure database access controls</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Review and manage row-level security policies across tables. RLS policies enforce
                data access controls at the database level.
              </p>
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  View Policies
                </Button>
                <Button>Add Policy</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>Configure login and registration options</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Manage authentication settings including email templates, social providers, and
                security policies.
              </p>
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  View Settings
                </Button>
                <Button>Edit Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Track important system actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                View audit logs for security-related actions across the platform. Logs track admin
                actions, authentication events, and critical changes.
              </p>
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  View Logs
                </Button>
                <Button>Export Logs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
