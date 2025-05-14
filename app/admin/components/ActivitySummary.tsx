import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Settings, Globe, FileText, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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
        avatar: '/avatars/admin.jpg',
      },
      action: 'edited',
      target: 'Tokyo, Japan',
      targetType: 'destination',
      timestamp: '10 minutes ago',
      type: 'edit',
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
      type: 'publish',
    },
    {
      id: '3',
      user: {
        name: 'System Admin',
        avatar: '/avatars/sysadmin.jpg',
      },
      action: 'updated',
      target: 'API rate limits',
      targetType: 'setting',
      timestamp: '1 day ago',
      type: 'edit',
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
      type: 'review',
    },
  ];

  const getActivityIcon = (type: 'destination' | 'content' | 'setting' | 'user') => {
    switch (type) {
      case 'destination':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'content':
        return <FileText className="h-4 w-4 text-violet-500" />;
      case 'setting':
        return <Settings className="h-4 w-4 text-emerald-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-pink-500" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          variants={item}
          className="flex items-start space-x-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-300 shadow-sm hover:shadow-md"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-black shadow-sm">
            {activity.user.avatar ? (
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                {activity.user.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">
                <span className="font-semibold">{activity.user.name}</span>{' '}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
              <span className="text-xs text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {activity.timestamp}
              </span>
            </div>
            <div className="flex items-center text-sm mt-1">
              <span className="flex items-center gap-1.5 bg-zinc-100/80 dark:bg-zinc-800/80 px-2.5 py-1 rounded-full">
                {getActivityIcon(activity.targetType)}
                <span className="font-medium">{activity.target}</span>
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
