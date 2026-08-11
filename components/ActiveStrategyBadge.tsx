'use client';

import React from 'react';
import { SharedContentContext } from '@/lib/content-contract';
import { Sparkles, Target, Layers, FileCode2, Edit3, CheckCircle, AlertCircle } from 'lucide-react';

interface ActiveStrategyBadgeProps {
  context: SharedContentContext | null;
  onOpenIntakeModal: () => void;
}

export function ActiveStrategyBadge({ context, onOpenIntakeModal }: ActiveStrategyBadgeProps) {
  if (!context) {
    return (
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle size={16} />
          </div>
          <div>
            <p className="font-bold text-amber-300 text-xs">Belum Ada Strategy Blueprint</p>
            <p className="text-[11px] text-amber-400/70">
              Impor JSON dari ALCO Creative System agar kalender dikomposisikan secara Strategy-First.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenIntakeModal}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] rounded-xl transition shadow-md shrink-0 flex items-center gap-1.5"
        >
          <Sparkles size={12} />
          Impor Blueprint
        </button>
      </div>
    );
  }

  const { brand_context, audience_context, strategy_context, system_flags } = context;

  return (
    <div className="bg-zinc-900/80 border border-brand/20 rounded-2xl p-4 mb-4 backdrop-blur-md relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-full bg-brand/5 blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {context.source.origin === 'campaign_pack_converted' ? (
              <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-700/60 text-sky-300 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <FileCode2 size={10} /> Imported as Campaign Pack → Mapped into Content Context
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-brand/10 border border-brand/30 text-brand text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <FileCode2 size={10} /> ALCO Creative System Blueprint
              </span>
            )}
            <span className="text-xs font-black text-white uppercase tracking-tight">
              {brand_context.brand_name}
            </span>
            {system_flags.is_complete_for_planning ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                <CheckCircle size={10} /> Strategy Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded-md">
                Partial Strategy
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-300 pt-1">
            <div className="flex items-center gap-1.5 truncate">
              <Target size={12} className="text-brand shrink-0" />
              <span className="text-zinc-500">Audience:</span>
              <span className="font-medium text-zinc-200 truncate">{audience_context.primary_audience}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Layers size={12} className="text-brand shrink-0" />
              <span className="text-zinc-500">Offer:</span>
              <span className="font-medium text-zinc-200 truncate">{strategy_context.main_offer}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles size={12} className="text-brand shrink-0" />
              <span className="text-zinc-500">Message:</span>
              <span className="font-medium text-zinc-200 truncate">{strategy_context.core_message}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenIntakeModal}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs rounded-xl border border-zinc-700 transition flex items-center gap-1.5"
          >
            <Edit3 size={13} />
            Ubah Blueprint Strategy
          </button>
        </div>
      </div>
    </div>
  );
}
