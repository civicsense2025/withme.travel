'use client';

import { useState } from 'react';
import { Group } from '@/types/groups';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Bell,
  MessageSquare,
  Lock,
  Globe,
  UserPlus,
  Trash2,
  CheckSquare,
  Settings,
  PenSquare,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface GroupSettingsModalProps {
  group: Group;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupSettingsModal({ group, isOpen, onOpenChange }: GroupSettingsModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Form state
  const [formData, setFormData] = useState({
    name: group.name || '',
    description: group.description || '',
    emoji: group.emoji || '👥',
    visibility: group.visibility || 'private',
    joinRequiresApproval: true,
    allowMemberInvites: true,
    notificationsEnabled: true,
    showMemberList: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          emoji: formData.emoji,
          visibility: formData.visibility,
          // Add other fields as needed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update group');
      }

      toast.success('Group settings updated successfully');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete group');
      }

      toast.success('Group deleted successfully');
      onOpenChange(false);
      router.push('/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Group Settings
          </DialogTitle>
          <DialogDescription>Customize how your group works and looks</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="general"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Permissions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Group Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Enter group name"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="emoji" className="text-right">
                  Emoji Icon
                </Label>
                <Input
                  id="emoji"
                  value={formData.emoji}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Choose an emoji (e.g. 🌴, 🏔️, 🏞️)"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3 min-h-[100px]"
                  placeholder="Describe what this group is about"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="visibility" className="text-right">
                  Visibility
                </Label>
                <Select
                  onValueChange={(value) => handleSelectChange('visibility', value)}
                  defaultValue={formData.visibility}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Private (Invite only)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Public (Anyone can join)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="joinRequiresApproval" className="text-right">
                  Approve Join Requests
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="joinRequiresApproval"
                    checked={formData.joinRequiresApproval}
                    onCheckedChange={(checked) =>
                      handleSwitchChange('joinRequiresApproval', checked)
                    }
                  />
                  <Label htmlFor="joinRequiresApproval" className="text-sm text-muted-foreground">
                    New members need admin approval to join
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allowMemberInvites" className="text-right">
                  Member Invites
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="allowMemberInvites"
                    checked={formData.allowMemberInvites}
                    onCheckedChange={(checked) => handleSwitchChange('allowMemberInvites', checked)}
                  />
                  <Label htmlFor="allowMemberInvites" className="text-sm text-muted-foreground">
                    All members can invite others
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="showMemberList" className="text-right">
                  Member List
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="showMemberList"
                    checked={formData.showMemberList}
                    onCheckedChange={(checked) => handleSwitchChange('showMemberList', checked)}
                  />
                  <Label htmlFor="showMemberList" className="text-sm text-muted-foreground">
                    Show member list to all members
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notificationsEnabled" className="text-right">
                  Notifications
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="notificationsEnabled"
                    checked={formData.notificationsEnabled}
                    onCheckedChange={(checked) =>
                      handleSwitchChange('notificationsEnabled', checked)
                    }
                  />
                  <Label htmlFor="notificationsEnabled" className="text-sm text-muted-foreground">
                    Enable group notifications
                  </Label>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Notify members about:</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm">New trips added to the group</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm">New members joining</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm">Updates to group plans</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm">Group chat messages (if enabled)</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-4">Advanced settings and danger zone</p>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="flex items-center text-red-700 dark:text-red-400 font-medium">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Group
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1 mb-3">
              Permanently delete this group and all its data. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteGroup}
              disabled={isLoading}
            >
              Delete Group
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={isLoading} className="flex items-center">
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <PenSquare className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
