/**
 * Manage Tab Template
 *
 * A template for the management tab in a trip or group page.
 * Provides unified access to member management, privacy settings,
 * and other administrative functions.
 *
 * @module manage/templates
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemberManagement } from '../organisms/member-management';
import { PrivacySettingsCard } from '../molecules/privacy-settings-card';
import { MemberRole } from '../atoms/member-role-badge';
import { PrivacyLevel } from '../atoms/entity-privacy-badge';
import { Member } from '../molecules/member-list-item';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ManageTabTemplateProps {
  /** Entity ID (trip or group) */
  entityId: string;
  /** Entity type */
  entityType: 'trip' | 'group';
  /** Entity name */
  entityName: string;
  /** List of members */
  members: Member[];
  /** Current user ID */
  currentUserId: string;
  /** Current user role */
  currentUserRole: MemberRole;
  /** Current privacy setting */
  privacySetting: PrivacyLevel;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Whether the entity is owned by the current user */
  isOwner?: boolean;
  /** Callbacks for member management actions */
  onRemoveMember?: (memberId: string) => Promise<void>;
  onChangeMemberRole?: (memberId: string, newRole: MemberRole) => Promise<void>;
  onResendInvite?: (memberId: string) => Promise<void>;
  onInviteMember?: (email: string, role?: MemberRole) => Promise<void>;
  /** Callback for privacy setting changes */
  onPrivacyChange?: (privacy: PrivacyLevel) => Promise<void>;
  /** Callback for entity deletion */
  onDelete?: () => Promise<void>;
  /** Callback for entity archiving */
  onArchive?: () => Promise<void>;
  /** Callback for entity transferring */
  onTransferOwnership?: (newOwnerId: string) => Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ManageTabTemplate({
  entityId,
  entityType,
  entityName,
  members,
  currentUserId,
  currentUserRole,
  privacySetting,
  isLoading = false,
  isOwner = false,
  onRemoveMember,
  onChangeMemberRole,
  onResendInvite,
  onInviteMember,
  onPrivacyChange,
  onDelete,
  onArchive,
  onTransferOwnership,
  className,
}: ManageTabTemplateProps) {
  const [activeTab, setActiveTab] = useState('members');
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle privacy setting change
  const handlePrivacyChange = async (privacy: PrivacyLevel) => {
    if (!onPrivacyChange) return;

    try {
      setPrivacyLoading(true);
      await onPrivacyChange(privacy);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    } finally {
      setPrivacyLoading(false);
    }
  };

  // Handle entity deletion
  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete();
    } catch (error) {
      console.error(`Failed to delete ${entityType}:`, error);
      setIsDeleting(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          {isOwner && <TabsTrigger value="danger">Danger Zone</TabsTrigger>}
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <MemberManagement
            members={members}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            entityId={entityId}
            entityType={entityType}
            isLoading={isLoading}
            onRemoveMember={onRemoveMember}
            onChangeMemberRole={onChangeMemberRole}
            onResendInvite={onResendInvite}
            onInviteMember={onInviteMember}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Privacy settings card */}
          {onPrivacyChange && (
            <PrivacySettingsCard
              value={privacySetting}
              onChange={handlePrivacyChange}
              isLoading={privacyLoading}
              disabled={!['owner', 'admin'].includes(currentUserRole)}
            />
          )}

          {/* Other settings could go here */}
        </TabsContent>

        {isOwner && (
          <TabsContent value="danger" className="space-y-4">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  These actions cannot be undone. Please be certain.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {onDelete && (
                  <div className="border rounded-md p-4 border-red-200">
                    <div className="font-medium">Delete this {entityType}</div>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      Permanently delete this {entityType} and all of its data. This action cannot
                      be undone.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-1">
                          <Trash className="h-4 w-4" />
                          Delete {entityType}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the {entityType} "{entityName}" and all of
                            its data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {/* Other danger zone actions */}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
