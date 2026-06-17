import React, { useMemo } from 'react';
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
  setMonth,
  setYear,
  getYear,
  getMonth
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
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Layers, 
  Eye, 
  Link2, 
  GripVertical, 
  Filter, 
  Lock, 
  Zap, 
  Calendar, 
  Users, 
  Mic2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Loader2, 
  AlertCircle,
  X,
  Plus,
  LayoutGrid,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Download,
  Trash2,
  Anchor,
  ExternalLink,
  FileText
} from 'lucide-react';

import { trackActivity } from './lib/activity';

interface ContentItem {
  no: number;
  tanggal: string;
  jenis: string;
  tujuan: string;
  hookType: string;
  headline: string;
  body: string;
  caption: string;
  format: string;
  referensi: string;
  visual: string;
  keterangan: string;
}

import { extractJSON } from './lib/geminiUtils';

interface CalendarViewProps {
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
  setRevisions: (val: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => void;
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
  configData: any;
}

const InputField = ({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
      <Icon size={12} />
      {label}
    </label>
    {children}
  </div>
);

const CalecoAIRecommendation = ({ 
  recommendation, 
  onApply, 
  onApplyAll,
  isLoading 
}: { 
  recommendation?: string | Record<string, string>; 
  onApply: (field: string, text: string) => void;
  onApplyAll?: (data: Record<string, string>) => void;
  isLoading: boolean;
}) => {
  if (!recommendation && !isLoading) return null;

  const isObject = typeof recommendation === 'object' && recommendation !== null;

  return (
    <div className="relative p-4 bg-brand/5 border border-brand/20 rounded-2xl text-[10px] text-zinc-400 italic leading-relaxed group mt-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-brand font-bold uppercase tracking-widest text-[8px]">
          <Sparkles size={10} />
          Caleco AI Recommendation
        </div>
        {isObject && !isLoading && onApplyAll && (
          <button 
            onClick={() => onApplyAll(recommendation as Record<string, string>)}
            className="flex items-center gap-1 px-2 py-1 bg-brand/10 hover:bg-brand/20 text-brand rounded-md transition-all text-[8px] font-bold uppercase tracking-widest"
            title="Apply All Recommendations"
          >
            <Check size={10} />
            Apply All
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 size={10} className="animate-spin text-brand" />
          <span>Caleco AI sedang berpikir...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {isObject ? (
            Object.entries(recommendation as Record<string, string>).map(([field, text]) => (
              <div key={field} className="space-y-1 border-l-2 border-brand/20 pl-3 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <button 
                    onClick={() => onApply(field, text)}
                    className="p-1 hover:bg-brand/20 text-brand rounded-md transition-all"
                    title={`Apply to ${field}`}
                  >
                    <Check size={10} />
                  </button>
                </div>
                <p className="text-zinc-300">{typeof text === 'object' ? JSON.stringify(text) : String(text)}</p>
              </div>
            ))
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p className="text-zinc-300 flex-grow">{typeof recommendation === 'object' ? JSON.stringify(recommendation) : String(recommendation)}</p>
              <button 
                onClick={() => onApply('default', recommendation as string)}
                className="p-1 hover:bg-brand/20 text-brand rounded-md transition-all shrink-0"
                title="Apply Recommendation"
              >
                <Check size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SortableItem: React.FC<{ item: ContentItem; onClick?: () => void; isGrowth?: boolean }> = ({ item, onClick, isGrowth }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: isGrowth ? `${item.no}_growth` : item.no });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

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
      className={`p-2 mb-2 rounded-lg border text-[10px] transition-all cursor-pointer group relative ${
        isDragging ? 'opacity-50 scale-95 border-brand bg-brand/10 z-[100]' : 
        (item.jenis || '').includes('TOFU') ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40' :
        (item.jenis || '').includes('MOFU') ? 'bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40' :
        'bg-brand/5 border-brand/20 hover:border-brand/40'
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className={`px-1 rounded font-bold uppercase tracking-tighter ${
          (item.jenis || '').includes('TOFU') ? 'text-blue-400' :
          (item.jenis || '').includes('MOFU') ? 'text-purple-400' :
          'text-brand'
        }`}>
          {(item.jenis || '').split(' ')[0]}
        </span>
        {isGrowth && (
          <span className="px-1 bg-brand/20 text-brand text-[6px] font-bold uppercase tracking-widest rounded border border-brand/30">
            Growth Insight
          </span>
        )}
        <div className="text-zinc-600 group-hover:text-zinc-400 p-1 -m-1 transition-colors">
          <GripVertical size={10} />
        </div>
      </div>
      <div className="font-medium text-zinc-200 line-clamp-2 leading-tight mb-1">{item.headline}</div>
      <div className="flex items-center gap-1 text-[8px] text-zinc-500">
        <Layers size={8} />
        {item.format}
      </div>
    </div>
  );
};

const CalendarDay: React.FC<{ 
  day: Date, 
  items: ContentItem[], 
  growthItems?: ContentItem[],
  isCurrentMonth: boolean, 
  onClick?: () => void,
  onEdit?: (item: ContentItem) => void,
  onSendToCalcer?: (brief: string) => void,
  loadingColor?: string,
  showStartPrompt?: boolean,
  resumePrompt?: boolean,
  showConfigButton?: boolean
}> = ({ day, items, growthItems = [], isCurrentMonth, onClick, onEdit, onSendToCalcer, loadingColor, showStartPrompt, resumePrompt, showConfigButton }) => {
  const { setNodeRef } = useSortable({ id: format(day, 'yyyy-MM-dd') });

  const totalItems = items.length + growthItems.length;

  const handleSendToCalcer = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allItems = [...items, ...growthItems];
    if (allItems.length === 0) return;

    const briefText = allItems.map(item => {
      return `[${item.jenis}] ${item.headline}\n\nBody:\n${item.body}\n\nCaption:\n${item.caption}\n\nFormat: ${item.format}\nVisual: ${item.visual}\nKeterangan: ${item.keterangan}`;
    }).join('\n\n---\n\n');

    navigator.clipboard.writeText(briefText);
    trackActivity('Copy Data', `Copied ${allItems.length} items to clipboard via Calcer`);
    onSendToCalcer?.(briefText);
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
      className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-r border-b border-zinc-800/50 transition-all relative ${
        !isCurrentMonth ? 'bg-zinc-900/10 opacity-30' : 'bg-zinc-900/20'
      } ${isSameDay(day, new Date()) ? 'ring-1 ring-inset ring-brand/30 bg-brand/5' : ''} ${
        (onClick || totalItems > 0) ? 'cursor-pointer hover:bg-zinc-800/40' : ''
      } ${(showStartPrompt || resumePrompt || showConfigButton) ? 'animate-glow ring-2 ring-brand/30 z-10' : ''}`}
      style={loadingColor ? { backgroundColor: loadingColor } : {}}
    >
      <div className="flex justify-between items-center mb-1 md:mb-2">
        <div className="flex items-center gap-1.5">
          <span className={`text-[8px] md:text-[10px] font-mono ${isSameDay(day, new Date()) ? 'text-brand font-bold' : 'text-zinc-500'}`}>
            {format(day, 'd')}
          </span>
        </div>
        {totalItems > 0 && (
          <div className="flex items-center gap-1">
            <button 
              onClick={handleSendToCalcer}
              className="p-1 hover:bg-brand/20 text-zinc-500 hover:text-brand rounded-md transition-all"
              title="Copy & Send to Calcer"
            >
              <Zap size={10} />
            </button>
            <span className="text-[6px] md:text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{totalItems} <span className="hidden xs:inline">Posts</span></span>
          </div>
        )}
      </div>
      
      {(showStartPrompt || resumePrompt || showConfigButton) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-zinc-500 text-[10px] font-light uppercase tracking-[0.2em] text-center px-4">
            {resumePrompt ? (
              <>Lanjutkan <span className="text-brand font-medium italic">Strategy</span></>
            ) : showConfigButton ? (
              <>Ubah <span className="text-brand font-medium italic">Konfigurasi</span></>
            ) : (
              <>Mulai <span className="text-brand font-medium italic">Strategy</span></>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length > 0 && (
          <div className="space-y-1">
            <SortableContext items={items.map(i => i.no)} strategy={verticalListSortingStrategy}>
              {items.map(item => (
                <SortableItem key={item.no} item={item} onClick={() => onEdit?.(item)} />
              ))}
            </SortableContext>
          </div>
        )}
        
        {growthItems.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-zinc-800/30">
            <SortableContext items={growthItems.map(i => i.no + '_growth')} strategy={verticalListSortingStrategy}>
              {growthItems.map(item => (
                <SortableItem key={item.no + '_growth'} item={item} onClick={() => onEdit?.(item)} isGrowth />
              ))}
            </SortableContext>
          </div>
        )}
      </div>
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({ 
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
  configData
}) => {
  const [loadingColors, setLoadingColors] = React.useState<string[]>([]);
  const [editingItem, setEditingItem] = React.useState<ContentItem | null>(null);
  const [editingPosition, setEditingPosition] = React.useState({ x: 0, y: 0 });
  const [showRestoreMenu, setShowRestoreMenu] = React.useState(false);
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showRawOutput, setShowRawOutput] = React.useState(false);

  // Generate Raw Output strings
  const [isRecommending, setIsRecommending] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState<Record<number, any>>({});

  const getAIRecommendation = async (step: number) => {
    setIsRecommending(true);
    try {
      let prompt = '';
      
      if (step === 0) {
        prompt = `Anda adalah Lead Expert Advertiser Dunia. Berdasarkan data sebelumnya, berikan rekomendasi untuk:
        1. Core Topic: Apa ide atau masalah utama yang ingin dibahas dalam konten?
        Berikan jawaban dalam format JSON: {"coreTopic": "..."}`;
      } else if (step === 2) {
        prompt = `Anda adalah Lead Expert Advertiser Dunia. Berdasarkan Core Topic: ${configData.coreTopic}, berikan rekomendasi untuk:
        1. Gender: Siapa gender target yang paling cocok? (Male/Female/Both)
        2. Min Age: Berapa umur minimal? (number)
        3. Max Age: Berapa umur maksimal? (number)
        Berikan jawaban dalam format JSON: {"gender": "...", "minAge": 20, "maxAge": 50}`;
      } else if (step === 3) {
        prompt = `Anda adalah Lead Expert Advertiser Dunia. Berdasarkan Core Topic: ${configData.coreTopic}, berikan rekomendasi untuk:
        1. Tofu Count: Jumlah konten TOFU? (number)
        2. Mofu Count: Jumlah konten MOFU? (number)
        3. Bofu Count: Jumlah konten BOFU? (number)
        Berikan jawaban dalam format JSON: {"tofu": 6, "mofu": 5, "bofu": 3}`;
      } else if (step === 5) {
        prompt = `Anda adalah Lead Expert Advertiser Dunia. Berdasarkan Core Topic: ${configData.coreTopic}, berikan rekomendasi untuk:
        1. Hook Type 1: Jenis hook pertama? (Call-Out, Curiosity Gap, Social Proof, Negativity Bias, Authority, Relatability)
        2. Hook Type 2: Jenis hook kedua?
        3. Hook Type 3: Jenis hook ketiga?
        Berikan jawaban dalam format JSON: {"hook1": "...", "hook2": "...", "hook3": "..."}`;
      } else if (step === 6) {
        prompt = `Anda adalah Lead Expert Advertiser Dunia. Berdasarkan Core Topic: ${configData.coreTopic}, berikan rekomendasi untuk:
        1. Formula: Formula apa yang paling cocok (Penjualan, Awareness & Soft Selling, Mencari Follower, Publikasi untuk Brand-produk baru)?
        Berikan jawaban dalam format JSON: {"selectedFormula": "..."}`;
      }

      if (!prompt) return;

      const response = await fetch('/api/gemini/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('API server returned error description.');
      }

      const resData = await response.json();

      try {
        const json = extractJSON(resData.text || '{}');
        setRecommendations(prev => ({ ...prev, [step]: json }));
      } catch (e) {
        console.error('Failed to parse AI recommendation:', e);
        setRecommendations(prev => ({ ...prev, [step]: resData.text || '' }));
      }
    } catch (err) {
      console.error('AI Recommendation Error:', err);
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

    const headers = ["No", "Tanggal", "Jenis", "Tujuan", "Hook Type", "Headline", "Body", "Caption", "Format", "Referensi", "Visual", "Keterangan"];
    
    // Markdown Table
    let md = `| ${headers.join(' | ')} |\n`;
    md += `| ${headers.map(() => '---').join(' | ')} |\n`;
    data.forEach(item => {
      const row = [
        item.no, item.tanggal, item.jenis, item.tujuan, item.hookType, 
        item.headline, item.body, item.caption, item.format, 
        item.referensi, item.visual, item.keterangan
      ].map(v => String(v).replace(/\|/g, '\\|').replace(/\n/g, ' '));
      md += `| ${row.join(' | ')} |\n`;
    });

    // TAB Separated Block
    let tab = headers.join('\t') + '\n';
    data.forEach(item => {
      const row = [
        item.no, item.tanggal, item.jenis, item.tujuan, item.hookType, 
        item.headline, item.body, item.caption, item.format, 
        item.referensi, item.visual, item.keterangan
      ].map(v => String(v).replace(/\t/g, ' ').replace(/\n/g, ' '));
      tab += row.join('\t') + '\n';
    });

    return { markdown: md, tab: tab };
  }, [items, growthItems]);

  React.useEffect(() => {
    if (isLoading) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const colors = Array.from({ length: 42 }).map((_, i) => {
          // Create a rhythmic pulse with individual offsets for a "wave" effect
          // Mimics the glow animation by cycling opacity between ~0.05 and 0.25
          const pulse = Math.sin((step * 0.2) + (i * 0.15));
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

  const [visibleSteps, setVisibleSteps] = React.useState<number[]>([]);
  const [closedSteps, setClosedSteps] = React.useState<number[]>([]);
  const [isStep1Ready, setIsStep1Ready] = React.useState(false);
  const [stepOrder, setStepOrder] = React.useState<number[]>([7, 6, 5, 4, 3, 2, 1, 0]);
  const [stepPositions, setStepPositions] = React.useState<Record<number, { x: number, y: number }>>({});
  const [isMessy, setIsMessy] = React.useState(false);
  const calendarConstraintsRef = React.useRef<HTMLDivElement>(null);
  const calendarContentRef = React.useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = React.useState({ left: 0, right: 0 });

  React.useEffect(() => {
    const updateConstraints = () => {
      if (calendarConstraintsRef.current && calendarContentRef.current) {
        const containerWidth = calendarConstraintsRef.current.offsetWidth;
        const contentWidth = calendarContentRef.current.scrollWidth;
        setDragConstraints({
          left: -(contentWidth - containerWidth),
          right: 0
        });
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  const getInitialPosition = (idx: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) return { x: 0, y: 0 };
    return {
      x: idx * 25 - 75,
      y: idx * 25 - 75
    };
  };

  React.useEffect(() => {
    if (isConfiguring) {
      setTimeout(() => {
        setVisibleSteps([]);
        setClosedSteps([]);
        setIsStep1Ready(false);
        setStepOrder([7, 6, 5, 4, 3, 2, 1, 0]);
        const initialPos: Record<number, { x: number, y: number }> = {};
        [0, 1, 2, 3, 4, 5, 6, 7].forEach(idx => {
          initialPos[idx] = getInitialPosition(idx);
        });
        setStepPositions(initialPos);
        setIsMessy(false);
      }, 0);

      const timers: NodeJS.Timeout[] = [];
      for (let i = 0; i < 8; i++) {
        timers.push(setTimeout(() => {
          setVisibleSteps(prev => [...prev, i]);
        }, i * 300));
      }
      return () => timers.forEach(clearTimeout);
    } else {
      setTimeout(() => {
        setVisibleSteps([]);
      }, 0);
    }
  }, [isConfiguring]);

  const handleTidyUp = () => {
    const tidyPos: Record<number, { x: number, y: number }> = {};
    [0, 1, 2, 3, 4, 5, 6, 7].forEach(idx => {
      tidyPos[idx] = getInitialPosition(idx);
    });
    setStepPositions(tidyPos);
    setIsMessy(false);
  };

  const handleCheckStep = (idx: number) => {
    setClosedSteps(prev => [...prev, idx]);
    
    // If it's the last step (index 7), close the configuration mode
    if (idx === 7) {
      setIsConfiguring(false);
      return;
    }

    // Automatically move the next step to the top to make it "mencolok"
    const nextStep = idx + 1;
    if (nextStep < 8) {
      handleMoveToTop(nextStep);
    }
  };

  const handleMoveToTop = (idx: number) => {
    setStepOrder(prev => {
      const filtered = prev.filter(i => i !== idx);
      return [...filtered, idx];
    });
  };

  const handleDragEndStep = (idx: number, info: any) => {
    setStepPositions(prev => ({
      ...prev,
      [idx]: {
        x: prev[idx].x + info.offset.x,
        y: prev[idx].y + info.offset.y
      }
    }));
    setIsMessy(true);
    handleMoveToTop(idx);
  };

  const handleCloseStep = (idx: number) => {
    setClosedSteps(prev => [...prev, idx]);
  };

  const handleRestoreStep = (idx: number) => {
    setClosedSteps(prev => prev.filter(i => i !== idx));
  };

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
    return items.filter(item => (item.jenis || '').toUpperCase().includes(normFilter));
  }, [items, filterType]);

  const filteredGrowthItems = useMemo(() => {
    if (!growthItems) return [];
    const normFilter = (filterType || '').toUpperCase();
    if (normFilter === 'ALL' || normFilter === '') return growthItems;
    return growthItems.filter(item => (item.jenis || '').toUpperCase().includes(normFilter));
  }, [growthItems, filterType]);

  // Determine the month to show based on the first item's date, the config start date, or current date
  const referenceDate = useMemo(() => {
    if (items.length > 0) {
      try {
        return parseISO(items[0].tanggal);
      } catch (e) {
        return new Date();
      }
    }
    if (configData.startDate) {
      try {
        return parseISO(configData.startDate);
      } catch (e) {
        return new Date();
      }
    }
    return new Date();
  }, [items, configData.startDate]);

  const [currentViewDate, setCurrentViewDate] = React.useState<Date>(referenceDate);

  React.useEffect(() => {
    setTimeout(() => {
      setCurrentViewDate(referenceDate);
    }, 0);
  }, [referenceDate]);

  const monthStart = startOfMonth(currentViewDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const preStartDate = useMemo(() => {
    try {
      return addDays(parseISO(configData.startDate), -1);
    } catch (e) {
      return null;
    }
  }, [configData.startDate]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the item being dragged
    const activeItem = items.find(i => i.no === activeId);
    if (!activeItem) return;

    let targetDate: string | null = null;

    // Case 1: Dropped directly over a day (ID is string like '2026-03-10')
    if (typeof overId === 'string' && overId.includes('-')) {
      targetDate = overId;
    } 
    // Case 2: Dropped over another item (ID is number like 1, 2, 3)
    else {
      const overItem = items.find(i => i.no === overId);
      if (overItem) {
        targetDate = overItem.tanggal;
      }
    }

    if (targetDate && targetDate !== activeItem.tanggal) {
      onReschedule(activeItem.no, targetDate);
    }
  };

  const handleCellClick = (idx: number) => {
    if (items.length === 0 && !isLoading) {
      setIsConfiguring(true);
    }
  };

  return (
    <div className="space-y-2 md:space-y-4 relative">
      <motion.div 
        animate={{ 
          scale: (isConfiguring || !!editingItem) ? 0.97 : 1,
          opacity: (isConfiguring || !!editingItem) ? 0.4 : 1,
          filter: (!!editingItem) ? 'blur(2px)' : 'blur(0px)'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="space-y-2 md:space-y-4"
      >
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <div className="flex items-center gap-2">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentViewDate(prev => subMonths(prev, 1))}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDatePicker(true)}
              className="text-lg font-light text-white hover:text-brand transition-colors px-3 py-1 rounded-xl hover:bg-zinc-800/50 flex items-center gap-2 group"
            >
              {format(monthStart, 'MMMM yyyy')}
              <ChevronDown size={14} className="text-zinc-500 group-hover:text-brand transition-colors" />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentViewDate(prev => addMonths(prev, 1))}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
              title="Bulan Berikutnya"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onReset}
              className="p-2 text-zinc-500 hover:text-amber-500 transition-colors"
              title="Reset Semua Input"
            >
              <RefreshCw size={18} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHistoryModal(true)}
              className="p-2 text-zinc-500 hover:text-brand transition-colors relative"
              title="Histori Generate"
            >
              <Layers size={18} />
              {history.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full border border-black" />
              )}
            </motion.button>
          </div>

          {items.length > 0 && (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRawOutput(true)}
                  className="p-2 text-zinc-500 hover:text-brand transition-colors"
                  title="View Raw Output (Markdown & TAB)"
                >
                  <FileText size={18} />
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={onCopy}
                  className="p-2 text-zinc-500 hover:text-brand transition-colors"
                  title="Copy for Spreadsheet (TSV)"
                >
                  <Copy size={18} />
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={onDownload}
                  className="p-2 text-zinc-500 hover:text-brand transition-colors"
                  title="Download CSV"
                >
                  <Download size={18} />
                </motion.button>
              </div>
              {accessStatus.type === 'TRIAL' && (
                <div className="text-[8px] text-zinc-500 font-medium bg-zinc-800/50 px-2 py-1 rounded-lg border border-zinc-800/50">
                  Trial Mode: 3x Generate, 1x Copy, No Download.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
      <div ref={calendarConstraintsRef} className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-800/50 bg-black/20">
        <motion.div 
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.1}
          dragMomentum={false}
          className="cursor-grab active:cursor-grabbing"
        >
          <div ref={calendarContentRef} className="min-w-[900px] md:min-w-0">
            <div className="grid grid-cols-7 border-b border-zinc-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 md:p-3 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center border-r border-zinc-800 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayItems = filteredItems.filter(item => {
                  try {
                    return isSameDay(parseISO(item.tanggal), day);
                  } catch (e) {
                    return false;
                  }
                });

                const dayGrowthItems = filteredGrowthItems.filter(item => {
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
                    onClick={() => {
                      if (items.length === 0 || (preStartDate && isSameDay(day, preStartDate))) {
                        setIsConfiguring(true);
                      }
                    }}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setEditingPosition({ x: 0, y: 0 });
                    }}
                    onSendToCalcer={onSendToCalcer}
                    loadingColor={loadingColors[idx]}
                    showStartPrompt={items.length === 0 && isSameDay(day, new Date()) && !isConfiguring && !configData.coreTopic}
                    resumePrompt={items.length === 0 && isSameDay(day, new Date()) && !isConfiguring && !!configData.coreTopic}
                    showConfigButton={items.length > 0 && !!preStartDate && isSameDay(day, preStartDate)}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
      </DndContext>
    </motion.div>

    {/* History Modal */}
    <AnimatePresence>
      {showHistoryModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHistoryModal(false)}
          />
          <div className="fixed inset-0 z-[700] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[450px] pointer-events-auto"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-brand bg-brand/10 border border-brand/20">
                      <Layers size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">Histori Generate</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {history.length > 0 && (
                      <button 
                        onClick={onClearHistory}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-all"
                        title="Hapus Semua Histori"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => setShowHistoryModal(false)}
                      className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {history.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <Layers size={32} className="mx-auto text-zinc-800" />
                      <p className="text-xs text-zinc-500 uppercase tracking-widest">Belum ada histori</p>
                    </div>
                  ) : (
                    history.map((entry: any) => (
                      <div 
                        key={entry.id}
                        className="p-4 bg-zinc-800/30 border border-zinc-800/50 rounded-2xl hover:border-brand/30 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-mono text-zinc-500">
                              Tanggal: {format(new Date(entry.timestamp), 'dd MMM yyyy')}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              Jam: {format(new Date(entry.timestamp), 'HH:mm')}
                            </span>
                            {entry.itemCount !== undefined && (
                              <span className="text-[10px] font-mono text-brand font-bold uppercase tracking-widest mt-1">
                                {entry.itemCount} Content Generated
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => onDeleteHistory(entry.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-xs font-medium text-white line-clamp-2 mb-3">{entry.topic}</p>
                        <button 
                          onClick={() => {
                            onLoadHistory(entry);
                            setShowHistoryModal(false);
                          }}
                          className="w-full py-2 bg-brand/10 hover:bg-brand text-brand hover:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-brand/20"
                        >
                          Muat Data
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>

    {/* Raw Output Modal */}
    <AnimatePresence>
      {showRawOutput && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md"
            onClick={() => setShowRawOutput(false)}
          />
          <div className="fixed inset-0 z-[1100] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-[1000px] max-h-[90vh] pointer-events-auto flex flex-col"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-brand bg-brand/10 border border-brand/20">
                      <FileText size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Raw Output (Markdown & TAB)</h3>
                  </div>
                  <button 
                    onClick={() => setShowRawOutput(false)}
                    className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  {/* Markdown Table Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Markdown Table</h4>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(rawOutputData.markdown);
                          // alert('Markdown Table copied!');
                          console.log('Markdown Table copied!');
                        }}
                        className="text-[10px] font-bold text-brand hover:underline uppercase tracking-widest"
                      >
                        Copy Table
                      </button>
                    </div>
                    <div className="bg-black/40 rounded-2xl border border-zinc-800 p-4 overflow-x-auto">
                      <pre className="text-[10px] font-mono text-zinc-400 whitespace-pre">
                        {rawOutputData.markdown}
                      </pre>
                    </div>
                  </div>

                  {/* TAB Separated Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">TAB Separated (For Spreadsheet)</h4>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(rawOutputData.tab);
                          // alert('TAB data copied!');
                          console.log('TAB data copied!');
                        }}
                        className="text-[10px] font-bold text-brand hover:underline uppercase tracking-widest"
                      >
                        Copy TAB Data
                      </button>
                    </div>
                    <div className="bg-black/40 rounded-2xl border border-zinc-800 p-4 overflow-x-auto">
                      <pre className="text-[10px] font-mono text-zinc-400 whitespace-pre">
                        {rawOutputData.tab}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-800/20 border-t border-zinc-800 text-center">
                  <p className="text-[9px] text-zinc-500 italic">
                    * Tips: Gunakan blok TAB di atas untuk langsung di-paste ke Google Sheets atau Excel tanpa merusak kolom.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>

    {/* Month/Year Picker Modal */}
    <AnimatePresence>
      {showDatePicker && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[800] bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDatePicker(false)}
          />
          <div className="fixed inset-0 z-[900] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[350px] pointer-events-auto"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">Pilih Bulan & Tahun</h3>
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Year Selector */}
                  <div className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-1">
                    <button 
                      onClick={() => setCurrentViewDate(prev => setYear(prev, getYear(prev) - 1))}
                      className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-bold text-white font-mono">{getYear(currentViewDate)}</span>
                    <button 
                      onClick={() => setCurrentViewDate(prev => setYear(prev, getYear(prev) + 1))}
                      className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Month Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const monthDate = setMonth(currentViewDate, i);
                      const isSelected = getMonth(currentViewDate) === i;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setCurrentViewDate(monthDate);
                            setShowDatePicker(false);
                          }}
                          className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                            isSelected 
                              ? 'bg-brand text-black border-brand' 
                              : 'bg-zinc-800/30 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          {format(monthDate, 'MMM')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-zinc-800/20 border-t border-zinc-800">
                  <button 
                    onClick={() => {
                      setCurrentViewDate(new Date());
                      setShowDatePicker(false);
                    }}
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-zinc-700"
                  >
                    Kembali ke Hari Ini
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>

    {/* Grid Configuration Overlay */}
    <AnimatePresence>
      {isConfiguring && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          onClick={() => setIsConfiguring(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-5xl h-[84vh] flex flex-col md:flex-row overflow-hidden shadow-2xl font-sans"
          >
            {/* Sidebar Navigation */}
            <div className="w-full md:w-80 bg-zinc-900/40 border-b md:border-b-0 md:border-r border-zinc-900 flex flex-col justify-between shrink-0">
              <div className="p-6">
                <div className="mb-5 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-black text-brand tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    CALECO CONFIG PANEL
                  </div>
                  {configData.connectionStatus === "active" && configData.brandContext ? (
                    <div className="bg-brand/15 border border-brand/20 p-2.5 rounded-xl flex items-center gap-2 mt-1">
                      <Sparkles className="text-brand shrink-0" size={11} />
                      <div className="overflow-hidden">
                        <p className="text-[8.5px] text-zinc-400 font-medium">App 1 Synced</p>
                        <p className="text-[10px] font-black text-white uppercase truncate">{configData.brandContext.brandName}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl flex items-center gap-2 mt-1">
                      <AlertCircle className="text-zinc-500 shrink-0" size={11} />
                      <p className="text-[9px] font-bold text-zinc-400">Sandbox Mode</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[48vh] pr-1">
                  {[
                    { id: 0, title: "Topik Utama", desc: "Brief kampanye", icon: Zap },
                    { id: 1, title: "Jadwal Kalender", desc: "Mulai & skip hari", icon: Calendar },
                    { id: 2, title: "Target Audiens", desc: "Gender & umur", icon: Users },
                    { id: 3, title: "Alokasi & Format", desc: "TOFU/MOFU & media", icon: Layers },
                    { id: 4, title: "Brand Voice", desc: "Karakter pembawaan", icon: Mic2 },
                    { id: 5, title: "Hooks Mix", desc: "Pemicu psikologis", icon: Filter },
                    { id: 6, title: "Formula Goals", desc: "Tujuan & cta", icon: Sparkles },
                    { id: 7, title: "Konfirmasi", desc: "Verifikasi strategi", icon: CheckCircle2 }
                  ].map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = step.id < currentStep;
                    const StepIcon = step.icon;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                          isActive
                            ? "bg-brand text-black font-extrabold shadow-lg scale-[1.01]"
                            : isCompleted
                            ? "bg-zinc-900/30 text-zinc-300 hover:bg-zinc-900/60 font-medium"
                            : "text-zinc-500 hover:bg-zinc-900/20 font-medium"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                          isActive ? "bg-black/10 border-black/10 text-black" : isCompleted ? "bg-brand/10 border-brand/20 text-brand" : "bg-zinc-900 border-zinc-800"
                        }`}>
                          <StepIcon size={12} />
                        </div>
                        <div className="overflow-hidden flex-1 leading-none">
                          <h4 className="text-[10.5px] uppercase tracking-wider font-extrabold">{step.title}</h4>
                          <p className={`text-[8px] font-medium truncate mt-0.5 ${isActive ? "text-black/80" : "text-zinc-500"}`}>{step.desc}</p>
                        </div>
                        {isCompleted && !isActive && <CheckCircle2 className="text-brand shrink-0" size={10} />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-5 border-t border-zinc-800/80 bg-zinc-900/20 flex justify-between text-[9px] text-zinc-500 font-mono">
                <span>WIZARD PROGRESS</span>
                <span className="text-brand font-black bg-brand/10 px-2 py-0.5 rounded border border-brand/10">{Math.round(((currentStep + 1) / 8) * 100)}%</span>
              </div>
            </div>

            {/* Content Display Workspace */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-zinc-950">
              <div className="px-8 py-5 border-b border-zinc-800/40 flex justify-between items-center shrink-0">
                <div>
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest font-black">LANGKAH {currentStep + 1} DARI 8</span>
                  <h2 className="text-xs font-black text-white uppercase tracking-wider mt-0.5">
                    {currentStep === 0 && "Topik Utama & Pilar Konten"}
                    {currentStep === 1 && "Tanggal Mulai & Pengecualian Kalender"}
                    {currentStep === 2 && "Profil Target Demografi"}
                    {currentStep === 3 && "Alokasi & Format Publikasi"}
                    {currentStep === 4 && "Karakter Suara & Dialektika"}
                    {currentStep === 5 && "Psikologi Hooks Mixing"}
                    {currentStep === 6 && "Goal Formula & CTA"}
                    {currentStep === 7 && "Summary & Launch Strategy"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsConfiguring(false)}
                  className="p-2 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-all"
                  title="Close Setup Wizard"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Dynamic Steps form rendering canvas */}
              <div className="flex-1 p-8 overflow-y-auto space-y-5">
                
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <InputField label="Core Topic Brief" icon={Zap}>
                      <textarea
                        value={configData.coreTopic || ''}
                        onChange={(e) => configData.setCoreTopic(e.target.value)}
                        placeholder="Uraikan fokus topik kampanye utama..."
                        className="w-full bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand h-24 resize-none"
                      />
                      {configData.editableContext?.contentStrategy?.pillars && configData.editableContext.contentStrategy.pillars.length > 0 && (
                        <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-1.5">
                          <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-extrabold">💡 PILAR KONTEN TERHUBUNG (KLIK UNTUK TERAPKAN):</span>
                          <div className="flex flex-wrap gap-1">
                            {configData.editableContext.contentStrategy.pillars.map((pillar: string, i: number) => (
                              <button
                                key={i}
                                onClick={() => configData.setCoreTopic(`${configData.selectedProject || "Campaign"} - Focus: ${pillar}`)}
                                className="bg-zinc-800 hover:bg-brand hover:text-black border border-zinc-700/60 text-zinc-300 px-2 py-1 rounded-lg text-[9px] transition-all font-medium"
                              >
                                {pillar}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="pt-2">
                        <button onClick={() => getAIRecommendation(0)} disabled={isRecommending} className="flex items-center gap-1.5 text-[9px] font-black text-brand uppercase tracking-wider hover:opacity-80">
                          <Sparkles size={10} /> {isRecommending ? 'Menganalisis...' : 'Minta Rekomendasi AI'}
                        </button>
                        <CalecoAIRecommendation
                          recommendation={recommendations[0]}
                          isLoading={isRecommending}
                          onApply={(field, text) => handleApplyRecommendation(0, field, text)}
                          onApplyAll={(data) => handleApplyAllRecommendations(0, data)}
                        />
                      </div>
                    </InputField>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Start Date" icon={Calendar}>
                      <input
                        type="date"
                        value={configData.startDate || ''}
                        onChange={(e) => configData.setStartDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-805 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand text-white font-mono"
                      />
                    </InputField>
                    <InputField label="Exclusions / Skip Days" icon={Calendar}>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                          const isSkipped = configData.skipDays.includes(day);
                          return (
                            <button
                              key={day}
                              onClick={() => configData.toggleSkipDay(day)}
                              className={`py-1.5 rounded-xl text-[9px] font-bold border transition-all ${
                                isSkipped ? 'bg-zinc-900 border-zinc-800 text-zinc-650 line-through' : 'bg-brand/10 border-brand/20 text-brand'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </InputField>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <InputField label="Audience Targeting Demographics" icon={Users}>
                      {configData.editableContext?.audience?.segments && (
                        <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl mb-2 flex flex-wrap gap-1 items-center">
                          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-black mr-2">Target Segment:</span>
                          {configData.editableContext.audience.segments.map((seg: string, i: number) => (
                            <span key={i} className="bg-zinc-800 text-[8.5px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-300 w-max font-medium">🎯 {seg}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1.5 bg-zinc-900 p-1.5 border border-zinc-900 rounded-xl max-w-sm mb-4">
                        {['Male', 'Female', 'Both'].map(g => (
                          <button
                            key={g}
                            onClick={() => configData.setGender(g)}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${configData.gender === g ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-900/20 p-4 border border-zinc-800 rounded-2xl">
                        {['Min Age', 'Max Age'].map((label, idx) => {
                          const val = configData.ageRange[idx];
                          return (
                            <div key={label} className="space-y-1.5">
                              <div className="flex justify-between text-[9.5px]">
                                <span className="text-zinc-500 font-mono uppercase">{label}</span>
                                <span className="text-brand font-black">{val} Years</span>
                              </div>
                              <input
                                type="range"
                                min="13"
                                max="65"
                                value={val || (idx === 0 ? 13 : 65)}
                                onChange={(e) => {
                                  const parsed = parseInt(e.target.value);
                                  configData.setAgeRange(idx === 0 ? [parsed, Math.max(parsed, configData.ageRange[1])] : [Math.min(parsed, configData.ageRange[0]), parsed]);
                                }}
                                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </InputField>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <InputField label="Format & Allocations" icon={Layers}>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {['Single', 'Carousel', 'Reels'].map(f => (
                          <div key={f} className="flex items-center gap-1.5">
                            <button
                              onClick={() => configData.toggleFormat(f)}
                              className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black border transition-all ${configData.formats.includes(f) ? 'bg-brand border-brand text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                            >
                              {f}
                            </button>
                            {f === 'Carousel' && configData.formats.includes('Carousel') && (
                              <input
                                type="text"
                                value={configData.carouselSlides || ''}
                                onChange={(e) => configData.setCarouselSlides(e.target.value.replace(/[^0-9]/g, '') ? parseInt(e.target.value.replace(/[^0-9]/g, '')) : 0)}
                                placeholder="Slides: 4"
                                className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-[9.5px] text-brand font-mono text-center"
                              />
                            )}
                            {f === 'Reels' && configData.formats.includes('Reels') && (
                              <input
                                type="text"
                                value={configData.reelsDuration || ''}
                                onChange={(e) => configData.setReelsDuration(e.target.value)}
                                placeholder="Durasi: 15s"
                                className="w-20 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-[9.5px] text-brand font-mono text-center"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 border border-zinc-900/60 p-4 rounded-2xl bg-zinc-900/20">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-zinc-500 uppercase tracking-wider font-extrabold font-mono">Posts Allocation Distribution</span>
                          <span className={`text-[10px] font-mono font-bold px-2 rounded-lg border ${
                            (configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu) > accessStatus.maxContent ? 'text-red-500 border-red-500/25 bg-red-500/10' : 'text-brand border-brand/25 bg-brand/10'
                          }`}>
                            Total: {configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu} / {accessStatus.maxContent}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {['tofu', 'mofu', 'bofu'].map(r => (
                            <div key={r} className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono">
                                <span className="uppercase text-zinc-650">{r}</span>
                                <span className="text-white font-bold">{configData.ratio[r]} Posts</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max={accessStatus.maxContent}
                                value={configData.ratio[r] || 0}
                                onChange={(e) => {
                                  const parsed = parseInt(e.target.value) || 0;
                                  configData.setRatio({...configData.ratio, [r]: parsed});
                                }}
                                className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-brand"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {['Single', 'Carousel', 'Reels'].map(f => (
                          <div key={f} className="space-y-1">
                            <label className="text-[8px] text-zinc-600 font-bold uppercase block">{f} % Ratio</label>
                            <input
                              type="number"
                              value={configData.formatRatio[f] || 0}
                              onChange={(e) => {
                                const parsed = parseInt(e.target.value) || 0;
                                configData.setFormatRatio({...configData.formatRatio, [f]: parsed});
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs text-white text-center"
                            />
                          </div>
                        ))}
                      </div>
                    </InputField>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <InputField label="Primary Voice Accent" icon={Mic2}>
                      {configData.brandContext?.brandIdentity?.voice && (
                        <div className="bg-brand/10 border border-brand/20 p-3.5 rounded-2xl flex items-center justify-between mb-2">
                          <div>
                            <span className="text-[7.5px] font-mono font-black text-brand uppercase tracking-wider block">SYNCD CORE BRAND VOICE:</span>
                            <h4 className="text-[11px] font-bold text-white mt-1">&quot;{configData.brandContext.brandIdentity.voice}&quot;</h4>
                          </div>
                          <button
                            onClick={() => {
                              const v = configData.brandContext.brandIdentity?.voice;
                              if (v && !configData.selectedVoices.includes(v)) configData.toggleVoice(v);
                            }}
                            className="bg-brand hover:opacity-85 text-black text-[9.5px] font-black uppercase px-2.5 py-1.5 rounded-lg text-center"
                          >
                            Apply Active Voice
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-1.5">
                        {['The Sarcastic Critic', 'The Brutally Honest', 'The Efficiency Expert', "The Devil's Advocate", 'The Grumpy Pro', 'The Insider', 'The Drill Sergeant', 'The Bullshit Detector'].map(v => {
                          const isSel = configData.selectedVoices.includes(v);
                          return (
                            <button
                              key={v}
                              onClick={() => configData.toggleVoice(v)}
                              className={`flex items-center justify-between p-3 rounded-xl text-[10px] border transition-all ${
                                isSel ? 'bg-brand/10 border-brand/40 text-brand font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                              }`}
                            >
                              <span>{v}</span>
                              {isSel && <CheckCircle2 size={10} className="text-brand shrink-0 text-brand" />}
                            </button>
                          );
                        })}
                      </div>
                    </InputField>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <InputField label="Hooks Ratio Setup" icon={Filter}>
                      <div className="space-y-2">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="flex gap-2 bg-zinc-900/35 p-2 rounded-xl">
                            <select
                              value={configData.hookMix[i].type || ''}
                              onChange={(e) => configData.updateHookMix(i, 'type', e.target.value)}
                              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white"
                            >
                              <option value="">Pilih Hook...</option>
                              {['Call-Out', 'Curiosity Gap', 'Social Proof', 'Negativity Bias', 'Authority', 'Relatability'].map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={configData.hookMix[i].percentage || 0}
                              onChange={(e) => configData.updateHookMix(i, 'percentage', parseInt(e.target.value) || 0)}
                              className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs text-white"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4 p-3 bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm mt-4 text-xs font-mono">
                        {['Logika AI', 'Humanis'].map(type => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <div onClick={() => configData.setReferenceType(type)} className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${configData.referenceType === type ? 'border-brand bg-brand/15' : 'border-zinc-800'}`}>
                              {configData.referenceType === type && <div className="w-1.5 h-1.5 bg-brand rounded-full" />}
                            </div>
                            <span className={configData.referenceType === type ? 'text-white font-bold' : 'text-zinc-500'}>{type}</span>
                          </label>
                        ))}
                      </div>
                    </InputField>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-4">
                    <InputField label="Campaign Master Goal Formula" icon={Sparkles}>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                          { id: 'SALES', title: 'Penjualan', desc: 'Fokus konversi & penutupan transaksi sales.' },
                          { id: 'AWARENESS', title: 'Awareness & Soft Selling', desc: 'Informasikan audiens sembari sounding.' },
                          { id: 'FOLLOWER', title: 'Mencari Follower', desc: 'Mendorong respon komen & menambah penonton.' },
                          { id: 'LAUNCH', title: 'Publikasi untuk Brand-produk baru', desc: 'Peluncuran entitas komersial perdana.' }
                        ].map((formula) => {
                          const isSel = configData.selectedFormula === formula.title;
                          return (
                            <button
                              key={formula.id}
                              onClick={() => configData.setSelectedFormula(formula.title)}
                              className={`p-3 text-left border rounded-xl transition-all leading-snug ${
                                isSel ? 'border-brand bg-brand/10 font-bold' : 'border-zinc-800'
                              }`}
                            >
                              <h4 className="text-[10px] uppercase font-black tracking-wider text-white">{formula.title}</h4>
                              <p className="text-[8px] text-zinc-500 mt-1">{formula.desc}</p>
                            </button>
                          );
                        })}
                      </div>

                      {configData.editableContext?.offers && configData.editableContext.offers.length > 0 && (
                        <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-2xl mb-2 space-y-1.5">
                          <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">📋 APP 1 SYNC CTAS:</span>
                          <div className="flex flex-wrap gap-1">
                            {configData.editableContext.offers.map((off: any, i: number) => {
                              const active = configData.selectedCTAs.includes(off.ctaText);
                              return (
                                <button
                                  key={i}
                                  onClick={() => configData.toggleCTA(off.ctaText)}
                                  className={`px-2 py-1 rounded-lg text-[9px] border transition-all ${active ? 'bg-brand/20 border-brand text-brand font-bold' : 'bg-zinc-800 border-zinc-700/60 text-zinc-300'}`}
                                >
                                  {off.ctaText}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5 mt-2">
                        <label className="text-[8px] text-zinc-650 uppercase font-black">CTAs (Click-to-actions)</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Link Bio', 'DM', 'WhatsApp'].map(cta => {
                            const isSel = configData.selectedCTAs.includes(cta);
                            return (
                              <button
                                key={cta}
                                onClick={() => configData.toggleCTA(cta)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] border transition-all ${isSel ? 'bg-brand/15 border-brand text-brand font-bold' : 'bg-zinc-900 border-zinc-800'}`}
                              >
                                {cta}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </InputField>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div className="p-5 bg-brand/5 border border-brand/10 rounded-2xl text-center space-y-2">
                      <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center mx-auto text-brand">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold uppercase text-white tracking-wider">Campaign Ready To Dispatch</h3>
                        <p className="text-[9px] text-zinc-400 mt-1">Sistem kalender akan men-generate <strong className="text-brand font-bold">${configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu} postingan strategis</strong> untuk Anda.</p>
                      </div>
                    </div>

                    {(configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu) > accessStatus.maxContent && (
                      <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl text-[9px] flex items-center gap-2">
                        <AlertCircle size={12} /> Exceeds packages limit. Reduce slots in formats step.
                      </div>
                    )}

                    <div className="flex justify-between items-center bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 text-[10px] font-mono">
                      <span className="text-zinc-500 uppercase tracking-widest text-[8px]">Fast Response Model Modes</span>
                      <button
                        onClick={() => configData.setIsFastMode(!configData.isFastMode)}
                        className={`w-9 h-5 rounded-full transition-all relative border ${configData.isFastMode ? 'bg-brand/15 border-brand/40' : 'bg-zinc-800 border-zinc-700'}`}
                      >
                        <motion.div
                          animate={{ x: configData.isFastMode ? 18 : 2 }}
                          className={`w-3 h-3 rounded-full absolute top-0.5 ${configData.isFastMode ? 'bg-brand' : 'bg-zinc-500'}`}
                        />
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Nav bar controls */}
              <div className="p-5 border-t border-zinc-800/40 bg-zinc-950 flex justify-between shrink-0">
                <button
                  onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-1 py-1.5 px-3 rounded-xl text-[9.5px] font-bold uppercase transition-all ${
                    currentStep === 0 ? "text-zinc-700 cursor-not-allowed opacity-30" : "text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900"
                  }`}
                >
                  <ChevronLeft size={12} /> Kembali
                </button>

                {currentStep < 7 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex items-center gap-1 py-1.5 px-4 bg-brand hover:brightness-105 text-black text-[9.5px] font-black uppercase rounded-xl transition-all"
                  >
                    Lanjutkan <ChevronRight size={12} />
                  </button>
                ) : (
                  <button
                    id="caleco-generate-btn"
                    disabled={
                      isLoading ||
                      (configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu) > accessStatus.maxContent ||
                      (configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu) === 0 ||
                      (configData.formats.includes('Reels') && !configData.reelsDuration) ||
                      (configData.formats.includes('Carousel') && !configData.carouselSlides)
                    }
                    onClick={() => {
                      configData.generateContent();
                      setIsConfiguring(false);
                    }}
                    className={`px-5 py-2 font-black rounded-xl text-xs uppercase flex items-center gap-2 transition-all shadow-md ${
                      isLoading ||
                      (configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu) > accessStatus.maxContent ||
                      (configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu) === 0 ||
                      (configData.formats.includes('Reels') && !configData.reelsDuration) ||
                      (configData.formats.includes('Carousel') && !configData.carouselSlides)
                        ? "bg-zinc-800 text-zinc-650 cursor-not-allowed opacity-50"
                        : "bg-brand hover:brightness-105 text-black"
                    }`}
                  >
                    {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={11} className="fill-black" />}
                    Launch {configData.isFastMode ? "Fast" : "Full"} Strategy
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
          {/* Content Detail Popup (Draggable) */}
          <AnimatePresence>
            {editingItem && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm"
                  onClick={() => setEditingItem(null)}
                />
                
                {/* Draggable Popup */}
                <div className="fixed inset-0 z-[500] flex items-center justify-center pointer-events-none p-4">
                  <motion.div
                    drag
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      setEditingPosition(prev => ({
                        x: prev.x + info.offset.x,
                        y: prev.y + info.offset.y
                      }));
                    }}
                    initial={{ opacity: 0, scale: 0.9, x: editingPosition.x, y: editingPosition.y }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      x: editingPosition.x, 
                      y: editingPosition.y 
                    }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    className="w-full max-w-[450px] cursor-grab active:cursor-grabbing pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-zinc-900/90 border border-zinc-800/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col backdrop-blur-3xl relative overflow-hidden">
                      {/* Header */}
                      <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border ${
                            (editingItem?.jenis || '').includes('TOFU') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            (editingItem?.jenis || '').includes('MOFU') ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-brand/10 text-brand border-brand/20'
                          }`}>
                            #{editingItem.no}
                          </div>
                          <div>
                            <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{editingItem.tanggal}</div>
                            <div className="text-xs font-bold text-white uppercase tracking-tight">{editingItem.jenis}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              const idx = items.findIndex(i => i.no === editingItem.no);
                              if (idx > 0) setEditingItem(items[idx - 1]);
                            }}
                            disabled={items.findIndex(i => i.no === editingItem.no) === 0}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-all disabled:opacity-20"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              const idx = items.findIndex(i => i.no === editingItem.no);
                              if (idx < items.length - 1) setEditingItem(items[idx + 1]);
                            }}
                            disabled={items.findIndex(i => i.no === editingItem.no) === items.length - 1}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-all disabled:opacity-20"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <div className="w-px h-4 bg-zinc-800 mx-1" />
                          <button 
                            onClick={() => setEditingItem(null)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <InputField label="Headline" icon={Zap}>
                          <input 
                            type="text"
                            value={editingItem.headline || ''}
                            onChange={(e) => onUpdateItem({ ...editingItem, headline: e.target.value })}
                            className="w-full bg-black/40 border border-zinc-800/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand/50 transition-colors"
                          />
                        </InputField>

                        <InputField label="Body Content" icon={Layers}>
                          <textarea 
                            value={editingItem.body || ''}
                            onChange={(e) => onUpdateItem({ ...editingItem, body: e.target.value })}
                            className="w-full bg-black/40 border border-zinc-800/50 rounded-xl px-3 py-3 text-xs text-zinc-300 focus:outline-none focus:border-brand/50 transition-colors h-32 resize-none leading-relaxed custom-scrollbar"
                          />
                        </InputField>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
                            <div className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Hook Type</div>
                            <p className="text-[10px] text-zinc-300">{editingItem.hookType}</p>
                          </div>
                          <div className="p-3 bg-black/20 border border-zinc-800/50 rounded-xl">
                            <div className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Format</div>
                            <p className="text-[10px] text-zinc-300">{editingItem.format}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-brand uppercase tracking-widest">
                            <Sparkles size={12} /> AI Revision
                          </div>
                          <textarea 
                            value={revisions[editingItem.no] || ''}
                            onChange={(e) => setRevisions(prev => ({ ...prev, [editingItem.no]: e.target.value }))}
                            placeholder="Instruksi revisi..."
                            className="w-full bg-black/40 border border-zinc-800/50 rounded-xl px-3 py-2 text-[10px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-brand/50 transition-colors h-16 resize-none custom-scrollbar"
                          />
                          <button 
                            disabled={isLoading || !revisions[editingItem.no]}
                            onClick={async () => {
                              await onRegenerateItem(editingItem.no, revisions[editingItem.no]);
                              setEditingItem(null);
                            }}
                            className="w-full h-8 bg-brand hover:bg-brand-dark text-black text-[9px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            Regenerate
                          </button>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-5 border-t border-zinc-800/50 flex items-center gap-2">
                        <button 
                          onClick={() => setEditingItem(null)}
                          className="flex-1 h-10 bg-brand hover:bg-brand-dark text-black font-bold rounded-xl text-[9px] uppercase tracking-widest transition-all"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-zinc-800/30">
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> TOFU
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" /> MOFU
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand shadow-[0_0_8px_rgba(177,153,249,0.4)]" /> BOFU
          </div>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-800/50">
          <Filter size={14} className="text-zinc-500 ml-2" />
          <select 
            value={filterType || 'All'}
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-zinc-300 focus:outline-none cursor-pointer pr-4"
          >
            <option value="ALL" className="bg-zinc-900">All Types</option>
            <option value="TOFU" className="bg-zinc-900">TOFU</option>
            <option value="MOFU" className="bg-zinc-900">MOFU</option>
            <option value="BOFU" className="bg-zinc-900">BOFU</option>
          </select>
        </div>
      </div>
    </div>
  );
};
