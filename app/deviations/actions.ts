'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/client';
import { logAuditEvent } from '@/lib/audit';
import type { DeviationSeverity, DeviationCategory, DeviationStatus } from '@/lib/supabase/types';

export async function createDeviation(data: {
  severity: DeviationSeverity;
  category: DeviationCategory;
  description: string;
  immediate_action?: string;
  corrective_action?: string;
  owner: string;
  opened_date: string;
  linked_sample_id?: string;
  linked_run_id?: string;
}): Promise<{ success?: boolean; error?: string; deviationId?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  const { count } = await sb
    .from('deviations')
    .select('*', { count: 'exact', head: true });

  const year = new Date().getFullYear();
  const deviationId = `DEV-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`;

  const { error } = await sb.from('deviations').insert({
    deviation_id: deviationId,
    severity: data.severity,
    category: data.category,
    description: data.description,
    immediate_action: data.immediate_action ?? null,
    corrective_action: data.corrective_action ?? null,
    owner: data.owner,
    status: 'open',
    opened_date: data.opened_date,
    closed_date: null,
    linked_sample_id: data.linked_sample_id ?? null,
    linked_run_id: data.linked_run_id ?? null,
  });

  if (error) return { error: error.message };

  const linkedNote = [
    data.linked_sample_id ? `sample=${data.linked_sample_id}` : '',
    data.linked_run_id ? `run=${data.linked_run_id}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  await logAuditEvent(
    data.owner,
    'DEVIATION_CREATED',
    'deviation',
    deviationId,
    `Deviation ${deviationId} filed: severity=${data.severity}, category=${data.category}${linkedNote ? `, ${linkedNote}` : ''}`
  );

  revalidatePath('/deviations');
  revalidatePath('/');

  return { success: true, deviationId };
}

export async function updateDeviationStatus(
  deviationId: string,
  newStatus: DeviationStatus,
  updatedBy: string,
  closedDate?: string
): Promise<{ success?: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  const { data: current } = await sb
    .from('deviations')
    .select('status')
    .eq('deviation_id', deviationId)
    .single();

  const patch: Record<string, string | null> = { status: newStatus };
  if (newStatus === 'resolved' && closedDate) {
    patch.closed_date = closedDate;
  }

  const { error } = await sb
    .from('deviations')
    .update(patch)
    .eq('deviation_id', deviationId);

  if (error) return { error: error.message };

  const closeNote = newStatus === 'resolved' && closedDate ? `, closed ${closedDate}` : '';
  await logAuditEvent(
    updatedBy,
    'DEVIATION_STATUS_UPDATED',
    'deviation',
    deviationId,
    `Status changed from "${current?.status}" to "${newStatus}"${closeNote}`
  );

  revalidatePath('/deviations');
  revalidatePath('/');

  return { success: true };
}
