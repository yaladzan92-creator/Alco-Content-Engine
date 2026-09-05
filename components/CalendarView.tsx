'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
  addMonths,
  subMonths,
  isValid,
} from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { motion } from 'motion/react';
import {
  Layers,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  RefreshCw,
  Copy,
  Download,
  Sparkles,
  FileText,
} from 'lucide-react';

import { buildGeminiRequestHeaders } from '@/lib/client-gemini-key';
import { extractJSON } from '@/lib/geminiUtils';
import { saveProjectData, getActiveProjectId } from '@/lib/storage';
import { getProductionStatus, getProductionStatusBadge } from '@/lib/content-contract';
import { ContentItem, ConfigDataProps } from './calendar/types';
import { CalendarDay } from './calendar/CalendarDay';
import { CalendarConfigWizard } from './calendar/CalendarConfigWizard';
import { CalendarItemDetailModal } from './calendar/CalendarItemDetailModal';
import { CalendarHistoryModal } from './calendar/CalendarHistoryModal';
import { CalendarRawOutputModal } from './calendar/CalendarRawOutputModal';
import { CalendarDatePickerModal } from './calendar/CalendarDatePickerModal';

export function getStudioCtaLabel(item?: ContentItem | null): string {
  if (!item) return 'Buka Studio';
  const asset = (item.primaryAssetType || '').toLowerCase();
  const format = (item.format || '').toLowerCase();

  if (asset === 'carousel' || format.includes('carousel') || format.includes('karosel') || format.includes('slide')) {
    return 'Buat Carousel';
  }
  if (asset === 'video' || format.includes('video') || format.includes('reels') || format.includes('tiktok') || format.includes('shorts') || format.includes('ugc')) {
    return 'Buat Video';
  }
  if (asset === 'image' || format.includes('image') || format.includes('single') || format.includes('feed') || format.includes('poster') || format.includes('foto')) {
    return 'Buat Image';
  }
  return 'Buka Studio';
}

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

export interface CalendarViewProps {
  items: ContentItem[];
  growthItems?: ContentItem[];
  onReschedule: (itemId: number, newDate: string) => void;
  filterType: string;
  onFilterChange: (type: string) => void;
  accessCode: string;
  setAccessCode: (code: string) => void;
  isAccessValid: boolean;
  isEditAccessLocked: boolean;
  setShowUnlockModal: (val: boolean) => void;
  accessStatus: any;
  usageStats: any;
  isLoading: boolean;
  isConfiguring: boolean;
  setIsConfiguring: (val: boolean) => void;
  currentStep: number;
  setCurrentStep: (val: number | ((prev: number) => number)) => void;
  activeConfigCell: number | null;
  setActiveConfigCell: (val: number | null) => void;
  revisions: Record<number, string>;
  setRevisions: (
    val: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)
  ) => void;
  onRegenerate: () => void;
  onClear: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onUpdateItem: (item: ContentItem) => void;
  onRegenerateItem: (itemNo: number, instruction: string) => Promise<void>;
  history: any[];
  onDeleteHistory: (id: number) => void;
  onClearHistory: () => void;
  onReset: () => void;
  onLoadHistory: (entry: any) => void;
  onSendToCalcer: (brief: string) => void;
  configData: ConfigDataProps;
}

