export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SampleFilters } from '@/components/samples/SampleFilters';
import { SampleTable } from '@/components/samples/SampleTable';
import { AddSampleModal } from '@/components/samples/AddSampleModal';
import type { Sample } from '@/lib/supabase/types';

interface SearchParams {
  status?: string;
  sample_type?: string;
  owner?: string;
  search?: string;
  from?: string;
}

async function SamplesContent({ params }: { params: SearchParams }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  let query = sb.from('samples').select('*').order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);
  if (params.sample_type) query = query.eq('sample_type', params.sample_type);
  if (params.owner) query = query.eq('owner', params.owner);
  if (params.search) query = query.ilike('sample_id', `%${params.search}%`);
  if (params.from) query = query.gte('received_date', params.from);

  const { data, error } = await query;
  const samples = (data ?? []) as Sample[];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
        Failed to load samples: {error.message}
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <EmptyState
        title="No samples found"
        description="No samples match your current filters, or no samples have been logged yet."
      />
    );
  }

  return <SampleTable samples={samples} />;
}

export default async function SamplesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Samples"
          description="Manage all lab samples from receipt through processing and disposal."
        />
        <AddSampleModal />
      </div>

      <Suspense>
        <SampleFilters />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-48 bg-white rounded-lg border border-slate-200 animate-pulse" />
        }
      >
        <SamplesContent params={params} />
      </Suspense>
    </div>
  );
}

