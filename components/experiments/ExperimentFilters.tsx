'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Search } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const QC_OPTIONS = [
  { value: '', label: 'Any QC Outcome' },
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'conditional-pass', label: 'Conditional Pass' },
  { value: 'pending', label: 'Pending Review' },
];

const OPERATOR_OPTIONS = [
  { value: '', label: 'All Operators' },
  { value: 'Dr. L. Chen', label: 'Dr. L. Chen' },
  { value: 'J. Martinez', label: 'J. Martinez' },
  { value: 'A. Patel', label: 'A. Patel' },
  { value: 'T. Nguyen', label: 'T. Nguyen' },
  { value: 'Dr. R. Osei', label: 'Dr. R. Osei' },
];

export function ExperimentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const selectClass =
    'text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search protocol name..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={e => updateParam('search', e.target.value)}
          className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
        />
      </div>

      <select
        value={searchParams.get('run_status') ?? ''}
        onChange={e => updateParam('run_status', e.target.value)}
        className={selectClass}
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('qc_outcome') ?? ''}
        onChange={e => updateParam('qc_outcome', e.target.value)}
        className={selectClass}
      >
        {QC_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('operator') ?? ''}
        onChange={e => updateParam('operator', e.target.value)}
        className={selectClass}
      >
        {OPERATOR_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
