const BADGE_CLASSES: Record<string, string> = {
  received: 'bg-slate-100 text-slate-700',
  'in-processing': 'bg-blue-100 text-blue-700',
  used: 'bg-emerald-100 text-emerald-700',
  'in-review': 'bg-yellow-100 text-yellow-800',
  flagged: 'bg-red-100 text-red-700',
  completed: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-slate-100 text-slate-500',
  'on-hold': 'bg-orange-100 text-orange-700',
  pending: 'bg-slate-100 text-slate-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
  pass: 'bg-emerald-100 text-emerald-700',
  fail: 'bg-red-100 text-red-700',
  'conditional-pass': 'bg-yellow-100 text-yellow-800',
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
  open: 'bg-red-100 text-red-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};

const LABEL_MAP: Record<string, string> = {
  received: 'Received',
  'in-processing': 'In Processing',
  used: 'Used',
  'in-review': 'In Review',
  flagged: 'Flagged',
  completed: 'Completed',
  archived: 'Archived',
  'on-hold': 'On Hold',
  pending: 'Pending',
  'in-progress': 'In Progress',
  failed: 'Failed',
  cancelled: 'Cancelled',
  pass: 'Pass',
  fail: 'Fail',
  'conditional-pass': 'Conditional Pass',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
  open: 'Open',
  resolved: 'Resolved',
};

interface StatusBadgeProps {
  value: string;
  className?: string;
}

export function StatusBadge({ value, className = '' }: StatusBadgeProps) {
  const classes = BADGE_CLASSES[value] ?? 'bg-slate-100 text-slate-600';
  const label = LABEL_MAP[value] ?? value;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${classes} ${className}`}
    >
      {label}
    </span>
  );
}
