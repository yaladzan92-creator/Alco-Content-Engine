'use client';

import React, { useState } from 'react';
import {
  StrategyBlueprint,
  SharedContentContext,
  validateBlueprint,
  buildSharedContentContext,
  parseAndMapStrategyJson,
  SAMPLE_STRATEGY_BLUEPRINT
} from '@/lib/content-contract';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Code2,
  Building2,
  Target,
  Megaphone,
  Briefcase,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StrategyIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStrategy: (blueprint: StrategyBlueprint, context: SharedContentContext) => void;
  currentBlueprint?: StrategyBlueprint | null;
}

export function StrategyIntakeModal({
  isOpen,
  onClose,
  onApplyStrategy,
  currentBlueprint
}: StrategyIntakeModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'form'>('upload');
  const [pastedJson, setPastedJson] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    isConverted: boolean;
    type: string;
    note: string;
  } | null>(null);

  // Editable Blueprint State
  const [blueprint, setBlueprint] = useState<StrategyBlueprint>(
    currentBlueprint || SAMPLE_STRATEGY_BLUEPRINT
  );

  const validation = validateBlueprint(blueprint);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const result = parseAndMapStrategyJson(json);
        setBlueprint(result.blueprint);
        setImportStatus({
          isConverted: result.isConverted,
          type: result.conversionType,
          note: result.conversionNote,
        });
        setParseError(null);
        setActiveTab('form');
      } catch (err) {
        setParseError('Format file JSON tidak valid. Pastikan file berupa JSON valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleParsePastedJson = () => {
    if (!pastedJson.trim()) {
      setParseError('Silakan masukkan text JSON terlebih dahulu.');
      return;
    }
    try {
      const json = JSON.parse(pastedJson);
      const result = parseAndMapStrategyJson(json);
      setBlueprint(result.blueprint);
      setImportStatus({
        isConverted: result.isConverted,
        type: result.conversionType,
        note: result.conversionNote,
      });
      setParseError(null);
      setActiveTab('form');
    } catch (err) {
      setParseError('Gagal memproses JSON. Periksa sintaksis dan coba lagi.');
    }
  };

  const handleLoadSample = () => {
    setBlueprint(SAMPLE_STRATEGY_BLUEPRINT);
    setImportStatus(null);
    setParseError(null);
    setActiveTab('form');
  };

  const handleSaveAndApply = () => {
    const origin = importStatus?.isConverted ? 'campaign_pack_converted' : 'creative_system_json';
    const context = buildSharedContentContext(blueprint, origin, importStatus?.note);
    onApplyStrategy(blueprint, context);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-tight">
                  ALCO Strategy Intake
                </h2>
                <p className="text-xs text-zinc-400">
                  Sinkronisasi Strategy Blueprint dari ALCO Creative System
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="px-6 pt-4 border-b border-zinc-800/80 bg-zinc-900 flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 px-3 font-bold border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'upload'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Upload size={14} /> Upload JSON
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-3 px-3 font-bold border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'paste'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code2 size={14} /> Paste Blueprint
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`pb-3 px-3 font-bold border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'form'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText size={14} /> Review & Edit Blueprint
            </button>

            <div className="ml-auto">
              <button
                onClick={handleLoadSample}
                className="mb-2 px-3 py-1 bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand text-[11px] font-bold rounded-lg transition flex items-center gap-1"
              >
                <Sparkles size={12} /> Load Demo Blueprint
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {parseError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                {parseError}
              </div>
            )}

            {/* TAB 1: UPLOAD JSON */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-zinc-700 hover:border-brand/60 bg-zinc-950/40 rounded-2xl p-8 text-center transition flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Upload File Strategy Blueprint (.json)
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Export file JSON dari ALCO Creative System Anda di sini
                    </p>
                  </div>
                  <label className="mt-2 px-4 py-2 bg-brand text-black font-extrabold text-xs rounded-xl cursor-pointer hover:bg-brand/90 transition">
                    Pilih File JSON
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: PASTE JSON */}
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 block">
                  Paste JSON Blueprint
                </label>
                <textarea
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  placeholder={`{\n  "project_name": "Course Launch 2026",\n  "brand_identity": {\n    "brand_name": "ALCO Academy"\n  }\n}`}
                  rows={10}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-brand"
                />
                <button
                  onClick={handleParsePastedJson}
                  className="px-4 py-2 bg-brand text-black font-extrabold text-xs rounded-xl hover:bg-brand/90 transition flex items-center gap-2"
                >
                  Proses & Impor JSON
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* TAB 3: REVIEW & FORM EDIT */}
            {activeTab === 'form' && (
              <div className="space-y-6">
                {/* Campaign Pack Conversion Honest Status Banner */}
                {importStatus?.isConverted && (
                  <div className="p-3.5 bg-sky-950/40 border border-sky-800/60 rounded-xl text-sky-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={16} className="text-sky-400 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold uppercase bg-sky-900/80 text-sky-200 px-2 py-0.5 rounded text-[10px]">
                            Imported as Campaign Pack
                          </span>
                          <span className="font-bold text-xs text-white">Automated Strategic Mapping</span>
                        </div>
                        <p className="text-[11px] text-sky-300/80 mt-0.5">
                          JSON terdeteksi sebagai Campaign Pack Meta Ads. Data telah secara otomatis dipetakan ke Strategy Blueprint. Anda dapat mereview atau menyesuaikan field di bawah.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-sky-300 font-mono font-bold bg-sky-900/60 border border-sky-700/50 px-2 py-1 rounded-lg shrink-0 self-start sm:self-center">
                      Mapped into Content Context
                    </span>
                  </div>
                )}

                {/* Validation Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    validation.isComplete
                      ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300'
                      : 'bg-amber-950/20 border-amber-800/50 text-amber-300'
                  }`}
                >
                  {validation.isComplete ? (
                    <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-400" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold text-sm">
                      {validation.isComplete
                        ? 'Blueprint Lengkap — Siap Masuk ke Content Engine'
                        : 'Field Wajib Belum Lengkap'}
                    </p>
                    {validation.isComplete ? (
                      <p className="mt-1 text-emerald-400/80">
                        Seluruh field wajib strategy intake telah terpenuhi. Kalender konten akan dibuat berlandaskan positioning & funnel ini.
                      </p>
                    ) : (
                      <div className="mt-1">
                        <p className="text-amber-400/80">
                          Beberapa data strategi penting belum diisi. Lengkapi di bawah agar AI tidak membuat konten generik:
                        </p>
                        <ul className="list-disc list-inside mt-1 font-mono text-[11px] text-amber-300/90">
                          {validation.missingFields.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Editable Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Brand Identity */}
                  <div className="bg-zinc-950/60 p-4 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-wider">
                      <Building2 size={14} /> Brand Identity
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Brand Name *
                      </label>
                      <input
                        type="text"
                        value={blueprint.brand_identity?.brand_name || ''}
                        onChange={(e) =>
                          setBlueprint({
                            ...blueprint,
                            brand_identity: { ...blueprint.brand_identity, brand_name: e.target.value }
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Industry / Category
                      </label>
                      <input
                        type="text"
                        value={blueprint.brand_identity?.category || ''}
                        onChange={(e) =>
                          setBlueprint({
                            ...blueprint,
                            brand_identity: { ...blueprint.brand_identity, category: e.target.value }
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="bg-zinc-950/60 p-4 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-wider">
                      <Target size={14} /> Target Audience
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Primary Audience Segment *
                      </label>
                      <input
                        type="text"
                        value={blueprint.target_audience?.primary_audience || ''}
                        onChange={(e) =>
                          setBlueprint({
                            ...blueprint,
                            target_audience: {
                              ...blueprint.target_audience,
                              primary_audience: e.target.value
                            }
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Pain Points (Pisahkan Koma) *
                      </label>
                      <input
                        type="text"
                        value={blueprint.target_audience?.audience_problem?.join(', ') || ''}
                        onChange={(e) =>
                          setBlueprint({
                            ...blueprint,
                            target_audience: {
                              ...blueprint.target_audience,
                              audience_problem: e.target.value.split(',').map((s) => s.trim())
                            }
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Positioning & Offer */}
                  <div className="bg-zinc-950/60 p-4 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-wider">
                      <Briefcase size={14} /> Positioning & Offer
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Core Positioning *
                      </label>
                      <textarea
                        rows={2}
                        value={blueprint.positioning?.core_positioning || ''}
                        onChange={(e) =>
                          setBlueprint({
                            ...blueprint,
                            positioning: { ...blueprint.positioning, core_positioning: e.target.value }
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Main Offer *
                      </label>
                      <input
                        type="text"
                        value={blueprint.offer?.main_offer || ''}
                        onChange={(e) =>
                          setBlueprint({
                            ...blueprint,
                            offer: { ...blueprint.offer, main_offer: e.target.value }
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Messaging & Copy Direction */}
                  <div className="bg-zinc-950/60 p-4 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-wider">
                      <Megaphone size={14} /> Core Message & Messaging
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Core Message *
                      </label>
                      <textarea
                        rows={2}
                        value={blueprint.messaging?.core_message || ''}
                        onChange={(e) =>
                          setBlueprint({
                            ...blueprint,
                            messaging: { ...blueprint.messaging, core_message: e.target.value }
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Brand Voice & Tone
                      </label>
                      <input
                        type="text"
                        value={blueprint.messaging?.brand_voice || ''}
                        onChange={(e) =>
                          setBlueprint({
                            ...blueprint,
                            messaging: { ...blueprint.messaging, brand_voice: e.target.value }
                          })
                        }
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white font-semibold transition"
            >
              Batal
            </button>

            <button
              onClick={handleSaveAndApply}
              className="px-6 py-2.5 bg-brand hover:bg-brand/90 text-black font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg"
            >
              <Sparkles size={16} />
              Terapkan Strategy Blueprint
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
