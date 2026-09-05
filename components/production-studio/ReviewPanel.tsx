'use client';
import { motion } from 'motion/react';
import React from 'react';
import { Sparkles, Loader2, Copy, Check, Info, FileText, Image as ImageIcon, Zap, Edit3, ChevronLeft, ChevronRight, PlaySquare, Video, Clipboard, Clock, Sliders, Target, Layers, FileCode2, CheckCircle2, Download, Save, AlertCircle, RefreshCw, CheckSquare, ListTodo, BrainCircuit, Users, ExternalLink, PlayCircle, MessageSquare, ChevronDown } from 'lucide-react';

export default function ReviewPanel(props: any) {
  const { 
    activeItem, activeContext, funnelRules, readinessChecklist, handleProceedToProduction, 
    isEditingMode, setIsEditingMode, reviewOutput, getInitialDraft, saveReviewOutput, setVideoMode, handleCopyText, copiedStates,
      handleDownloadImage, imageGenerateError, handleRenderVideo, handleCheckRenderStatus,
      json2VideoPayload, characterDNA, getGoogleFlowVideoPack, setActiveTab
} = props;
  return (
    <>
  <div className="space-y-6 flex-1">
    
    {/* Review Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e7e0d4] gap-3">
      <div>
        <h3 className="text-sm font-bold text-[#1f2933] flex items-center gap-2">
          <Sliders size={16} className="text-[#0f766e]" /> Evaluasi Strategis & Kesiapan Produksi
        </h3>
        <p className="text-xs text-stone-500">Pastikan seluruh data penawaran selaras dengan corong pemasaran sebelum eksekusi</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-stone-500 text-xs">Status Kesiapan:</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          readinessChecklist.percentage === 100 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {readinessChecklist.percentage}% Siap
        </span>
      </div>
    </div>

    {/* Grid Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      {/* BLOK 1: Selected Content Item Details */}
      <div className="bg-[#f6f3ee]/60 rounded-xl p-4 border border-[#e7e0d4] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#e7e0d4]">
          <FileText size={14} className="text-[#0f766e]" />
          <h4 className="text-xs font-bold text-[#1f2933]">1. Selected Content Item</h4>
        </div>
        <div className="space-y-2.5 text-xs leading-relaxed text-stone-700">
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Headline Utama</span>
            <p className="font-bold text-[#1f2933]">{activeItem.headline}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-stone-500 font-semibold block">Funnel Stage</span>
              <p className="text-stone-800">{activeItem.jenis}</p>
            </div>
            <div>
              <span className="text-xs text-stone-500 font-semibold block">Objective / Tujuan</span>
              <p className="text-stone-800">{activeItem.tujuan}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-stone-500 font-semibold block">Format Konten</span>
              <p className="text-stone-800">{activeItem.format}</p>
            </div>
            <div>
              <span className="text-xs text-stone-500 font-semibold block">Panggilan Aksi (CTA)</span>
              <p className="text-[#0f766e] font-bold">{activeItem.cta}</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Naskah Kasar / Body</span>
            <p className="text-stone-700 line-clamp-3 bg-[#fffdf8] p-2 rounded-lg border border-[#e7e0d4] leading-normal">{activeItem.body}</p>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Rencana Caption</span>
            <p className="text-stone-700 line-clamp-3 bg-[#fffdf8] p-2 rounded-lg border border-[#e7e0d4] leading-normal">{activeItem.caption}</p>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Visual Direction</span>
            <p className="text-stone-700 italic">{activeItem.visual}</p>
          </div>
        </div>
      </div>

      {/* BLOK 2: Brand & Strategy Context */}
      <div className="bg-[#f6f3ee]/60 rounded-xl p-4 border border-[#e7e0d4] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#e7e0d4]">
          <Target size={14} className="text-[#b7791f]" />
          <h4 className="text-xs font-bold text-[#1f2933]">2. Brand & Strategy Context</h4>
        </div>
        <div className="space-y-2.5 text-xs leading-relaxed text-stone-700">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-stone-500 font-semibold block">Nama Brand</span>
              <p className="font-bold text-[#1f2933]">{activeContext.brand_context?.brand_name || 'ALCO Engine'}</p>
            </div>
            <div>
              <span className="text-xs text-stone-500 font-semibold block">Brand Voice</span>
              <p className="text-stone-800">{activeContext.brand_context?.brand_voice || '-'}</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Target Audiens</span>
            <p className="text-stone-800 font-medium">{activeContext.audience_context?.primary_audience}</p>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Core Positioning</span>
            <p className="text-stone-700 leading-normal">{activeContext.strategy_context?.positioning || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Unique Selling Proposition (USP)</span>
            <p className="text-stone-700 leading-normal">{activeContext.strategy_context?.usp?.join(' | ') || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Penawaran Utama (Main Offer)</span>
            <p className="text-[#0f766e] font-bold">{activeContext.strategy_context?.main_offer || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Core Message</span>
            <p className="text-stone-700 italic bg-[#fffdf8] p-2 rounded-lg border border-[#e7e0d4] leading-normal">{activeContext.strategy_context?.core_message || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Pilar Konten Utama (Content Pillars)</span>
            <p className="text-stone-800 font-medium">{activeContext.strategy_context?.content_pillars?.join(' - ') || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-stone-500 font-semibold block">Pain Points Terdeteksi</span>
            <p className="text-rose-700 leading-normal">{activeContext.audience_context?.pain_points?.join(', ')}</p>
          </div>
        </div>
      </div>

    </div>

    {/* Sub-section: 3 & 4 Grid */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
      
      {/* BLOK 3: Production Readiness Checklist (md:col-span-5) */}
      <div className="md:col-span-5 bg-[#f6f3ee]/60 rounded-xl p-4 border border-[#e7e0d4] flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e7e0d4]">
            <CheckSquare size={14} className="text-emerald-600" />
            <h4 className="text-xs font-bold text-[#1f2933]">3. Production Readiness</h4>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1 py-1">
            <div className="flex justify-between text-xs text-stone-500 font-medium">
              <span>Validasi Kelayakan Data</span>
              <span className="font-bold text-[#0f766e]">{readinessChecklist.percentage}%</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden border border-[#e7e0d4]">
              <motion.div 
                className="bg-[#0f766e] h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${readinessChecklist.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Checklist List */}
          <div className="space-y-2 pt-1">
            {readinessChecklist.checks.map((check: any) => (
              <div key={check.id} className="flex items-center justify-between text-xs">
                <span className="text-stone-600">{check.label}</span>
                {check.status ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
                    <Check size={11} /> Valid
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-700 font-bold text-xs bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
                    <AlertCircle size={11} /> Kosong
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-stone-500 italic mt-4 pt-2 border-t border-[#e7e0d4]">
          * Apabila ada field kosong, silakan sesuaikan ulang isian di strategi masukan atau formulir detail kalender.
        </div>
      </div>

      {/* BLOK 4: Choose Production Path (md:col-span-7) */}
      <div className="md:col-span-7 bg-[#f6f3ee]/60 rounded-xl p-4 border border-[#e7e0d4] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#e7e0d4]">
          <ListTodo size={14} className="text-[#0f766e]" />
          <h4 className="text-xs font-bold text-[#1f2933]">4. Choose Production Path</h4>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed pb-1">
          Pilih format aset produksi yang ingin Anda optimalkan menggunakan parameter strategi yang sudah diselaraskan di atas:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Path Character DNA */}
          <button
            onClick={() => setActiveTab('dna')}
            className="p-3 bg-[#fffdf8] hover:bg-stone-100 border border-[#e7e0d4] rounded-xl text-left transition group shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2 text-[#1f2933] font-bold text-xs group-hover:text-[#0f766e] transition mb-1">
              <BrainCircuit size={13} className="text-[#b7791f]" />
              <span>DNA Karakter</span>
            </div>
            <p className="text-xs text-stone-500 line-clamp-2 leading-normal">
              Kelola identitas visual karakter yang konsisten untuk aset konten.
            </p>
          </button>

          {/* Path Image */}
          <button
            onClick={() => setActiveTab('image')}
            className="p-3 bg-[#fffdf8] hover:bg-stone-100 border border-[#e7e0d4] rounded-xl text-left transition group shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2 text-[#1f2933] font-bold text-xs group-hover:text-[#0f766e] transition mb-1">
              <ImageIcon size={13} className="text-sky-600" />
              <span>Gambar</span>
            </div>
            <p className="text-xs text-stone-500 line-clamp-2 leading-normal">
              Buat prompt gambar Midjourney/Imagen siap pakai berdasarkan detail visual.
            </p>
          </button>

          {/* Path Carousel */}
          <button
            onClick={() => setActiveTab('carousel')}
            className="p-3 bg-[#fffdf8] hover:bg-stone-100 border border-[#e7e0d4] rounded-xl text-left transition group shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2 text-[#1f2933] font-bold text-xs group-hover:text-[#0f766e] transition mb-1">
              <Layers size={13} className="text-[#0f766e]" />
              <span>Carousel</span>
            </div>
            <p className="text-xs text-stone-500 line-clamp-2 leading-normal">
              Kembangkan alur slide-by-slide lengkap dengan trigger visual psikologis.
            </p>
          </button>

          {/* Path Video */}
          <button
            onClick={() => setActiveTab('video')}
            className="p-3 bg-[#fffdf8] hover:bg-stone-100 border border-[#e7e0d4] rounded-xl text-left transition group shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2 text-[#1f2933] font-bold text-xs group-hover:text-[#0f766e] transition mb-1">
              <Video size={13} className="text-rose-600" />
              <span>Video</span>
            </div>
            <p className="text-xs text-stone-500 line-clamp-2 leading-normal">
              Susun script Reels/TikTok lengkap dengan urutan prompt per scene Google Flow.
            </p>
          </button>

        </div>
      </div>

    </div>

    {/* BLOK 5: AI Strategic Alignment Report */}
    <div className="bg-[#f6f3ee]/60 rounded-xl p-4.5 border border-[#e7e0d4] space-y-3 mt-5">
      <div className="flex items-center justify-between pb-2 border-b border-[#e7e0d4]">
        <div className="flex items-center gap-2">
          <BrainCircuit size={14} className="text-[#0f766e]" />
          <h4 className="text-xs font-bold text-[#1f2933]">5. AI Strategic Alignment Report</h4>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsEditingMode((prev: any) => !prev);
            }}
            className="px-2.5 py-1 rounded-lg font-bold text-xs bg-[#fffdf8] text-stone-700 hover:text-stone-900 border border-[#e7e0d4] transition"
          >
            {isEditingMode ? 'Preview' : 'Edit Report'}
          </button>
          <button
            onClick={() => handleCopyText('review_report', reviewOutput || getInitialDraft('review', activeItem, activeContext), 'none')}
            className="p-1.5 bg-[#fffdf8] hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-lg border border-[#e7e0d4] transition"
            title="Salin Laporan"
          >
            {copiedStates['review_report'] ? <Check size={12} className="text-[#0f766e]" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {isEditingMode ? (
        <textarea
          value={reviewOutput || getInitialDraft('review', activeItem, activeContext)}
          onChange={(e) => saveReviewOutput(e.target.value)}
          className="w-full h-64 p-3 bg-[#fffdf8] text-stone-800 text-xs font-sans leading-relaxed resize-none focus:outline-none focus:border-[#0f766e] custom-scrollbar rounded-xl border border-[#e7e0d4]"
          placeholder="Sesuaikan laporan evaluasi strategis di sini..."
        />
      ) : (
        <div className="whitespace-pre-wrap font-sans text-stone-800 text-xs leading-relaxed bg-[#fffdf8] p-4 rounded-xl border border-[#e7e0d4] max-h-96 overflow-y-auto custom-scrollbar">
          {reviewOutput || getInitialDraft('review', activeItem, activeContext)}
        </div>
      )}
    </div>

  </div>
    </>
  );
}
