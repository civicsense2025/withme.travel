import { redirect } from 'next/navigation';
export default function CreatePlanRedirect({ params }: { params: { id: string } }) {
  // Redirect to the main plans page for this group
  redirect(`/groups/${params.id}/plans`);
}
