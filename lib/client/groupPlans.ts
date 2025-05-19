import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';
import { handleApiResponse } from './index';

// Types
export interface GroupPlan {
  id: string;
  group_id: string;
  title: string;
  description?: string | null;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
  meta?: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  items?: GroupPlanItem[];
  slug?: string;
  name?: string;
  is_archived?: boolean;
  ideas_count?: number;
  voting?: boolean;
  completed?: boolean;
  trip_id?: string;
  creator?: {
    id: string;
    email: string;
    user_metadata: any;
  };
}

export interface GroupPlanItem {
  id: string;
  plan_id: string;
  group_id: string;
  title: string;
  description?: string | null;
  order?: number;
  type?: string;
  status?: string;
  meta?: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupIdea {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  type?: string;
  created_by: string;
  start_date?: string;
  end_date?: string;
  meta?: any;
  votes_up?: number;
  votes_down?: number;
  created_at: string;
  updated_at: string;
}

// API functions
export async function listGroupPlans(groupId: string): Promise<Result<GroupPlan[]>> {
  return tryCatch(
    fetch(`/api/groups/${groupId}/plans`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<GroupPlan[]>(response))
  );
}

export async function getGroupPlan(groupId: string, planId: string): Promise<Result<GroupPlan>> {
  return tryCatch(
    fetch(`/api/groups/${groupId}/plans/${planId}`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<GroupPlan>(response))
  );
}

export async function createGroupPlan(
  groupId: string,
  data: Partial<GroupPlan>
): Promise<Result<GroupPlan>> {
  return tryCatch(
    fetch(`/api/groups/${groupId}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<GroupPlan>(response))
  );
}

export async function updateGroupPlan(
  groupId: string,
  planId: string,
  data: Partial<GroupPlan>
): Promise<Result<GroupPlan>> {
  return tryCatch(
    fetch(`/api/groups/${groupId}/plans/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<GroupPlan>(response))
  );
}

export async function deleteGroupPlan(groupId: string, planId: string): Promise<Result<null>> {
  return tryCatch(
    fetch(`/api/groups/${groupId}/plans/${planId}`, {
      method: 'DELETE',
    }).then((response) => handleApiResponse<null>(response))
  );
}

// Ideas
export async function listGroupIdeas(groupId: string): Promise<Result<GroupIdea[]>> {
  return tryCatch(
    fetch(`/api/groups/${groupId}/ideas`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<GroupIdea[]>(response))
  );
}

export async function createGroupIdea(
  groupId: string,
  data: Partial<GroupIdea>
): Promise<Result<GroupIdea>> {
  return tryCatch(
    fetch(`/api/groups/${groupId}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<GroupIdea>(response))
  );
}

export async function voteGroupIdea(
  groupId: string,
  ideaId: string,
  voteType: 'up' | 'down'
): Promise<Result<GroupIdea>> {
  return tryCatch(
    fetch(`/api/groups/${groupId}/ideas/${ideaId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteType }),
    }).then((response) => handleApiResponse<GroupIdea>(response))
  );
}
