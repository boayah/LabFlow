'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/client';
import { logAuditEvent } from '@/lib/audit';
import type { RunStatus, QCOutcome, SampleStatus } from '@/lib/supabase/types';

function sampleStatusFromOutcome(qcOutcome: QCOutcome | null, runStatus: RunStatus): SampleStatus {
  if (runStatus === 'failed' || runStatus === 'cancelled') return 'flagged';
  if (runStatus === 'in-progress') return 'in-processing';
  if (!qcOutcome || qcOutcome === 'pending') return 'in-processing';
  switch (qcOutcome) {
    case 'pass':
      return 'used';
    case 'fail':
      return 'flagged';
    case 'conditional-pass':
      return 'in-review';
    default:
      return 'in-processing';
  }
}

export async function createExperimentRun(data: {
  protocol_name: string;
  operator: string;
  date: string;
  linked_sample_ids: string[];
  equipment_used: string;
  reagent_lot?: string;
  run_status: RunStatus;
  qc_outcome?: QCOutcome | null;
  observations?: string;
}): Promise<{ success?: boolean; error?: string; runId?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  const { count } = await sb
    .from('experiment_runs')
    .select('*', { count: 'exact', head: true });

  const year = new Date().getFullYear();
  const runId = `EXP-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`;

  const { error } = await sb.from('experiment_runs').insert({
    run_id: runId,
    protocol_name: data.protocol_name,
    operator: data.operator,
    date: data.date,
    linked_sample_ids: data.linked_sample_ids,
    equipment_used: data.equipment_used,
    reagent_lot: data.reagent_lot ?? null,
    run_status: data.run_status,
    qc_outcome: data.qc_outcome ?? null,
    observations: data.observations ?? null,
  });

  if (error) return { error: error.message };

  if (data.linked_sample_ids.length > 0) {
    const newStatus = sampleStatusFromOutcome(data.qc_outcome ?? null, data.run_status);
    await sb
      .from('samples')
      .update({ status: newStatus })
      .in('sample_id', data.linked_sample_ids);
  }

  const linkedNote = data.linked_sample_ids.length
    ? `, linked samples: ${data.linked_sample_ids.join(', ')}`
    : '';
  await logAuditEvent(
    data.operator,
    'EXPERIMENT_CREATED',
    'experiment_run',
    runId,
    `Run ${runId} created: protocol=${data.protocol_name}, status=${data.run_status}${linkedNote}`
  );

  revalidatePath('/experiments');
  revalidatePath('/samples');
  revalidatePath('/');

  return { success: true, runId };
}

export async function updateExperimentRun(
  runId: string,
  updates: {
    run_status?: RunStatus;
    qc_outcome?: QCOutcome | null;
    observations?: string;
  },
  updatedBy: string
): Promise<{ success?: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  const { data: current } = await sb
    .from('experiment_runs')
    .select('*')
    .eq('run_id', runId)
    .single();

  if (!current) return { error: 'Run not found' };

  const patch: Record<string, unknown> = {};
  const changeParts: string[] = [];

  if (updates.run_status !== undefined && updates.run_status !== current.run_status) {
    patch.run_status = updates.run_status;
    changeParts.push(`status: ${current.run_status} -> ${updates.run_status}`);
  }
  if (updates.qc_outcome !== undefined && updates.qc_outcome !== current.qc_outcome) {
    patch.qc_outcome = updates.qc_outcome;
    changeParts.push(`qc_outcome: ${current.qc_outcome ?? 'none'} -> ${updates.qc_outcome ?? 'none'}`);
  }
  if (updates.observations !== undefined) {
    patch.observations = updates.observations;
  }

  if (Object.keys(patch).length > 0) {
    const { error } = await sb
      .from('experiment_runs')
      .update(patch)
      .eq('run_id', runId);
    if (error) return { error: error.message };
  }

  const effectiveQC = updates.qc_outcome !== undefined ? updates.qc_outcome : current.qc_outcome;
  const effectiveStatus = updates.run_status !== undefined ? updates.run_status : current.run_status;

  if (current.linked_sample_ids?.length > 0 && (updates.run_status || updates.qc_outcome !== undefined)) {
    const newSampleStatus = sampleStatusFromOutcome(effectiveQC, effectiveStatus);
    await sb
      .from('samples')
      .update({ status: newSampleStatus })
      .in('sample_id', current.linked_sample_ids);
  }

  if (changeParts.length > 0) {
    await logAuditEvent(
      updatedBy,
      'EXPERIMENT_UPDATED',
      'experiment_run',
      runId,
      changeParts.join('; ')
    );
  }

  revalidatePath('/experiments');
  revalidatePath('/samples');
  revalidatePath('/');

  return { success: true };
}
