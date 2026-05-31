'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { updateDeviationStatus } from '@/app/deviations/actions';
import type { Deviation, DeviationStatus } from '@/lib/supabase/types';

const STATUS_OPTIONS: { value: DeviationStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in-review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
];

const OWNERS = ['Dr. L. Chen', 'J. Martinez', 'A. Patel', 'T. Nguyen', 'Dr. R. Osei'];

const CATEGORY_LABELS: Record<string, string> = {
  equipment: 'Equipment',
  protocol: 'Protocol',
  environmental: 'Environmental',
  sample: 'Sample',
  reagent: 'Reagent',
};

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DeviationTable({ deviations }: { deviations: Deviation[] }) {
  const [editing, setEditing] = useState<Deviation | null>(null);
  const [newStatus, setNewStatus] = useState<DeviationStatus>('open');
  const [closedDate, setClosedDate] = useState(new Date().toISOString().split('T')[0]);
  const [updatedBy, setUpdatedBy] = useState('Dr. L. Chen');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openEdit(dev: Deviation) {
    setEditing(dev);
    setNewStatus(dev.status);
    setClosedDate(dev.closed_date ?? new Date().toISOString().split('T')[0]);
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
      const result = await updateDeviationStatus(
        editing.deviation_id,
        newStatus,
        updatedBy,
        newStatus === 'resolved' ? closedDate : undefined
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
                  'Deviation ID',
                  'Severity',
                  'Category',
                  'Description',
                  'Status',
                  'Owner',
                  'Opened',
                  'Linked',
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
              {deviations.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-slate-900 whitespace-nowrap">
                    {d.deviation_id}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={d.severity} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {CATEGORY_LABELS[d.category] ?? d.category}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate"
                    title={d.description}
                  >
                    {d.description}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={d.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {d.owner}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                    {formatDate(d.opened_date)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {d.linked_sample_id ?? d.linked_run_id ?? (
                      <span className="text-slate-400 font-sans">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(d)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-500">
            {deviations.length} {deviations.length === 1 ? 'deviation' : 'deviations'}
          </span>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">Update Deviation Status</h3>
              <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="px-5 py-4 space-y-4">
              <p className="text-xs text-slate-500">
                Deviation{' '}
                <span className="font-mono font-medium text-slate-700">
                  {editing.deviation_id}
                </span>
              </p>
              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as DeviationStatus)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {newStatus === 'resolved' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Closed Date
                  </label>
                  <input
                    type="date"
                    value={closedDate}
                    onChange={e => setClosedDate(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Updated By</label>
                <select
                  value={updatedBy}
                  onChange={e => setUpdatedBy(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OWNERS.map(o => (
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
