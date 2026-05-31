export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AuditFilters } from '@/components/audit/AuditFilters';
import type { AuditEvent } from '@/lib/supabase/types';

const ACTION_LABELS: Record<string, string> = {
  SAMPLE_CREATED: 'Sample Created',
  SAMPLE_STATUS_UPDATED: 'Sample Status Updated',
  EXPERIMENT_CREATED: 'Experiment Created',
  EXPERIMENT_UPDATED: 'Experiment Updated',
  DEVIATION_CREATED: 'Deviation Filed',
  DEVIATION_STATUS_UPDATED: 'Deviation Updated',
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  sample: 'Sample',
  experiment_run: 'Experiment Run',
  deviation: 'Deviation',
};

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface SearchParams {
  entity_type?: string;
  action?: string;
  search?: string;
}

async function AuditContent({ params }: { params: SearchParams }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  let query = sb
    .from('audit_events')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(200);

  if (params.entity_type) query = query.eq('entity_type', params.entity_type);
  if (params.action) query = query.eq('action', params.action);
  if (params.search) query = query.ilike('entity_id', `%${params.search}%`);

  const { data, error } = await query;
  const events = (data ?? []) as AuditEvent[];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
        Failed to load audit trail: {error.message}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No audit events found"
        description="Audit events are created automatically when samples, experiments, or deviations are created or updated."
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Change Summary'].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {formatTimestamp(e.timestamp)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                  {e.user_name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                  {ACTION_LABELS[e.action] ?? e.action}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                  {ENTITY_TYPE_LABELS[e.entity_type] ?? e.entity_type}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-900 whitespace-nowrap">
                  {e.entity_id}
                </td>
                <td
                  className="px-4 py-3 text-sm text-slate-600 max-w-sm truncate"
                  title={e.change_summary}
                >
                  {e.change_summary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
        <span className="text-xs text-slate-500">
          {events.length} {events.length === 1 ? 'event' : 'events'} (most recent 200)
        </span>
      </div>
    </div>
  );
}

export default async function AuditTrailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Trail"
        description="Immutable log of all create and update actions across samples, experiment runs, and deviations."
      />

      <Suspense>
        <AuditFilters />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-64 bg-white rounded-lg border border-slate-200 animate-pulse" />
        }
      >
        <AuditContent params={params} />
      </Suspense>
    </div>
  );
}

