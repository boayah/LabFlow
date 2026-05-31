'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const SEVERITY_OPTIONS = [
  { value: '', label: 'All Severities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'protocol', label: 'Protocol' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'sample', label: 'Sample' },
  { value: 'reagent', label: 'Reagent' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in-review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
];

export function DeviationFilters() {
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
      <select
        value={searchParams.get('severity') ?? ''}
        onChange={e => updateParam('severity', e.target.value)}
        className={selectClass}
      >
        {SEVERITY_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('category') ?? ''}
        onChange={e => updateParam('category', e.target.value)}
        className={selectClass}
      >
        {CATEGORY_OPTIONS.map(o => (
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
    </div>
  );
}
