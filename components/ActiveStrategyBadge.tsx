'use client';

import React from 'react';
import { SharedContentContext } from '@/lib/content-contract';
import { Sparkles, Target, Layers, FileCode2, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';

interface ActiveStrategyBadgeProps {
  context: SharedContentContext | null;
  onOpenIntakeModal: () => void;
}

export function ActiveStrategyBadge({ context, onOpenIntakeModal }: ActiveStrategyBadgeProps) {
  if (!context) {
    return (
      <div className="bg-[#fffdf8] border border-[#e7e0d4] rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs mb-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#b7791f] shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="font-bold text-[#1f2933] text-sm">Belum Ada Strategy Blueprint</p>
            <p className="text-xs text-[#627d98] mt-0.5">
              Impor JSON dari ALCO Creative System agar kalender dikomposisikan secara Strategy-First.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenIntakeModal}
          className="px-4 py-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs rounded-xl transition shadow-sm shrink-0 flex items-center gap-2"
        >
          <Sparkles size={14} />
          Impor Blueprint
        </button>
      </div>
    );
  }

  const { brand_context, audience_context, strategy_context, system_flags } = context;

  return (
    <div className="bg-[#fffdf8] border border-[#e7e0d4] rounded-2xl p-5 md:p-6 mb-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            {context.source.origin === 'campaign_pack_converted' ? (
              <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-[#0f766e] text-xs font-semibold flex items-center gap-1.5">
                <FileCode2 size={12} /> Campaign Pack Import
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-[#0f766e] text-xs font-semibold flex items-center gap-1.5">
                <FileCode2 size={12} /> ALCO Strategy Blueprint
              </span>
            )}
            <span className="text-sm font-black text-[#1f2933] tracking-tight">
              {brand_context.brand_name}
            </span>
            {system_flags.is_complete_for_planning ? (
              <span className="inline-flex items-center gap-1 text-xs text-[#0f766e] font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                <CheckCircle2 size={12} /> Strategy Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-[#b7791f] font-semibold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                Partial Strategy
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#1f2933] pt-0.5">
            <div className="flex items-center gap-2 truncate bg-[#f6f3ee] px-3 py-1.5 rounded-lg border border-[#e7e0d4]">
              <Target size={13} className="text-[#0f766e] shrink-0" />
              <span className="text-[#627d98] font-medium">Audience:</span>
              <span className="font-semibold text-[#1f2933] truncate">{audience_context.primary_audience}</span>
            </div>
            <div className="flex items-center gap-2 truncate bg-[#f6f3ee] px-3 py-1.5 rounded-lg border border-[#e7e0d4]">
              <Layers size={13} className="text-[#0f766e] shrink-0" />
              <span className="text-[#627d98] font-medium">Offer:</span>
              <span className="font-semibold text-[#1f2933] truncate">{strategy_context.main_offer}</span>
            </div>
            <div className="flex items-center gap-2 truncate bg-[#f6f3ee] px-3 py-1.5 rounded-lg border border-[#e7e0d4]">
              <Sparkles size={13} className="text-[#b7791f] shrink-0" />
              <span className="text-[#627d98] font-medium">Message:</span>
              <span className="font-semibold text-[#1f2933] truncate">{strategy_context.core_message}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
          <button
            onClick={onOpenIntakeModal}
            className="px-3.5 py-2 bg-white hover:bg-[#f6f3ee] text-[#1f2933] font-semibold text-xs rounded-xl border border-[#e7e0d4] transition shadow-xs flex items-center gap-1.5"
          >
            <Edit3 size={13} className="text-[#0f766e]" />
            Ubah Blueprint Strategy
          </button>
        </div>
      </div>
    </div>
  );
}