export default function CalendarView({
  items,
  growthItems = [],
  onReschedule,
  filterType,
  onFilterChange,
  accessCode,
  setAccessCode,
  isAccessValid,
  isEditAccessLocked,
  setShowUnlockModal,
  accessStatus,
  usageStats,
  isLoading,
  isConfiguring,
  setIsConfiguring,
  currentStep,
  setCurrentStep,
  activeConfigCell,
  setActiveConfigCell,
  revisions,
  setRevisions,
  onRegenerate,
  onClear,
  onCopy,
  onDownload,
  onUpdateItem,
  onRegenerateItem,
  history,
  onDeleteHistory,
  onClearHistory,
  onReset,
  onLoadHistory,
  onSendToCalcer,
  configData,
}: CalendarViewProps) {
  const router = useRouter();
  const [loadingColors, setLoadingColors] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRawOutput, setShowRawOutput] = useState(false);
  const [productionAsset, setProductionAsset] = useState<{
    type: string;
    title: string;
    content: string;
  } | null>(null);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [copiedAsset, setCopiedAsset] = useState(false);

  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState<Record<number, any>>({});

  const handleGenerateProductionAsset = async (
    assetType: 'brief' | 'caption' | 'image' | 'carousel' | 'video'
  ) => {
    if (!editingItem || isGeneratingAsset) return;
    setIsGeneratingAsset(true);
    setCopiedAsset(false);
    try {
      let promptTitle = '';
      if (assetType === 'brief') promptTitle = 'Brief';
      else if (assetType === 'caption') promptTitle = 'Caption';
      else if (assetType === 'image') promptTitle = 'Prompt Image Konten';
      else if (assetType === 'carousel') promptTitle = 'Carousel Blueprint';
      else if (assetType === 'video') promptTitle = 'Video Script';

      let prompt = `Buatkan ${promptTitle} (Bahasa Indonesia, rapi, siap pakai) untuk post konten ini:
No: ${editingItem.no} | Tgl: ${editingItem.tanggal} | Funnel: ${editingItem.jenis} | Objective: ${editingItem.tujuan} | Hook: ${editingItem.hookType} | Format: ${editingItem.format}
Headline: ${editingItem.headline}
Body: ${editingItem.body}
Keterangan: ${editingItem.keterangan}`;

      if (assetType === 'image') {
        prompt = `Buatkan Prompt Image Konten (Bahasa Indonesia, rapi, siap pakai) untuk post konten ini. PASTIKAN hasil prompt image selalu diawali dengan teks persis: "Buatkan saya image untuk konten Instagram...".
No: ${editingItem.no} | Tgl: ${editingItem.tanggal} | Funnel: ${editingItem.jenis} | Objective: ${editingItem.tujuan} | Hook: ${editingItem.hookType} | Format: ${editingItem.format}
Headline: ${editingItem.headline}
Body: ${editingItem.body}
Keterangan: ${editingItem.keterangan}`;
      }

      const response = await fetch('/api/gemini/recommendation', {
        method: 'POST',
        headers: buildGeminiRequestHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        let errText = 'API server returned error.';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errText = errData.error;
          }
        } catch (_) {}
        throw new Error(errText);
      }

      const resData = await response.json();
      setProductionAsset({
        type: assetType,
        title: promptTitle,
        content: resData.text || 'Gagal menghasilkan asset.',
      });
    } catch (err: any) {
      console.error('Production Asset Generation Error:', err);
      const errMsg = err.message || '';
      const isRateLimited =
        /dibatasi/i.test(errMsg) ||
        /rate.*limit/i.test(errMsg) || /quota/i.test(errMsg) || /429/i.test(errMsg) || /503/i.test(errMsg) || /high.*demand/i.test(errMsg) || /unavailable/i.test(errMsg);

      setProductionAsset({
        type: assetType,
        title: isRateLimited
          ? 'Permintaan AI Sedang Dibatasi'
          : `${assetType.toUpperCase()} Production Asset`,
        content: isRateLimited
          ? `### ⚠️ PERMINTAAN AI SEDANG DIBATASI\n\nPermintaan AI sedang dibatasi (Rate Limit / High Demand). Coba lagi beberapa saat.\n\nSilakan gunakan draf cadangan berikut untuk sementara:\n\n---\n\n### RENCANA PRODUKSI: ${editingItem.headline}\n\n- **Funnel Stage:** ${editingItem.jenis}\n- **Objective:** ${editingItem.tujuan}\n- **Format:** ${editingItem.format}\n- **Hook:** ${editingItem.hookType}\n\n**Deskripsi & Naskah:**\n${editingItem.body}`
          : `### RENCANA PRODUKSI: ${editingItem.headline}\n\n- **Funnel Stage:** ${editingItem.jenis}\n- **Objective:** ${editingItem.tujuan}\n- **Format:** ${editingItem.format}\n- **Hook:** ${editingItem.hookType}\n\n**Deskripsi & Naskah:**\n${editingItem.body}\n\n*(Catatan: Dibuat sebagai aset operasional konten untuk eksekusi langsung).*`,
      });
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  const getAIRecommendation = async (step: number) => {
    if (isRecommending) return;
    setIsRecommending(true);
    try {
      let prompt = '';
      if (step === 0) {
        prompt = `Rekomendasikan Core Topic (masalah utama/ide) untuk konten. HANYA return JSON: {"coreTopic": "..."}`;
      } else if (step === 2) {
        prompt = `Topik: ${configData.coreTopic}. Rekomendasikan target audience. HANYA return JSON: {"gender": "Male/Female/Both", "minAge": 20, "maxAge": 50}`;
      } else if (step === 3) {
        prompt = `Topik: ${configData.coreTopic}. Rekomendasikan komposisi konten. HANYA return JSON: {"tofu": 6, "mofu": 5, "bofu": 3}`;
      } else if (step === 5) {
        prompt = `Topik: ${configData.coreTopic}. Rekomendasikan 3 jenis hook konten (pilih dari: Call-Out, Curiosity Gap, Social Proof, Negativity Bias, Authority, Relatability). HANYA return JSON: {"hook1": "...", "hook2": "...", "hook3": "..."}`;
      } else if (step === 6) {
        prompt = `Topik: ${configData.coreTopic}. Rekomendasikan formula kampanye konten (Penjualan, Awareness & Soft Selling, Mencari Follower, atau Publikasi untuk Brand). HANYA return JSON: {"selectedFormula": "..."}`;
      }

      if (!prompt) return;

      const response = await fetch('/api/gemini/recommendation', {
        method: 'POST',
        headers: buildGeminiRequestHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        let errText = 'API server returned error description.';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errText = errData.error;
          }
        } catch (_) {}
        throw new Error(errText);
      }

      const resData = await response.json();
      try {
        const json = extractJSON(resData.text || '{}');
        setRecommendations((prev) => ({ ...prev, [step]: json }));
      } catch (e) {
        console.error('Failed to parse AI recommendation:', e);
        setRecommendations((prev) => ({ ...prev, [step]: resData.text || '' }));
      }
    } catch (err: any) {
      console.error('AI Recommendation Error:', err);
      const errMsg = err.message || '';
      const isRateLimited =
        /dibatasi/i.test(errMsg) ||
        /rate.*limit/i.test(errMsg) || /quota/i.test(errMsg) || /429/i.test(errMsg) || /503/i.test(errMsg) || /high.*demand/i.test(errMsg) || /unavailable/i.test(errMsg);

      const fallbackMsg = isRateLimited
        ? '⚠️ PERMINTAAN AI DIBATASI (Rate Limit / High Demand). Coba lagi beberapa saat.'
        : '⚠️ Gagal memuat rekomendasi. Anda dapat mengedit secara manual.';

      setRecommendations((prev) => ({ ...prev, [step]: { error: fallbackMsg } }));
    } finally {
      setIsRecommending(false);
    }
  };

  const handleApplyRecommendation = (step: number, field: string, text: any) => {
    if (step === 0) {
      configData.setCoreTopic(text);
    } else if (step === 2) {
      if (field === 'gender') configData.setGender(text);
      if (field === 'minAge') configData.setAgeRange([text, configData.ageRange[1]]);
      if (field === 'maxAge') configData.setAgeRange([configData.ageRange[0], text]);
    } else if (step === 3) {
      configData.setRatio({ ...configData.ratio, [field]: text });
    } else if (step === 5) {
      const index = field === 'hook1' ? 0 : field === 'hook2' ? 1 : 2;
      configData.updateHookMix(index, 'type', text);
    } else if (step === 6) {
      configData.setSelectedFormula(text);
    }
  };

  const handleApplyAllRecommendations = (step: number, data: any) => {
    if (step === 0) {
      configData.setCoreTopic(data.coreTopic);
    } else if (step === 2) {
      configData.setGender(data.gender);
      configData.setAgeRange([data.minAge, data.maxAge]);
    } else if (step === 3) {
      configData.setRatio({ tofu: data.tofu, mofu: data.mofu, bofu: data.bofu });
    } else if (step === 5) {
      if (data.hook1) configData.updateHookMix(0, 'type', data.hook1);
      if (data.hook2) configData.updateHookMix(1, 'type', data.hook2);
      if (data.hook3) configData.updateHookMix(2, 'type', data.hook3);
    } else if (step === 6) {
      configData.setSelectedFormula(data.selectedFormula);
    }
  };

  const rawOutputData = useMemo(() => {
    const data = growthItems.length > 0 ? growthItems : items;
    if (!data || data.length === 0) return { markdown: '', tab: '' };

    const headers = [
      'No',
      'Tanggal',
      'Jenis',
      'Tujuan',
      'Hook Type',
      'Headline',
      'Body',
      'Caption',
      'Format',
      'Primary Asset',
      'Asset Reason',
      'Referensi',
      'Visual',
      'Keterangan',
    ];

    let md = `| ${headers.join(' | ')} |\n`;
    md += `| ${headers.map(() => '---').join(' | ')} |\n`;
    data.forEach((item) => {
      const row = [
        item.no,
        item.tanggal,
        item.jenis,
        item.tujuan,
        item.hookType,
        item.headline,
        item.body,
        item.caption,
        item.format,
        item.primaryAssetType || '',
        item.assetTypeReason || '',
        item.referensi,
        item.visual,
        item.keterangan,
      ].map((v) => String(v).replace(/\|/g, '\\|').replace(/\n/g, ' '));
      md += `| ${row.join(' | ')} |\n`;
    });

    let tab = headers.join('\t') + '\n';
    data.forEach((item) => {
      const row = [
        item.no,
        item.tanggal,
        item.jenis,
        item.tujuan,
        item.hookType,
        item.headline,
        item.body,
        item.caption,
        item.format,
        item.primaryAssetType || '',
        item.assetTypeReason || '',
        item.referensi,
        item.visual,
        item.keterangan,
      ].map((v) => String(v).replace(/\t/g, ' ').replace(/\n/g, ' '));
      tab += row.join('\t') + '\n';
    });

    return { markdown: md, tab };
  }, [items, growthItems]);

  useEffect(() => {
    if (isLoading) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const colors = Array.from({ length: 42 }).map((_, i) => {
          const pulse = Math.sin(step * 0.2 + i * 0.15);
          const opacity = 0.05 + ((pulse + 1) / 2) * 0.2;
          return `rgba(177, 153, 249, ${opacity})`;
        });
        setLoadingColors(colors);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setTimeout(() => {
        setLoadingColors([]);
      }, 0);
    }
  }, [isLoading]);

  const calendarConstraintsRef = useRef<HTMLDivElement>(null);
  const calendarContentRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [todayDate, setTodayDate] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTodayDate(new Date());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateConstraints = () => {
      if (calendarConstraintsRef.current && calendarContentRef.current) {
        const containerWidth = calendarConstraintsRef.current.offsetWidth;
        const contentWidth = calendarContentRef.current.scrollWidth;
        setDragConstraints({
          left: -(contentWidth - containerWidth),
          right: 0,
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredItems = useMemo(() => {
    const normFilter = (filterType || '').toUpperCase();
    if (normFilter === 'ALL' || normFilter === '') return items;
    return items.filter((item) => (item.jenis || '').toUpperCase().includes(normFilter));
  }, [items, filterType]);

  const filteredGrowthItems = useMemo(() => {
    if (!growthItems) return [];
    const normFilter = (filterType || '').toUpperCase();
    if (normFilter === 'ALL' || normFilter === '') return growthItems;
    return growthItems.filter((item) => (item.jenis || '').toUpperCase().includes(normFilter));
  }, [growthItems, filterType]);

  const safeParseISO = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    try {
      const parsed = parseISO(dateStr);
      return isValid(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  };

  const referenceDate = useMemo(() => {
    if (items.length > 0 && items[0]?.tanggal) {
      const d = safeParseISO(items[0].tanggal);
      if (d) return d;
    }
    if (configData.startDate) {
      const d = safeParseISO(configData.startDate);
      if (d) return d;
    }
    return new Date();
  }, [items, configData.startDate]);

  const [currentViewDate, setCurrentViewDate] = useState<Date>(referenceDate);

  useEffect(() => {
    setTimeout(() => {
      if (isValid(referenceDate)) {
        setCurrentViewDate(referenceDate);
      }
    }, 0);
  }, [referenceDate]);

  const validViewDate = useMemo(() => {
    return isValid(currentViewDate) ? currentViewDate : new Date();
  }, [currentViewDate]);

  const monthStart = startOfMonth(validViewDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const preStartDate = useMemo(() => {
    const d = safeParseISO(configData.startDate);
    return d ? addDays(d, -1) : null;
  }, [configData.startDate]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeItem = items.find((i) => i.no === activeId);
    if (!activeItem) return;

    let targetDate: string | null = null;
    if (typeof overId === 'string' && overId.includes('-')) {
      targetDate = overId;
    } else {
      const overItem = items.find((i) => i.no === overId);
      if (overItem) {
        targetDate = overItem.tanggal;
      }
    }

    if (targetDate && targetDate !== activeItem.tanggal) {
      onReschedule(activeItem.no, targetDate);
    }
  };

  const mobileAgendaDates = useMemo(() => {
    const itemsInMonth = filteredItems.filter((item) => {
      try {
        const parsed = parseISO(item.tanggal);
        return isValid(parsed) && isSameMonth(parsed, monthStart);
      } catch {
        return false;
      }
    });

    const itemsToDisplay = itemsInMonth.length > 0 ? itemsInMonth : filteredItems;
    const grouped: Record<
      string,
      { date: Date; dateStr: string; items: ContentItem[]; growthItems: ContentItem[] }
    > = {};

    const sorted = [...itemsToDisplay].sort((a, b) => {
      try {
        return parseISO(a.tanggal).getTime() - parseISO(b.tanggal).getTime();
      } catch {
        return 0;
      }
    });

    sorted.forEach((item) => {
      const dateKey = item.tanggal;
      if (!grouped[dateKey]) {
        try {
          grouped[dateKey] = {
            date: parseISO(dateKey),
            dateStr: dateKey,
            items: [],
            growthItems: [],
          };
        } catch {}
      }
      if (grouped[dateKey]) {
        if (item.isGrowth) {
          grouped[dateKey].growthItems.push(item);
        } else {
          grouped[dateKey].items.push(item);
        }
      }
    });

    return Object.values(grouped);
  }, [filteredItems, monthStart]);

  return (
    <div className="space-y-3 md:space-y-4 relative">
      <motion.div
        animate={{
          scale: isConfiguring || !!editingItem ? 0.97 : 1,
          opacity: isConfiguring || !!editingItem ? 0.4 : 1,
          filter: !!editingItem ? 'blur(2px)' : 'blur(0px)',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="space-y-3 md:space-y-4"
      >
        {/* Month Navigation & Action Bar Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 md:mb-5">
          <div className="flex items-center gap-1 sm:gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentViewDate((prev) => subMonths(prev, 1))}
              className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 hover:text-stone-900 transition-all min-h-[38px] min-w-[38px] flex items-center justify-center border border-[#e7e0d4] bg-[#fffdf8] shadow-sm"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft size={18} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDatePicker(true)}
              className="text-base sm:text-lg font-bold text-[#1f2933] hover:text-[#0f766e] transition-colors px-3 py-1.5 rounded-xl hover:bg-stone-100 flex items-center gap-2 group min-h-[38px] border border-[#e7e0d4] bg-[#fffdf8] shadow-sm"
            >
              <span>{format(monthStart, 'MMMM yyyy')}</span>
              <ChevronDown
                size={16}
                className="text-stone-400 group-hover:text-[#0f766e] transition-colors"
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentViewDate((prev) => addMonths(prev, 1))}
              className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 hover:text-stone-900 transition-all min-h-[38px] min-w-[38px] flex items-center justify-center border border-[#e7e0d4] bg-[#fffdf8] shadow-sm"
              title="Bulan Berikutnya"
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onReset}
                className="p-2 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-xl border border-[#e7e0d4] bg-[#fffdf8] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shadow-sm"
                title="Reset Semua Input"
              >
                <RefreshCw size={16} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowHistoryModal(true)}
                className="p-2 text-stone-500 hover:text-[#0f766e] hover:bg-stone-100 rounded-xl border border-[#e7e0d4] bg-[#fffdf8] transition-colors relative min-h-[38px] min-w-[38px] flex items-center justify-center shadow-sm"
                title="Histori Generate"
              >
                <Layers size={16} />
                {history.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#0f766e] rounded-full" />
                )}
              </motion.button>
            </div>

            {items.length > 0 && (
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRawOutput(true)}
                  className="p-2 text-stone-500 hover:text-[#0f766e] hover:bg-stone-100 rounded-xl border border-[#e7e0d4] bg-[#fffdf8] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shadow-sm"
                  title="View Raw Output (Markdown & TAB)"
                >
                  <FileText size={16} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onCopy}
                  className="p-2 text-stone-500 hover:text-[#0f766e] hover:bg-stone-100 rounded-xl border border-[#e7e0d4] bg-[#fffdf8] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shadow-sm"
                  title="Copy for Spreadsheet (TSV)"
                >
                  <Copy size={16} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onDownload}
                  className="p-2 text-stone-500 hover:text-[#0f766e] hover:bg-stone-100 rounded-xl border border-[#e7e0d4] bg-[#fffdf8] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shadow-sm"
                  title="Download CSV"
                >
                  <Download size={16} />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE VIEW: Agenda List */}
        <div className="block md:hidden space-y-4">
          {items.length === 0 ? (
            <div className="p-6 rounded-3xl border border-[#e7e0d4] bg-[#fffdf8] text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#0f766e]/10 border border-[#0f766e]/20 text-[#0f766e] flex items-center justify-center mx-auto">
                <Calendar size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1f2933]">
                  Kalender Konten Siap Dibuat
                </h3>
                <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                  Tentukan topik, pilar, dan strategi funnel untuk generate kalender publikasi
                  terstruktur.
                </p>
              </div>
              <button
                onClick={() => setIsConfiguring(true)}
                className="w-full min-h-[44px] px-4 py-2.5 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
              >
                <Layers size={14} />
                Mulai Setup Kalender
              </button>
            </div>
          ) : mobileAgendaDates.length === 0 ? (
            <div className="p-6 rounded-3xl border border-[#e7e0d4] bg-[#fffdf8] text-center space-y-3 shadow-sm">
              <p className="text-xs text-stone-600">
                Tidak ada konten pada bulan {format(monthStart, 'MMMM yyyy')} yang sesuai filter.
              </p>
              <button
                onClick={() => setIsConfiguring(true)}
                className="min-h-[40px] px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition border border-stone-200"
              >
                Atur Tanggal / Generate Lagi
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mobileAgendaDates.map((group) => {
                const allGroupItems = [...group.items, ...group.growthItems];
                const isGroupToday = todayDate ? isSameDay(group.date, todayDate) : false;

                return (
                  <div key={group.dateStr} className="space-y-2.5">
                    {/* Date Header Badge */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isGroupToday ? 'bg-[#0f766e]' : 'bg-stone-400'
                          }`}
                        />
                        <h3 className="text-xs font-bold text-[#1f2933]">
                          {format(group.date, 'EEEE, d MMMM yyyy')}
                        </h3>
                        {isGroupToday && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#0f766e]/10 border border-[#0f766e]/30 text-[#0f766e] text-[10px] font-semibold">
                            Hari Ini
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-stone-600 bg-[#fffdf8] px-2.5 py-0.5 rounded-full border border-[#e7e0d4] shadow-sm">
                        {allGroupItems.length} Konten
                      </span>
                    </div>

                    {/* Cards List for this Date */}
                    <div className="space-y-2.5">
                      {allGroupItems.map((item) => {
                        const isTofu = (item.jenis || '').toUpperCase().includes('TOFU');
                        const isMofu = (item.jenis || '').toUpperCase().includes('MOFU');
                        const isBofu = (item.jenis || '').toUpperCase().includes('BOFU');

                        return (
                          <div
                            key={item.no}
                            className={`p-4 rounded-2xl border transition-all space-y-2.5 shadow-sm ${
                              isTofu
                                ? 'bg-sky-50/60 border-sky-200'
                                : isMofu
                                ? 'bg-amber-50/60 border-amber-200'
                                : isBofu
                                ? 'bg-[#0f766e]/5 border-[#0f766e]/20'
                                : 'bg-[#fffdf8] border-[#e7e0d4]'
                            }`}
                          >
                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(() => {
                                const prodStatus = getProductionStatus(item);
                                const statusBadge = getProductionStatusBadge(prodStatus);
                                return (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusBadge.bgClass}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
                                    <span>{statusBadge.label}</span>
                                  </span>
                                );
                              })()}

                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                  isTofu
                                    ? 'bg-sky-100 text-sky-800 border-sky-200'
                                    : isMofu
                                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : 'bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/20'
                                }`}
                              >
                                {item.jenis || 'TOFU'}
                              </span>

                              <span className="px-2 py-0.5 rounded-md bg-[#fffdf8] text-stone-700 border border-[#e7e0d4] text-[10px] font-medium flex items-center gap-1">
                                <Layers size={11} className="text-stone-400" />
                                {item.format}
                              </span>

                              {item.primaryAssetType && (
                                <span className="px-2 py-0.5 rounded-md bg-[#0f766e]/10 text-[#0f766e] border border-[#0f766e]/20 text-[10px] font-semibold">
                                  {item.primaryAssetType}
                                </span>
                              )}

                              {item.isGrowth && (
                                <span className="px-1.5 py-0.5 bg-[#b7791f]/15 text-[#b7791f] border border-[#b7791f]/30 text-[10px] font-semibold rounded">
                                  Growth Insight
                                </span>
                              )}
                            </div>

                            {/* Headline */}
                            <h4 className="text-xs sm:text-sm font-bold text-[#1f2933] leading-snug line-clamp-2">
                              {item.headline}
                            </h4>

                            {/* Hook / Subtitle */}
                            {item.hookType && (
                              <div className="flex items-center gap-1.5 text-xs text-stone-600">
                                <span className="text-stone-500 font-semibold">
                                  Hook:
                                </span>
                                <span className="truncate">{item.hookType}</span>
                              </div>
                            )}

                            {/* Action Buttons Row */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                }}
                                className="flex-1 min-h-[40px] px-3 bg-[#fffdf8] hover:bg-stone-100 text-stone-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-[#e7e0d4] shadow-sm"
                              >
                                <FileText size={14} className="text-[#0f766e]" />
                                Buka Detail
                              </button>

                              <button
                                onClick={() => {
                                  const resolvedProjectId =
                                    (item as any)?.projectId ||
                                    configData?.sharedContentContext?.project_id ||
                                    configData?.strategyBlueprint?.project_id ||
                                    configData?.selectedProject ||
                                    getActiveProjectId() ||
                                    '';

                                  if (resolvedProjectId) {
                                    localStorage.setItem('alco_selected_project_id', resolvedProjectId);
                                    saveProjectData(resolvedProjectId, 'selectedContentItem', item);
                                    if (configData?.sharedContentContext) {
                                      saveProjectData(resolvedProjectId, 'context', configData.sharedContentContext);
                                    }
                                  }

                                  const itemWithProject = resolvedProjectId
                                    ? { ...item, projectId: resolvedProjectId }
                                    : item;

                                  localStorage.setItem('alco_selected_item', JSON.stringify(itemWithProject));
                                  localStorage.setItem(
                                    'alco_shared_context',
                                    JSON.stringify(configData?.sharedContentContext || null)
                                  );
                                  const tab =
                                    item.primaryAssetType === 'carousel'
                                      ? 'carousel'
                                      : item.primaryAssetType === 'video'
                                      ? 'video'
                                      : 'image';
                                  router.push(`/production-studio?tab=${tab}`);
                                }}
                                className="min-h-[40px] px-3.5 bg-[#0f766e]/10 hover:bg-[#0f766e] text-[#0f766e] hover:text-white border border-[#0f766e]/30 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                                title="Buka di Production Studio"
                              >
                                <Sparkles size={13} />
                                <span>{getStudioCtaLabel(item)}</span>
                              </button>

                              <button
                                onClick={() => {
                                  let briefText = `Tanggal: ${item.tanggal}\nJenis: ${item.jenis}\nFormat: ${item.format}\nHeadline: ${item.headline}\nHook: ${item.hookType || '-'}\nBody: ${item.body || '-'}`;
                                  void safeCopyToClipboard(briefText);
                                }}
                                className="min-h-[40px] w-10 bg-[#fffdf8] hover:bg-stone-100 border border-[#e7e0d4] text-stone-600 hover:text-stone-900 rounded-xl flex items-center justify-center transition shadow-sm"
                                title="Copy Brief"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DESKTOP VIEW: Full 7-column Calendar Grid */}
        <div className="hidden md:block">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div
              ref={calendarConstraintsRef}
              className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-[#e7e0d4] bg-[#fffdf8] shadow-sm"
            >
              <motion.div
                drag="x"
                dragConstraints={dragConstraints}
                dragElastic={0.1}
                dragMomentum={false}
                className="cursor-grab active:cursor-grabbing"
              >
                <div ref={calendarContentRef} className="w-full">
                  <div className="grid grid-cols-7 border-b border-[#e7e0d4] bg-[#f6f3ee]/70">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div
                        key={day}
                        className="p-3 text-xs font-bold text-stone-600 text-center border-r border-[#e7e0d4] last:border-r-0"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                      const dayStr = format(day, 'yyyy-MM-dd');
                      const dayItems = filteredItems.filter((item) => {
                        try {
                          return isSameDay(parseISO(item.tanggal), day);
                        } catch (e) {
                          return false;
                        }
                      });

                      const dayGrowthItems = filteredGrowthItems.filter((item) => {
                        try {
                          return isSameDay(parseISO(item.tanggal), day);
                        } catch (e) {
                          return false;
                        }
                      });

                      return (
                        <CalendarDay
                          key={dayStr}
                          day={day}
                          items={dayItems}
                          growthItems={dayGrowthItems}
                          isCurrentMonth={isSameMonth(day, monthStart)}
                          todayDate={todayDate}
                          onClick={() => {
                            if (
                              items.length === 0 ||
                              (preStartDate && isSameDay(day, preStartDate))
                            ) {
                              setIsConfiguring(true);
                            }
                          }}
                          onEdit={(item) => {
                            setEditingItem(item);
                          }}
                          onSendToCalcer={onSendToCalcer}
                          loadingColor={loadingColors[idx]}
                          showStartPrompt={
                            items.length === 0 &&
                            !!todayDate &&
                            isSameDay(day, todayDate) &&
                            !isConfiguring &&
                            !configData.coreTopic
                          }
                          resumePrompt={
                            items.length === 0 &&
                            !!todayDate &&
                            isSameDay(day, todayDate) &&
                            !isConfiguring &&
                            !!configData.coreTopic
                          }
                          showConfigButton={
                            items.length > 0 && !!preStartDate && isSameDay(day, preStartDate)
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </DndContext>
        </div>
      </motion.div>

      {/* 8-Step Wizard Modal */}
      <CalendarConfigWizard
        isOpen={isConfiguring}
        onClose={() => setIsConfiguring(false)}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        configData={configData}
        accessStatus={accessStatus}
        isLoading={isLoading}
        recommendations={recommendations}
        isRecommending={isRecommending}
        getAIRecommendation={getAIRecommendation}
        handleApplyRecommendation={handleApplyRecommendation}
        handleApplyAllRecommendations={handleApplyAllRecommendations}
      />

      {/* History Modal */}
      <CalendarHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        onClearHistory={onClearHistory}
        onDeleteHistory={onDeleteHistory}
        onLoadHistory={onLoadHistory}
      />

      {/* Raw Output Modal */}
      <CalendarRawOutputModal
        isOpen={showRawOutput}
        onClose={() => setShowRawOutput(false)}
        rawOutputData={rawOutputData}
      />

      {/* Date Picker Modal */}
      <CalendarDatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        currentViewDate={validViewDate}
        setCurrentViewDate={setCurrentViewDate}
      />

      {/* Content Item Detail Modal */}
      <CalendarItemDetailModal
        editingItem={editingItem}
        onClose={() => setEditingItem(null)}
        isEditAccessLocked={isEditAccessLocked}
        setShowUnlockModal={setShowUnlockModal}
        onUpdateItem={(item) => {
          setEditingItem(item);
          onUpdateItem(item);
        }}
        onRegenerateItem={onRegenerateItem}
        productionAsset={productionAsset}
        setProductionAsset={setProductionAsset}
        isGeneratingAsset={isGeneratingAsset}
        copiedAsset={copiedAsset}
        setCopiedAsset={setCopiedAsset}
        handleGenerateProductionAsset={handleGenerateProductionAsset}
      />
    </div>
  );
}
