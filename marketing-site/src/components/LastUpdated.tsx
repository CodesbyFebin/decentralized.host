import React from 'react';
import { Clock } from 'lucide-react';

interface Props {
  updatedAt: string;
}

export const LastUpdated: React.FC<Props> = ({ updatedAt }) => {
  const formatted = new Date(updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-white/40 uppercase tracking-wider">
      <Clock className="w-3 h-3" />
      <span>Last updated: {formatted}</span>
    </div>
  );
};
