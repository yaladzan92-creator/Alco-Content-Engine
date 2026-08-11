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
import { StrategyIntakeModal } from '@/components/StrategyIntakeModal';
import { ActiveStrategyBadge } from '@/components/ActiveStrategyBadge';
import CalendarView from '@/components/CalendarView';

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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[9999] bg-brand text-black font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-brand/50"
          >
            <Sparkles size={14} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
            <Zap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white uppercase">ALCO CONTENT ENGINE</h1>
              <span className="px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-[8px] font-mono font-bold tracking-widest uppercase">
                Strategy-First v2.5
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">Content Operating System — Stage 2 after ALCO Creative System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {projectList.length > 0 && (
            <div className="relative group mr-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-300">
                <FolderOpen size={12} className="text-zinc-500" />
                {projectList.find(p => p.project_id === activeProjectId)?.project_name || 'Select Project'}
              </button>
              <div className="absolute top-full mt-1 right-0 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                {projectList.map(p => (
                  <button
                    key={p.project_id}
                    onClick={() => {
                      setActiveProjectIdState(p.project_id);
                      setActiveProjectId(p.project_id);
                      window.location.reload();
                    }}
                    className={`w-full text-left px-3 py-2 text-[10px] hover:bg-zinc-800 transition-colors ${activeProjectId === p.project_id ? 'text-brand font-bold' : 'text-zinc-400'}`}
                  >
                    {p.project_name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setActiveProjectIdState(null);
                    setActiveProjectId(null);
                    window.location.reload();
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] text-red-400 hover:bg-zinc-800 transition-colors border-t border-zinc-800"
                >
                  Clear Active Project
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsIntakeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold rounded-xl text-xs transition"
          >
            <FileText size={14} className="text-brand" />
            Strategy Intake
          </button>

          <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-[10px]">
            {['ALL', 'TOFU', 'MOFU', 'BOFU'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterType === type ? 'bg-brand text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsConfiguring(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand hover:bg-brand/90 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg"
          >
            <Layers size={14} />
            {items.length > 0 ? 'Edit Parameter' : 'Buat Kalender Baru'}
          </button>
        </div>
      </header>      <div className="flex-1 p-3 md:p-6 max-w-[1600px] w-full mx-auto space-y-4">
        {activeProjectId && sharedContext ? (
          <ActiveStrategyBadge
            context={sharedContext}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        ) : null}

        {(!activeProjectId || (items.length === 0 && !isConfiguring)) && (
          <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950 border border-brand/30 rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-2xl mx-auto space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-mono font-bold tracking-wider uppercase">
                <Sparkles size={13} />
                Langkah Pertama Strategy
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {activeProjectId ? 'Buat Kalender Konten Anda' : 'Belum Ada Project Aktif'}
              </h2>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                {activeProjectId 
                  ? 'Sistem otomatisasi kalender konten berbasis strategi funnel (TOFU, MOFU, BOFU). Silakan pilih langkah awal untuk mulai menyusun kalender strategi konten Anda.'
                  : 'Sistem penyimpanan sekarang berbasis project agar data tidak tercampur. Mulai Strategy Intake baru untuk membuat project pertama Anda.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 max-w-xl mx-auto">
              {!activeProjectId && (
                <button
                  onClick={() => setIsIntakeModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand/90 text-black font-extrabold rounded-xl text-xs shadow-xl transition-all group"
                >
                  <FileText size={16} className="group-hover:scale-110 transition-transform" />
                  Mulai Project Baru
                </button>
              )}
              {activeProjectId && (
                <>
                  <button
                    onClick={() => setIsIntakeModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs border border-zinc-700 shadow-lg transition-all group"
                  >
                    <FileText size={16} className="text-brand group-hover:scale-110 transition-transform" />
                    Edit Strategy
                  </button>
                  <button
                    onClick={() => setIsConfiguring(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand/90 text-black font-extrabold rounded-xl text-xs shadow-xl transition-all group"
                  >
                    <Layers size={16} className="group-hover:scale-110 transition-transform" />
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
              strategyBlueprint: strategyBlueprint
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

      <footer className="border-t border-zinc-900 bg-zinc-950 py-3 px-6 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
        <div>ALCO Content Engine — Powered by Google Gemini 3.6 Flash & Strategy Blueprint</div>
        <div className="flex gap-4">
          <span>Funnel Items: {items.length}</span>
          <span>Strategy Status: {sharedContext?.system_flags?.is_complete_for_planning ? 'Complete' : 'Partial'}</span>
        </div>
      </footer>
    </main>
  );
}
