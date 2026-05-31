'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Search } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'cell-culture', label: 'Cell Culture' },
  { value: 'tissue', label: 'Tissue' },
  { value: 'blood-derived', label: 'Blood-Derived' },
  { value: 'reagent', label: 'Reagent' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'received', label: 'Received' },
  { value: 'in-processing', label: 'In Processing' },
  { value: 'used', label: 'Used' },
  { value: 'in-review', label: 'In Review' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
  { value: 'on-hold', label: 'On Hold' },
];

const OWNER_OPTIONS = [
  { value: '', label: 'All Owners' },
  { value: 'Dr. L. Chen', label: 'Dr. L. Chen' },
  { value: 'J. Martinez', label: 'J. Martinez' },
  { value: 'A. Patel', label: 'A. Patel' },
  { value: 'T. Nguyen', label: 'T. Nguyen' },
  { value: 'Dr. R. Osei', label: 'Dr. R. Osei' },
];

export function SampleFilters() {
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
          placeholder="Search sample ID..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={e => updateParam('search', e.target.value)}
          className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
        />
      </div>

      <select
        value={searchParams.get('sample_type') ?? ''}
        onChange={e => updateParam('sample_type', e.target.value)}
        className={selectClass}
      >
        {TYPE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('status') ?? ''}
        onChange={e => updateParam('status', e.target.value)}
        className={selectClass}
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('owner') ?? ''}
        onChange={e => updateParam('owner', e.target.value)}
        className={selectClass}
      >
        {OWNER_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <input
        type="date"
        title="Received from"
        defaultValue={searchParams.get('from') ?? ''}
        onChange={e => updateParam('from', e.target.value)}
        className="text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
      />
    </div>
  );
}
