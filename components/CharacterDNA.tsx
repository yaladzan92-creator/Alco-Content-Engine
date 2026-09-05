'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Upload,
  Sparkles,
  Loader2,
  ChevronDown,
  UserCheck,
  Eye,
  Smile,
  Mic2,
  ShieldCheck,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';
import { getActiveProjectId, getProjectCharacterDNA, saveProjectCharacterDNA } from '@/lib/storage';
import { CharacterDNA } from '@/lib/content-contract';
import { buildGeminiRequestHeaders } from '@/lib/client-gemini-key';

export default function CharacterDNASection({ 
  onDNAUpdate,
  projectId
}: { 
  onDNAUpdate: (dna: CharacterDNA) => void;
  projectId?: string;
}) {
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [dna, setDna] = useState<CharacterDNA | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const targetProjectId = projectId || getActiveProjectId() || 'default';
    const existing = getProjectCharacterDNA(targetProjectId);
    if (existing) {
      setDna(existing);
    }
  }, [projectId]);

  const handleCopy = (key: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 3));
    }
  };

  const generateDNA = async () => {
    if (loading || images.length === 0) return;
    setLoading(true);
    try {
      const base64Images = await Promise.all(
        images.map(img => new Promise<{ data: string; mimeType: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ 
            data: (e.target?.result as string).split(',')[1], 
            mimeType: img.type 
          });
          reader.readAsDataURL(img);
        }))
      );

      const response = await fetch('/api/gemini/generate-dna', {
        method: 'POST',
        headers: buildGeminiRequestHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ images: base64Images, prompt: "Maintain character consistency." }),
      });

      const data = await response.json();
      const newDNA: CharacterDNA = { ...data.dna, preview_image: data.previewImageBase64 };
      setDna(newDNA);
      onDNAUpdate(newDNA);
      
      const targetProjectId = projectId || getActiveProjectId() || 'default';
      saveProjectCharacterDNA(targetProjectId, newDNA);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      
      {/* 1. HEADER & ACTION TOOLBAR */}
      <div className="bg-[#fffdf8] rounded-2xl border border-[#e7e0d4] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck size={18} className="text-[#0f766e]" />
            <h2 className="text-sm font-bold text-[#1f2933]">Character DNA &amp; Visual Identity</h2>
          </div>
          <p className="text-xs text-stone-500">
            Kelola profil karakter visual agar wajah, postur, dan persona talent konsisten di setiap postingan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="dna-upload"
          />
          <label
            htmlFor="dna-upload"
            className="cursor-pointer flex items-center gap-2 px-3.5 py-2 bg-[#f6f3ee] text-stone-800 font-bold border border-[#e7e0d4] rounded-xl hover:bg-stone-200 text-xs transition shadow-xs"
          >
            <Upload size={13} className="text-[#0f766e]" />
            <span>{images.length > 0 ? `${images.length} Foto Dipilih` : 'Upload Foto Ref (1-3)'}</span>
          </label>

          <button
            onClick={generateDNA}
            disabled={images.length === 0 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f766e] hover:bg-[#0f766e]/90 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={13} /> : <Sparkles size={13} />}
            <span>{loading ? 'Menganalisis DNA...' : 'Generate DNA'}</span>
          </button>
        </div>
      </div>

      {/* 2. CHARACTER IDENTITY (Result / Active Workspace) */}
      {dna ? (
        <div className="space-y-4">
          
          {/* Basic Identity & Preview */}
          <div className="bg-[#fffdf8] rounded-2xl border border-[#e7e0d4] p-5 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              
              {/* Reference / Preview Image */}
              <div className="md:col-span-4 flex flex-col items-center">
                {dna.preview_image ? (
                  <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden border border-[#e7e0d4] bg-[#f6f3ee] shadow-xs">
                    <Image
                      src={dna.preview_image.startsWith('data:') ? dna.preview_image : `data:image/png;base64,${dna.preview_image}`}
                      alt={dna.identity?.display_name || 'Character Preview'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square max-w-[280px] rounded-2xl border border-dashed border-[#e7e0d4] bg-[#f6f3ee] flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                    <UserCheck size={32} className="text-stone-300 mb-2" />
                    <span className="text-xs font-semibold">Belum ada preview render</span>
                  </div>
                )}
                <span className="text-[10px] text-stone-500 font-medium mt-2">
                  Visual Master Reference
                </span>
              </div>

              {/* Basic Identity Details */}
              <div className="md:col-span-8 space-y-4">
                <div className="pb-3 border-b border-[#e7e0d4] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      {dna.identity?.display_name || 'Karakter Talent Brand'}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      {dna.behavior?.on_camera_persona || dna.style?.visual_vibe || 'Kreator Autentik'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#0f766e]/10 text-[#0f766e] border border-[#0f766e]/20 uppercase tracking-wider">
                    DNA Aktif
                  </span>
                </div>

                {/* Primary Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Gender &amp; Usia</span>
                    <p className="text-stone-800 font-semibold">
                      {dna.identity?.gender_presentation || '-'}, {dna.identity?.estimated_age_range || '-'}
                    </p>
                  </div>

                  <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Wilayah / Etnisitas</span>
                    <p className="text-stone-800 font-semibold">
                      {dna.identity?.ethnicity_or_region_hint || '-'}
                    </p>
                  </div>

                  <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Postur &amp; Fitur Tubuh</span>
                    <p className="text-stone-800 font-medium">
                      {dna.identity?.body_type || '-'} &bull; {dna.identity?.skin_tone || '-'}
                    </p>
                  </div>

                  <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Rambut &amp; Wajah</span>
                    <p className="text-stone-800 font-medium line-clamp-1">
                      {dna.identity?.hair_description || '-'}
                    </p>
                  </div>
                </div>

                {/* Brand Fit Note */}
                {dna.style?.brand_fit_reason && (
                  <div className="p-3 bg-[#f6f3ee]/60 border border-[#e7e0d4] rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Kesesuaian Brand Voice</span>
                    <p className="text-stone-700 leading-relaxed italic">
                      &ldquo;{dna.style.brand_fit_reason}&rdquo;
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 3. PROGRESSIVE DISCLOSURE SECTIONS */}
          <div className="space-y-2.5">
            
            {/* Visual DNA */}
            <details className="group border border-[#e7e0d4] bg-[#fffdf8] rounded-2xl overflow-hidden shadow-xs transition-all">
              <summary className="p-3.5 flex items-center justify-between font-bold text-xs text-stone-800 hover:text-[#0f766e] cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-[#0f766e]" />
                  <span>Visual DNA &amp; Wardrobe</span>
                </div>
                <ChevronDown size={14} className="text-stone-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-4 pt-2 border-t border-[#e7e0d4]/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Gaya Busana (Wardrobe)</span>
                  <p className="text-stone-800 font-medium">{dna.style?.wardrobe_style || '-'}</p>
                </div>
                <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Visual Vibe &amp; Mood</span>
                  <p className="text-stone-800 font-medium">{dna.style?.visual_vibe || '-'}</p>
                </div>
                <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Makeup / Skincare Look</span>
                  <p className="text-stone-800 font-medium">{dna.style?.makeup_style || '-'}</p>
                </div>
                <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Aksesori Khas</span>
                  <p className="text-stone-800 font-medium">
                    {dna.style?.accessories?.join(', ') || '-'}
                  </p>
                </div>
              </div>
            </details>

            {/* Personality DNA */}
            <details className="group border border-[#e7e0d4] bg-[#fffdf8] rounded-2xl overflow-hidden shadow-xs transition-all">
              <summary className="p-3.5 flex items-center justify-between font-bold text-xs text-stone-800 hover:text-[#0f766e] cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <Smile size={14} className="text-[#0f766e]" />
                  <span>Personality &amp; Behavior DNA</span>
                </div>
                <ChevronDown size={14} className="text-stone-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-4 pt-2 border-t border-[#e7e0d4]/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Ekspresi Dominan</span>
                  <p className="text-stone-800 font-medium">{dna.behavior?.expression_style || '-'}</p>
                </div>
                <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Pose &amp; Gestur Tubuh</span>
                  <p className="text-stone-800 font-medium">{dna.behavior?.pose_tendency || '-'}</p>
                </div>
              </div>
            </details>

            {/* Voice / Communication DNA */}
            <details className="group border border-[#e7e0d4] bg-[#fffdf8] rounded-2xl overflow-hidden shadow-xs transition-all">
              <summary className="p-3.5 flex items-center justify-between font-bold text-xs text-stone-800 hover:text-[#0f766e] cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <Mic2 size={14} className="text-[#0f766e]" />
                  <span>Voice &amp; Communication DNA</span>
                </div>
                <ChevronDown size={14} className="text-stone-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-4 pt-2 border-t border-[#e7e0d4]/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Nada Bicara (Speaking Tone)</span>
                  <p className="text-stone-800 font-medium">{dna.behavior?.speaking_tone || '-'}</p>
                </div>
                <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Gaya Gestur Tangan</span>
                  <p className="text-stone-800 font-medium">{dna.behavior?.gesture_style || '-'}</p>
                </div>
              </div>
            </details>

            {/* Production & Consistency Rules */}
            <details className="group border border-[#e7e0d4] bg-[#fffdf8] rounded-2xl overflow-hidden shadow-xs transition-all">
              <summary className="p-3.5 flex items-center justify-between font-bold text-xs text-stone-800 hover:text-[#0f766e] cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#0f766e]" />
                  <span>Production Rules &amp; Aturan Konsistensi</span>
                </div>
                <ChevronDown size={14} className="text-stone-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-4 pt-2 border-t border-[#e7e0d4]/60 space-y-3 text-xs">
                {/* Locked Traits */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Karakteristik Wajib (Locked Traits)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {dna.consistency_rules?.locked_traits && dna.consistency_rules.locked_traits.length > 0 ? (
                      dna.consistency_rules.locked_traits.map((trait, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                          &bull; {trait}
                        </span>
                      ))
                    ) : (
                      <span className="text-stone-400 italic">Belum ada aturan spesifik</span>
                    )}
                  </div>
                </div>

                {/* Avoid Traits */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Pantangan Visual (Avoid Traits)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {dna.consistency_rules?.avoid_traits && dna.consistency_rules.avoid_traits.length > 0 ? (
                      dna.consistency_rules.avoid_traits.map((trait, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium">
                          &times; {trait}
                        </span>
                      ))
                    ) : (
                      <span className="text-stone-400 italic">Tidak ada pantangan khusus</span>
                    )}
                  </div>
                </div>
              </div>
            </details>

            {/* Advanced Prompt Assets & Raw Data */}
            <details className="group border border-[#e7e0d4] bg-[#fffdf8] rounded-2xl overflow-hidden shadow-xs transition-all">
              <summary className="p-3.5 flex items-center justify-between font-bold text-xs text-stone-800 hover:text-[#0f766e] cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <FileCode size={14} className="text-[#0f766e]" />
                  <span>Prompt Assets &amp; Raw DNA Data</span>
                </div>
                <ChevronDown size={14} className="text-stone-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-4 pt-2 border-t border-[#e7e0d4]/60 space-y-3 text-xs">
                {dna.prompt_assets?.dna_summary_prompt && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-500 uppercase">DNA Summary Prompt</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('dna_sum', dna.prompt_assets?.dna_summary_prompt || '')}
                        className="text-[10px] font-bold text-[#0f766e] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'dna_sum' ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === 'dna_sum' ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                    <p className="text-stone-800 font-mono text-[11px] leading-relaxed bg-[#f6f3ee] p-3 rounded-lg border border-[#e7e0d4] select-all">
                      {dna.prompt_assets.dna_summary_prompt}
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Raw JSON Schema</span>
                  <div className="text-[#1f2933] bg-[#f6f3ee] p-3 rounded-xl border border-[#e7e0d4] text-[10px] font-mono overflow-y-auto max-h-52 custom-scrollbar">
                    <pre>{JSON.stringify(dna, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </details>

          </div>

        </div>
      ) : (
        <div className="bg-[#fffdf8] rounded-2xl border border-[#e7e0d4] p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center mx-auto">
            <UserCheck size={24} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-stone-800">Belum Ada DNA Karakter untuk Proyek Ini</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Upload 1 hingga 3 foto referensi orang/talent nyata di atas, lalu klik <strong>Generate DNA</strong> untuk mengekstrak identitas visual konsisten.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
