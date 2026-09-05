'use client';
import React from 'react';
import {
  Zap,
  Copy,
  Check,
  ExternalLink,
  Users,
  MessageSquare,
  ChevronDown,
  Image as ImageIcon,
  Sparkles,
  Info,
} from 'lucide-react';
import { countWords } from '@/lib/funnel-rules';

export default function UGCPanel(props: any) {
  const {
    activeItem,
    activeContext,
    handleCopyText,
    copiedStates,
    getInitialDraft,
    ugcOutput,
    tryParseJSON,
  } = props;

  if (!ugcOutput) {
    return (
      <div className="whitespace-pre-wrap font-sans text-stone-800 text-xs leading-relaxed">
        {ugcOutput || (getInitialDraft ? getInitialDraft('ugc', activeItem, activeContext) : '')}
      </div>
    );
  }

  let ugcPack: any | null = null;
  try {
    const parsed = tryParseJSON(ugcOutput);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      ugcPack = parsed as any;
    }
  } catch (e) {
    ugcPack = null;
  }

  if (!ugcPack) {
    return (
      <div className="whitespace-pre-wrap font-sans text-stone-800 text-xs leading-relaxed">
        {ugcOutput}
      </div>
    );
  }

  const scenes = [
    {
      num: 1,
      title: 'Scene 1: Hook',
      desc: 'Penarik Perhatian Spontan (0-3s)',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      script: ugcPack.script_scene_1,
      imagePrompt: ugcPack.scene1_image_prompt,
      videoPrompt: ugcPack.scene1_google_flow_prompt,
      imgCopyKey: 'ugc_s1_img',
      vidCopyKey: 'ugc_s1_vid',
    },
    {
      num: 2,
      title: 'Scene 2: Solution',
      desc: 'Penyelesaian Masalah Intuitif & Trust (3-7s)',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      script: ugcPack.script_scene_2,
      imagePrompt: ugcPack.scene2_image_prompt,
      videoPrompt: ugcPack.scene2_google_flow_prompt,
      imgCopyKey: 'ugc_s2_img',
      vidCopyKey: 'ugc_s2_vid',
    },
    {
      num: 3,
      title: 'Scene 3: CTA',
      desc: 'Ajakan Bertindak Konversi Tinggi (7-10s)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      script: ugcPack.script_scene_3,
      imagePrompt: ugcPack.scene3_image_prompt,
      videoPrompt: ugcPack.scene3_google_flow_prompt,
      imgCopyKey: 'ugc_s3_img',
      vidCopyKey: 'ugc_s3_vid',
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Action Toolbar with Google Flow link */}
      <div className="bg-[#f6f3ee] border border-[#e7e0d4] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-stone-700 font-medium px-1">
          <Zap size={14} className="text-[#0f766e]" />
          <span>Produksi UGC &bull; <strong>Alur 3-Scene Google Flow</strong></span>
        </div>

        <a
          href="https://labs.google/fx/tools/flow"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <ExternalLink size={13} />
          <span>Buka Google Flow</span>
        </a>
      </div>

      {/* Ringkasan Arahan Produksi Per Scene */}
      <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-3.5 sm:p-4 text-xs text-stone-700 flex items-start gap-2.5 shadow-xs">
        <Info size={15} className="text-[#0f766e] shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed text-[11px] sm:text-xs">
          <p className="font-semibold text-stone-800">
            Kerjakan satu scene sampai selesai agar karakter, visual, dan dialog tetap konsisten.
          </p>
          <p className="text-stone-600">
            Urutan per scene: <strong>1. Salin Prompt Image</strong> &rarr; buat gambar di Google Flow &rarr; <strong>2. Salin Prompt Video</strong> &rarr; generate video gerak di Google Flow.
          </p>
        </div>
      </div>

      {/* 3 SCENE BLOCKS - CLEAR STEP-BY-STEP WORKFLOW */}
      <div className="space-y-4">
        {scenes.map((scene) => {
          const isImgCopied = copiedStates[scene.imgCopyKey];
          const isVidCopied = copiedStates[scene.vidCopyKey];

          return (
            <div
              key={scene.num}
              className="bg-[#fffdf8] border border-[#e7e0d4] p-5 rounded-2xl space-y-4 shadow-xs"
            >
              {/* Scene Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e7e0d4]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${scene.badgeClass}`}
                  >
                    Langkah {scene.num}: {scene.title}
                  </span>
                  <span className="text-xs font-semibold text-stone-700">
                    {scene.desc}
                  </span>
                </div>
              </div>

              {/* Dialogue / Script Box */}
              <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                  <span className="font-bold text-stone-700 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[#0f766e]" />
                    Naskah Dialog Kreator:
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/80 text-stone-700 font-mono font-medium">
                    {countWords(scene.script || '')} kata
                  </span>
                </div>
                <p className="text-stone-900 leading-relaxed font-semibold italic text-xs bg-[#fffdf8] p-3 rounded-lg border border-[#e7e0d4]/80">
                  &ldquo;{scene.script}&rdquo;
                </p>
              </div>

              {/* 2 Step Boxes: Step 1 (Image Prompt) and Step 2 (Video Prompt) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                {/* Box 1: Step 1 - Start Frame Image Prompt */}
                <div className="space-y-2.5 flex flex-col justify-between p-4 bg-[#f6f3ee]/60 border border-[#e7e0d4] rounded-xl">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon size={13} className="text-blue-600" />
                        1. Start Frame Image Prompt (9:16)
                      </span>
                    </div>
                    <div className="p-3 bg-[#fffdf8] border border-[#e7e0d4] rounded-xl min-h-[90px]">
                      <p className="text-stone-800 font-mono text-[11px] leading-relaxed select-all">
                        {scene.imagePrompt}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyText(scene.imgCopyKey, scene.imagePrompt, 'promptCopied')}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border ${
                      isImgCopied
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                        : 'bg-[#fffdf8] hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300'
                    }`}
                  >
                    {isImgCopied ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span>Prompt Image Scene {scene.num} Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>1. Salin Prompt Image Scene {scene.num}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Box 2: Step 2 - Google Flow Video Prompt */}
                <div className="space-y-2.5 flex flex-col justify-between p-4 bg-[#f6f3ee]/60 border border-[#e7e0d4] rounded-xl">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#0f766e] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#0f766e]" />
                        2. Google Flow Video Prompt (Veo / FX Studio)
                      </span>
                    </div>
                    <div className="p-3 bg-[#fffdf8] border border-[#e7e0d4] rounded-xl min-h-[90px]">
                      <p className="text-stone-800 font-mono text-[11px] leading-relaxed select-all">
                        {scene.videoPrompt}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyText(scene.vidCopyKey, scene.videoPrompt, 'promptCopied')}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border ${
                      isVidCopied
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                        : 'bg-[#0f766e] hover:bg-[#0f766e]/90 border-[#0f766e] text-white'
                    }`}
                  >
                    {isVidCopied ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span>Prompt Video Scene {scene.num} Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>2. Salin Prompt Video Scene {scene.num}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accordion Sekunder: Detail Karakter & Reference Image */}
      <details className="group border border-[#e7e0d4] bg-[#f6f3ee]/50 rounded-2xl overflow-hidden shadow-xs transition-all">
        <summary className="p-3.5 flex items-center justify-between font-bold text-xs text-stone-700 hover:text-stone-900 cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#0f766e]" />
            <span>Detail Karakter &amp; Reference Image (Opsional)</span>
          </div>
          <ChevronDown size={15} className="group-open:rotate-180 transition-transform text-stone-500" />
        </summary>
        <div className="p-4 pt-2 border-t border-[#e7e0d4] space-y-3.5 text-xs">
          <div className="bg-[#fffdf8] p-3.5 rounded-xl border border-[#e7e0d4]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
              Profil &amp; Persona Kreator
            </span>
            <p className="text-stone-800 leading-relaxed">{ugcPack.characterProfile}</p>
          </div>

          <div className="bg-[#fffdf8] p-3.5 rounded-xl border border-[#e7e0d4] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Character Reference Image Prompt
              </span>
              <button
                type="button"
                onClick={() => handleCopyText('ugc_char_ref', ugcPack.characterReferenceImagePrompt, 'promptCopied')}
                className="text-[10px] font-bold text-[#0f766e] hover:underline cursor-pointer flex items-center gap-1"
              >
                {copiedStates['ugc_char_ref'] ? (
                  <>
                    <Check size={11} className="text-[#0f766e]" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Salin Prompt Karakter</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-stone-800 font-mono text-[11px] leading-relaxed bg-[#f6f3ee] p-2.5 rounded-lg border border-[#e7e0d4] select-all">
              {ugcPack.characterReferenceImagePrompt}
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
