'use client';

import { useState, useTransition } from 'react';
import { Plus, X } from 'lucide-react';
import { createSample } from '@/app/samples/actions';
import type { SampleType } from '@/lib/supabase/types';

const SAMPLE_TYPES: { value: SampleType; label: string }[] = [
  { value: 'cell-culture', label: 'Cell Culture' },
  { value: 'tissue', label: 'Tissue (ex vivo)' },
  { value: 'blood-derived', label: 'Blood-Derived' },
  { value: 'reagent', label: 'Reagent / Lot Check' },
];

const STORAGE_CONDITIONS = [
  '-80C Freezer A',
  '-80C Freezer B',
  'LN2 Tank 1',
  '4C Refrigerator',
  'CO2 Incubator 1',
  'CO2 Incubator 2',
  'Room Temperature',
];

const OWNERS = ['Dr. L. Chen', 'J. Martinez', 'A. Patel', 'T. Nguyen', 'Dr. R. Osei'];

const EMPTY_FORM = {
  sample_type: 'cell-culture' as SampleType,
  source: '',
  storage_condition: '-80C Freezer A',
  received_date: new Date().toISOString().split('T')[0],
  owner: 'Dr. L. Chen',
  notes: '',
};

export function AddSampleModal() {
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
    if (!form.source.trim()) {
      setError('Source description is required.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createSample({
        sample_type: form.sample_type,
        source: form.source.trim(),
        storage_condition: form.storage_condition,
        received_date: form.received_date,
        owner: form.owner,
        notes: form.notes.trim() || undefined,
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
        Add Sample
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Add Sample</h2>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Sample Type
                  </label>
                  <select
                    name="sample_type"
                    value={form.sample_type}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SAMPLE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Received Date
                  </label>
                  <input
                    type="date"
                    name="received_date"
                    value={form.received_date}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Source</label>
                <input
                  type="text"
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  placeholder="e.g., HeLa cell line (ATCC CCL-2), passage 12"
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Storage Condition
                  </label>
                  <select
                    name="storage_condition"
                    value={form.storage_condition}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STORAGE_CONDITIONS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
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
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
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
                  {isPending ? 'Saving...' : 'Save Sample'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
