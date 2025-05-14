'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Edit,
  Clock,
  MousePointer,
  User,
  UserPlus,
  MoreHorizontal,
  Heart,
  MapPin,
  Plus,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface User {
  id: string;
  name: string;
  avatarUrl: string;
  status: 'online' | 'idle' | 'offline';
  lastActive?: string;
  currentActivity?: string;
  location?: string;
}

interface SharedPresenceSectionProps {
  className?: string;
}

export function SharedPresenceSection({ className }: SharedPresenceSectionProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Sofia Chen',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      status: 'online',
      currentActivity: 'Editing itinerary',
      location: 'Day 2 - Barcelona',
    },
    {
      id: '2',
      name: 'Marcus Kim',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      status: 'online',
      currentActivity: 'Adding activities',
      location: 'Day 3 - Madrid',
    },
    {
      id: '3',
      name: 'Ava Patel',
      avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      status: 'idle',
      lastActive: '5 minutes ago',
      location: 'Day 1 - Accommodation',
    },
    {
      id: '4',
      name: 'Jordan Taylor',
      avatarUrl: 'https://randomuser.me/api/portraits/men/61.jpg',
      status: 'offline',
      lastActive: '35 minutes ago',
    },
  ]);

  const [activities, setActivities] = useState<string[]>([]);
  const [pointerPositions, setPointerPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

  // Simulate real-time activities
  useEffect(() => {
    const initialActivities = [
      "Sofia added 'Tapas Tour' to Day 2",
      "Marcus liked Sofia's suggestion",
      "Ava commented on 'Park Güell visit'",
    ];

    setActivities(initialActivities);

    const activityMessages = [
      "Sofia moved 'Sagrada Familia' to morning",
      "Marcus added a photo to 'Madrid Food Market'",
      'Sofia suggested a new restaurant for dinner',
      "Ava commented on 'Beach day'",
      "Marcus liked Ava's comment",
      'Sofia is updating the accommodation details',
      'Marcus added notes to the transport section',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const newActivity = activityMessages[Math.floor(Math.random() * activityMessages.length)];
        setActivities((prev) => [newActivity, ...prev.slice(0, 4)]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Simulate cursor movements for online users
  useEffect(() => {
    const onlineUserIds = users.filter((user) => user.status === 'online').map((user) => user.id);

    // Initial positions
    const initialPositions: { [key: string]: { x: number; y: number } } = {};
    onlineUserIds.forEach((id) => {
      initialPositions[id] = {
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
      };
    });

    setPointerPositions(initialPositions);

    // Movement intervals for each user
    const intervals = onlineUserIds.map((id) => {
      return setInterval(
        () => {
          setPointerPositions((prev) => {
            const currentPos = prev[id] || { x: 50, y: 50 };
            return {
              ...prev,
              [id]: {
                x: Math.max(0, Math.min(100, currentPos.x + (Math.random() - 0.5) * 15)),
                y: Math.max(0, Math.min(100, currentPos.y + (Math.random() - 0.5) * 15)),
              },
            };
          });
        },
        2000 + Math.random() * 2000
      ); // Different intervals for each user
    });

    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [users]);

  // Periodically update user statuses to simulate real activity
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prev) =>
        prev.map((user) => {
          // Randomly change some user statuses
          if (Math.random() > 0.8) {
            if (user.status === 'online' && Math.random() > 0.7) {
              return { ...user, status: 'idle', lastActive: 'just now' };
            } else if (user.status === 'idle' && Math.random() > 0.6) {
              return { ...user, status: 'online', currentActivity: 'Just returned' };
            }
          }
          return user;
        })
      );
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  function getStatusColor(status: string): string {
    switch (status) {
      case 'online':
        return 'bg-travel-mint';
      case 'idle':
        return 'bg-travel-yellow';
      case 'offline':
        return 'bg-gray-300 dark:bg-gray-600';
      default:
        return 'bg-gray-300';
    }
  }

  return (
    <Card className="overflow-hidden border-border shadow-md dark:shadow-gray-900/30">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Team Presence</CardTitle>
            <CardDescription>See who's working on the trip in real-time</CardDescription>
          </div>
          <Badge
            variant="outline"
            className="gap-1 bg-travel-mint/10 text-travel-mint border-travel-mint/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-travel-mint opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-travel-mint"></span>
            </span>
            Live
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* User Presence Area */}
        <div className="relative w-full bg-muted/30 rounded-lg p-4 mb-4 h-48 overflow-hidden">
          {/* Location markers */}
          <div className="absolute inset-0 p-4">
            <div className="absolute left-[20%] top-[15%] bg-travel-purple/20 px-2 py-0.5 rounded text-xs">
              Day 1
            </div>
            <div className="absolute left-[40%] top-[60%] bg-travel-blue/20 px-2 py-0.5 rounded text-xs">
              Day 2
            </div>
            <div className="absolute left-[70%] top-[30%] bg-travel-pink/20 px-2 py-0.5 rounded text-xs">
              Day 3
            </div>
            <div className="absolute left-[60%] top-[80%] bg-travel-yellow/20 px-2 py-0.5 rounded text-xs">
              Settings
            </div>
          </div>

          {/* User cursors */}
          {Object.entries(pointerPositions).map(([userId, position]) => {
            const user = users.find((u) => u.id === userId);
            if (!user || user.status !== 'online') return null;

            return (
              <motion.div
                key={userId}
                className="absolute"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                transition={{
                  type: 'spring',
                  damping: 20,
                  stiffness: 100,
                }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <MousePointer className="h-5 w-5 text-primary" />
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center p-0.5 border border-border">
                          <Avatar className="h-3 w-3">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="text-[8px]">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs space-y-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-muted-foreground">{user.currentActivity}</p>
                        <p className="text-muted-foreground">{user.location}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            );
          })}
        </div>

        {/* Active Now */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Active Now</h3>
          <div className="flex -space-x-2">
            <AnimatePresence>
              {users
                .filter((user) => user.status !== 'offline')
                .map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Avatar className="h-9 w-9 border-2 border-background">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span
                              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${getStatusColor(user.status)}`}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{user.name}</p>
                            {user.status === 'online' && user.currentActivity && (
                              <p className="text-xs text-muted-foreground flex items-center">
                                <Edit className="h-3 w-3 mr-1" /> {user.currentActivity}
                              </p>
                            )}
                            {user.status === 'idle' && user.lastActive && (
                              <p className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" /> Active {user.lastActive}
                              </p>
                            )}
                            {user.location && (
                              <p className="text-xs text-muted-foreground flex items-center">
                                <MapPin className="h-3 w-3 mr-1" /> {user.location}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </motion.div>
                ))}
            </AnimatePresence>

            <motion.button
              className="h-9 w-9 rounded-full bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {activities.slice(0, 3).map((activity, index) => (
                <motion.div
                  key={`${activity}-${index}`}
                  className="p-2 rounded-md bg-muted/30 text-sm flex items-start gap-2"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {activity.includes('added') ? (
                    <div className="h-6 w-6 rounded-full bg-travel-blue/20 flex items-center justify-center">
                      <Plus className="h-3 w-3 text-travel-blue" />
                    </div>
                  ) : activity.includes('liked') ? (
                    <div className="h-6 w-6 rounded-full bg-travel-pink/20 flex items-center justify-center">
                      <Heart className="h-3 w-3 text-travel-pink" />
                    </div>
                  ) : activity.includes('commented') ? (
                    <div className="h-6 w-6 rounded-full bg-travel-purple/20 flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 text-travel-purple" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-travel-mint/20 flex items-center justify-center">
                      <Edit className="h-3 w-3 text-travel-mint" />
                    </div>
                  )}
                  <span>{activity}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border pt-3">
        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{users.filter((u) => u.status !== 'offline').length} team members active</span>
          </div>
          <button className="flex items-center hover:text-primary">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
