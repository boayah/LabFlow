export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ExperimentRun } from '@/lib/supabase/types';

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function QCSummary() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;
  const { data, error } = await sb
    .from('experiment_runs')
    .select('id, run_id, protocol_name, operator, date, qc_outcome, run_status, equipment_used, linked_sample_ids')
    .not('qc_outcome', 'is', null)
    .order('date', { ascending: false });

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
        Failed to load QC data: {error.message}
      </div>
    );
  }

  const runs = (data ?? []) as ExperimentRun[];

  if (runs.length === 0) {
    return (
      <EmptyState
        title="No QC records yet"
        description="QC outcomes are recorded when experiment runs are updated. No runs with QC outcomes exist yet."
      />
    );
  }

  const pass = runs.filter(r => r.qc_outcome === 'pass').length;
  const fail = runs.filter(r => r.qc_outcome === 'fail').length;
  const conditional = runs.filter(r => r.qc_outcome === 'conditional-pass').length;
  const pending = runs.filter(r => r.qc_outcome === 'pending').length;
  const decisive = pass + fail + conditional;
  const passRate = decisive > 0 ? Math.round((pass / decisive) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Pass', value: pass, color: 'text-emerald-700' },
          { label: 'Fail', value: fail, color: 'text-red-700' },
          { label: 'Conditional Pass', value: conditional, color: 'text-yellow-700' },
          { label: 'Pending Review', value: pending, color: 'text-slate-600' },
          {
            label: 'Pass Rate',
            value: passRate !== null ? `${passRate}%` : 'N/A',
            color: passRate !== null && passRate >= 80 ? 'text-emerald-700' : 'text-orange-700',
            note: decisive > 0 ? `${decisive} decisive runs` : undefined,
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg border border-slate-200 px-4 py-4">
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
            {stat.note && <p className="text-xs text-slate-400 mt-0.5">{stat.note}</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {['Run ID', 'Protocol', 'Operator', 'Date', 'Equipment', 'QC Outcome', 'Run Status'].map(h => (
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
              {runs.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-mono text-slate-900 whitespace-nowrap">
                    {r.run_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate" title={r.protocol_name}>
                    {r.protocol_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{r.operator}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate" title={r.equipment_used}>
                    {r.equipment_used}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={r.qc_outcome!} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={r.run_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-500">{runs.length} runs with QC outcomes</span>
        </div>
      </div>
    </div>
  );
}

export default function QCReportPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="QC Report"
        description="Summary of experiment run outcomes. QC outcomes are automatically recorded when runs are updated."
      />
      <Suspense
        fallback={<div className="h-48 bg-white rounded-lg border border-slate-200 animate-pulse" />}
      >
        <QCSummary />
      </Suspense>
    </div>
  );
}

