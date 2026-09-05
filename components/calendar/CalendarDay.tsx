'use client';

import React from 'react';
import { format, isSameDay } from 'date-fns';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Layers, Zap } from 'lucide-react';
import { ContentItem } from './types';
import { trackActivity } from '@/lib/activity';
import { getProductionStatus, getProductionStatusBadge } from '@/lib/content-contract';

const safeCopyToClipboard = async (text: string) => {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Clipboard write failed:', error);
    return false;
  }
};

export const SortableItem: React.FC<{ item: ContentItem; onClick?: () => void; isGrowth?: boolean }> = ({
  item,
  onClick,
  isGrowth,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: isGrowth ? `${item.no}_growth` : item.no });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  const isTofu = (item.jenis || '').includes('TOFU');
  const isMofu = (item.jenis || '').includes('MOFU');
  const prodStatus = getProductionStatus(item);
  const statusBadge = getProductionStatusBadge(prodStatus);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) onClick?.();
      }}
      className={`p-2.5 mb-2 rounded-xl border text-xs transition-all cursor-pointer group relative shadow-sm ${
        isDragging
          ? 'opacity-60 scale-95 border-[#0f766e] bg-[#0f766e]/10 z-[100]'
          : isTofu
          ? 'bg-sky-50/60 border-sky-200/80 hover:border-sky-300'
          : isMofu
          ? 'bg-amber-50/60 border-amber-200/80 hover:border-amber-300'
          : 'bg-[#0f766e]/5 border-[#0f766e]/20 hover:border-[#0f766e]/40'
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-normal ${
            isTofu
              ? 'text-sky-800 bg-sky-100/70'
              : isMofu
              ? 'text-amber-800 bg-amber-100/70'
              : 'text-[#0f766e] bg-[#0f766e]/10'
          }`}
        >
          {(item.jenis || '').split(' ')[0]}
        </span>
        {isGrowth && (
          <span className="px-1.5 py-0.5 bg-[#b7791f]/15 text-[#b7791f] text-[10px] font-semibold rounded border border-[#b7791f]/30">
            Growth Insight
          </span>
        )}
        <div className="text-stone-400 group-hover:text-stone-600 p-1 -m-1 transition-colors">
          <GripVertical size={12} />
        </div>
      </div>
      <div className="font-semibold text-[#1f2933] line-clamp-2 leading-snug mb-1 text-xs">
        {item.headline}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
        <Layers size={11} className="text-stone-400" />
        <span>{item.format}</span>
        {item.primaryAssetType && (
          <>
            <span className="text-stone-300">•</span>
            <span className="text-[#0f766e] font-semibold">{item.primaryAssetType}</span>
          </>
        )}
      </div>

      {/* Production Status Summary Badge */}
      <div className="mt-1.5 pt-1.5 border-t border-black/5 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${statusBadge.bgClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
          <span>{statusBadge.label}</span>
        </span>
      </div>

      {item.carousel_plan && (
        <div className="mt-1.5 p-2 bg-[#f6f3ee] border border-[#e7e0d4] rounded-lg text-[11px] space-y-1">
          <div className="flex items-center justify-between text-stone-700 font-semibold">
            <span className="flex items-center gap-1">
              <Layers size={11} className="text-[#0f766e]" /> {item.carousel_plan.slide_count || item.carousel_plan.slides?.length || 0} Slides
            </span>
            {item.carousel_plan.primary_cta_text && (
              <span
                className="text-[#0f766e] font-semibold truncate max-w-[100px]"
                title={item.carousel_plan.primary_cta_text}
              >
                CTA: {item.carousel_plan.primary_cta_text}
              </span>
            )}
          </div>
          {item.carousel_plan.belief_journey_summary && (
            <p className="text-stone-600 line-clamp-2 italic leading-relaxed">
              &quot;{item.carousel_plan.belief_journey_summary}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const CalendarDay: React.FC<{
  day: Date;
  items: ContentItem[];
  growthItems?: ContentItem[];
  isCurrentMonth: boolean;
  onClick?: () => void;
  onEdit?: (item: ContentItem) => void;
  onSendToCalcer?: (brief: string) => void;
  loadingColor?: string;
  showStartPrompt?: boolean;
  resumePrompt?: boolean;
  showConfigButton?: boolean;
  todayDate?: Date | null;
}> = ({
  day,
  items,
  growthItems = [],
  isCurrentMonth,
  onClick,
  onEdit,
  onSendToCalcer,
  loadingColor,
  showStartPrompt,
  resumePrompt,
  showConfigButton,
  todayDate,
}) => {
  const { setNodeRef } = useSortable({ id: format(day, 'yyyy-MM-dd') });

  const totalItems = items.length + growthItems.length;
  const isToday = todayDate ? isSameDay(day, todayDate) : false;

  const handleSendToCalcer = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allItems = [...items, ...growthItems];
    if (allItems.length === 0) return;

    const briefText = allItems
      .map((item) => {
        let formatInfo = `Format: ${item.format}`;
        if (item.primaryAssetType) {
          formatInfo += `\nPrimary Asset: ${item.primaryAssetType}`;
          if (item.assetTypeReason) formatInfo += `\nAsset Reason: ${item.assetTypeReason}`;
        }
        return `[${item.jenis}] ${item.headline}\n\nBody:\n${item.body}\n\nCaption:\n${item.caption}\n\n${formatInfo}\nVisual: ${item.visual}\nKeterangan: ${item.keterangan}`;
      })
      .join('\n\n---\n\n');

    void (async () => {
      const copied = await safeCopyToClipboard(briefText);
      if (copied) {
        trackActivity('Copy Data', `Copied ${allItems.length} items to clipboard via Calcer`);
      }
      onSendToCalcer?.(briefText);
    })();
  };

  return (
    <div
      ref={setNodeRef}
      onClick={() => {
        if (totalItems > 0) {
          onEdit?.(items[0] || growthItems[0]);
        } else {
          onClick?.();
        }
      }}
      className={`min-h-[90px] md:min-h-[130px] p-2 md:p-2.5 border-r border-b border-[#e7e0d4] transition-all relative ${
        !isCurrentMonth ? 'bg-[#f6f3ee]/50 opacity-40' : 'bg-[#fffdf8]'
      } ${isToday ? 'ring-2 ring-inset ring-[#0f766e]/30 bg-[#0f766e]/5' : ''} ${
        onClick || totalItems > 0 ? 'cursor-pointer hover:bg-stone-50' : ''
      } ${showStartPrompt || resumePrompt || showConfigButton ? 'ring-2 ring-[#0f766e]/40 z-10 bg-[#0f766e]/5' : ''}`}
      style={loadingColor ? { backgroundColor: loadingColor } : {}}
    >
      <div className="flex justify-between items-center mb-1.5 md:mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs md:text-sm font-semibold ${
              isToday ? 'text-[#0f766e] font-bold' : 'text-stone-500'
            }`}
          >
            {format(day, 'd')}
          </span>
        </div>
        {totalItems > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSendToCalcer}
              className="p-1 hover:bg-[#0f766e]/15 text-stone-500 hover:text-[#0f766e] rounded-md transition-all"
              title="Copy & Send to Calcer"
            >
              <Zap size={12} />
            </button>
            <span className="text-[10px] md:text-xs font-semibold text-stone-500">
              {totalItems} <span className="hidden sm:inline">Posts</span>
            </span>
          </div>
        )}
      </div>

      {(showStartPrompt || resumePrompt || showConfigButton) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-stone-500 text-xs font-medium text-center px-3">
            {resumePrompt ? (
              <>
                Lanjutkan <span className="text-[#0f766e] font-bold">Strategy</span>
              </>
            ) : showConfigButton ? (
              <>
                Ubah <span className="text-[#0f766e] font-bold">Konfigurasi</span>
              </>
            ) : (
              <>
                Mulai <span className="text-[#0f766e] font-bold">Strategy</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length > 0 && (
          <div className="space-y-1">
            <SortableContext items={items.map((i) => i.no)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableItem key={item.no} item={item} onClick={() => onEdit?.(item)} />
              ))}
            </SortableContext>
          </div>
        )}

        {growthItems.length > 0 && (
          <div className="space-y-1 pt-1.5 border-t border-[#e7e0d4]">
            <SortableContext
              items={growthItems.map((i) => i.no + '_growth')}
              strategy={verticalListSortingStrategy}
            >
              {growthItems.map((item) => (
                <SortableItem
                  key={item.no + '_growth'}
                  item={item}
                  onClick={() => onEdit?.(item)}
                  isGrowth
                />
              ))}
            </SortableContext>
          </div>
        )}
      </div>
    </div>
  );
};
