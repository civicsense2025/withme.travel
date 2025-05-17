'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, Variants } from 'framer-motion';
import { Clock, MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';

interface Feedback {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  rating: number;
  page: string;
  timestamp: string;
  urgent?: boolean;
}

export function RecentFeedback() {
  // This would typically come from an API
  const feedbackItems: Feedback[] = [
    {
      id: '1',
      user: {
        name: 'David Kim',
        avatar: '/avatars/david.jpg',
      },
      content: 'The itinerary builder is amazing! Would love to see more drag-and-drop features.',
      rating: 4,
      page: '/trips/create',
      timestamp: '10 minutes ago',
    },
    {
      id: '2',
      user: {
        name: 'Sarah Johnson',
      },
      content: 'Found a bug when trying to invite friends to my trip.',
      rating: 2,
      page: '/trips/123/invite',
      timestamp: '2 hours ago',
      urgent: true,
    },
    {
      id: '3',
      user: {
        name: 'Michael Wong',
        avatar: '/avatars/michael.jpg',
      },
      content: 'Love the new destination pages! The recommendations are spot on.',
      rating: 5,
      page: '/destinations/tokyo',
      timestamp: '1 day ago',
    },
  ];

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4) {
      return <ThumbsUp className="h-4 w-4 text-green-500" />;
    } else if (rating <= 2) {
      return <ThumbsDown className="h-4 w-4 text-red-500" />;
    } else {
      return <MessageSquare className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <Card className="overflow-hidden border rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Recent Feedback</CardTitle>
            <CardDescription>Latest user opinions and reports</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {feedbackItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={`p-4 rounded-xl ${
                item.urgent
                  ? 'bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800'
              } shadow-sm hover:shadow-md transition-all duration-300`}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-black shadow-sm">
                  {item.user.avatar ? (
                    <AvatarImage src={item.user.avatar} alt={item.user.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                      {item.user.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.user.name}</h4>
                    <div className="flex items-center gap-2">
                      {item.urgent && (
                        <Badge
                          variant="destructive"
                          className="rounded-full px-2 py-0 h-5 gap-1 text-xs"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.timestamp}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm">{item.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      On page: <span className="font-mono">{item.page}</span>
                    </span>
                    <Badge
                      className="rounded-full"
                      variant={
                        item.rating >= 4 ? 'default' : item.rating <= 2 ? 'outline' : 'secondary'
                      }
                    >
                      <span className="flex items-center gap-1">
                        {getRatingIcon(item.rating)}
                        {item.rating}/5
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
