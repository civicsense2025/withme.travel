'use client';

import Link from 'next/link';
import { Group } from '@/types/groups';
import { Users } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  // Get my role in the group
  const myRole = group.group_members?.find((member) => member.status === 'active')?.role;

  // Get number of active members
  const activeMembers =
    group.group_members?.filter((member) => member.status === 'active').length || 0;

  return (
    <Card className="overflow-hidden">
      <Link href={`/groups/${group.id}`} className="cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">{group.emoji || '👥'}</div>
              <CardTitle className="text-xl">{group.name}</CardTitle>
            </div>
            {myRole === 'owner' && (
              <Badge variant="outline" className="text-xs">
                Owner
              </Badge>
            )}
            {myRole === 'admin' && (
              <Badge variant="outline" className="text-xs">
                Admin
              </Badge>
            )}
          </div>
          {group.description && (
            <CardDescription className="mt-2 line-clamp-2">{group.description}</CardDescription>
          )}
        </CardHeader>
      </Link>

      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>
              {activeMembers} member{activeMembers !== 1 ? 's' : ''}
            </span>
          </div>
          <div>
            {group.trip_count || 0} trip{group.trip_count !== 1 ? 's' : ''}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <div className="w-full flex justify-between">
          <Link href={`/groups/${group.id}/trips`} passHref>
            <Button variant="ghost" size="sm">
              View Trips
            </Button>
          </Link>
          <Link href={`/groups/${group.id}`} passHref>
            <Button variant="outline" size="sm">
              Open Group
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
