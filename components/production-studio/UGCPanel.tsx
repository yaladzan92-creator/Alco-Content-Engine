import React from 'react';
import { Sparkles, Loader2, Copy, Check, Info, FileText, Image as ImageIcon, Zap, Edit3, ChevronLeft, ChevronRight, PlaySquare, Video, Clipboard, Clock, Sliders, Target, Layers, FileCode2, CheckCircle2, Download, Save, AlertCircle, RefreshCw, CheckSquare, ListTodo, BrainCircuit, Users, ExternalLink, PlayCircle, MessageSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UGCPanel(props: any) {
  const {
    activeItem, activeContext, imageAnglesPackage, selectedAngleId, setSelectedAngleId,
    generatedImages, imageGeneratingKey, handleCopyText, copiedStates, handleGenerateImage,
    imageOutput, getInitialDraft, funnelRules, carouselFrames, selectedCarouselId,
    setSelectedCarouselId, activeSlideNumber, setActiveSlideNumber, handleCopyCarouselSlide,
    carouselOutput, videoOutput, tryParseJSON, normalizeFunnelStage, getFunnelRules,
    selectedVideoId, handleSelectany, videoMode, setVideoMode, characterImageUrl,
    setCharacterImageUrl, productScreenImageUrl, setProductScreenImageUrl, coverImageUrl,
    setCoverImageUrl, videoOutputMode, setVideoOutputMode, showToast, handleGenerateJson2VideoPayload,
    isRenderingVideo, renderVideoWithJson2Video, renderJobId, renderJobData, renderError,
    isCheckingStatus, checkRenderStatus, flowCustomCreator, setFlowCustomCreator,
    flowCustomSetting, setFlowCustomSetting, flowCustomDialogues, setFlowCustomDialogues,
    handleGenerateVideoScriptFromFlow, videoGeneratingKey, ugcOutput, ugcDataPackage,
    ugcGeneratingKey, handleGenerateUGCImage, generatedUGCImages, sourceItem, imageAnglesPackage: imgAngs,
      handleDownloadImage, imageGenerateError, handleRenderVideo, handleCheckRenderStatus,
      json2VideoPayload, characterDNA, getGoogleFlowVideoPack, setActiveTab

  } = props;
  
  // Return the block safely
  

          if (!ugcOutput) {
    return (
      <div className="whitespace-pre-wrap font-sans text-stone-800 text-xs leading-relaxed">
        {ugcOutput || getInitialDraft('ugc', activeItem, activeContext)}
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

  return (
    <div className="space-y-4">
      {/* 3 Main Action Toolbar */}
      <div className="bg-[#f6f3ee] border border-[#e7e0d4] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-stone-700 font-medium px-1">
          <Zap size={14} className="text-[#0f766e]" />
          <span>Produksi UGC &bull; <strong>Alur 3-Scene Google Flow</strong></span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const fullPackText = `[UGC CREATOR BRIEF & SCRIPT PACK]\n\nCHARACTER PROFILE:\n${ugcPack?.characterProfile}\n\nCHARACTER IMAGE PROMPT:\n${ugcPack?.characterReferenceImagePrompt}\n\n=========================================\n\nSCENE 1 (HOOK):\nScript: ${ugcPack?.script_scene_1}\nVideo Prompt: ${ugcPack?.scene1_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene1_image_prompt}\n\n=========================================\n\nSCENE 2 (SOLUTION):\nScript: ${ugcPack?.script_scene_2}\nVideo Prompt: ${ugcPack?.scene2_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene2_image_prompt}\n\n=========================================\n\nSCENE 3 (CTA):\nScript: ${ugcPack?.script_scene_3}\nVideo Prompt: ${ugcPack?.scene3_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene3_image_prompt}`;
              handleCopyText('ugc_full_package', fullPackText);
            }}
            className="px-3.5 py-1.5 bg-[#fffdf8] hover:bg-stone-100 text-[#1f2933] border border-[#e7e0d4] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedStates['ugc_full_package'] ? (
              <>
                <Check size={13} className="text-[#0f766e]" />
                <span className="text-[#0f766e]">Full Pack Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Salin Full UGC Pack</span>
              </>
            )}
          </button>

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
      </div>

      {/* 3 SCENE BLOCKS ACCORDING TO 1-2-3 WORKFLOW */}
      <div className="space-y-4">
        {/* Scene 1 = Hook */}
        <div className="bg-[#fffdf8] border border-[#e7e0d4] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#e7e0d4]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg border text-xs font-bold bg-[#0f766e]/10 border-[#0f766e]/20 text-[#0f766e]">
                Langkah 1: Scene 1 (Hook)
              </span>
              <span className="text-xs font-semibold text-stone-700">
                Penarik Perhatian Spontan
              </span>
            </div>
            <button
              onClick={() => {
                const sceneText = `[SCENE 1 (HOOK)]\nScript: "${ugcPack?.script_scene_1}"\nVideo Prompt: ${ugcPack?.scene1_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene1_image_prompt}`;
                handleCopyText('ugc_scene_1', sceneText);
              }}
              className="px-3 py-1 bg-[#f6f3ee] hover:bg-stone-200 border border-[#e7e0d4] rounded-xl text-xs font-bold text-stone-700 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              {copiedStates['ugc_scene_1'] ? (
                <>
                  <Check size={12} className="text-[#0f766e]" />
                  <span className="text-[#0f766e]">Scene 1 Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Salin Scene 1</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            <div className="md:col-span-4 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Naskah Kreator (Hook)</span>
              <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl">
                <p className="text-stone-900 leading-relaxed font-semibold italic text-xs">&ldquo;{ugcPack.script_scene_1}&rdquo;</p>
              </div>
            </div>
            <div className="md:col-span-5 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Prompt Video (Google Flow)</span>
              <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl">
                <p className="text-stone-900 font-mono text-[11px] leading-relaxed select-all">{ugcPack.scene1_google_flow_prompt}</p>
              </div>
            </div>
            <div className="md:col-span-3 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Image Prompt</span>
              <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl">
                <p className="text-stone-800 font-mono text-[10px] leading-relaxed select-all">{ugcPack.scene1_image_prompt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scene 2 = Solution */}
        <div className="bg-[#fffdf8] border border-[#e7e0d4] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#e7e0d4]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg border text-xs font-bold bg-blue-100 border-blue-200 text-blue-800">
                Langkah 2: Scene 2 (Solution)
              </span>
              <span className="text-xs font-semibold text-stone-700">
                Penyelesaian Masalah Intuitif
              </span>
            </div>
            <button
              onClick={() => {
                const sceneText = `[SCENE 2 (SOLUTION)]\nScript: "${ugcPack?.script_scene_2}"\nVideo Prompt: ${ugcPack?.scene2_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene2_image_prompt}`;
                handleCopyText('ugc_scene_2', sceneText);
              }}
              className="px-3 py-1 bg-[#f6f3ee] hover:bg-stone-200 border border-[#e7e0d4] rounded-xl text-xs font-bold text-stone-700 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              {copiedStates['ugc_scene_2'] ? (
                <>
                  <Check size={12} className="text-[#0f766e]" />
                  <span className="text-[#0f766e]">Scene 2 Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Salin Scene 2</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            <div className="md:col-span-4 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Naskah Kreator (Solusi)</span>
              <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl">
                <p className="text-stone-900 leading-relaxed font-semibold italic text-xs">&ldquo;{ugcPack.script_scene_2}&rdquo;</p>
              </div>
            </div>
            <div className="md:col-span-5 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Prompt Video (Google Flow)</span>
              <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl">
                <p className="text-stone-900 font-mono text-[11px] leading-relaxed select-all">{ugcPack.scene2_google_flow_prompt}</p>
              </div>
            </div>
            <div className="md:col-span-3 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Image Prompt</span>
              <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl">
                <p className="text-stone-800 font-mono text-[10px] leading-relaxed select-all">{ugcPack.scene2_image_prompt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scene 3 = CTA */}
        <div className="bg-[#fffdf8] border border-[#e7e0d4] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#e7e0d4]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg border text-xs font-bold bg-purple-100 border-purple-200 text-purple-800">
                Langkah 3: Scene 3 (CTA)
              </span>
              <span className="text-xs font-semibold text-stone-700">
                Ajakan Bertindak Konversi Tinggi
              </span>
            </div>
            <button
              onClick={() => {
                const sceneText = `[SCENE 3 (CTA)]\nScript: "${ugcPack?.script_scene_3}"\nVideo Prompt: ${ugcPack?.scene3_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene3_image_prompt}`;
                handleCopyText('ugc_scene_3', sceneText);
              }}
              className="px-3 py-1 bg-[#f6f3ee] hover:bg-stone-200 border border-[#e7e0d4] rounded-xl text-xs font-bold text-stone-700 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              {copiedStates['ugc_scene_3'] ? (
                <>
                  <Check size={12} className="text-[#0f766e]" />
                  <span className="text-[#0f766e]">Scene 3 Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Salin Scene 3</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            <div className="md:col-span-4 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Naskah Kreator (CTA)</span>
              <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl">
                <p className="text-stone-900 leading-relaxed font-bold italic text-xs">&ldquo;{ugcPack.script_scene_3}&rdquo;</p>
              </div>
            </div>
            <div className="md:col-span-5 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Prompt Video (Google Flow)</span>
              <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl">
                <p className="text-stone-900 font-mono text-[11px] leading-relaxed select-all">{ugcPack.scene3_google_flow_prompt}</p>
              </div>
            </div>
            <div className="md:col-span-3 space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Image Prompt</span>
              <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl">
                <p className="text-stone-800 font-mono text-[10px] leading-relaxed select-all">{ugcPack.scene3_image_prompt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Section: Detail Teknis Profil Kreator & Karakter Reference */}
      <details className="group border border-[#e7e0d4] bg-[#f6f3ee]/50 rounded-2xl overflow-hidden shadow-xs transition-all">
        <summary className="p-3.5 flex items-center justify-between font-bold text-xs text-stone-700 hover:text-stone-900 cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#0f766e]" />
            <span>Detail Teknis &amp; Profil Karakter Kreator UGC</span>
          </div>
          <ChevronDown size={15} className="group-open:rotate-180 transition-transform text-stone-500" />
        </summary>
        <div className="p-4 pt-2 border-t border-[#e7e0d4] space-y-3.5 text-xs">
          <div className="bg-[#fffdf8] p-3.5 rounded-xl border border-[#e7e0d4]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Profil &amp; Persona Kreator</span>
            <p className="text-stone-800 leading-relaxed">{ugcPack.characterProfile}</p>
          </div>

          <div className="bg-[#fffdf8] p-3.5 rounded-xl border border-[#e7e0d4] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Character Reference Image Prompt</span>
              <button
                onClick={() => handleCopyText('ugc_char_ref', ugcPack.characterReferenceImagePrompt)}
                className="text-[10px] font-bold text-[#0f766e] hover:underline cursor-pointer"
              >
                {copiedStates['ugc_char_ref'] ? 'Tersalin!' : 'Copy Prompt'}
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
