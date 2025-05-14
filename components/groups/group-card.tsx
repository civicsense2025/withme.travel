'use client';

import React from 'react';
import Link from 'next/link';
import { MoreHorizontal, Users, Trash, Copy, ExternalLink, CheckSquare } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  bulkMode = false,
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
    <Card
      className={cn(
        'h-full flex flex-col transition-all duration-300',
        'border hover:shadow-md dark:hover:shadow-lg rounded-xl overflow-hidden',
        'dark:bg-gradient-to-br dark:from-card dark:to-black/90',
        'hover:translate-y-[-2px]',
        isSelected && 'ring-2 ring-accent bg-accent/5 dark:bg-accent/10'
      )}
    >
      <CardHeader className="pb-2 relative">
        {isSelectable && (
          <div className="absolute left-4 top-4 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              className="h-5 w-5 transition-transform duration-300 data-[state=checked]:scale-105"
            />
          </div>
        )}
        <div className={cn('flex flex-col', isSelectable && 'pl-7')}>
          <CardTitle className="text-xl font-semibold">{group.name}</CardTitle>
          <CardDescription className="text-sm">
            {group.tripCount} {group.tripCount === 1 ? 'Trip' : 'Trips'}
          </CardDescription>
        </div>

        {!bulkMode && (
          <div className="absolute right-4 top-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-accent/10 transition-colors duration-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className="rounded-lg cursor-pointer transition-colors duration-150"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  asChild
                  className="rounded-lg cursor-pointer transition-colors duration-150"
                >
                  <Link href={`/groups/${group.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </Link>
                </DropdownMenuItem>
                {onSelect && (
                  <DropdownMenuItem
                    onClick={handleSelect}
                    className="rounded-lg cursor-pointer transition-colors duration-150"
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    {isSelected ? 'Deselect' : 'Select'}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive rounded-lg cursor-pointer transition-colors duration-150"
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
          <Users className="mr-1.5 h-4 w-4 text-accent" />
          <span>
            {group.memberCount} {group.memberCount === 1 ? 'Member' : 'Members'}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  // If it's selectable, wrap the card with a click handler
  if (isSelectable) {
    return (
      <div onClick={handleSelect} className="h-full cursor-pointer">
        {cardContent}
      </div>
    );
  }

  // If not in bulk mode, make it a link to the group page
  if (!bulkMode) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Link href={`/groups/${group.id}`} className="h-full block">
            {cardContent}
          </Link>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 rounded-xl p-1 shadow-lg">
          {onEdit && (
            <ContextMenuItem
              onClick={handleEdit}
              className="rounded-lg cursor-pointer transition-colors duration-150"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Edit
            </ContextMenuItem>
          )}
          <ContextMenuItem
            asChild
            className="rounded-lg cursor-pointer transition-colors duration-150"
          >
            <Link href={`/groups/${group.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </Link>
          </ContextMenuItem>
          {onSelect && (
            <ContextMenuItem
              onClick={handleSelect}
              className="rounded-lg cursor-pointer transition-colors duration-150"
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              {isSelected ? 'Deselect' : 'Select'}
            </ContextMenuItem>
          )}
          {onDelete && (
            <ContextMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive rounded-lg cursor-pointer transition-colors duration-150"
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
