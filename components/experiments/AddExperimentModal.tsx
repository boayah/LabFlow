'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { createExperimentRun } from '@/app/experiments/actions';
import type { Sample, RunStatus, QCOutcome } from '@/lib/supabase/types';

const OPERATORS = ['Dr. L. Chen', 'J. Martinez', 'A. Patel', 'T. Nguyen', 'Dr. R. Osei'];

const RUN_STATUS_OPTIONS: { value: RunStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const QC_OUTCOME_OPTIONS: { value: QCOutcome; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'conditional-pass', label: 'Conditional Pass' },
  { value: 'pending', label: 'Pending Review' },
];

const EMPTY_FORM = {
  protocol_name: '',
  operator: 'Dr. L. Chen',
  date: new Date().toISOString().split('T')[0],
  equipment_used: '',
  reagent_lot: '',
  run_status: 'pending' as RunStatus,
  qc_outcome: null as QCOutcome | null,
  observations: '',
};

export function AddExperimentModal({ samples }: { samples: Sample[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [linkedSamples, setLinkedSamples] = useState<string[]>([]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'qc_outcome' ? (value === '' ? null : value) : value,
    }));
  }

  function toggleSample(sampleId: string) {
    setLinkedSamples(prev =>
      prev.includes(sampleId) ? prev.filter(id => id !== sampleId) : [...prev, sampleId]
    );
  }

  function handleClose() {
    setIsOpen(false);
    setError(null);
    setForm(EMPTY_FORM);
    setLinkedSamples([]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.protocol_name.trim()) {
      setError('Protocol name is required.');
      return;
    }
    if (!form.equipment_used.trim()) {
      setError('Equipment used is required.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createExperimentRun({
        protocol_name: form.protocol_name.trim(),
        operator: form.operator,
        date: form.date,
        linked_sample_ids: linkedSamples,
        equipment_used: form.equipment_used.trim(),
        reagent_lot: form.reagent_lot.trim() || undefined,
        run_status: form.run_status,
        qc_outcome: form.qc_outcome,
        observations: form.observations.trim() || undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        handleClose();
      }
    });
  }

  const showQCField =
    form.run_status === 'completed' ||
    form.run_status === 'failed' ||
    form.run_status === 'cancelled';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Run
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">New Experiment Run</h2>
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

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Protocol Name
                </label>
                <input
                  type="text"
                  name="protocol_name"
                  value={form.protocol_name}
                  onChange={handleChange}
                  placeholder="e.g., MTT Cell Viability Assay - Cisplatin Dose-Response"
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Operator</label>
                  <select
                    name="operator"
                    value={form.operator}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {OPERATORS.map(o => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Equipment Used
                  </label>
                  <input
                    type="text"
                    name="equipment_used"
                    value={form.equipment_used}
                    onChange={handleChange}
                    placeholder="e.g., BioTek Epoch2 (EPR-004)"
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Reagent Lot (optional)
                  </label>
                  <input
                    type="text"
                    name="reagent_lot"
                    value={form.reagent_lot}
                    onChange={handleChange}
                    placeholder="e.g., MTT-2026-003"
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Run Status
                  </label>
                  <select
                    name="run_status"
                    value={form.run_status}
                    onChange={handleChange}
                    className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {RUN_STATUS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {showQCField && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      QC Outcome
                    </label>
                    <select
                      name="qc_outcome"
                      value={form.qc_outcome ?? ''}
                      onChange={handleChange}
                      className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Not recorded</option>
                      {QC_OUTCOME_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Linked Samples
                </label>
                {samples.length === 0 ? (
                  <p className="text-xs text-slate-400">No samples available.</p>
                ) : (
                  <div className="border border-slate-200 rounded-md max-h-40 overflow-y-auto divide-y divide-slate-100">
                    {samples.map(s => (
                      <label
                        key={s.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            linkedSamples.includes(s.sample_id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-slate-300'
                          }`}
                          onClick={() => toggleSample(s.sample_id)}
                        >
                          {linkedSamples.includes(s.sample_id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-mono text-slate-900">{s.sample_id}</span>
                          <span className="text-xs text-slate-500 ml-2 truncate">{s.source}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {linkedSamples.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    {linkedSamples.length} sample{linkedSamples.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Observations (optional)
                </label>
                <textarea
                  name="observations"
                  value={form.observations}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Key findings, control performance, notes..."
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
                  {isPending ? 'Saving...' : 'Save Run'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
