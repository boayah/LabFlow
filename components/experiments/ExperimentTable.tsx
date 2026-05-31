'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { updateExperimentRun } from '@/app/experiments/actions';
import type { ExperimentRun, RunStatus, QCOutcome } from '@/lib/supabase/types';

const STATUS_OPTIONS: { value: RunStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const QC_OPTIONS: { value: QCOutcome; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'conditional-pass', label: 'Conditional Pass' },
  { value: 'pending', label: 'Pending Review' },
];

const OPERATORS = ['Dr. L. Chen', 'J. Martinez', 'A. Patel', 'T. Nguyen', 'Dr. R. Osei'];

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function showQCField(status: RunStatus) {
  return status === 'completed' || status === 'failed' || status === 'cancelled';
}

export function ExperimentTable({ runs }: { runs: ExperimentRun[] }) {
  const [editing, setEditing] = useState<ExperimentRun | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatus>('pending');
  const [qcOutcome, setQcOutcome] = useState<QCOutcome | ''>('');
  const [observations, setObservations] = useState('');
  const [updatedBy, setUpdatedBy] = useState('Dr. L. Chen');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openEdit(run: ExperimentRun) {
    setEditing(run);
    setRunStatus(run.run_status);
    setQcOutcome(run.qc_outcome ?? '');
    setObservations(run.observations ?? '');
    setUpdatedBy('Dr. L. Chen');
    setError(null);
  }

  function closeEdit() {
    setEditing(null);
    setError(null);
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const result = await updateExperimentRun(
        editing.run_id,
        {
          run_status: runStatus,
          qc_outcome: qcOutcome === '' ? null : qcOutcome,
          observations: observations.trim() || undefined,
        },
        updatedBy
      );
      if (result.error) {
        setError(result.error);
      } else {
        closeEdit();
      }
    });
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {[
                  'Run ID',
                  'Protocol',
                  'Operator',
                  'Date',
                  'Samples',
                  'Equipment',
                  'Status',
                  'QC Outcome',
                  '',
                ].map(h => (
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
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-slate-900 whitespace-nowrap">
                    {r.run_id}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate"
                    title={r.protocol_name}
                  >
                    {r.protocol_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {r.operator}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                    {formatDate(r.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                    {r.linked_sample_ids.length === 0 ? (
                      <span className="text-slate-400">None</span>
                    ) : (
                      <span
                        title={r.linked_sample_ids.join(', ')}
                        className="font-mono text-xs"
                      >
                        {r.linked_sample_ids.length === 1
                          ? r.linked_sample_ids[0]
                          : `${r.linked_sample_ids.length} samples`}
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-slate-500 max-w-40 truncate"
                    title={r.equipment_used}
                  >
                    {r.equipment_used}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={r.run_status} />
                  </td>
                  <td className="px-4 py-3">
                    {r.qc_outcome ? (
                      <StatusBadge value={r.qc_outcome} />
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(r)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-500">
            {runs.length} {runs.length === 1 ? 'run' : 'runs'}
          </span>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">Update Run</h3>
              <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="px-5 py-4 space-y-4">
              <p className="text-xs text-slate-500">
                Run{' '}
                <span className="font-mono font-medium text-slate-700">{editing.run_id}</span>
              </p>
              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Run Status
                  </label>
                  <select
                    value={runStatus}
                    onChange={e => setRunStatus(e.target.value as RunStatus)}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {showQCField(runStatus) && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      QC Outcome
                    </label>
                    <select
                      value={qcOutcome}
                      onChange={e => setQcOutcome(e.target.value as QCOutcome | '')}
                      className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Not recorded</option>
                      {QC_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Observations
                </label>
                <textarea
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Updated By</label>
                <select
                  value={updatedBy}
                  onChange={e => setUpdatedBy(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OPERATORS.map(o => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                >
                  {isPending ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
