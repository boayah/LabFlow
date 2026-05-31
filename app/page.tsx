export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Sample, ExperimentRun, Deviation, AuditEvent } from '@/lib/supabase/types';

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ACTION_LABELS: Record<string, string> = {
  SAMPLE_CREATED: 'Sample created',
  SAMPLE_STATUS_UPDATED: 'Sample status updated',
  EXPERIMENT_CREATED: 'Experiment run created',
  EXPERIMENT_UPDATED: 'Experiment run updated',
  DEVIATION_CREATED: 'Deviation filed',
  DEVIATION_STATUS_UPDATED: 'Deviation updated',
};

const TYPE_LABELS: Record<string, string> = {
  'cell-culture': 'Cell Culture',
  tissue: 'Tissue',
  'blood-derived': 'Blood-Derived',
  reagent: 'Reagent',
};

async function DashboardContent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createClient() as any;

  const [samplesRes, runsRes, deviationsRes, auditRes] = await Promise.all([
    sb.from('samples')
      .select('id, sample_id, source, owner, status, received_date, sample_type')
      .order('created_at', { ascending: false }),
    sb.from('experiment_runs').select('id, run_status, qc_outcome'),
    sb.from('deviations')
      .select('id, deviation_id, severity, status, description, opened_date, owner')
      .order('opened_date', { ascending: false }),
    sb.from('audit_events')
      .select('id, timestamp, user_name, action, entity_id, entity_type, change_summary')
      .order('timestamp', { ascending: false })
      .limit(8),
  ]);

  const samples = (samplesRes.data ?? []) as Sample[];
  const runs = (runsRes.data ?? []) as ExperimentRun[];
  const deviations = (deviationsRes.data ?? []) as Deviation[];
  const auditEvents = (auditRes.data ?? []) as AuditEvent[];

  const activeRuns = runs.filter(r => r.run_status === 'in-progress').length;
  const openDeviations = deviations.filter(d => d.status === 'open' || d.status === 'in-review');
  const criticalOpen = openDeviations.filter(d => d.severity === 'critical').length;

  const decisiveRuns = runs.filter(r => r.qc_outcome && r.qc_outcome !== 'pending');
  const passCount = decisiveRuns.filter(r => r.qc_outcome === 'pass').length;
  const qcPassRate =
    decisiveRuns.length > 0 ? Math.round((passCount / decisiveRuns.length) * 100) : null;

  const recentSamples = samples.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Lab operations overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Samples', value: samples.length, note: null, href: '/samples', color: 'text-slate-900' },
          { label: 'Active Runs', value: activeRuns, note: null, href: '/experiments', color: 'text-blue-700' },
          {
            label: 'Open Deviations',
            value: openDeviations.length,
            note: criticalOpen > 0 ? `${criticalOpen} critical` : null,
            href: '/deviations',
            color: openDeviations.length > 0 ? 'text-red-700' : 'text-slate-900',
          },
          {
            label: 'QC Pass Rate',
            value: qcPassRate !== null ? `${qcPassRate}%` : 'N/A',
            note: decisiveRuns.length > 0 ? `${decisiveRuns.length} decisive runs` : 'No data yet',
            href: '/qc-report',
            color:
              qcPassRate !== null && qcPassRate >= 80
                ? 'text-emerald-700'
                : qcPassRate !== null
                ? 'text-orange-700'
                : 'text-slate-500',
          },
        ].map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-lg border border-slate-200 px-5 py-4 hover:border-slate-300 transition-colors block"
          >
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
            {stat.note && <p className="text-xs text-slate-400 mt-0.5">{stat.note}</p>}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Samples</h2>
            <Link href="/samples" className="text-xs text-blue-600 hover:text-blue-800">View all</Link>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {recentSamples.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">No samples yet.</p>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Sample ID', 'Type', 'Source', 'Owner', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSamples.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-xs font-mono text-slate-900">{s.sample_id}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">{TYPE_LABELS[s.sample_type] ?? s.sample_type}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-600 max-w-40 truncate" title={s.source}>{s.source}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{s.owner}</td>
                      <td className="px-4 py-2.5"><StatusBadge value={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Open Deviations</h2>
            <Link href="/deviations" className="text-xs text-blue-600 hover:text-blue-800">View all</Link>
          </div>
          <div className="space-y-2">
            {openDeviations.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 px-4 py-8 text-center">
                <p className="text-sm text-slate-400">No open deviations.</p>
              </div>
            ) : (
              openDeviations.slice(0, 5).map(d => (
                <div key={d.id} className="bg-white rounded-lg border border-slate-200 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge value={d.severity} />
                      <span className="text-xs font-mono text-slate-500">{d.deviation_id}</span>
                    </div>
                    <StatusBadge value={d.status} />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-700 line-clamp-2">{d.description}</p>
                  <p className="mt-1 text-xs text-slate-400">{d.owner} - {formatDate(d.opened_date)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
          <Link href="/audit-trail" className="text-xs text-blue-600 hover:text-blue-800">Full audit trail</Link>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {auditEvents.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">No activity yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {['Time', 'User', 'Action', 'Entity', 'Details'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditEvents.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{formatTimestamp(e.timestamp)}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-700 whitespace-nowrap">{e.user_name}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{ACTION_LABELS[e.action] ?? e.action}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-700 whitespace-nowrap">{e.entity_id}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 max-w-xs truncate" title={e.change_summary}>{e.change_summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

