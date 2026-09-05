'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock, Check, Sparkles, Send, FileText, Image as ImageIcon, Copy, ArrowRight } from 'lucide-react';
import { ContentItem, ProductionProgress, getProductionStatus, getProductionStatusBadge } from '@/lib/content-contract';

interface ProductionProgressWidgetProps {
  item: ContentItem;
  onUpdateProgress: (newProgress: Partial<ProductionProgress>) => void;
  className?: string;
  variant?: 'card' | 'panel' | 'compact';
}

export default function ProductionProgressWidget({
  item,
  onUpdateProgress,
  className = '',
  variant = 'card',
}: ProductionProgressWidgetProps) {
  const progress: ProductionProgress = item.productionProgress || {
    briefReady: true,
    promptCopied: false,
    assetCreated: false,
    captionCopied: false,
    readyToPost: false,
    alreadyPosted: false,
  };

  const status = getProductionStatus(item);
  const badge = getProductionStatusBadge(status);

  // Count completed tasks out of 6
  const completedCount = [
    progress.briefReady ?? true,
    !!progress.promptCopied,
    !!progress.assetCreated,
    !!progress.captionCopied,
    !!progress.readyToPost,
    !!progress.alreadyPosted,
  ].filter(Boolean).length;

  const toggleField = (field: keyof ProductionProgress) => {
    const currentVal = field === 'briefReady' ? (progress.briefReady ?? true) : !!progress[field];
    const updatedVal = !currentVal;
    
    const updated: Partial<ProductionProgress> = {
      [field]: updatedVal,
    };

    onUpdateProgress(updated);
  };

  const steps: {
    key: keyof ProductionProgress;
    label: string;
    description: string;
    isManual: boolean;
    checked: boolean;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'briefReady',
      label: 'Brief siap',
      description: 'Draf konsep, hook, dan pesan konten sudah lengkap di kalender.',
      isManual: false,
      checked: progress.briefReady ?? true,
      icon: <FileText size={15} className="text-[#0f766e]" />,
    },
    {
      key: 'promptCopied',
      label: 'Prompt disalin',
      description: 'Prompt visual/video sudah disalin untuk digunakan di tool AI.',
      isManual: false,
      checked: !!progress.promptCopied,
      icon: <Copy size={15} className="text-blue-600" />,
    },
    {
      key: 'assetCreated',
      label: 'Aset dibuat',
      description: 'Centang jika gambar/video sudah selesai dibuat di tool eksternal.',
      isManual: true,
      checked: !!progress.assetCreated,
      icon: <ImageIcon size={15} className="text-amber-600" />,
    },
    {
      key: 'captionCopied',
      label: 'Caption disalin',
      description: 'Teks caption/naskah sudah disalin dan siap ditempel ke media sosial.',
      isManual: false,
      checked: !!progress.captionCopied,
      icon: <Copy size={15} className="text-indigo-600" />,
    },
    {
      key: 'readyToPost',
      label: 'Siap posting',
      description: 'Aset visual dan caption sudah siap diunggah ke Instagram / Facebook.',
      isManual: true,
      checked: !!progress.readyToPost,
      icon: <Sparkles size={15} className="text-teal-600" />,
    },
    {
      key: 'alreadyPosted',
      label: 'Sudah diposting',
      description: 'Centang setelah postingan resmi tayang di feed/reels akun Anda.',
      isManual: true,
      checked: !!progress.alreadyPosted,
      icon: <Send size={15} className="text-emerald-600" />,
    },
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.bgClass}`}>
          <span className={`w-2 h-2 rounded-full ${badge.dotClass}`} />
          <span>{badge.label}</span>
        </span>
        <span className="text-xs text-stone-500 font-medium">
          {completedCount}/6 tahap
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-[#fffdf8] border border-[#e7e0d4] rounded-2xl p-4 md:p-5 shadow-xs ${className}`}>
      {/* Header with Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e7e0d4]">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm md:text-base font-bold text-[#1f2933]">
              Progress Produksi Konten
            </h4>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bgClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Pantau tahap produksi setelah membuat aset di tool eksternal (Canva, Google Flow, dll).
          </p>
        </div>

        {/* Progress counter pill */}
        <div className="flex items-center gap-2 bg-[#f6f3ee] px-3 py-1.5 rounded-xl border border-[#e7e0d4] self-start sm:self-auto">
          <span className="text-xs font-semibold text-stone-600">Selesai:</span>
          <span className="text-xs font-extrabold text-[#0f766e]">{completedCount}/6</span>
          <div className="w-14 bg-stone-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0f766e] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(completedCount / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 6 Step Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-4">
        {steps.map((step) => (
          <button
            key={step.key}
            type="button"
            onClick={() => toggleField(step.key)}
            className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
              step.checked
                ? 'bg-teal-50/60 border-[#0f766e]/30 hover:border-[#0f766e]/50'
                : 'bg-white border-[#e7e0d4] hover:border-stone-400 hover:bg-stone-50/60'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {step.checked ? (
                <CheckCircle2 size={18} className="text-[#0f766e] fill-teal-100" />
              ) : (
                <Circle size={18} className="text-stone-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${step.checked ? 'text-[#0f766e]' : 'text-[#1f2933]'}`}>
                  {step.label}
                </span>
                {step.isManual && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 text-stone-500 rounded border border-stone-200 font-medium">
                    Manual
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                {step.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
