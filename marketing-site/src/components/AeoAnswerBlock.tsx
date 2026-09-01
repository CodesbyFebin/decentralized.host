import React from 'react';
import { HelpCircle, Check, Sparkles } from 'lucide-react';

interface Props {
  question?: string;
  answer: string;
  sourceContext?: string;
}

export const AeoAnswerBlock: React.FC<Props> = ({ 
  question = 'Direct Answer / Canonical Definition',
  answer,
  sourceContext = 'Extracted from repository architecture & implementation specifications'
}) => {
  return (
    <div className="relative my-6 p-4 sm:p-5 rounded-lg bg-[#0a0a0a] border border-[#00FF41]/30 shadow-[0_0_20px_rgba(0,255,65,0.08)] overflow-hidden">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00FF41]" />
      
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-mono font-semibold tracking-widest text-[#00FF41] uppercase">
              {question}
            </span>
            <span className="text-[10px] font-mono text-white/50 flex items-center gap-1 uppercase tracking-wider">
              <Check className="w-3 h-3 text-[#00FF41]" /> AEO Verified
            </span>
          </div>
          <p className="text-white font-medium text-sm sm:text-base leading-relaxed font-sans">
            {answer}
          </p>
          <div className="text-[10px] text-white/40 font-mono pt-1.5 border-t border-white/10 uppercase tracking-wider">
            Source: {sourceContext}
          </div>
        </div>
      </div>
    </div>
  );
};
