import React from 'react';
import { ClaimStatus } from '../types';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface Props {
  status: ClaimStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ClaimBadge: React.FC<Props> = ({ status, size = 'sm', showLabel = true }) => {
  const configs = {
    IMPLEMENTED: {
      label: 'IMPLEMENTED',
      description: 'Fully implemented and verified in codebase',
      bgColor: 'bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]',
      dotColor: 'bg-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.8)]',
      icon: CheckCircle2
    },
    EXPERIMENTAL: {
      label: 'EXPERIMENTAL',
      description: 'Functional prototype in repository; active hardening',
      bgColor: 'bg-[#ffbd2e]/10 border-[#ffbd2e]/30 text-[#ffbd2e]',
      dotColor: 'bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.8)]',
      icon: AlertCircle
    },
    PLANNED: {
      label: 'PLANNED',
      description: 'Documented architecture milestone; not yet in production build',
      bgColor: 'bg-[#00e5ff]/10 border-[#00e5ff]/30 text-[#00e5ff]',
      dotColor: 'bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.8)]',
      icon: Clock
    }
  };

  const config = configs[status] || configs.IMPLEMENTED;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium border ${config.bgColor} ${sizeClasses[size]}`}
      title={config.description}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
      <Icon className="w-3 h-3" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
