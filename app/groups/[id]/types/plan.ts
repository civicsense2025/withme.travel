export interface Plan {
  id: string;
  name: string;
  description?: string;
  slug: string;
  created_at: string;
  created_by: string;
  group_id: string;
  is_active: boolean;
  metadata?: Record<string, any>;
}
