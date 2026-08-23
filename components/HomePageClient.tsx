'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, FileText, Layers, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  StrategyBlueprint,
  SharedContentContext,
  buildSharedContentContext,
  SAMPLE_STRATEGY_BLUEPRINT,
  ContentItem
} from '@/lib/content-contract';
import {
  getActiveProjectId,
  setActiveProjectId,
  loadProjectData,
  saveProjectData,
  updateProjectMeta,
  getProjectList
} from '@/lib/storage';
import dynamic from 'next/dynamic';
import { ActiveStrategyBadge } from '@/components/ActiveStrategyBadge';
import { GeminiApiKeyControl } from '@/components/GeminiApiKeyControl';
import { buildGeminiRequestHeaders } from '@/lib/client-gemini-key';

const CalendarView = dynamic(() => import('@/components/CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      <span className="text-xs font-mono">Memuat Kalender Konten...</span>
    </div>
  ),
});

const StrategyIntakeModal = dynamic(
  () => import('@/components/StrategyIntakeModal').then((mod) => mod.StrategyIntakeModal),
  { ssr: false }
);

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

export default function HomePageClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [projectList, setProjectList] = useState<any[]>([]);

  const [items, setItems] = useState<ContentItem[]>([]);
  const [growthItems, setGrowthItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingItem, setIsRegeneratingItem] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeConfigCell, setActiveConfigCell] = useState<number | null>(null);
  const [filterType, setFilterType] = useState('ALL');
  const [revisions, setRevisions] = useState<Record<number, string>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [strategyBlueprint, setStrategyBlueprint] = useState<StrategyBlueprint | null>(null);
  const [sharedContext, setSharedContext] = useState<SharedContentContext | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  const [accessCode, setAccessCode] = useState('');
  const [isAccessValid] = useState(true);
  const [isEditAccessLocked] = useState(false);
  const [, setShowUnlockModal] = useState(false);
  const [accessStatus] = useState({ type: 'FULL', maxContent: 30 });
  const [usageStats] = useState({ generates: 0, copies: 0 });

  const [coreTopic, setCoreTopic] = useState('Digital Course Launch Strategy');
  const [startDate, setStartDate] = useState('2026-08-08');

  // Initialization & Storage
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const pList = getProjectList();
      setProjectList(pList);

      const pid = getActiveProjectId();
      if (pid) {
        setActiveProjectIdState(pid);
        const savedBlueprint = loadProjectData(pid, 'blueprint');
        const savedContext = loadProjectData(pid, 'context');
        if (savedBlueprint) setStrategyBlueprint(savedBlueprint);
        if (savedContext) setSharedContext(savedContext);

        const savedItems = loadProjectData(pid, 'items', []);
        const savedGrowthItems = loadProjectData(pid, 'growthItems', []);
        const savedHistory = loadProjectData(pid, 'history', []);
        
        setItems(savedItems);
        setGrowthItems(savedGrowthItems);
        setHistory(savedHistory);
        
        if (savedBlueprint?.brand_identity?.brand_name) {
          setCoreTopic(`${savedBlueprint.brand_identity.brand_name} Campaign`);
        }
      }
    }

    const timer = setTimeout(() => {
      setStartDate(new Date().toISOString().split('T')[0]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save changes to local storage when they change
  useEffect(() => {
    if (activeProjectId && strategyBlueprint && sharedContext) {
      saveProjectData(activeProjectId, 'blueprint', strategyBlueprint);
      saveProjectData(activeProjectId, 'context', sharedContext);
      updateProjectMeta(activeProjectId, strategyBlueprint.project_name || 'ALCO Campaign');
      setProjectList(getProjectList());
    }
  }, [strategyBlueprint, sharedContext, activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
      saveProjectData(activeProjectId, 'items', items);
      saveProjectData(activeProjectId, 'growthItems', growthItems);
      saveProjectData(activeProjectId, 'history', history);
    }
  }, [items, growthItems, history, activeProjectId]);

  const [skipDays, setSkipDays] = useState<string[]>([]);
  const [gender, setGender] = useState('Both');
  const [ageRange, setAgeRange] = useState<[number, number]>([20, 45]);
  const [formats, setFormats] = useState<string[]>(['Single', 'Carousel', 'Reels']);
  const [carouselSlides, setCarouselSlides] = useState<number>(5);
  const [reelsDuration, setReelsDuration] = useState<string>('30s');
  const [ratio, setRatio] = useState({ tofu: 8, mofu: 6, bofu: 4 });
  const [formatRatio, setFormatRatio] = useState<Record<string, number>>({ Single: 30, Carousel: 40, Reels: 30 });
  const [selectedVoices, setSelectedVoices] = useState<string[]>(['The Efficiency Expert']);
  const [hookMix, setHookMix] = useState<{ type: string; percentage?: number }[]>([
    { type: 'Call-Out', percentage: 40 },
    { type: 'Curiosity Gap', percentage: 35 },
    { type: 'Social Proof', percentage: 25 }
  ]);
  const [selectedFormula, setSelectedFormula] = useState('Awareness & Soft Selling');
  const [referenceType, setReferenceType] = useState('Logika AI');
  const [selectedCTAs, setSelectedCTAs] = useState<string[]>(['Link Bio']);
  const [isFastMode, setIsFastMode] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyStrategy = (newBlueprint: StrategyBlueprint, newContext: SharedContentContext) => {
    let pid = activeProjectId;
    if (!pid) {
      pid = newBlueprint.project_id || `proj_${Date.now()}`;
      newBlueprint.project_id = pid;
      newContext.project_id = pid;
      setActiveProjectIdState(pid);
      setActiveProjectId(pid);
    }
    setStrategyBlueprint(newBlueprint);
    setSharedContext(newContext);
    if (newBlueprint.brand_identity?.brand_name) {
      setCoreTopic(`${newBlueprint.brand_identity.brand_name} Campaign`);
    }
    showToast('Strategy Blueprint berhasil diterapkan ke Content Engine!');
  };

  const toggleSkipDay = (day: string) => {
    setSkipDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleFormat = (fmt: string) => {
    setFormats(prev => prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]);
  };

  const toggleVoice = (v: string) => {
    setSelectedVoices(prev => prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]);
  };

  const toggleCTA = (cta: string) => {
    setSelectedCTAs(prev => prev.includes(cta) ? prev.filter(c => c !== cta) : [...prev, cta]);
  };

  const updateHookMix = (index: number, field: string, val: any) => {
    setHookMix(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: val };
      } else {
        updated[index] = { type: 'Call-Out', [field]: val };
      }
      return updated;
    });
  };

  const handleGenerateCalendar = async () => {
    if (isLoading) return;
    setIsLoading(true);
    showToast('Generasi strategi konten sedang berjalan via Gemini AI...');
    try {
      const response = await fetch('/api/gemini/generate-calendar', {
        method: 'POST',
        headers: buildGeminiRequestHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          coreTopic: coreTopic || sharedContext?.brand_context?.brand_name || 'Peluncuran Produk Strategy',
          startDate,
          skipDays,
          gender,
          ageRange,
          ratio,
          formats,
          carouselSlides,
          reelsDuration,
          selectedVoices,
          selectedFormula,
          selectedCTAs,
          hookMix,
          referenceType,
          isFastMode,
          strategyBlueprint,
          sharedContentContext: sharedContext,
        }),
      });

      if (!response.ok) {
        let errText = 'Failed to generate calendar content';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errText = errData.error;
          }
        } catch (_) {}
        throw new Error(errText);
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        setItems(data.items);
        if (data.growthItems) setGrowthItems(data.growthItems);

        const newHistoryEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          topic: coreTopic || sharedContext?.brand_context?.brand_name || 'Peluncuran Produk',
          itemCount: data.items.length,
          items: data.items,
          growthItems: data.growthItems || []
        };
        setHistory(prev => [newHistoryEntry, ...prev.slice(0, 9)]);
        setIsConfiguring(false);
        showToast(`Berhasil membuat ${data.items.length} strategi konten berbasis funnel!`);
      } else {
        showToast('Respon tidak valid, silakan coba lagi.');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || '';
      if (/dibatasi/i.test(errMsg) || /rate.*limit/i.test(errMsg) || /quota/i.test(errMsg) || /429/i.test(errMsg)) {
        showToast('Permintaan AI sedang dibatasi. Coba lagi beberapa saat.');
      } else {
        showToast('Gagal memuat strategi: ' + errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = (itemId: number, newDate: string) => {
    setItems(prev => prev.map(item => item.no === itemId ? { ...item, tanggal: newDate } : item));
    showToast(`Post #${itemId} dijadwalkan ulang ke ${newDate}`);
  };

  const handleUpdateItem = (updatedItem: ContentItem) => {
    setItems(prev => prev.map(item => item.no === updatedItem.no ? { ...updatedItem, isManualEdited: true } : item));
    showToast(`Post #${updatedItem.no} diperbarui (manual edit disimpan)`);
  };

  const handleRegenerateItem = async (itemNo: number, instruction: string) => {
    const target = items.find(i => i.no === itemNo);
    if (!target || isRegeneratingItem) return;
    setIsRegeneratingItem(true);
    showToast(`Merevisi Post #${itemNo}...`);

    try {
      const res = await fetch('/api/gemini/regenerate-item', {
        method: 'POST',
        headers: buildGeminiRequestHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          item: target,
          instruction,
          coreTopic,
          sharedContentContext: sharedContext
        })
      });

      if (!res.ok) {
        let errText = 'Failed to regenerate item';
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errText = errData.error;
          }
        } catch (_) {}
        throw new Error(errText);
      }

      const data = await res.json();
      if (data.item) {
        handleUpdateItem(data.item);
        showToast(`Post #${itemNo} berhasil direvisi!`);
      }
    } catch (e: any) {
      console.error(e);
      const errMsg = e.message || '';
      if (/dibatasi/i.test(errMsg) || /rate.*limit/i.test(errMsg) || /quota/i.test(errMsg) || /429/i.test(errMsg)) {
        showToast('Permintaan AI sedang dibatasi. Coba lagi beberapa saat.');
      } else {
        showToast('Gagal merevisi item: ' + errMsg);
      }
    } finally {
      setIsRegeneratingItem(false);
    }
  };

  const handleCopyTSV = () => {
    if (items.length === 0) return;
    const headers = ["No", "Tanggal", "Jenis", "Tujuan", "Hook Type", "Headline", "Body", "Caption", "Format", "Referensi", "Visual", "Keterangan", "CTA"];
    let tsv = headers.join('\t') + '\n';
    items.forEach(item => {
      const row = [
        item.no, item.tanggal, item.jenis, item.tujuan, item.hookType,
        item.headline, item.body, item.caption, item.format,
        item.referensi, item.visual, item.keterangan, item.cta
      ].map(v => String(v || '').replace(/\t/g, ' ').replace(/\n/g, ' '));
      tsv += row.join('\t') + '\n';
    });
    void (async () => {
      const copied = await safeCopyToClipboard(tsv);
      showToast(copied ? 'Berhasil menyalin data TSV untuk Spreadsheet!' : 'Clipboard tidak tersedia di environment ini.');
    })();
  };

  const handleDownloadCSV = () => {
    if (items.length === 0) return;
    const headers = ["No", "Tanggal", "Jenis", "Tujuan", "Hook Type", "Headline", "Body", "Caption", "Format", "Referensi", "Visual", "Keterangan", "CTA"];
    let csv = headers.join(',') + '\n';
    items.forEach(item => {
      const row = [
        item.no, item.tanggal, item.jenis, item.tujuan, item.hookType,
        item.headline, item.body, item.caption, item.format,
        item.referensi, item.visual, item.keterangan, item.cta
      ].map(v => `"${String(v || '').replace(/"/g, '""')}"`);
      csv += row.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ALCO_Content_Calendar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh!');
  };

  const handleReset = () => {
    setItems([]);
    setGrowthItems([]);
    setIsConfiguring(true);
    setCurrentStep(0);
    showToast('Sistem di-reset ke awal.');
  };

  const configData = {
    coreTopic, setCoreTopic,
    startDate, setStartDate,
    skipDays, toggleSkipDay,
    gender, setGender,
    ageRange, setAgeRange,
    formats, toggleFormat,
    carouselSlides, setCarouselSlides,
    reelsDuration, setReelsDuration,
    ratio, setRatio,
    formatRatio, setFormatRatio,
    selectedVoices, toggleVoice,
    hookMix, updateHookMix,
    selectedFormula, setSelectedFormula,
    referenceType, setReferenceType,
    selectedCTAs, toggleCTA,
    isFastMode, setIsFastMode,
    generateContent: handleGenerateCalendar,
    connectionStatus: "active",
    brandContext: { brandName: sharedContext?.brand_context?.brand_name || "ALCO Engine" },
    editableContext: {
      contentStrategy: {
        pillars: sharedContext?.strategy_context?.content_pillars || ["TOFU Awareness", "MOFU Consideration", "BOFU Conversion"]
      },
      audience: {
        segments: [sharedContext?.audience_context?.primary_audience || "Target Buyers"]
      },
      offers: [{ ctaText: sharedContext?.strategy_context?.main_offer || "Link Bio" }]
    },
    sharedContentContext: sharedContext,
    strategyBlueprint: strategyBlueprint
  };

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const tofuCount = items.filter(i => (i.jenis || '').toUpperCase().includes('TOFU')).length;
  const mofuCount = items.filter(i => (i.jenis || '').toUpperCase().includes('MOFU')).length;
  const bofuCount = items.filter(i => (i.jenis || '').toUpperCase().includes('BOFU')).length;

  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#1f2933] flex flex-col font-sans">
      {/* Notification Toast */}
      {isMounted && (
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-[9999] bg-[#0f766e] text-white font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-teal-600"
            >
              <Sparkles size={14} />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <header className="border-b border-[#e7e0d4] bg-[#fffdf8]/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3">
        {/* Desktop & Mobile Main Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0f766e] shrink-0 shadow-xs">
              <Zap size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold tracking-tight text-[#1f2933] truncate">
                  <span className="md:hidden">ALCO ENGINE</span>
                  <span className="hidden md:inline">ALCO Content Engine</span>
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-[#0f766e] text-[10px] font-semibold tracking-wide shrink-0">
                  <span className="md:hidden">Stage 2</span>
                  <span className="hidden md:inline">Strategy-First v2.5</span>
                </span>
              </div>
              <p className="text-xs text-[#627d98] truncate hidden sm:block">
                Content Operating System - Stage 2 after ALCO Creative System
              </p>
            </div>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {projectList.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsProjectDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e7e0d4] rounded-xl text-xs font-semibold text-[#1f2933] hover:bg-[#f6f3ee] transition shadow-xs"
                >
                  <FolderOpen size={14} className="text-[#0f766e]" />
                  <span className="max-w-[140px] truncate">
                    {projectList.find(p => p.project_id === activeProjectId)?.project_name || 'Pilih Project'}
                  </span>
                </button>
                {isProjectDropdownOpen && (
                  <div className="absolute top-full mt-1.5 right-0 w-56 bg-[#fffdf8] border border-[#e7e0d4] rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="p-2.5 text-xs font-semibold text-[#627d98] border-b border-[#e7e0d4] bg-[#f6f3ee]">
                      Pilih Project
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {projectList.map(p => (
                        <button
                          key={p.project_id}
                          onClick={() => {
                            setActiveProjectIdState(p.project_id);
                            setActiveProjectId(p.project_id);
                            setIsProjectDropdownOpen(false);
                            window.location.reload();
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors ${activeProjectId === p.project_id ? 'text-[#0f766e] font-bold bg-teal-50' : 'text-[#1f2933] hover:bg-[#f6f3ee]'}`}
                        >
                          {p.project_name}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setActiveProjectIdState(null);
                        setActiveProjectId(null);
                        setIsProjectDropdownOpen(false);
                        window.location.reload();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-[#e7e0d4]"
                    >
                      Kosongkan Project Aktif
                    </button>
                  </div>
                )}
              </div>
            )}
            <GeminiApiKeyControl onToast={showToast} />

            <button
              onClick={() => setIsIntakeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#f6f3ee] text-[#1f2933] border border-[#e7e0d4] font-semibold rounded-xl text-xs transition shadow-xs"
            >
              <FileText size={14} className="text-[#0f766e]" />
              Input Strategi
            </button>

            <div className="flex items-center bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl p-1 text-xs">
              {[
                { type: 'ALL', count: items.length },
                { type: 'TOFU', count: tofuCount },
                { type: 'MOFU', count: mofuCount },
                { type: 'BOFU', count: bofuCount }
              ].map(({ type, count }) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    filterType === type ? 'bg-[#0f766e] text-white shadow-xs font-bold' : 'text-[#627d98] hover:text-[#1f2933]'
                  }`}
                >
                  <span>{type}</span>
                  {items.length > 0 && count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterType === type ? 'bg-white/20 text-white' : 'bg-black/5 text-[#627d98]'}`}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsConfiguring(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold rounded-xl text-xs transition-all shadow-sm shrink-0"
            >
              <Layers size={14} />
              {items.length > 0 ? 'Edit Parameter' : 'Buat Kalender Baru'}
            </button>
          </div>

          {/* Mobile Right Controls: API Key */}
          <div className="flex md:hidden items-center gap-2">
            <GeminiApiKeyControl variant="compact" onToast={showToast} />
          </div>
        </div>

        {/* Mobile Rows: Row 2 (Projects & Primary CTAs) and Row 3 (Filters) */}
        <div className="md:hidden mt-2.5 pt-2.5 border-t border-[#e7e0d4] space-y-2">
          {/* Row 2: Project selector & Primary CTAs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {projectList.length > 0 && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsProjectDropdownOpen(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e7e0d4] rounded-xl text-xs font-semibold text-[#1f2933] min-h-[38px] shadow-xs"
                >
                  <FolderOpen size={13} className="text-[#0f766e]" />
                  <span className="max-w-[95px] truncate">
                    {projectList.find(p => p.project_id === activeProjectId)?.project_name || 'Project'}
                  </span>
                </button>
                {isProjectDropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-0 w-52 bg-[#fffdf8] border border-[#e7e0d4] rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-2.5 text-xs font-semibold text-[#627d98] bg-[#f6f3ee] border-b border-[#e7e0d4]">
                      Pilih Project
                    </div>
                    {projectList.map(p => (
                      <button
                        key={p.project_id}
                        onClick={() => {
                          setActiveProjectIdState(p.project_id);
                          setActiveProjectId(p.project_id);
                          setIsProjectDropdownOpen(false);
                          window.location.reload();
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${activeProjectId === p.project_id ? 'text-[#0f766e] font-bold bg-teal-50' : 'text-[#1f2933]'}`}
                      >
                        {p.project_name}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setActiveProjectIdState(null);
                        setActiveProjectId(null);
                        setIsProjectDropdownOpen(false);
                        window.location.reload();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-[#e7e0d4]"
                    >
                      Kosongkan Project Aktif
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsIntakeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#f6f3ee] text-[#1f2933] border border-[#e7e0d4] font-semibold rounded-xl text-xs shrink-0 min-h-[38px] shadow-xs"
            >
              <FileText size={13} className="text-[#0f766e]" />
              Input Strategi
            </button>

            <button
              onClick={() => setIsConfiguring(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold rounded-xl text-xs shadow-sm shrink-0 min-h-[38px]"
            >
              <Layers size={13} />
              {items.length > 0 ? 'Edit Parameter' : 'Buat Kalender'}
            </button>
          </div>

          {/* Row 3: Mobile Funnel Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {[
              { type: 'ALL', label: 'Semua', count: items.length, color: 'text-[#1f2933]' },
              { type: 'TOFU', label: 'TOFU Awareness', count: tofuCount, color: 'text-teal-700' },
              { type: 'MOFU', label: 'MOFU Consideration', count: mofuCount, color: 'text-amber-700' },
              { type: 'BOFU', label: 'BOFU Conversion', count: bofuCount, color: 'text-[#0f766e]' }
            ].map(({ type, label, count, color }) => {
              const isSelected = filterType === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 min-h-[36px] border ${
                    isSelected
                      ? 'bg-[#0f766e] text-white border-[#0f766e] font-bold shadow-xs'
                      : 'bg-white border-[#e7e0d4] text-[#627d98] hover:text-[#1f2933]'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : color}>{label}</span>
                  {items.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-[#627d98]'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
        {activeProjectId && sharedContext ? (
          <ActiveStrategyBadge
            context={sharedContext}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        ) : null}

        {(!activeProjectId || (items.length === 0 && !isConfiguring)) && (
          <div className="bg-[#fffdf8] border border-[#e7e0d4] rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-sm relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0f766e] text-xs font-semibold">
                <Sparkles size={14} />
                Langkah Pertama Strategy
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1f2933] tracking-tight">
                {activeProjectId ? 'Buat Kalender Konten Anda' : 'Belum Ada Project Aktif'}
              </h2>
              <p className="text-sm text-[#627d98] leading-relaxed">
                {activeProjectId 
                  ? 'Sistem otomatisasi kalender konten berbasis strategi funnel (TOFU, MOFU, BOFU). Silakan pilih langkah awal untuk mulai menyusun kalender strategi konten Anda.'
                  : 'Sistem penyimpanan sekarang berbasis project agar data tidak tercampur. Mulai Strategy Intake baru untuk membuat project pertama Anda.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 max-w-xl mx-auto">
              {!activeProjectId && (
                <button
                  onClick={() => setIsIntakeModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold rounded-xl text-xs shadow-sm transition-all group"
                >
                  <FileText size={16} className="group-hover:scale-105 transition-transform" />
                  Mulai Project Baru
                </button>
              )}
              {activeProjectId && (
                <>
                  <button
                    onClick={() => setIsIntakeModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#f6f3ee] text-[#1f2933] font-semibold rounded-xl text-xs border border-[#e7e0d4] shadow-xs transition-all group"
                  >
                    <FileText size={16} className="text-[#0f766e] group-hover:scale-105 transition-transform" />
                    Edit Strategy
                  </button>
                  <button
                    onClick={() => setIsConfiguring(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold rounded-xl text-xs shadow-sm transition-all group"
                  >
                    <Layers size={16} className="group-hover:scale-105 transition-transform" />
                    Buat Kalender Pertama
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeProjectId && (
          <CalendarView
            items={items}
            growthItems={growthItems}
            onReschedule={handleReschedule}
            filterType={filterType}
            onFilterChange={setFilterType}
            accessCode={accessCode}
            setAccessCode={setAccessCode}
            isAccessValid={isAccessValid}
            isEditAccessLocked={isEditAccessLocked}
            setShowUnlockModal={setShowUnlockModal}
            accessStatus={accessStatus}
            usageStats={usageStats}
            isLoading={isLoading}
            isConfiguring={isConfiguring}
            setIsConfiguring={setIsConfiguring}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            activeConfigCell={activeConfigCell}
            setActiveConfigCell={setActiveConfigCell}
            revisions={revisions}
            setRevisions={setRevisions}
            onRegenerate={handleGenerateCalendar}
            onClear={handleReset}
            onCopy={handleCopyTSV}
            onDownload={handleDownloadCSV}
            onUpdateItem={handleUpdateItem}
            onRegenerateItem={handleRegenerateItem}
            history={history}
            onDeleteHistory={(id) => setHistory(prev => prev.filter(h => h.id !== id))}
            onClearHistory={() => setHistory([])}
            onReset={handleReset}
            onLoadHistory={(entry) => {
              if (entry.items) setItems(entry.items);
              if (entry.growthItems) setGrowthItems(entry.growthItems);
              showToast(`Memuat ${entry.items?.length || 0} post dari histori.`);
            }}
            onSendToCalcer={() => showToast('Brief disalin ke clipboard untuk Calcer AI!')}
            configData={{
              coreTopic, setCoreTopic,
              startDate, setStartDate,
              skipDays, setSkipDays, toggleSkipDay,
              gender, setGender,
              ageRange, setAgeRange,
              formats, setFormats, toggleFormat,
              carouselSlides, setCarouselSlides,
              reelsDuration, setReelsDuration,
              ratio, setRatio,
              formatRatio, setFormatRatio,
              selectedVoices, setSelectedVoices, toggleVoice,
              hookMix, setHookMix, updateHookMix,
              selectedFormula, setSelectedFormula,
              referenceType, setReferenceType,
              selectedCTAs, setSelectedCTAs, toggleCTA,
              isFastMode, setIsFastMode,
              generateContent: handleGenerateCalendar,
              editableContext: {
                contentStrategy: {
                  pillars: sharedContext?.strategy_context?.content_pillars || ["TOFU Awareness", "MOFU Consideration", "BOFU Conversion"]
                },
                audience: {
                  segments: [sharedContext?.audience_context?.primary_audience || "Target Buyers"]
                },
                offers: [{ ctaText: sharedContext?.strategy_context?.main_offer || "Link Bio" }]
              },
              sharedContentContext: sharedContext,
              strategyBlueprint: strategyBlueprint,
              selectedProject: activeProjectId
            }}
          />
        )}
      </div>

      <StrategyIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onApplyStrategy={handleApplyStrategy}
        currentBlueprint={strategyBlueprint}
      />

      <footer className="border-t border-[#e7e0d4] bg-[#fffdf8] py-4 px-6 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#627d98]">
        <div>ALCO Content Engine — Powered by Google Gemini 3.6 Flash & Strategy Blueprint</div>
        <div className="flex gap-4 font-medium">
          <span>Funnel Items: {items.length}</span>
          <span>Strategy Status: {sharedContext?.system_flags?.is_complete_for_planning ? 'Complete' : 'Partial'}</span>
        </div>
      </footer>
    </main>
  );
}
