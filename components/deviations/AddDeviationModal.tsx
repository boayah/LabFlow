'use client';

import { useState, useTransition } from 'react';
import { Plus, X } from 'lucide-react';
import { createDeviation } from '@/app/deviations/actions';
import type { Sample, ExperimentRun, DeviationSeverity, DeviationCategory } from '@/lib/supabase/types';

const SEVERITY_OPTIONS: { value: DeviationSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const CATEGORY_OPTIONS: { value: DeviationCategory; label: string }[] = [
  { value: 'equipment', label: 'Equipment' },
  { value: 'protocol', label: 'Protocol' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'sample', label: 'Sample' },
  { value: 'reagent', label: 'Reagent' },
];

const OWNERS = ['Dr. L. Chen', 'J. Martinez', 'A. Patel', 'T. Nguyen', 'Dr. R. Osei'];

const EMPTY_FORM = {
  severity: 'medium' as DeviationSeverity,
  category: 'protocol' as DeviationCategory,
  description: '',
  immediate_action: '',
  corrective_action: '',
  owner: 'Dr. L. Chen',
  opened_date: new Date().toISOString().split('T')[0],
  linked_sample_id: '',
  linked_run_id: '',
};

interface Props {
  samples: Sample[];
  runs: ExperimentRun[];
}

export function AddDeviationModal({ samples, runs }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleClose() {
    setIsOpen(false);
    setError(null);
    setForm(EMPTY_FORM);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) {
      setError('Description is required.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createDeviation({
        severity: form.severity,
        category: form.category,
        description: form.description.trim(),
        immediate_action: form.immediate_action.trim() || undefined,
        corrective_action: form.corrective_action.trim() || undefined,
        owner: form.owner,
        opened_date: form.opened_date,
        linked_sample_id: form.linked_sample_id || undefined,
        linked_run_id: form.linked_run_id || undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        handleClose();
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        File Deviation
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">File Deviation</h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Severity</label>
                  <select
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SEVERITY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Opened Date
                  </label>
                  <input
                    type="date"
                    name="opened_date"
                    value={form.opened_date}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the deviation clearly, including what was observed and when."
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Immediate Action (optional)
                </label>
                <textarea
                  name="immediate_action"
                  value={form.immediate_action}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Steps taken immediately after the deviation was identified."
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Corrective Action (optional)
                </label>
                <textarea
                  name="corrective_action"
                  value={form.corrective_action}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Long-term corrective action to prevent recurrence."
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Owner</label>
                  <select
                    name="owner"
                    value={form.owner}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {OWNERS.map(o => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Linked Sample (optional)
                  </label>
                  <select
                    name="linked_sample_id"
                    value={form.linked_sample_id}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {samples.map(s => (
                      <option key={s.id} value={s.sample_id}>
                        {s.sample_id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Linked Run (optional)
                  </label>
                  <select
                    name="linked_run_id"
                    value={form.linked_run_id}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {runs.map(r => (
                      <option key={r.id} value={r.run_id}>
                        {r.run_id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                >
                  {isPending ? 'Filing...' : 'File Deviation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
