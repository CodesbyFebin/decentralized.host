import React from 'react';

interface TerminalCursorProps {
  char?: string;
  className?: string;
  color?: string;
  asBlock?: boolean;
}

export const TerminalCursor: React.FC<TerminalCursorProps> = ({
  char = '▋',
  className = '',
  color = 'text-[#00FF41]',
  asBlock = false,
}) => {
  if (asBlock) {
    return (
      <span
        aria-hidden="true"
        className={`inline-block w-2.5 h-4 sm:h-5 bg-[#00FF41] align-middle ml-1 shadow-[0_0_8px_rgba(0,255,65,0.8)] animate-terminal-cursor ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-block ml-0.5 font-mono select-none animate-terminal-cursor ${color} ${className}`}
    >
      {char}
    </span>
  );
};
