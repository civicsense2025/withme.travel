/**
 * Group Card
 * 
 * A card component that shows group details with interactive elements
 * 
 * @module groups/molecules
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { MoreHorizontal, Users, Trash, Copy, ExternalLink, CheckSquare, Edit } from 'lucide-react';
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
import { GroupImage } from '../atoms/GroupImage';
import { GroupMemberCount } from '../atoms/GroupMemberCount';
import { GroupTripCount } from '../atoms/GroupTripCount';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupCardProps {
  /** Group information */
  group: {
    id: string;
    name: string;
    description?: string;
    emoji?: string;
    imageUrl?: string;
    memberCount: number;
    tripCount: number;
    updatedAt?: string;
    createdAt?: string;
  };
  /** Whether this card is selectable (for bulk actions) */
  isSelectable?: boolean;
  /** Whether this card is currently selected */
  isSelected?: boolean;
  /** Selection handler */
  onSelect?: (id: string, isSelected: boolean) => void;
  /** Delete handler */
  onDelete?: (id: string) => void;
  /** Edit handler */
  onEdit?: (id: string) => void;
  /** Whether bulk selection mode is active */
  bulkMode?: boolean;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Click handler instead of default navigation */
  onClick?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupCard({
  group,
  isSelectable = false,
  isSelected = false,
  onSelect,
  onDelete,
  onEdit,
  bulkMode = false,
  showActions = true,
  className = '',
  onClick,
}: GroupCardProps) {
  const handleCardSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(group.id, !isSelected);
    }
  };

  const handleCheckboxChange = (checked: boolean | string) => {
    if (onSelect) {
      onSelect(group.id, !!checked);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(group.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(group.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (onClick) {
      return (
        <Card 
          className={cn(
            "overflow-hidden transition-all hover:shadow-md cursor-pointer",
            isSelected && "ring-2 ring-primary",
            className
          )}
          onClick={handleCardClick}
        >
          {children}
        </Card>
      );
    }

    return (
      <Link href={`/groups/${group.id}`} passHref>
        <Card 
          className={cn(
            "overflow-hidden transition-all hover:shadow-md cursor-pointer",
            isSelected && "ring-2 ring-primary",
            className
          )}
        >
          {children}
        </Card>
      </Link>
    );
  };

  return (
    <CardWrapper>
      <div className="relative">
        {/* Image */}
        <GroupImage 
          imageUrl={group.imageUrl}
          groupName={group.name}
          emoji={group.emoji}
        />
        
        {/* Selection checkbox for bulk mode */}
        {(isSelectable || bulkMode) && (
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 rounded-md border-2 bg-white/90"
            />
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{group.name}</CardTitle>
        {group.description && (
          <CardDescription className="line-clamp-2">{group.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex flex-col gap-1.5">
          <GroupMemberCount count={group.memberCount} />
          <GroupTripCount count={group.tripCount} />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">View Group</Button>
        
        {showActions && !bulkMode && (
          <div className="flex gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </CardWrapper>
  );
} 