import React from 'react';
import { Sparkles, Loader2, Copy, Check, Info, FileText, Image as ImageIcon, Zap, Edit3, ChevronLeft, ChevronRight, PlaySquare, Video, Clipboard, Clock, Sliders, Target, Layers, FileCode2, CheckCircle2, Download, Save, AlertCircle, RefreshCw, CheckSquare, ListTodo, BrainCircuit, Users, ExternalLink, PlayCircle, MessageSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PromptNextStepLinks } from './PromptNextStepLinks';

export default function ImagePanel(props: any) {
  const {
    activeItem, activeContext, imageAnglesPackage, selectedAngleId, setSelectedAngleId,
    generatedImages, imageGeneratingKey, handleCopyText, copiedStates, handleGenerateImage,
    nextStepVisibleKeys, handleDismissNextStep,
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
  

          if (!imageAnglesPackage || imageAnglesPackage.angles.length === 0) {
    return (
      <div className="whitespace-pre-wrap font-sans text-stone-800 text-xs leading-relaxed">
        {imageOutput || getInitialDraft('image', activeItem, activeContext)}
      </div>
    );
  }

  const activeAngle = imageAnglesPackage.angles.find((a: any) => a.id === selectedAngleId) || imageAnglesPackage.angles[0];
  const recommendedAngle = imageAnglesPackage.angles.find((a: any) => a.id === imageAnglesPackage.recommendedAngleId) || imageAnglesPackage.angles[0];
  const imageKey = `${sourceItem?.no || 1}_${activeAngle.id}`;
  const generatedImg = generatedImages[imageKey];
  const isGenerating = imageGeneratingKey === imageKey;

  return (
    <div className="space-y-4">
      {/* AI Recommendation Banner */}
      {imageAnglesPackage.recommendationReason && (
        <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl flex items-start gap-3 shadow-xs">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
            <Sparkles size={15} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
                Rekomendasi AI: Angle {recommendedAngle.id} ({recommendedAngle.name})
              </span>
            </div>
            <p className="text-xs text-stone-700 font-medium leading-relaxed pt-0.5">
              {imageAnglesPackage.recommendationReason}
            </p>
          </div>
        </div>
      )}

      {/* Angle Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e7e0d4] pb-3 overflow-x-auto custom-scrollbar">
        {imageAnglesPackage.angles.map((angle: any) => {
          const isRecommended = angle.id === imageAnglesPackage.recommendedAngleId;
          const isSelected = selectedAngleId === angle.id;

          return (
            <button
              key={angle.id}
              onClick={() => setSelectedAngleId(angle.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-[#0f766e] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-[#e7e0d4] bg-[#fffdf8]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-stone-400'}`} />
              <span>{angle.name || `Angle ${angle.id}`}</span>
              {isRecommended && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                  isSelected 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  Rekomendasi
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3 Main Action Toolbar */}
      <div className="bg-[#f6f3ee] border border-[#e7e0d4] p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-stone-600 font-medium px-1">
          <Sparkles size={14} className="text-[#0f766e]" />
          <span>Angle <strong>{activeAngle.name}</strong> &bull; {activeAngle.funnelStage || 'TOFU'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopyText(`prompt_${selectedAngleId}`, activeAngle.finalPrompt)}
            className="px-3.5 py-1.5 bg-[#fffdf8] hover:bg-stone-100 text-[#1f2933] border border-[#e7e0d4] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            {copiedStates[`prompt_${selectedAngleId}`] ? (
              <>
                <Check size={13} className="text-[#0f766e]" />
                <span className="text-[#0f766e]">Prompt Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Salin Prompt Image</span>
              </>
            )}
          </button>

          {!generatedImg ? (
            <button
              onClick={() => handleGenerateImage(activeAngle.finalPrompt, activeAngle.id)}
              disabled={isGenerating}
              className="px-3.5 py-1.5 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Generating Visual...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Generate Visual Gemini</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleDownloadImage(generatedImg.imageDataUrl, activeAngle.id)}
              className="px-3.5 py-1.5 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Download size={13} />
              <span>Download Gambar</span>
            </button>
          )}
        </div>
      </div>

      {/* Next Step Links when prompt copied */}
      <PromptNextStepLinks
        show={Boolean(nextStepVisibleKeys?.[`prompt_${selectedAngleId}`])}
        onDismiss={() => handleDismissNextStep?.(`prompt_${selectedAngleId}`)}
      />

      {/* Layer 1: Strategy Brief (Ringkasan Strategi Konten) */}
      {activeAngle.strategyBrief && (
        <div className="bg-[#fcfaf6] border border-[#e7e0d4] p-4 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#e7e0d4]">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-[#0f766e]" />
              <span className="text-xs font-bold text-[#1f2933]">Lapisan 1: Ringkasan Strategi Konten (Strategy Brief)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0f766e]/10 text-[#0f766e] border border-[#0f766e]/20">
                {activeAngle.strategyBrief.funnelStage || activeAngle.funnelStage || 'TOFU'}
              </span>
              {activeAngle.messageAlignmentCheck && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  activeAngle.messageAlignmentCheck.isAligned
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <CheckCircle2 size={11} />
                  <span>{activeAngle.messageAlignmentCheck.isAligned ? 'Penyelarasan Corong OK' : 'Disesuaikan'}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-stone-500 font-medium block text-[10px]">Tujuan Konten:</span>
              <p className="text-stone-800 font-semibold">{activeAngle.strategyBrief.tujuanKonten || activeAngle.contentGoal || '-'}</p>
            </div>
            <div>
              <span className="text-stone-500 font-medium block text-[10px]">Ide Utama Konten:</span>
              <p className="text-stone-800 font-semibold">{activeAngle.strategyBrief.ideUtama || '-'}</p>
            </div>
            <div>
              <span className="text-stone-500 font-medium block text-[10px]">Konteks Audiens:</span>
              <p className="text-stone-800">{activeAngle.strategyBrief.audienceContext || '-'}</p>
            </div>
            <div>
              <span className="text-stone-500 font-medium block text-[10px]">Angle &amp; Emosi Utama:</span>
              <p className="text-stone-800 font-medium">{activeAngle.strategyBrief.angle || activeAngle.name} &bull; <span className="text-stone-700 font-normal">{activeAngle.strategyBrief.emosiUtama || activeAngle.targetEmotion || '-'}</span></p>
            </div>
            {activeAngle.visualObjective && (
              <div className="md:col-span-2 bg-[#f0fdfa] p-2.5 rounded-xl border border-[#0f766e]/20">
                <span className="text-[#0f766e] font-bold block text-[10px] uppercase tracking-wide">Visual Objective ({activeAngle.funnelStage || 'TOFU'}):</span>
                <p className="text-stone-800 text-xs mt-0.5 font-medium">{activeAngle.visualObjective}</p>
              </div>
            )}
            <div className="md:col-span-2 bg-[#f6f3ee] p-2.5 rounded-xl border border-[#e7e0d4]/80">
              <span className="text-stone-500 font-medium block text-[10px]">Pesan Visual yang Dibangun:</span>
              <p className="text-stone-800 text-xs mt-0.5">{activeAngle.strategyBrief.pesanVisual || activeAngle.visualStrategy || '-'}</p>
            </div>
            {activeAngle.messageAlignmentCheck && (
              <div className="md:col-span-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <CheckCircle2 size={12} className="text-[#0f766e]" />
                  <span>Validasi Headline &amp; Text Overlay ({activeAngle.funnelStage || 'TOFU'}):</span>
                </div>
                {activeAngle.messageAlignmentCheck.issue && (
                  <p className="text-amber-700 text-[11px]"><strong>Catatan Penyelarasan:</strong> {activeAngle.messageAlignmentCheck.issue}</p>
                )}
                <p className="text-stone-700"><strong>Alasan Keselarasan:</strong> {activeAngle.messageAlignmentCheck.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Layer 2: Primary Visual Production Prompt Box */}
      <div className="bg-[#fffdf8] border border-[#e7e0d4] p-4.5 rounded-2xl space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ImageIcon size={14} className="text-[#0f766e]" />
            <span className="text-xs font-bold text-[#1f2933]">Lapisan 2: Prompt Produksi Visual (Midjourney v6 / Imagen)</span>
          </div>
          <span className="text-[10px] text-stone-500 font-medium bg-[#f6f3ee] px-2 py-0.5 rounded-md border border-[#e7e0d4]">4:5 Vertical Editorial</span>
        </div>
        <div className="p-3.5 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl text-stone-900 font-mono text-xs leading-relaxed select-all whitespace-pre-wrap">
          {activeAngle.finalPrompt}
        </div>
        {activeAngle.textOverlay && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Teks Dalam Gambar (Overlay):</span>
            <span className="text-xs font-semibold text-[#0f766e] bg-[#0f766e]/10 border border-[#0f766e]/20 px-2.5 py-0.5 rounded-lg">
              &ldquo;{activeAngle.textOverlay}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* Collapsible Section: Detail Teknis & Parameter Strategi */}
      <details className="group border border-[#e7e0d4] bg-[#f6f3ee]/50 rounded-2xl overflow-hidden shadow-xs transition-all">
        <summary className="p-3.5 flex items-center justify-between font-bold text-xs text-stone-700 hover:text-stone-900 cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-[#0f766e]" />
            <span>Detail Teknis &amp; Parameter Strategi Angle {activeAngle.id}</span>
          </div>
          <ChevronDown size={15} className="group-open:rotate-180 transition-transform text-stone-500" />
        </summary>
        <div className="p-4 pt-2 border-t border-[#e7e0d4] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3 bg-[#fffdf8] p-3.5 rounded-xl border border-[#e7e0d4]">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#e7e0d4]">
              <span className="font-bold text-[#1f2933]">Funnel &amp; Target Emosi</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0f766e]/10 text-[#0f766e]">{activeAngle.funnelStage || 'TOFU'}</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium block text-[10px]">Tujuan Konten</span>
              <p className="text-stone-800 font-semibold">{activeAngle.contentGoal || '-'}</p>
            </div>
            <div>
              <span className="text-stone-500 font-medium block text-[10px]">Target Emosi</span>
              <p className="text-stone-800">{activeAngle.targetEmotion || '-'}</p>
            </div>
            <div>
              <span className="text-stone-500 font-medium block text-[10px]">Strategi Hook Visual</span>
              <p className="text-stone-800">{activeAngle.hookStrategy || '-'}</p>
            </div>
          </div>

          <div className="space-y-3 bg-[#fffdf8] p-3.5 rounded-xl border border-[#e7e0d4]">
            <div className="pb-1.5 border-b border-[#e7e0d4]">
              <span className="font-bold text-[#1f2933]">Komposisi &amp; Psikologi Visual</span>
            </div>
            <div>
              <span className="text-stone-500 font-medium block text-[10px]">Strategi Visual</span>
              <p className="text-stone-800">{activeAngle.visualStrategy || '-'}</p>
            </div>
            <div>
              <span className="text-stone-500 font-medium block text-[10px]">Tata Letak / Layout</span>
              <p className="text-stone-800">{activeAngle.layoutStrategy || '-'}</p>
            </div>
            {activeAngle.colorPsychology && (
              <div>
                <span className="text-stone-500 font-medium block text-[10px]">Nuansa &amp; Psikologi Warna</span>
                <p className="text-stone-800">{activeAngle.colorPsychology}</p>
              </div>
            )}
          </div>
        </div>
      </details>

      {/* Direct Gemini Image Generation Box & Preview */}
      <div className="bg-[#fffdf8] border border-[#e7e0d4] p-4.5 rounded-2xl space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#e7e0d4]">
          <div>
            <h4 className="text-xs font-bold text-[#1f2933] flex items-center gap-1.5">
              <ImageIcon size={14} className="text-[#0f766e]" />
              Aset Gambar Nyata (Gemini Visual Engine)
            </h4>
            <p className="text-[11px] text-stone-500">
              Generate visual langsung dari prompt di atas menggunakan model Imagen / Gemini.
            </p>
          </div>

          {!generatedImg && (
            <button
              onClick={() => handleGenerateImage(activeAngle.finalPrompt, activeAngle.id)}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={13} className="animate-spin text-white" />
                  <span>Generating Image...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Generate Visual</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Error Message if any */}
        {imageGenerateError && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
            <p className="font-medium">{imageGenerateError}</p>
          </div>
        )}

        {/* Generated Image Preview & Controls */}
        {generatedImg ? (
          <div className="space-y-3 pt-1">
            <div className="relative group rounded-xl overflow-hidden border border-[#e7e0d4] bg-[#f6f3ee] flex justify-center max-w-md mx-auto shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedImg.imageDataUrl}
                alt={`Generated Visual Angle ${activeAngle.id}`}
                className="w-full h-auto object-contain max-h-[460px] rounded-xl"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-mono text-white border border-white/20">
                {generatedImg.model || 'gemini-2.5-flash-image'}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                onClick={() => handleDownloadImage(generatedImg.imageDataUrl, activeAngle.id)}
                className="px-4 py-2 bg-[#fffdf8] hover:bg-stone-100 text-[#1f2933] border border-[#e7e0d4] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Download size={13} className="text-[#0f766e]" />
                <span>Download Image</span>
              </button>

              <button
                onClick={() => handleGenerateImage(activeAngle.finalPrompt, activeAngle.id)}
                disabled={isGenerating}
                className="px-4 py-2 bg-[#fffdf8] hover:bg-stone-100 text-stone-700 border border-[#e7e0d4] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-[#0f766e]" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} className="text-[#0f766e]" />
                    <span>Regenerate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-[#e7e0d4] rounded-xl bg-[#f6f3ee]/50 text-xs text-stone-500 space-y-1">
            <p>Klik tombol <strong>Generate Visual</strong> di atas untuk menghasilkan ilustrasi langsung dari AI Studio.</p>
          </div>
        )}
      </div>
    </div>
  );

}
