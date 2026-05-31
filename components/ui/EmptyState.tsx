interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-slate-200">
      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
        <span className="text-slate-400 text-lg">-</span>
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-slate-400 max-w-xs">{description}</p>
      )}
    </div>
  );
}
