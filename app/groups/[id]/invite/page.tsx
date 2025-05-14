import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function GroupInvitePage({ params }: { params: { id: string } }) {
  const groupId = params.id;
  const supabase = await getServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect(`/login?redirectTo=/groups/${groupId}/invite`);
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
  const userId = session.user.id;
  const membership = group.group_members?.find(
    (m: any) => m.user_id === userId && m.status === 'active'
  );
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    redirect(`/groups/${groupId}`);
  }
  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://withme.travel'}/groups/${groupId}/join`;
  return (
    <div className="container max-w-lg py-12">
      <Card>
        <CardHeader>
          <CardTitle>Invite Friends to {group.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Invite Link</label>
            <div className="flex gap-2">
              <Input value={inviteUrl} readOnly className="flex-1" />
              <Button type="button" onClick={() => navigator.clipboard.writeText(inviteUrl)}>
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this link with your friends to invite them to your group.
            </p>
          </div>
          {/* TODO: Add email/QR options here */}
        </CardContent>
      </Card>
    </div>
  );
}
