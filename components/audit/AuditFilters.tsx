'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Search } from 'lucide-react';

const ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'All Entity Types' },
  { value: 'sample', label: 'Sample' },
  { value: 'experiment_run', label: 'Experiment Run' },
  { value: 'deviation', label: 'Deviation' },
];

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'SAMPLE_CREATED', label: 'Sample Created' },
  { value: 'SAMPLE_STATUS_UPDATED', label: 'Sample Status Updated' },
  { value: 'EXPERIMENT_CREATED', label: 'Experiment Created' },
  { value: 'EXPERIMENT_UPDATED', label: 'Experiment Updated' },
  { value: 'DEVIATION_CREATED', label: 'Deviation Filed' },
  { value: 'DEVIATION_STATUS_UPDATED', label: 'Deviation Updated' },
];

export function AuditFilters() {
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
          placeholder="Search entity ID..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={e => updateParam('search', e.target.value)}
          className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
        />
      </div>

      <select
        value={searchParams.get('entity_type') ?? ''}
        onChange={e => updateParam('entity_type', e.target.value)}
        className={selectClass}
      >
        {ENTITY_TYPE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('action') ?? ''}
        onChange={e => updateParam('action', e.target.value)}
        className={selectClass}
      >
        {ACTION_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
