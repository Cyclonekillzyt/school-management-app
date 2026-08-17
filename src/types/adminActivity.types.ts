export type AdminActivityEntry = {
  id: string;
  actor_name: string | null;
  action: string;
  entity_type: string | null;
  entity_label: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
};