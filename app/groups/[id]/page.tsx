import { redirect } from 'next/navigation';
import GroupDetailPage from './group-detail';

export default async function GroupDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params;

  if (groupId === 'create') {
    redirect('/groups/create');
  }

  return <GroupDetailPage groupId={groupId} />;
}
