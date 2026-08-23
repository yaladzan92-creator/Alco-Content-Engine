'use client';

import React from 'react';
import { ExternalLink, Sparkles, X } from 'lucide-react';

interface PromptNextStepLinksProps {
  show?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const PromptNextStepLinks: React.FC<PromptNextStepLinksProps> = ({
  show,
  onDismiss,
  className = '',
}) => {
  if (!show) return null;

  return (
    <div
      className={`p-4 sm:p-5 bg-[#f0fdfa] border-2 border-[#0f766e]/40 rounded-2xl shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 text-stone-800 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-[#0f766e]">
            <Sparkles size={16} className="text-[#0f766e] shrink-0" />
            <span>Langkah berikutnya</span>
          </div>
          <p className="text-xs text-stone-700 font-medium leading-relaxed">
            Prompt sudah tersalin. Buka salah satu AI berikut, lalu paste prompt.
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="px-2.5 py-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 bg-white/90 hover:bg-white border border-stone-200 rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
            title="Sembunyikan panel langkah berikutnya"
          >
            <X size={12} />
            <span>Sembunyikan</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
        <a
          href="https://gemini.google.com/app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white font-bold text-xs rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <span>Buka Google Gemini</span>
          <ExternalLink size={13} />
        </a>
        <a
          href="https://chatgpt.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f2933] hover:bg-stone-900 text-white font-bold text-xs rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <span>Buka ChatGPT</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};

export default PromptNextStepLinks;
