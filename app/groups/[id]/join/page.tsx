import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TABLES } from '@/utils/constants/tables';

export default async function GroupJoinPage({ params }: { params: { id: string } }) {
  const groupId = params.id;
  const supabase = await getServerSupabase();
  // Get user securely
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error('Error fetching user:', userError);
    redirect(`/login?redirectTo=/groups/${groupId}/join&error=auth_error`);
  }
  if (!user) {
    redirect(`/login?redirectTo=/groups/${groupId}/join`);
  }
  // Fetch group and membership
  const { data: group, error } = await supabase
    .from('groups')
    .select(`*, ${'group_members'} (user_id, role, status)`)
    .eq('id', groupId)
    .single();
  if (error || !group) {
    redirect('/groups');
  }
  const userId = user.id;
  const membership = group.group_members?.find((m: any) => m.user_id === userId);
  if (membership && membership.status === 'active') {
    redirect(`/groups/${groupId}`);
  }
  // UI logic
  let content;
  if (membership && membership.status === 'invited') {
    content = (
      <div className="space-y-4">
        <p>
          You have been invited to join <b>{group.name}</b>!
        </p>
        <form method="POST" action={`/api/groups/members/accept`}>
          <input type="hidden" name="groupId" value={groupId} />
          <Button type="submit">Accept Invitation</Button>
        </form>
        <form method="POST" action={`/api/groups/members/decline`}>
          <input type="hidden" name="groupId" value={groupId} />
          <Button type="submit" variant="outline">
            Decline
          </Button>
        </form>
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        <p>
          Want to join <b>{group.name}</b>?
        </p>
        <form method="POST" action={`/api/groups/members/request`}>
          <input type="hidden" name="groupId" value={groupId} />
          <Button type="submit">Request to Join</Button>
        </form>
      </div>
    );
  }
  return (
    <div className="container max-w-lg py-12">
      <Card>
        <CardHeader>
          <CardTitle>Join Group</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    </div>
  );
}
