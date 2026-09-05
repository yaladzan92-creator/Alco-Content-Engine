'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, FileText, Layers, FolderOpen, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  StrategyBlueprint,
  SharedContentContext,
  ContentItem
} from '@/lib/content-contract';
import {
  getActiveProjectId,
  setActiveProjectId,
  loadProjectData,
  saveProjectData,
  updateProjectMeta,
  getProjectList,
  CalendarSettings,
  DEFAULT_CALENDAR_SETTINGS,
  getDefaultCalendarSettings,
  getProjectCalendarSettings,
  saveProjectCalendarSettings
} from '@/lib/storage';
import { ActiveStrategyBadge } from '@/components/ActiveStrategyBadge';
import { GeminiApiKeyControl } from '@/components/GeminiApiKeyControl';
import { GeminiApiKeyOnboardingCard } from '@/components/GeminiApiKeyOnboardingCard';
import { buildGeminiRequestHeaders, useGeminiApiKey } from '@/lib/client-gemini-key';
import CalendarView from '@/components/CalendarView';
import { StrategyIntakeModal } from '@/components/StrategyIntakeModal';
import ContentEngineShell from '@/components/ContentEngineShell';

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
  const [isProjectIncomplete, setIsProjectIncomplete] = useState(false);
  const isSwitchingRef = useRef(false);
  const activeProjectIdRef = useRef<string | null>(null);
  const onboardingRef = useRef<HTMLDivElement>(null);
  const { hasCustomKey } = useGeminiApiKey();

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

  // 14 calendar settings per project
  const [coreTopic, setCoreTopic] = useState(DEFAULT_CALENDAR_SETTINGS.coreTopic);
  const [startDate, setStartDate] = useState(DEFAULT_CALENDAR_SETTINGS.startDate);
  const [skipDays, setSkipDays] = useState<string[]>(DEFAULT_CALENDAR_SETTINGS.skipDays);
  const [gender, setGender] = useState(DEFAULT_CALENDAR_SETTINGS.gender);
  const [ageRange, setAgeRange] = useState<[number, number]>(DEFAULT_CALENDAR_SETTINGS.ageRange);
  const [formats, setFormats] = useState<string[]>(DEFAULT_CALENDAR_SETTINGS.formats);
  const [carouselSlides, setCarouselSlides] = useState<number>(DEFAULT_CALENDAR_SETTINGS.carouselSlides);
  const [reelsDuration, setReelsDuration] = useState<string>(DEFAULT_CALENDAR_SETTINGS.reelsDuration);
  const [ratio, setRatio] = useState(DEFAULT_CALENDAR_SETTINGS.ratio);
  const [formatRatio, setFormatRatio] = useState<Record<string, number>>(DEFAULT_CALENDAR_SETTINGS.formatRatio);
  const [selectedVoices, setSelectedVoices] = useState<string[]>(DEFAULT_CALENDAR_SETTINGS.selectedVoices);
  const [hookMix, setHookMix] = useState<{ type: string; percentage?: number }[]>(DEFAULT_CALENDAR_SETTINGS.hookMix);
  const [selectedFormula, setSelectedFormula] = useState(DEFAULT_CALENDAR_SETTINGS.selectedFormula);
  const [referenceType, setReferenceType] = useState(DEFAULT_CALENDAR_SETTINGS.referenceType);
  const [selectedCTAs, setSelectedCTAs] = useState<string[]>(DEFAULT_CALENDAR_SETTINGS.selectedCTAs);
  const [isFastMode, setIsFastMode] = useState(DEFAULT_CALENDAR_SETTINGS.isFastMode);

  const applyCalendarSettings = (
    settings: Partial<CalendarSettings> | null,
    blueprint?: StrategyBlueprint | SharedContentContext | null,
    projectName?: string
  ) => {
    const fallbackDefaults = getDefaultCalendarSettings(blueprint, projectName);
    const s = settings || fallbackDefaults;

    const resolvedCoreTopic =
      s.coreTopic && s.coreTopic !== 'Digital Course Launch Strategy'
        ? s.coreTopic
        : fallbackDefaults.coreTopic;

    setCoreTopic(resolvedCoreTopic);
    setStartDate(s.startDate || fallbackDefaults.startDate);
    setSkipDays(Array.isArray(s.skipDays) ? s.skipDays : fallbackDefaults.skipDays);
    setGender(s.gender || fallbackDefaults.gender);
    setAgeRange(Array.isArray(s.ageRange) && s.ageRange.length === 2 ? s.ageRange : fallbackDefaults.ageRange);
    setFormats(Array.isArray(s.formats) && s.formats.length > 0 ? s.formats : fallbackDefaults.formats);
    setCarouselSlides(typeof s.carouselSlides === 'number' ? s.carouselSlides : fallbackDefaults.carouselSlides);
    setReelsDuration(s.reelsDuration || fallbackDefaults.reelsDuration);
    setRatio(s.ratio || fallbackDefaults.ratio);
    setFormatRatio(s.formatRatio || fallbackDefaults.formatRatio);
    setSelectedVoices(Array.isArray(s.selectedVoices) && s.selectedVoices.length > 0 ? s.selectedVoices : fallbackDefaults.selectedVoices);
    setHookMix(Array.isArray(s.hookMix) && s.hookMix.length > 0 ? s.hookMix : fallbackDefaults.hookMix);
    setSelectedFormula(s.selectedFormula || fallbackDefaults.selectedFormula);
    setReferenceType(s.referenceType || fallbackDefaults.referenceType);
    setSelectedCTAs(Array.isArray(s.selectedCTAs) && s.selectedCTAs.length > 0 ? s.selectedCTAs : fallbackDefaults.selectedCTAs);
    setIsFastMode(Boolean(s.isFastMode));
  };

  const saveCurrentProjectSnapshot = (pid: string | null) => {
    if (!pid || isProjectIncomplete || isSwitchingRef.current) return;
    const currentSettings: CalendarSettings = {
      coreTopic,
      startDate,
      skipDays,
      gender,
      ageRange,
      formats,
      carouselSlides,
      reelsDuration,
      ratio,
      formatRatio,
      selectedVoices,
      hookMix,
      selectedFormula,
      referenceType,
      selectedCTAs,
      isFastMode
    };
    saveProjectCalendarSettings(pid, currentSettings);
    saveProjectData(pid, 'items', items);
    saveProjectData(pid, 'growthItems', growthItems);
    saveProjectData(pid, 'history', history);
    saveProjectData(pid, 'revisions', revisions);
  };

  const loadProject = (pid: string | null) => {
    // 1. Save current active project snapshot before switching away
    const oldPid = activeProjectIdRef.current;
    if (oldPid && oldPid !== pid && !isProjectIncomplete) {
      saveCurrentProjectSnapshot(oldPid);
    }

    // 2. Set switching flag to block auto-save effects during transition
    isSwitchingRef.current = true;

    // 3. Immediately clear all states of old project
    setItems([]);
    setGrowthItems([]);
    setHistory([]);
    setRevisions({});
    setStrategyBlueprint(null);
    setSharedContext(null);
    setIsConfiguring(false);
    setActiveConfigCell(null);

    // 4. Update active project ID
    setActiveProjectIdState(pid);
    setActiveProjectId(pid);
    activeProjectIdRef.current = pid;

    // 5. If pid is null, reset everything to defaults
    if (!pid) {
      setIsProjectIncomplete(false);
      applyCalendarSettings(getDefaultCalendarSettings(null), null);
      setTimeout(() => {
        isSwitchingRef.current = false;
      }, 50);
      return;
    }

    // 6. Validate that both blueprint and context are present and valid
    const savedBlueprint = loadProjectData(pid, 'blueprint');
    const savedContext = loadProjectData(pid, 'context');

    const isBlueprintValid = Boolean(
      savedBlueprint &&
      typeof savedBlueprint === 'object' &&
      Object.keys(savedBlueprint).length > 0 &&
      (savedBlueprint.brand_identity || savedBlueprint.project_id || savedBlueprint.project_name || savedBlueprint.core_strategy)
    );

    const isContextValid = Boolean(
      savedContext &&
      typeof savedContext === 'object' &&
      Object.keys(savedContext).length > 0 &&
      (savedContext.brand_context || savedContext.project_id)
    );

    if (!isBlueprintValid || !isContextValid) {
      // Incomplete / corrupted project data:
      // Do NOT show calendar, context, or items of previous project.
      setIsProjectIncomplete(true);
      setStrategyBlueprint(null);
      setSharedContext(null);
      setItems([]);
      setGrowthItems([]);
      setHistory([]);
      setRevisions({});
      applyCalendarSettings(getDefaultCalendarSettings(null), null);
      setTimeout(() => {
        isSwitchingRef.current = false;
      }, 50);
      return;
    }

    // 7. Project is valid and complete
    setIsProjectIncomplete(false);
    setStrategyBlueprint(savedBlueprint);
    setSharedContext(savedContext);

    const savedItems = loadProjectData(pid, 'items', []);
    const savedGrowthItems = loadProjectData(pid, 'growthItems', []);
    const savedHistory = loadProjectData(pid, 'history', []);
    const savedRevisions = loadProjectData(pid, 'revisions', {});
    setItems(savedItems);
    setGrowthItems(savedGrowthItems);
    setHistory(savedHistory);
    setRevisions(savedRevisions);

    // Load or default calendar settings specifically for this project
    const savedSettings = getProjectCalendarSettings(pid);
    if (savedSettings) {
      applyCalendarSettings(savedSettings, savedBlueprint);
    } else {
      const freshDefault = getDefaultCalendarSettings(savedBlueprint);
      saveProjectCalendarSettings(pid, freshDefault);
      applyCalendarSettings(freshDefault, savedBlueprint);
    }

    setTimeout(() => {
      isSwitchingRef.current = false;
    }, 50);
  };

  const loadProjectRef = useRef<(pid: string | null) => void>(() => {});
  loadProjectRef.current = loadProject;

  // Initialization & Storage
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const pList = getProjectList();
      setProjectList(pList);

      const pid = getActiveProjectId();
      if (pid) {
        loadProjectRef.current(pid);
      } else {
        applyCalendarSettings(getDefaultCalendarSettings(null), null);
      }
    }
  }, []);

  // Auto-save blueprint & context
  useEffect(() => {
    if (isSwitchingRef.current || !activeProjectId || isProjectIncomplete || !strategyBlueprint || !sharedContext || activeProjectIdRef.current !== activeProjectId) {
      return;
    }
    saveProjectData(activeProjectId, 'blueprint', strategyBlueprint);
    saveProjectData(activeProjectId, 'context', sharedContext);
    updateProjectMeta(activeProjectId, strategyBlueprint.brand_identity?.brand_name || strategyBlueprint.project_name || 'ALCO Campaign');
    setProjectList(getProjectList());
  }, [strategyBlueprint, sharedContext, activeProjectId, isProjectIncomplete]);

  // Auto-save items & history
  useEffect(() => {
    if (isSwitchingRef.current || !activeProjectId || isProjectIncomplete || activeProjectIdRef.current !== activeProjectId) {
      return;
    }
    saveProjectData(activeProjectId, 'items', items);
    saveProjectData(activeProjectId, 'growthItems', growthItems);
    saveProjectData(activeProjectId, 'history', history);
    saveProjectData(activeProjectId, 'revisions', revisions);
  }, [items, growthItems, history, revisions, activeProjectId, isProjectIncomplete]);

  // Auto-save calendar settings per project
  useEffect(() => {
    if (isSwitchingRef.current || !activeProjectId || isProjectIncomplete || !strategyBlueprint || !sharedContext || activeProjectIdRef.current !== activeProjectId) {
      return;
    }
    const currentSettings: CalendarSettings = {
      coreTopic,
      startDate,
      skipDays,
      gender,
      ageRange,
      formats,
      carouselSlides,
      reelsDuration,
      ratio,
      formatRatio,
      selectedVoices,
      hookMix,
      selectedFormula,
      referenceType,
      selectedCTAs,
      isFastMode,
    };
    saveProjectCalendarSettings(activeProjectId, currentSettings);
  }, [
    activeProjectId,
    isProjectIncomplete,
    strategyBlueprint,
    sharedContext,
    coreTopic,
    startDate,
    skipDays,
    gender,
    ageRange,
    formats,
    carouselSlides,
    reelsDuration,
    ratio,
    formatRatio,
    selectedVoices,
    hookMix,
    selectedFormula,
    referenceType,
    selectedCTAs,
    isFastMode,
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyStrategy = (newBlueprint: StrategyBlueprint, newContext: SharedContentContext, isNewProject: boolean) => {
    let finalProjectId = activeProjectId;
    const incomingProjectId = newBlueprint.project_id || newContext.project_id;

    if (isNewProject || !finalProjectId) {
      finalProjectId = incomingProjectId || `proj_${Date.now()}`;
      if (finalProjectId === activeProjectId) {
        finalProjectId = `proj_${Date.now()}`;
      }
    }

    newBlueprint.project_id = finalProjectId;
    newContext.project_id = finalProjectId;

    const isDifferentProject = finalProjectId !== activeProjectId;

    if (isDifferentProject || isNewProject) {
      // 1. Snapshot previous project if one existed
      const oldPid = activeProjectIdRef.current;
      if (oldPid && oldPid !== finalProjectId && !isProjectIncomplete) {
        saveCurrentProjectSnapshot(oldPid);
      }

      // 2. Set switching flag to block auto-save effects
      isSwitchingRef.current = true;

      // 3. Reset calendar, items, and revision states completely
      setItems([]);
      setGrowthItems([]);
      setHistory([]);
      setRevisions({});
      setIsConfiguring(false);
      setActiveConfigCell(null);

      // 4. Generate clean default settings based on the new blueprint
      const freshSettings = getDefaultCalendarSettings(newBlueprint, newBlueprint.project_name);

      // 5. Save everything under finalProjectId immediately in storage
      saveProjectData(finalProjectId, 'blueprint', newBlueprint);
      saveProjectData(finalProjectId, 'context', newContext);
      saveProjectCalendarSettings(finalProjectId, freshSettings);
      saveProjectData(finalProjectId, 'items', []);
      saveProjectData(finalProjectId, 'growthItems', []);
      saveProjectData(finalProjectId, 'history', []);
      saveProjectData(finalProjectId, 'revisions', {});

      // 6. Update active project ID & state
      setActiveProjectIdState(finalProjectId);
      setActiveProjectId(finalProjectId);
      activeProjectIdRef.current = finalProjectId;

      // 7. Apply the new settings, blueprint, and context to React state
      applyCalendarSettings(freshSettings, newBlueprint, newBlueprint.project_name);
      setIsProjectIncomplete(false);
      setStrategyBlueprint(newBlueprint);
      setSharedContext(newContext);

      updateProjectMeta(finalProjectId, newBlueprint.brand_identity?.brand_name || newBlueprint.project_name || 'ALCO Campaign');
      setProjectList(getProjectList());

      setTimeout(() => {
        isSwitchingRef.current = false;
      }, 50);

      showToast(isDifferentProject ? `Beralih ke project: ${newBlueprint.brand_identity?.brand_name || newBlueprint.project_name || finalProjectId}` : 'Strategy Blueprint baru berhasil diterapkan!');
    } else {
      // Updating current project blueprint & context
      saveProjectData(finalProjectId, 'blueprint', newBlueprint);
      saveProjectData(finalProjectId, 'context', newContext);
      updateProjectMeta(finalProjectId, newBlueprint.brand_identity?.brand_name || newBlueprint.project_name || 'ALCO Campaign');
      setProjectList(getProjectList());

      setStrategyBlueprint(newBlueprint);
      setSharedContext(newContext);

      // If project has saved settings, keep them, but update coreTopic if it was default or empty
      const existingSettings = getProjectCalendarSettings(finalProjectId);
      if (!existingSettings) {
        const freshSettings = getDefaultCalendarSettings(newBlueprint);
        saveProjectCalendarSettings(finalProjectId, freshSettings);
        applyCalendarSettings(freshSettings, newBlueprint);
      } else if (newBlueprint.brand_identity?.brand_name && (!existingSettings.coreTopic || existingSettings.coreTopic === 'Content Campaign' || existingSettings.coreTopic === 'Digital Course Launch Strategy')) {
        const updated = {
          ...existingSettings,
          coreTopic: `${newBlueprint.brand_identity.brand_name} Campaign`
        };
        saveProjectCalendarSettings(finalProjectId, updated);
        setCoreTopic(updated.coreTopic);
      }

      showToast('Strategy Blueprint berhasil diperbarui!');
    }
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

  const handleOpenConfig = () => {
    if (isProjectIncomplete || !strategyBlueprint || !sharedContext) {
      showToast('Project ini tidak lengkap. Silakan upload blueprint ulang.');
      setIsIntakeModalOpen(true);
      return;
    }
    setIsConfiguring(true);
  };

  const handleGenerateCalendar = async () => {
    if (!hasCustomKey) {
      showToast('Hubungkan Gemini API Key dulu untuk menggunakan fitur generate AI.');
      onboardingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (isProjectIncomplete || !strategyBlueprint || !sharedContext) {
      showToast('Project ini tidak lengkap. Silakan upload blueprint ulang.');
      setIsIntakeModalOpen(true);
      return;
    }

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
    if (!hasCustomKey) {
      showToast('Hubungkan Gemini API Key dulu untuk menggunakan fitur generate AI.');
      onboardingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

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

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const tofuCount = items.filter(i => (i.jenis || '').toUpperCase().includes('TOFU')).length;
  const mofuCount = items.filter(i => (i.jenis || '').toUpperCase().includes('MOFU')).length;
  const bofuCount = items.filter(i => (i.jenis || '').toUpperCase().includes('BOFU')).length;
  const currentProjectName = projectList.find(p => p.project_id === activeProjectId)?.project_name || 'Pilih Project';
  const funnelFilters = [
    { type: 'ALL', label: 'Semua', count: items.length, color: 'text-slate-900' },
    { type: 'TOFU', label: 'TOFU Awareness', count: tofuCount, color: 'text-sky-700' },
    { type: 'MOFU', label: 'MOFU Consideration', count: mofuCount, color: 'text-amber-700' },
    { type: 'BOFU', label: 'BOFU Conversion', count: bofuCount, color: 'text-emerald-700' }
  ];
  const projectSelector = projectList.length > 0 ? (
    <div className="relative">
      <button
        onClick={() => setIsProjectDropdownOpen(prev => !prev)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted"
      >
        <FolderOpen size={14} className="text-primary" />
        <span className="max-w-[160px] truncate">{currentProjectName}</span>
      </button>
      {isProjectDropdownOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-60 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="border-b border-border bg-muted p-2.5 text-xs font-semibold text-muted-foreground">
            Pilih Project
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {projectList.map(p => (
              <button
                key={p.project_id}
                onClick={() => {
                  setIsProjectDropdownOpen(false);
                  loadProject(p.project_id);
                }}
                className={`w-full px-3.5 py-2.5 text-left text-xs transition-colors ${activeProjectId === p.project_id ? 'bg-primary/10 font-bold text-primary' : 'text-foreground hover:bg-muted'}`}
              >
                {p.project_name}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setIsProjectDropdownOpen(false);
              loadProject(null);
            }}
            className="w-full border-t border-border px-3.5 py-2 text-left text-xs text-rose-600 transition-colors hover:bg-rose-50"
          >
            Kosongkan Project Aktif
          </button>
        </div>
      )}
    </div>
  ) : null;
  const primaryActions = (
    <>
      {projectSelector}
      <GeminiApiKeyControl onToast={showToast} />
      <button
        onClick={() => setIsIntakeModalOpen(true)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted"
      >
        <FileText size={14} className="text-primary" />
        Input Strategi
      </button>
      <button
        onClick={handleOpenConfig}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/95"
      >
        <Layers size={14} />
        {items.length > 0 ? 'Edit Parameter' : 'Buat Kalender Baru'}
      </button>
    </>
  );
  const mobileActions = (
    <>
      <GeminiApiKeyControl variant="compact" onToast={showToast} />
      <button
        onClick={handleOpenConfig}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground shadow-sm"
      >
        <Layers size={13} />
        Kalender
      </button>
    </>
  );

  return (
    <ContentEngineShell
      title="ALCO Content Engine"
      subtitle="Execution workspace setelah ALCO Creative System"
      eyebrow="Strategy-First v2.5"
      actions={primaryActions}
      mobileActions={mobileActions}
      footer={(
        <footer className="shrink-0 border-t border-border bg-card px-6 py-4 text-xs text-muted-foreground md:px-8">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div>ALCO Content Engine - Powered by Google Gemini 3.6 Flash & Strategy Blueprint</div>
            <div className="flex gap-4 font-medium">
              <span>Funnel Items: {items.length}</span>
              <span>Strategy Status: {isProjectIncomplete ? 'Incomplete' : (sharedContext?.system_flags?.is_complete_for_planning ? 'Complete' : 'Partial')}</span>
            </div>
          </div>
        </footer>
      )}
    >
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

      <div className="p-4 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
        <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar">
          {projectSelector}
          <button
            onClick={() => setIsIntakeModalOpen(true)}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm"
          >
            <FileText size={13} className="text-primary" />
            Input Strategi
          </button>
        </div>
        {/* Onboarding Card */}
        <div ref={onboardingRef}>
          <GeminiApiKeyOnboardingCard />
        </div>

        {/* Active Strategy Context Badge (Only if project is valid and complete) */}
        {activeProjectId && !isProjectIncomplete && sharedContext ? (
          <ActiveStrategyBadge
            context={sharedContext}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        ) : null}

        {/* Incomplete Project State Warning Card */}
        {activeProjectId && isProjectIncomplete && (
          <div className="bg-[#fffdf8] border border-amber-300 rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-sm relative overflow-hidden">
            <div className="max-w-md mx-auto space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-xs">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1f2933]">
                Project ini tidak lengkap. Silakan upload blueprint ulang.
              </h2>
              <p className="text-xs md:text-sm text-[#627d98] leading-relaxed">
                Data blueprint atau context strategi untuk project ini tidak ditemukan atau rusak. Silakan upload blueprint untuk mengaktifkan kembali perancangan kalender.
              </p>
            </div>
            <div className="flex justify-center relative z-10">
              <button
                onClick={() => setIsIntakeModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#0f766e] hover:bg-[#115e59] text-white font-bold rounded-xl text-xs shadow-sm transition-all group"
              >
                <FileText size={16} className="group-hover:scale-105 transition-transform" />
                Upload Blueprint
              </button>
            </div>
          </div>
        )}

        {/* Empty state / Welcome card when no active project or no items yet */}
        {(!activeProjectId || (!isProjectIncomplete && items.length === 0 && !isConfiguring)) && (
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
              {activeProjectId && !isProjectIncomplete && (
                <>
                  <button
                    onClick={() => setIsIntakeModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#f6f3ee] text-[#1f2933] font-semibold rounded-xl text-xs border border-[#e7e0d4] shadow-xs transition-all group"
                  >
                    <FileText size={16} className="text-[#0f766e] group-hover:scale-105 transition-transform" />
                    Edit Strategy
                  </button>
                  <button
                    onClick={handleOpenConfig}
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

        {/* Active Project Calendar View (Only if project is valid and complete) */}
        {activeProjectId && !isProjectIncomplete && (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-black text-foreground">Kalender Konten</h2>
                <p className="text-xs text-muted-foreground">Filter funnel dan jadwal produksi berada di workspace kalender.</p>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {funnelFilters.map(({ type, label, count, color }) => {
                  const isSelected = filterType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span className={isSelected ? 'text-primary-foreground' : color}>{label}</span>
                      {items.length > 0 && (
                        <span className={`rounded-full px-1.5 text-[10px] font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-muted-foreground'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
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
          </section>
        )}
      </div>

      <StrategyIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onApplyStrategy={handleApplyStrategy}
        currentBlueprint={strategyBlueprint}
        hasActiveProject={!!activeProjectId && !isProjectIncomplete}
      />

    </ContentEngineShell>
  );
}
