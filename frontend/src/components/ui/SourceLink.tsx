import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SourceLinkProps {
  url: string;
  label?: string;
  investigationId?: string;
  className?: string;
}

export const SourceLink: React.FC<SourceLinkProps> = ({
  url,
  label = 'View NASA PSI Record',
  investigationId,
  className = '',
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline transition-colors ${className}`}
    >
      <span>{label}</span>
      {investigationId && (
        <span className="text-[10px] bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
          {investigationId}
        </span>
      )}
      <ExternalLink size={12} className="shrink-0" />
    </a>
  );
};
