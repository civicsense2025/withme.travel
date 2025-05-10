'use client';

import React from 'react';
import Link from 'next/link';
import { MoreHorizontal, Users, Trash, Copy, ExternalLink, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    memberCount: number;
    tripCount: number;
  };
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  bulkMode?: boolean;
}

export function GroupCard({
  group,
  isSelectable = false,
  isSelected = false,
  onSelect,
  onDelete,
  onEdit,
  bulkMode = false
}: GroupCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(group.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(group.id);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect(group.id, !isSelected);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelect) {
      onSelect(group.id, checked);
    }
  };

  const cardContent = (
    <Card className={cn(
      "h-full flex flex-col transition-all border-2 border-black dark:border-zinc-800 hover:shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-black",
      isSelected && "border-travel-purple dark:border-travel-purple bg-travel-purple/5"
    )}>
      <CardHeader className="pb-2 relative">
        {isSelectable && (
          <div className="absolute left-4 top-4 z-10">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              className="h-5 w-5 data-[state=checked]:bg-travel-purple"
            />
          </div>
        )}
        <div className={cn("flex flex-col", isSelectable && "pl-7")}>
          <CardTitle className="text-xl font-semibold">{group.name}</CardTitle>
          <CardDescription className="text-sm">
            {group.tripCount} {group.tripCount === 1 ? 'Trip' : 'Trips'}
          </CardDescription>
        </div>
        
        {!bulkMode && (
          <div className="absolute right-4 top-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/groups/${group.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </Link>
                </DropdownMenuItem>
                {onSelect && (
                  <DropdownMenuItem onClick={handleSelect}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    {isSelected ? 'Deselect' : 'Select'}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end pt-2">
        <div className="flex items-center text-sm">
          <Users className="mr-1.5 h-4 w-4 text-travel-purple" />
          <span>{group.memberCount} {group.memberCount === 1 ? 'Member' : 'Members'}</span>
        </div>
      </CardContent>
    </Card>
  );

  // If it's selectable, wrap the card with a click handler
  if (isSelectable) {
    return (
      <div onClick={handleSelect}>
        {cardContent}
      </div>
    );
  }

  // If not in bulk mode, make it a link to the group page
  if (!bulkMode) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Link href={`/groups/${group.id}`}>
            {cardContent}
          </Link>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {onEdit && (
            <ContextMenuItem onClick={handleEdit}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Edit
            </ContextMenuItem>
          )}
          <ContextMenuItem asChild>
            <Link href={`/groups/${group.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </Link>
          </ContextMenuItem>
          {onSelect && (
            <ContextMenuItem onClick={handleSelect}>
              <CheckSquare className="mr-2 h-4 w-4" />
              {isSelected ? 'Deselect' : 'Select'}
            </ContextMenuItem>
          )}
          {onDelete && (
            <ContextMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // In bulk mode with no selection, just show the card
  return cardContent;
} 