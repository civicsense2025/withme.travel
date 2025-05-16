import { createServerComponentClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const USER_TESTING_TABLES = {
  USER_TESTING_SIGNUPS: 'user_testing_signups',
};

interface TestingSignup {
  id: string;
  name: string;
  email: string;
  signup_date: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default async function UserTestingDebugPage() {
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Not Available</h1>
        <p>This page is only available in development mode.</p>
        <Link href="/user-testing" className="text-blue-500 hover:underline">
          Back to User Testing
        </Link>
      </div>
    );
  }

  // Get data from Supabase
  const supabase = await createServerComponentClient();
  const { data: signups, error } = await supabase
    .from(USER_TESTING_TABLES.USER_TESTING_SIGNUPS)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Testing Signups Debug</h1>
        <div className="flex space-x-4">
          <Button asChild>
            <Link href="/user-testing">Back to Testing</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/user-testing/debug">Refresh</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading signups</p>
          <p>{error.message}</p>
        </div>
      )}

      {signups && signups.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">No signups found</p>
          <p>There are no user testing signups in the database.</p>
        </div>
      )}

      {signups && signups.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Source</th>
                <th className="px-4 py-2 text-left">Signup Date</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((signup: TestingSignup) => (
                <tr key={signup.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{signup.name}</td>
                  <td className="px-4 py-2">{signup.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        signup.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {signup.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{signup.source}</td>
                  <td className="px-4 py-2">
                    {new Date(signup.signup_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-sm">
                    {formatDistanceToNow(new Date(signup.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">How to Test Signups</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Go to <Link href="/user-testing" className="text-blue-500 hover:underline">/user-testing</Link> and sign up with a test email</li>
          <li>After signup, refresh this page to see if the record was saved</li>
          <li>Try different emails to see how new registrations are handled</li>
          <li>Check that using the same email updates the existing record</li>
        </ol>
      </div>
    </div>
  );
} 