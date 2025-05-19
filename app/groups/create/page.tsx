'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/features/layout/molecules/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Section } from '@/components/ui/Section';
import CreateGroupForm from '../components/create-group-form';
import clientGuestUtils from '@/utils/guest';

/**
 * Dedicated page for /groups/create to avoid clashing with the dynamic [id] route
 * 
 * @returns React.ReactElement The create group page component
 */
export default function CreateGroupPage(): React.ReactElement {
  const router = useRouter();

  // Handle form success - redirect to new group
  const handleSuccess = async (groupId: string): Promise<void> => {
    await router.push(`/groups/${groupId}`);
  };

  // Handle form cancellation - return to groups list
  const handleCancel = (): void => {
    router.push('/groups');
  };

  return (
    <PageContainer>
      <Section 
        title={
          <Text as="h1" variant="strong" className="text-3xl">
            Create a New Group
          </Text>
        }
        className="max-w-3xl mx-auto py-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateGroupForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              allowGuestAccess={true}
            />
          </CardContent>
        </Card>
      </Section>
    </PageContainer>
  );
}
