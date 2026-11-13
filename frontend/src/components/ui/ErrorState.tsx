import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load experimental data.',
  onRetry,
}) => {
  return (
    <div className="glass-panel rounded-xl p-6 border-red-500/30 bg-red-950/20 text-center flex flex-col items-center justify-center my-4">
      <AlertTriangle className="text-rose-400 mb-2" size={28} />
      <p className="text-sm text-rose-200 mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs flex items-center gap-1.5">
          <RotateCw size={13} />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
