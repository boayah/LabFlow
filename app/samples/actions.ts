'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/client';
import { logAuditEvent } from '@/lib/audit';
import type { SampleStatus, SampleType } from '@/lib/supabase/types';

export async function createSample(data: {
  sample_type: SampleType;
  source: string;
  storage_condition: string;
  received_date: string;
  owner: string;
  notes?: string;
}): Promise<{ success?: boolean; error?: string; sampleId?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  const { count } = await sb
    .from('samples')
    .select('*', { count: 'exact', head: true });

  const year = new Date().getFullYear();
  const sampleId = `SMP-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`;

  const { error } = await sb.from('samples').insert({
    sample_id: sampleId,
    sample_type: data.sample_type,
    source: data.source,
    storage_condition: data.storage_condition,
    received_date: data.received_date,
    owner: data.owner,
    status: 'received',
    notes: data.notes ?? null,
  });

  if (error) return { error: error.message };

  await logAuditEvent(
    data.owner,
    'SAMPLE_CREATED',
    'sample',
    sampleId,
    `Sample ${sampleId} created: type=${data.sample_type}, source=${data.source}`
  );

  revalidatePath('/samples');
  revalidatePath('/');

  return { success: true, sampleId };
}

export async function updateSampleStatus(
  sampleId: string,
  newStatus: SampleStatus,
  updatedBy: string
): Promise<{ success?: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  const { data: current } = await sb
    .from('samples')
    .select('status')
    .eq('sample_id', sampleId)
    .single();

  const { error } = await sb
    .from('samples')
    .update({ status: newStatus })
    .eq('sample_id', sampleId);

  if (error) return { error: error.message };

  await logAuditEvent(
    updatedBy,
    'SAMPLE_STATUS_UPDATED',
    'sample',
    sampleId,
    `Status changed from "${current?.status}" to "${newStatus}"`
  );

  revalidatePath('/samples');
  revalidatePath('/');

  return { success: true };
}
