import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Try adjusting your search terms or filter criteria.',
  actionText,
  onAction,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center justify-center my-6">
      <div className="w-14 h-14 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-4 text-ignis-muted">
        <SearchX size={26} />
      </div>
      <h3 className="text-base font-semibold text-ignis-text mb-1">{title}</h3>
      <p className="text-xs text-ignis-muted max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-secondary text-xs">
          {actionText}
        </button>
      )}
    </div>
  );
};
