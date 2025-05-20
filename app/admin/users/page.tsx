import { getTypedDbClient } from '@/utils/supabase/server';
import { handleQueryResult } from '@/utils/type-safety';
import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import Link from 'next/link';
import { TABLES } from '@/utils/constants/tables';

export const metadata = {
  title: 'Manage Users | Admin Panel',
  description: 'Manage users on withme.travel',
};

interface UserProfile {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}

// Server component function to fetch users from Supabase with pagination
async function getUsers(db: Awaited<ReturnType<typeof getTypedDbClient>>, page = 0, perPage = 20) {
  const from = page * perPage;
  const to = from + perPage - 1;

  // First get the total count for pagination
  const { count, error: countError } = await db
    .from(TABLES.PROFILES)
    .select('id', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting users:', countError);
    return { users: [], count: 0, error: countError };
  }

  // Then fetch the paginated data
  const { data: users, error } = await db
    .from(TABLES.PROFILES)
    .select(
      `
      id,
      username,
      name,
      email,
      avatar_url,
      created_at,
      updated_at,
      is_admin
    `
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching users:', error);
    return { users: [], count: 0, error };
  }

  return {
    users: users as UserProfile[],
    count,
    error: null,
  };
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  // TODO: Replace with real admin check
  // For now, just allow access
  const db = await getTypedDbClient();

  // Parse pagination from URL query params
  const page = searchParams.page ? parseInt(searchParams.page) - 1 : 0;
  const perPage = 20; // Users per page

  // Fetch users with pagination
  const { users, count, error } = await getUsers(db, page, perPage);

  if (error) {
    console.error('Error fetching users:', error);
  }

  // Calculate pagination values
  const totalCount = count || 0; // Provide default value
  const totalPages = Math.ceil(totalCount / perPage);
  const currentPage = page + 1;

  // Ensure type safety
  const typedUsers = (users || []) as UserProfile[];

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Link
          href="/admin/users/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Add User
        </Link>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
              {typedUsers.length > 0 ? (
                typedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar_url}
                              alt={`${user.name || user.username || 'User'}'s avatar`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-500 dark:text-gray-400 text-sm">
                                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{user.name || 'No Name'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username || 'no-username'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_admin
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                      >
                        {user.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/delete`}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-600 px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{page * perPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min((page + 1) * perPage, totalCount)}</span>{' '}
                  of <span className="font-medium">{totalCount}</span> users
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Link
                    href={currentPage > 1 ? `/admin/users?page=${currentPage - 1}` : '#'}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-300 dark:text-gray-600 cursor-default'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                   >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/admin/users?page=${pageNum}`}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300'
                            : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                       >
                        {pageNum}
                      </Link>
                    );
                  })}

                  <Link
                    href={currentPage < totalPages ? `/admin/users?page=${currentPage + 1}` : '#'}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-300 dark:text-gray-600 cursor-default'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                   >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Bulk Actions</h2>
        <div className="flex space-x-4">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            Grant Admin
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            Revoke Admin
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            Delete Selected
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Note: Bulk actions will be implemented in the client component version
        </p>
      </div>
    </Container>
  );
}
