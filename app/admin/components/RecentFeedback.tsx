import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';

interface FeedbackItem {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  date: string;
  type: 'feedback' | 'bug' | 'suggestion';
}

export function RecentFeedback() {
  // This would typically come from an API
  const feedbackItems: FeedbackItem[] = [
    {
      id: '1',
      user: {
        name: 'Emma Wilson',
        email: 'emma@example.com',
        avatar: '/avatars/emma.jpg'
      },
      content: 'The itinerary builder is amazing but could use a better mobile interface.',
      date: '2 hours ago',
      type: 'feedback'
    },
    {
      id: '2',
      user: {
        name: 'Alex Chen',
        email: 'alex@example.com',
      },
      content: 'Encountered error when trying to add more than 10 people to a trip.',
      date: '1 day ago',
      type: 'bug'
    },
    {
      id: '3',
      user: {
        name: 'Sofia Rodriguez',
        email: 'sofia@example.com',
        avatar: '/avatars/sofia.jpg'
      },
      content: 'Would be great to add calendar integration with Google Calendar.',
      date: '2 days ago',
      type: 'suggestion'
    }
  ];

  return (
    <div className="space-y-5">
      {feedbackItems.map((item) => (
        <Link href={`/admin/feedback/${item.id}`} key={item.id} className="block">
          <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar className="h-10 w-10">
              {item.user.avatar ? (
                <AvatarImage src={item.user.avatar} alt={item.user.name} />
              ) : (
                <AvatarFallback>
                  {item.user.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium">{item.user.name}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.date}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.content}</p>
              <div className="mt-1">
                <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'bug' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                    : item.type === 'suggestion'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  <MessageSquare className="mr-1 h-3 w-3" />
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 