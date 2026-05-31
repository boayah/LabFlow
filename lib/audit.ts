import { createClient } from '@/lib/supabase/client';
import type { AuditEntityType } from '@/lib/supabase/types';

export async function logAuditEvent(
  userName: string,
  action: string,
  entityType: AuditEntityType,
  entityId: string,
  changeSummary: string
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createClient() as any;
    const { error } = await sb.from('audit_events').insert({
      user_name: userName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      change_summary: changeSummary,
      timestamp: new Date().toISOString(),
    });
    if (error) {
      console.error('[audit] Failed to write event:', error.message);
    }
  } catch (err) {
    console.error('[audit] Unexpected error:', err);
  }
}
