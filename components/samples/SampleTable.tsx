'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { updateSampleStatus } from '@/app/samples/actions';
import type { Sample, SampleStatus } from '@/lib/supabase/types';

const STATUS_OPTIONS: { value: SampleStatus; label: string }[] = [
  { value: 'received', label: 'Received' },
  { value: 'in-processing', label: 'In Processing' },
  { value: 'used', label: 'Used' },
  { value: 'in-review', label: 'In Review' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
  { value: 'on-hold', label: 'On Hold' },
];

const OWNERS = ['Dr. L. Chen', 'J. Martinez', 'A. Patel', 'T. Nguyen', 'Dr. R. Osei'];

const TYPE_LABELS: Record<string, string> = {
  'cell-culture': 'Cell Culture',
  tissue: 'Tissue',
  'blood-derived': 'Blood-Derived',
  reagent: 'Reagent',
};

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function SampleTable({ samples }: { samples: Sample[] }) {
  const [editing, setEditing] = useState<Sample | null>(null);
  const [newStatus, setNewStatus] = useState<SampleStatus>('received');
  const [updatedBy, setUpdatedBy] = useState('Dr. L. Chen');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openEdit(sample: Sample) {
    setEditing(sample);
    setNewStatus(sample.status);
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
      const result = await updateSampleStatus(editing.sample_id, newStatus, updatedBy);
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
                {['Sample ID', 'Type', 'Source', 'Owner', 'Received', 'Status', 'Storage', ''].map(
                  h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {samples.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-slate-900 whitespace-nowrap">
                    {s.sample_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {TYPE_LABELS[s.sample_type] ?? s.sample_type}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate"
                    title={s.source}
                  >
                    {s.source}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {s.owner}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                    {formatDate(s.received_date)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={s.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                    {s.storage_condition}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      Edit Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-500">
            {samples.length} {samples.length === 1 ? 'sample' : 'samples'}
          </span>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Update Status
              </h3>
              <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="px-5 py-4 space-y-4">
              <p className="text-xs text-slate-500">
                Sample <span className="font-mono font-medium text-slate-700">{editing.sample_id}</span>
              </p>
              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </p>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as SampleStatus)}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
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
