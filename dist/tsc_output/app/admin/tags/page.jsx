'use client';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export default function AdminTagsPage() {
    const supabase = useSupabaseClient();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [pendingTags, setPendingTags] = useState([]);
    const [approvedTags, setApprovedTags] = useState([]);
    useEffect(() => {
        checkAdmin();
        loadTags();
    }, []);
    async function checkAdmin() {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .single();
            if (!(profile === null || profile === void 0 ? void 0 : profile.is_admin)) {
                toast({
                    title: 'Access Denied',
                    description: 'You do not have permission to access this page',
                    variant: 'destructive',
                });
                router.push('/');
            }
        }
        catch (error) {
            console.error('Error checking admin status:', error);
            router.push('/');
        }
    }
    async function loadTags() {
        try {
            setIsLoading(true);
            // Load pending tag suggestions
            const { data: suggestions, error: suggestionsError } = await supabase
                .from('user_suggested_tags')
                .select(`
          *,
          tag:tags(*),
          destination:destinations(id, name)
        `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            if (suggestionsError)
                throw suggestionsError;
            // Load approved tags
            const { data: approved, error: approvedError } = await supabase
                .from('tags')
                .select('*')
                .eq('is_verified', true)
                .order('use_count', { ascending: false });
            if (approvedError)
                throw approvedError;
            setPendingTags((suggestions || []).map((s) => (Object.assign(Object.assign({}, s.tag), { suggestion: {
                    id: s.id,
                    tag_id: s.tag_id,
                    destination_id: s.destination_id,
                    status: s.status,
                    admin_notes: s.admin_notes,
                }, destination: s.destination }))));
            setApprovedTags(approved || []);
        }
        catch (error) {
            console.error('Error loading tags:', error);
            toast({
                title: 'Error',
                description: 'Failed to load tags',
                variant: 'destructive',
            });
        }
        finally {
            setIsLoading(false);
        }
    }
    async function handleApprove(suggestion) {
        try {
            setIsLoading(true);
            const { error } = await supabase.rpc('approve_user_suggested_tag', {
                p_suggestion_id: suggestion.id,
                p_admin_notes: 'Approved by admin',
            });
            if (error)
                throw error;
            toast({
                title: 'Success',
                description: 'Tag suggestion approved',
            });
            loadTags();
        }
        catch (error) {
            console.error('Error approving tag:', error);
            toast({
                title: 'Error',
                description: 'Failed to approve tag',
                variant: 'destructive',
            });
        }
        finally {
            setIsLoading(false);
        }
    }
    async function handleReject(suggestion, reason = 'Rejected by admin') {
        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('user_suggested_tags')
                .update({
                status: 'rejected',
                admin_notes: reason,
            })
                .eq('id', suggestion.id);
            if (error)
                throw error;
            toast({
                title: 'Success',
                description: 'Tag suggestion rejected',
            });
            loadTags();
        }
        catch (error) {
            console.error('Error rejecting tag:', error);
            toast({
                title: 'Error',
                description: 'Failed to reject tag',
                variant: 'destructive',
            });
        }
        finally {
            setIsLoading(false);
        }
    }
    if (isLoading) {
        return (<div className="container py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"/>
        </div>
      </div>);
    }
    return (<div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Tag Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Suggestions
                {pendingTags.length > 0 && (<Badge variant="secondary" className="ml-2">
                    {pendingTags.length}
                  </Badge>)}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved Tags
                {approvedTags.length > 0 && (<Badge variant="secondary" className="ml-2">
                    {approvedTags.length}
                  </Badge>)}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {pendingTags.map((tag) => (<Card key={tag.suggestion.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {tag.emoji && <span>{tag.emoji}</span>}
                              <h3 className="font-semibold">{tag.name}</h3>
                              <Badge>{tag.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Suggested for{' '}
                              <span className="font-medium">{tag.destination.name}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => handleApprove(tag.suggestion)}>
                              <Check className="h-4 w-4"/>
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => handleReject(tag.suggestion)}>
                              <X className="h-4 w-4"/>
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>))}
                  {pendingTags.length === 0 && (<div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2"/>
                      <p>No pending tag suggestions</p>
                    </div>)}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="approved">
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-3 gap-4">
                  {approvedTags.map((tag) => (<Card key={tag.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          {tag.emoji && <span>{tag.emoji}</span>}
                          <h3 className="font-semibold">{tag.name}</h3>
                          <Badge>{tag.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Used {tag.use_count} times
                        </p>
                      </CardContent>
                    </Card>))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>);
}
