import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Settings, Globe, FileText, Users } from 'lucide-react';

type ActivityType = 'edit' | 'create' | 'delete' | 'publish' | 'review';

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  targetType: 'destination' | 'content' | 'setting' | 'user';
  timestamp: string;
  type: ActivityType;
}

export function ActivitySummary() {
  // This would typically come from an API
  const activities: Activity[] = [
    {
      id: '1',
      user: {
        name: 'Admin User',
        avatar: '/avatars/admin.jpg'
      },
      action: 'edited',
      target: 'Tokyo, Japan',
      targetType: 'destination',
      timestamp: '10 minutes ago',
      type: 'edit'
    },
    {
      id: '2',
      user: {
        name: 'Content Team',
      },
      action: 'published',
      target: 'Summer in Europe Guide',
      targetType: 'content',
      timestamp: '2 hours ago',
      type: 'publish'
    },
    {
      id: '3',
      user: {
        name: 'System Admin',
        avatar: '/avatars/sysadmin.jpg'
      },
      action: 'updated',
      target: 'API rate limits',
      targetType: 'setting',
      timestamp: '1 day ago',
      type: 'edit'
    },
    {
      id: '4',
      user: {
        name: 'Moderator',
      },
      action: 'reviewed',
      target: 'User feedback items',
      targetType: 'content',
      timestamp: '2 days ago',
      type: 'review'
    }
  ];

  const getActivityIcon = (type: 'destination' | 'content' | 'setting' | 'user') => {
    switch (type) {
      case 'destination':
        return <Globe className="h-4 w-4 text-travel-blue" />;
      case 'content':
        return <FileText className="h-4 w-4 text-travel-purple" />;
      case 'setting':
        return <Settings className="h-4 w-4 text-travel-mint" />;
      case 'user':
        return <Users className="h-4 w-4 text-travel-pink" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <Avatar className="h-8 w-8">
            {activity.user.avatar ? (
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            ) : (
              <AvatarFallback>
                {activity.user.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between">
              <p className="text-sm font-medium">
                <span className="font-semibold">{activity.user.name}</span>{' '}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
              <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="flex items-center gap-1">
                {getActivityIcon(activity.targetType)}
                <span className="font-medium">{activity.target}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 