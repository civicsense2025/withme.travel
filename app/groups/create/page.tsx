'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateGroupForm from '../components/create-group-form';
import { clientGuestUtils } from '@/utils/guest';

/**
 * Dedicated page for /groups/create to avoid clashing with the dynamic [id] route
 */
export default function CreateGroupPage() {
  const router = useRouter();

  // This page just renders the create group form directly
  return (
    <Container>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Create a New Group</h1>
        <Card>
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateGroupForm
              onSuccess={(groupId) => {
                router.push(`/groups/${groupId}`);
              }}
              onCancel={() => {
                router.push('/groups');
              }}
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
