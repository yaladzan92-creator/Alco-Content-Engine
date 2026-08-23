'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Calendar,
  Users,
  Layers,
  Mic2,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { CalecoAIRecommendation } from './CalecoAIRecommendation';
import { ConfigDataProps } from './types';

const InputField = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
      <Icon size={14} className="text-[#0f766e]" />
      {label}
    </label>
    {children}
  </div>
);

interface CalendarConfigWizardProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  configData: ConfigDataProps;
  accessStatus: any;
  isLoading: boolean;
  recommendations: Record<number, any>;
  isRecommending: boolean;
  getAIRecommendation: (step: number) => void;
  handleApplyRecommendation: (step: number, field: string, text: string) => void;
  handleApplyAllRecommendations: (step: number, data: Record<string, string>) => void;
}

export const CalendarConfigWizard: React.FC<CalendarConfigWizardProps> = ({
  isOpen,
  onClose,
  currentStep,
  setCurrentStep,
  configData,
  accessStatus,
  isLoading,
  recommendations,
  isRecommending,
  getAIRecommendation,
  handleApplyRecommendation,
  handleApplyAllRecommendations,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fffdf8] border border-[#e7e0d4] rounded-3xl w-full max-w-5xl h-[86vh] flex flex-col md:flex-row overflow-hidden shadow-2xl font-sans"
          >
            {/* Sidebar Navigation */}
            <div className="w-full md:w-80 bg-[#f6f3ee]/80 border-b md:border-b-0 md:border-r border-[#e7e0d4] flex flex-col justify-between shrink-0">
              <div className="p-5 md:p-6">
                <div className="mb-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f766e]">
                    <span className="w-2 h-2 rounded-full bg-[#0f766e]" />
                    Panel Konfigurasi Kalender
                  </div>
                  {configData.connectionStatus === 'active' && configData.brandContext ? (
                    <div className="bg-[#0f766e]/10 border border-[#0f766e]/20 p-2.5 rounded-xl flex items-center gap-2 mt-1">
                      <Sparkles className="text-[#0f766e] shrink-0" size={13} />
                      <div className="overflow-hidden">
                        <p className="text-[11px] text-stone-500 font-medium">App 1 Terhubung</p>
                        <p className="text-xs font-bold text-[#1f2933] truncate">
                          {configData.brandContext.brandName}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#fffdf8] border border-[#e7e0d4] p-2 rounded-xl flex items-center gap-2 mt-1">
                      <AlertCircle className="text-stone-400 shrink-0" size={13} />
                      <p className="text-xs font-medium text-stone-600">Sandbox Mode</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[48vh] pr-1">
                  {[
                    { id: 0, title: 'Topik Utama', desc: 'Brief kampanye', icon: Zap },
                    { id: 1, title: 'Jadwal Kalender', desc: 'Mulai & skip hari', icon: Calendar },
                    { id: 2, title: 'Target Audiens', desc: 'Gender & umur', icon: Users },
                    { id: 3, title: 'Alokasi & Format', desc: 'TOFU/MOFU & media', icon: Layers },
                    { id: 4, title: 'Brand Voice', desc: 'Karakter pembawaan', icon: Mic2 },
                    { id: 5, title: 'Hooks Mix', desc: 'Pemicu psikologis', icon: Filter },
                    { id: 6, title: 'Formula Goals', desc: 'Tujuan & cta', icon: Sparkles },
                    { id: 7, title: 'Konfirmasi', desc: 'Verifikasi strategi', icon: CheckCircle2 },
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
                            ? 'bg-[#0f766e] text-white font-semibold shadow-sm'
                            : isCompleted
                            ? 'bg-[#fffdf8] text-stone-800 hover:bg-stone-100 font-medium border border-[#e7e0d4]/60'
                            : 'text-stone-600 hover:bg-stone-100 font-medium'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            isActive
                              ? 'bg-white/20 border-white/30 text-white'
                              : isCompleted
                              ? 'bg-[#0f766e]/10 border-[#0f766e]/20 text-[#0f766e]'
                              : 'bg-stone-100 border-stone-200 text-stone-500'
                          }`}
                        >
                          <StepIcon size={14} />
                        </div>
                        <div className="overflow-hidden flex-1 leading-none">
                          <h4 className="text-xs font-semibold">
                            {step.title}
                          </h4>
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isActive ? 'text-white/80' : 'text-stone-500'
                            }`}
                          >
                            {step.desc}
                          </p>
                        </div>
                        {isCompleted && !isActive && (
                          <CheckCircle2 className="text-[#0f766e] shrink-0" size={13} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 border-t border-[#e7e0d4] bg-[#fffdf8] flex justify-between text-xs text-stone-600">
                <span>Progress Konfigurasi</span>
                <span className="text-[#0f766e] font-bold bg-[#0f766e]/10 px-2 py-0.5 rounded">
                  {Math.round(((currentStep + 1) / 8) * 100)}%
                </span>
              </div>
            </div>

            {/* Content Display Workspace */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#fffdf8]">
              <div className="px-6 md:px-8 py-5 border-b border-[#e7e0d4] flex justify-between items-center shrink-0 bg-[#f6f3ee]/40">
                <div>
                  <span className="text-xs text-stone-500 font-medium">
                    Langkah {currentStep + 1} dari 8
                  </span>
                  <h2 className="text-sm md:text-base font-bold text-[#1f2933] mt-0.5">
                    {currentStep === 0 && 'Topik Utama & Pilar Konten'}
                    {currentStep === 1 && 'Tanggal Mulai & Pengecualian Kalender'}
                    {currentStep === 2 && 'Profil Target Demografi'}
                    {currentStep === 3 && 'Alokasi & Format Publikasi'}
                    {currentStep === 4 && 'Karakter Suara & Dialektika'}
                    {currentStep === 5 && 'Psikologi Hooks Mixing'}
                    {currentStep === 6 && 'Goal Formula & CTA'}
                    {currentStep === 7 && 'Summary & Launch Strategy'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 border border-[#e7e0d4] hover:bg-stone-100 rounded-xl text-stone-500 hover:text-stone-800 transition-all"
                  title="Tutup Wizard"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Dynamic Steps form rendering canvas */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-5">
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <InputField label="Brief Topik Utama" icon={Zap}>
                      <textarea
                        value={configData.coreTopic || ''}
                        onChange={(e) => configData.setCoreTopic(e.target.value)}
                        placeholder="Uraikan fokus topik kampanye utama..."
                        className="w-full bg-[#f6f3ee] border border-[#e7e0d4] rounded-2xl p-4 text-xs text-[#1f2933] placeholder:text-stone-400 focus:outline-none focus:border-[#0f766e] h-28 resize-none leading-relaxed"
                      />
                      {configData.editableContext?.contentStrategy?.pillars &&
                        configData.editableContext.contentStrategy.pillars.length > 0 && (
                          <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1.5">
                            <span className="block text-xs font-semibold text-stone-600">
                              💡 Pilar Konten Terhubung (Klik untuk terapkan):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {configData.editableContext.contentStrategy.pillars.map(
                                (pillar: string, i: number) => (
                                  <button
                                    key={i}
                                    onClick={() =>
                                      configData.setCoreTopic(
                                        `${configData.selectedProject || 'Campaign'} - Focus: ${pillar}`
                                      )
                                    }
                                    className="bg-[#fffdf8] hover:bg-[#0f766e] hover:text-white border border-[#e7e0d4] text-stone-700 px-2.5 py-1 rounded-lg text-xs transition-all font-medium"
                                  >
                                    {pillar}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      <div className="pt-2">
                        <button
                          onClick={() => getAIRecommendation(0)}
                          disabled={isRecommending}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#0f766e] hover:underline"
                        >
                          <Sparkles size={13} />{' '}
                          {isRecommending ? 'Menganalisis...' : 'Minta Rekomendasi AI'}
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
                    <InputField label="Tanggal Mulai" icon={Calendar}>
                      <input
                        type="date"
                        value={configData.startDate || ''}
                        onChange={(e) => configData.setStartDate(e.target.value)}
                        className="w-full bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#0f766e] text-stone-800"
                      />
                    </InputField>
                    <InputField label="Pengecualian / Skip Hari" icon={Calendar}>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                          const isSkipped = configData.skipDays.includes(day);
                          return (
                            <button
                              key={day}
                              onClick={() => configData.toggleSkipDay(day)}
                              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                                isSkipped
                                  ? 'bg-[#f6f3ee] border-[#e7e0d4] text-stone-400 line-through'
                                  : 'bg-[#0f766e]/10 border-[#0f766e]/30 text-[#0f766e]'
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Gender" icon={Users}>
                        <div className="grid grid-cols-3 gap-2">
                          {['Both', 'Male', 'Female'].map((g) => (
                            <button
                              key={g}
                              onClick={() => configData.setGender(g)}
                              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                                configData.gender === g
                                  ? 'bg-[#0f766e] border-[#0f766e] text-white'
                                  : 'bg-[#f6f3ee] border-[#e7e0d4] text-stone-700 hover:border-stone-400'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </InputField>

                      <InputField
                        label={`Rentang Umur: ${configData.ageRange[0]} - ${configData.ageRange[1]} Tahun`}
                        icon={Users}
                      >
                        <div className="flex items-center gap-3 pt-2">
                          <input
                            type="range"
                            min="15"
                            max="65"
                            value={configData.ageRange[0]}
                            onChange={(e) =>
                              configData.setAgeRange([
                                parseInt(e.target.value),
                                configData.ageRange[1],
                              ])
                            }
                            className="w-full accent-[#0f766e] bg-stone-200"
                          />
                          <input
                            type="range"
                            min="15"
                            max="65"
                            value={configData.ageRange[1]}
                            onChange={(e) =>
                              configData.setAgeRange([
                                configData.ageRange[0],
                                parseInt(e.target.value),
                              ])
                            }
                            className="w-full accent-[#0f766e] bg-stone-200"
                          />
                        </div>
                      </InputField>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => getAIRecommendation(2)}
                        disabled={isRecommending}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#0f766e] hover:underline"
                      >
                        <Sparkles size={13} />{' '}
                        {isRecommending ? 'Menganalisis...' : 'Minta Rekomendasi Target'}
                      </button>
                      <CalecoAIRecommendation
                        recommendation={recommendations[2]}
                        isLoading={isRecommending}
                        onApply={(field, text) => handleApplyRecommendation(2, field, text)}
                        onApplyAll={(data) => handleApplyAllRecommendations(2, data)}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-stone-700">
                          Rasio Alokasi Funnel (Jumlah Post)
                        </label>
                        <span className="text-xs text-[#0f766e] font-bold">
                          Total: {configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu} Post
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: 'tofu', label: 'TOFU (Awareness)', color: 'text-sky-800' },
                          { key: 'mofu', label: 'MOFU (Consideration)', color: 'text-amber-800' },
                          { key: 'bofu', label: 'BOFU (Conversion)', color: 'text-[#0f766e]' },
                        ].map(({ key, label, color }) => (
                          <div key={key} className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-2xl">
                            <span className={`text-xs font-bold block mb-1 ${color}`}>{label}</span>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={configData.ratio[key as keyof typeof configData.ratio]}
                              onChange={(e) =>
                                configData.setRatio({
                                  ...configData.ratio,
                                  [key]: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full bg-[#fffdf8] border border-[#e7e0d4] rounded-xl p-2 text-center text-sm font-bold text-stone-900"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-stone-700">
                        Format Konten yang Didukung
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Single', 'Carousel', 'Reels'].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => configData.toggleFormat(fmt)}
                            className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                              configData.formats.includes(fmt)
                                ? 'bg-[#0f766e] border-[#0f766e] text-white shadow-sm'
                                : 'bg-[#f6f3ee] border-[#e7e0d4] text-stone-700 hover:border-stone-400'
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <InputField label="Brand Voices & Karakter" icon={Mic2}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {[
                          'The Efficiency Expert',
                          'The Provocative Leader',
                          'The Data Scientist',
                          'The Empathetic Mentor',
                          'The Visionary Pioneer',
                        ].map((v) => {
                          const isSel = configData.selectedVoices?.includes(v);
                          return (
                            <button
                              key={v}
                              onClick={() => configData.toggleVoice(v)}
                              className={`p-3 text-left border rounded-xl transition-all ${
                                isSel ? 'border-[#0f766e] bg-[#0f766e]/10 font-bold text-[#0f766e]' : 'border-[#e7e0d4] bg-[#f6f3ee] text-stone-700 hover:border-stone-400'
                              }`}
                            >
                              <span className="text-xs block">{v}</span>
                            </button>
                          );
                        })}
                      </div>
                    </InputField>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <InputField label="Psychological Hooks Mix (%)" icon={Filter}>
                      <div className="space-y-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="flex gap-2">
                            <select
                              value={configData.hookMix?.[i]?.type || 'Call-Out'}
                              onChange={(e) => configData.updateHookMix(i, 'type', e.target.value)}
                              className="flex-1 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#0f766e]"
                            >
                              {['Call-Out', 'Curiosity Gap', 'Social Proof', 'Negativity Bias', 'Authority', 'Relatability'].map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={configData.hookMix?.[i]?.percentage || 0}
                              onChange={(e) => configData.updateHookMix(i, 'percentage', parseInt(e.target.value) || 0)}
                              className="w-20 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl text-center text-xs text-stone-900 focus:outline-none focus:border-[#0f766e]"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4 p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl max-w-sm mt-4 text-xs">
                        {['Logika AI', 'Humanis'].map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <div
                              onClick={() => configData.setReferenceType(type)}
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                configData.referenceType === type ? 'border-[#0f766e] bg-[#0f766e]/15' : 'border-stone-300 bg-white'
                              }`}
                            >
                              {configData.referenceType === type && <div className="w-2 h-2 bg-[#0f766e] rounded-full" />}
                            </div>
                            <span className={configData.referenceType === type ? 'text-[#1f2933] font-bold' : 'text-stone-600'}>
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </InputField>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-4">
                    <InputField label="Master Goal Formula & Tujuan Kampanye" icon={Sparkles}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                        {[
                          { id: 'SALES', title: 'Penjualan', desc: 'Fokus konversi & penutupan transaksi sales.' },
                          { id: 'AWARENESS', title: 'Awareness & Soft Selling', desc: 'Informasikan audiens sembari sounding.' },
                          { id: 'FOLLOWER', title: 'Mencari Follower', desc: 'Mendorong respon komen & menambah penonton.' },
                          { id: 'LAUNCH', title: 'Publikasi untuk Brand-produk baru', desc: 'Peluncuran entitas komersial perdana.' },
                        ].map((formula) => {
                          const isSel = configData.selectedFormula === formula.title;
                          return (
                            <button
                              key={formula.id}
                              onClick={() => configData.setSelectedFormula(formula.title)}
                              className={`p-3 text-left border rounded-xl transition-all leading-snug ${
                                isSel ? 'border-[#0f766e] bg-[#0f766e]/10 font-bold' : 'border-[#e7e0d4] bg-[#f6f3ee] hover:border-stone-400'
                              }`}
                            >
                              <h4 className="text-xs font-bold text-[#1f2933]">{formula.title}</h4>
                              <p className="text-[11px] text-stone-600 mt-0.5">{formula.desc}</p>
                            </button>
                          );
                        })}
                      </div>

                      {configData.editableContext?.offers && configData.editableContext.offers.length > 0 && (
                        <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-2xl mb-2 space-y-1.5">
                          <span className="block text-xs font-semibold text-stone-600">
                            📋 App 1 Sync CTAs:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {configData.editableContext.offers.map((off: any, i: number) => {
                              const active = configData.selectedCTAs?.includes(off.ctaText);
                              return (
                                <button
                                  key={i}
                                  onClick={() => configData.toggleCTA(off.ctaText)}
                                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                                    active ? 'bg-[#0f766e] border-[#0f766e] text-white font-bold' : 'bg-[#fffdf8] border-[#e7e0d4] text-stone-700'
                                  }`}
                                >
                                  {off.ctaText}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5 mt-2">
                        <label className="text-xs text-stone-600 font-semibold">Pilihan CTA Cepat</label>
                        <div className="flex flex-wrap gap-2">
                          {['Link Bio', 'DM', 'WhatsApp'].map((cta) => {
                            const isSel = configData.selectedCTAs?.includes(cta);
                            return (
                              <button
                                key={cta}
                                onClick={() => configData.toggleCTA(cta)}
                                className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${
                                  isSel ? 'bg-[#0f766e] border-[#0f766e] text-white font-bold' : 'bg-[#f6f3ee] border-[#e7e0d4] text-stone-700 hover:border-stone-400'
                                }`}
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
                    <div className="p-5 bg-[#0f766e]/5 border border-[#0f766e]/20 rounded-2xl text-center space-y-2">
                      <div className="w-10 h-10 bg-[#0f766e]/10 rounded-full flex items-center justify-center mx-auto text-[#0f766e]">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1f2933]">
                          Strategi Siap Dijalankan
                        </h3>
                        <p className="text-xs text-stone-600 mt-1">
                          Sistem kalender akan menghasilkan{' '}
                          <strong className="text-[#0f766e] font-bold">
                            {configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu} postingan strategis
                          </strong>{' '}
                          untuk Anda.
                        </p>
                      </div>
                    </div>

                    {configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu > accessStatus.maxContent && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle size={14} /> Melebihi kuota paket. Kurangi alokasi post pada langkah alokasi.
                      </div>
                    )}

                    <div className="flex justify-between items-center bg-[#f6f3ee] p-3 rounded-xl border border-[#e7e0d4] text-xs">
                      <span className="text-stone-700 font-medium">
                        Mode Generasi Cepat (Fast Response)
                      </span>
                      <button
                        onClick={() => configData.setIsFastMode(!configData.isFastMode)}
                        className={`w-10 h-6 rounded-full transition-all relative border ${
                          configData.isFastMode ? 'bg-[#0f766e] border-[#0f766e]' : 'bg-stone-300 border-stone-400'
                        }`}
                      >
                        <motion.div
                          animate={{ x: configData.isFastMode ? 18 : 2 }}
                          className="w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm"
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Nav bar controls */}
              <div className="p-5 border-t border-[#e7e0d4] bg-[#fffdf8] flex justify-between shrink-0">
                <button
                  onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                    currentStep === 0
                      ? 'text-stone-300 cursor-not-allowed opacity-40'
                      : 'text-stone-700 hover:text-stone-900 border border-[#e7e0d4] hover:bg-stone-100'
                  }`}
                >
                  <ChevronLeft size={14} /> Kembali
                </button>

                {currentStep < 7 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex items-center gap-1.5 py-2 px-5 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                  >
                    Lanjutkan <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    id="caleco-generate-btn"
                    disabled={
                      isLoading ||
                      configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu > accessStatus.maxContent ||
                      configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu === 0 ||
                      (configData.formats.includes('Reels') && !configData.reelsDuration) ||
                      (configData.formats.includes('Carousel') && !configData.carouselSlides)
                    }
                    onClick={() => {
                      if (isLoading) return;
                      configData.generateContent();
                      onClose();
                    }}
                    className={`px-6 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm ${
                      isLoading ||
                      configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu > accessStatus.maxContent ||
                      configData.ratio.tofu + configData.ratio.mofu + configData.ratio.bofu === 0 ||
                      (configData.formats.includes('Reels') && !configData.reelsDuration) ||
                      (configData.formats.includes('Carousel') && !configData.carouselSlides)
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-60'
                        : 'bg-[#0f766e] hover:bg-[#0f766e]/90 text-white'
                    }`}
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="fill-white" />}
                    Jalankan Strategi Kalender
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
