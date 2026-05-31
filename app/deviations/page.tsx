export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { DeviationFilters } from '@/components/deviations/DeviationFilters';
import { DeviationTable } from '@/components/deviations/DeviationTable';
import { AddDeviationModal } from '@/components/deviations/AddDeviationModal';
import type { Sample, ExperimentRun, Deviation } from '@/lib/supabase/types';

interface SearchParams {
  severity?: string;
  category?: string;
  status?: string;
}

async function DeviationsContent({ params }: { params: SearchParams }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  let query = sb.from('deviations').select('*').order('opened_date', { ascending: false });

  if (params.severity) query = query.eq('severity', params.severity);
  if (params.category) query = query.eq('category', params.category);
  if (params.status) query = query.eq('status', params.status);

  const { data, error } = await query;
  const deviations = (data ?? []) as Deviation[];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
        Failed to load deviations: {error.message}
      </div>
    );
  }

  if (deviations.length === 0) {
    return (
      <EmptyState
        title="No deviations found"
        description="No deviations match your current filters, or none have been filed yet."
      />
    );
  }

  return <DeviationTable deviations={deviations} />;
}

export default async function DeviationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  const [samplesRes, runsRes] = await Promise.all([
    sb.from('samples').select('id, sample_id, source, sample_type, status').order('created_at', { ascending: false }),
    sb.from('experiment_runs').select('id, run_id, protocol_name').order('created_at', { ascending: false }),
  ]);

  const samples = (samplesRes.data ?? []) as Sample[];
  const runs = (runsRes.data ?? []) as ExperimentRun[];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Deviations"
          description="Document and track deviations from expected procedures. All entries are logged in the audit trail."
        />
        <AddDeviationModal samples={samples} runs={runs} />
      </div>

      <Suspense>
        <DeviationFilters />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-48 bg-white rounded-lg border border-slate-200 animate-pulse" />
        }
      >
        <DeviationsContent params={params} />
      </Suspense>
    </div>
  );
}

