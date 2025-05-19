import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserX, UserPlus } from 'lucide-react';

export interface GroupMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface GroupMemberListProps {
  members: GroupMember[];
  onRemove: (id: string) => void;
  onPromote: (id: string) => void;
}

export function GroupMemberList({ members, onRemove, onPromote }: GroupMemberListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Group Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {members.map((member) => (
            <li 
              key={member.id} 
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatarUrl} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    {member.role === 'admin' && (
                      <Shield className="h-3 w-3 mr-1 inline" />
                    )}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {member.role !== 'admin' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onPromote(member.id)}
                    title="Promote to admin"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="sr-only">Promote</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onRemove(member.id)}
                  title="Remove member"
                >
                  <UserX className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 