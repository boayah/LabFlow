export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ExperimentFilters } from '@/components/experiments/ExperimentFilters';
import { ExperimentTable } from '@/components/experiments/ExperimentTable';
import { AddExperimentModal } from '@/components/experiments/AddExperimentModal';
import type { Sample, ExperimentRun } from '@/lib/supabase/types';

interface SearchParams {
  run_status?: string;
  qc_outcome?: string;
  operator?: string;
  search?: string;
}

async function ExperimentsContent({ params }: { params: SearchParams }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  let query = sb.from('experiment_runs').select('*').order('created_at', { ascending: false });

  if (params.run_status) query = query.eq('run_status', params.run_status);
  if (params.qc_outcome) query = query.eq('qc_outcome', params.qc_outcome);
  if (params.operator) query = query.eq('operator', params.operator);
  if (params.search) query = query.ilike('protocol_name', `%${params.search}%`);

  const { data, error } = await query;
  const runs = (data ?? []) as ExperimentRun[];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
        Failed to load runs: {error.message}
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <EmptyState
        title="No experiment runs found"
        description="No runs match your current filters, or no runs have been logged yet."
      />
    );
  }

  return <ExperimentTable runs={runs} />;
}

export default async function ExperimentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;
  const { data } = await sb
    .from('samples')
    .select('id, sample_id, source, sample_type, status')
    .order('created_at', { ascending: false });
  const samples = (data ?? []) as Sample[];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Experiment Runs"
          description="Log and track all assay runs, instrument usage, and QC outcomes. Linked sample statuses update automatically based on QC outcome."
        />
        <AddExperimentModal samples={samples} />
      </div>

      <Suspense>
        <ExperimentFilters />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-48 bg-white rounded-lg border border-slate-200 animate-pulse" />
        }
      >
        <ExperimentsContent params={params} />
      </Suspense>
    </div>
  );
}

