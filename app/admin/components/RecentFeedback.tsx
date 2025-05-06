import React from 'react';
import Link from 'next/link';

interface FeedbackUser {
  full_name: string | null;
  email: string | null;
}

interface FeedbackItem {
  id: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
  email: string | null;
  user: FeedbackUser | null;
}

interface RecentFeedbackProps {
  items: FeedbackItem[];
  limit?: number;
}

export function RecentFeedback({ items, limit = 5 }: RecentFeedbackProps) {
  const displayItems = items.slice(0, limit);

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'bug_report':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'feature_request':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'improvement':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'question':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Feedback</h2>
        <Link 
          href="/admin/feedback" 
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All
        </Link>
      </div>
      
      <div className="space-y-4">
        {displayItems.length > 0 ? (
          displayItems.map((item) => (
            <div key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
              <div className="flex items-start gap-2">
                <div className={`px-2 py-1 text-xs rounded-full ${getTypeBadgeClass(item.type)}`}>
                  {item.type.replace('_', ' ')}
                </div>
                <div className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(item.status)}`}>
                  {item.status.replace('_', ' ')}
                </div>
              </div>
              
              <p className="mt-2 line-clamp-2">{item.content}</p>
              
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                <span>
                  {item.user?.full_name || item.email || 'Anonymous'}
                </span>
                <span>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="mt-2">
                <Link 
                  href={`/admin/feedback/${item.id}`}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No feedback yet</p>
        )}
      </div>
    </div>
  );
} 