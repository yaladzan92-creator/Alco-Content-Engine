import React from 'react';
import { 
  Sparkles, Copy, Check, Sliders, CheckCircle2, AlertCircle,
  Layers, ArrowRight, Palette, Compass, Camera, BarChart3,
  Layers2, Eye, ShieldCheck, ChevronDown
} from 'lucide-react';
import { PromptNextStepLinks } from './PromptNextStepLinks';

export default function CarouselPanel(props: any) {
  const {
    activeItem,
    activeContext,
    handleCopyText,
    copiedStates,
    nextStepVisibleKeys,
    handleDismissNextStep,
    activeSlideNumber,
    setActiveSlideNumber,
    carouselOutput,
    getInitialDraft,
    tryParseJSON,
  } = props;

  let plan: any | null = activeItem?.carousel_plan || null;

  if (!plan) {
    const rawOutput = carouselOutput || getInitialDraft('carousel', activeItem, activeContext);
    if (rawOutput) {
      const parsed = tryParseJSON(rawOutput);
      if (parsed && typeof parsed === 'object') {
        if ('slides' in parsed && Array.isArray(parsed.slides)) {
          plan = parsed;
        } else if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.slides) {
          plan = parsed[0];
        }
      }
    }
  }

  if (!plan || !plan.slides || plan.slides.length === 0) {
    return (
      <div className="p-4 bg-[#fffdf8] border border-[#e7e0d4] rounded-2xl">
        <div className="whitespace-pre-wrap font-sans text-stone-800 text-xs leading-relaxed">
          {carouselOutput || getInitialDraft('carousel', activeItem, activeContext)}
        </div>
      </div>
    );
  }

  const slides = plan.slides;
  const currentSlideIndex = slides.findIndex((s: any) => s.slide === activeSlideNumber);
  const activeSlide = currentSlideIndex >= 0 ? slides[currentSlideIndex] : slides[0];
  const activeSlideNum = activeSlide.slide || 1;

  const funnelStage = String(plan.funnel_stage || activeItem?.jenis || 'TOFU').toUpperCase();
  const alignmentCheck = plan.messageAlignmentCheck || { isAligned: true };

  // Helper to extract 3-layer data with fallbacks
  const visualFormat: 'photography' | 'infographic' | 'hybrid' = 
    activeSlide.visual_format || (activeSlide.slide === 1 ? 'photography' : 'infographic');

  const creativeStrategy = activeSlide.creative_strategy || {
    funnel_stage: funnelStage,
    slide_role: activeSlide.role || 'content',
    visual_objective: activeSlide.visual_intent || '',
    core_message: activeSlide.headline || '',
    audience_emotion: activeSlide.emotional_state || '',
    visual_concept: activeSlide.visual_type || '',
    text_overlay: activeSlide.headline || ''
  };

  const visualProduction = activeSlide.visual_production || {
    subject: activeSlide.visual_intent || '',
    action: activeSlide.visual_intent || '',
    composition: activeSlide.text_zone || 'Upper Third / Center',
    layout: activeSlide.negative_space_plan || '',
    visual_metaphor: '',
    typography: 'Headline 28-32pt bold, body 16pt sans-serif.',
    background: '#FAF9F6 clean warm neutral background.',
    color_mood: 'Professional & high-contrast.',
    negative_space: activeSlide.negative_space_plan || 'Ruang bersih 40%',
    negative_prompt: visualFormat === 'photography' 
      ? 'hard selling ads, cluttered poster, too much text, generic stock photo, unreadable typography, distorted face, extra fingers.'
      : 'photography, realistic person, complex faces, human hands, messy sketch, stock photo, blurry text, cluttered layout, hard selling ads.'
  };

  const formatSlideFullText = (s: any) => {
    const cs = s.creative_strategy || {
      funnel_stage: funnelStage,
      slide_role: s.role || 'content',
      visual_objective: s.visual_intent || '',
      core_message: s.headline || '',
      audience_emotion: s.emotional_state || '',
      visual_concept: s.visual_type || '',
      text_overlay: s.headline || ''
    };
    const vf = s.visual_format || (s.slide === 1 ? 'photography' : 'infographic');
    const vp = s.visual_production || {
      subject: s.visual_intent || '',
      action: s.visual_intent || '',
      composition: s.text_zone || '',
      layout: s.negative_space_plan || '',
      visual_metaphor: '',
      typography: 'Headline 28-32pt bold, body 16pt.',
      background: '#FAF9F6',
      color_mood: 'Professional',
      negative_space: 'Ruang bersih 40%',
      negative_prompt: ''
    };

    return `--- SLIDE ${s.slide} (${(s.role || 'Content').toUpperCase()}) [Format: ${vf.toUpperCase()}] ---
Headline: ${s.headline}
Body:
${s.body}
Swipe Bridge: ${s.swipe_bridge || '-'}

[1. CREATIVE STRATEGY]
Funnel Stage: ${cs.funnel_stage || funnelStage}
Slide Role: ${cs.slide_role || s.role}
Visual Objective: ${cs.visual_objective || s.visual_intent || '-'}
Core Message: ${cs.core_message || s.headline}
Audience Emotion: ${cs.audience_emotion || s.emotional_state || '-'}
Visual Concept: ${cs.visual_concept || s.visual_type || '-'}
Text Overlay: "${cs.text_overlay || s.headline}"

[2. VISUAL FORMAT]
Visual Format: ${vf}

[3. VISUAL PRODUCTION]
Subject: ${vp.subject || '-'}
Action: ${vp.action || '-'}
Composition: ${vp.composition || '-'}
Layout: ${vp.layout || '-'}
Visual Metaphor: ${vp.visual_metaphor || '-'}
Typography: ${vp.typography || '-'}
Background: ${vp.background || '-'}
Color Mood: ${vp.color_mood || '-'}
Negative Space: ${vp.negative_space || '-'}
Negative Prompt: ${vp.negative_prompt || '-'}

[SLIDE IMAGE PROMPT (AI GENERATOR / FLUX / MIDJOURNEY)]
${s.slide_image_prompt || '-'}

[PRODUCTION / LAYOUT PROMPT]
${s.production_prompt || '-'}`;
  };

  return (
    <div className="space-y-4">
      {/* 1. Top Action Toolbar */}
      <div className="bg-[#f6f3ee] border border-[#e7e0d4] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-700 font-medium">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0f766e]/10 border border-[#0f766e]/20 rounded-xl text-[#0f766e] font-bold">
            <Sparkles size={13} />
            <span>{funnelStage} Carousel Blueprint</span>
          </div>
          <span className="text-stone-400">&bull;</span>
          <span className="font-semibold text-stone-800">{slides.length} Slide</span>
          {plan.primary_cta_text && (
            <>
              <span className="text-stone-400">&bull;</span>
              <span className="text-stone-600">CTA: <strong className="text-stone-900">{plan.primary_cta_text}</strong></span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const combinedText = `[CAROUSEL 3-LAYER STRATEGY BLUEPRINT]\nFunnel Stage: ${funnelStage}\nGoal: ${plan.content_goal || '-'}\nCore Promise: ${plan.core_promise || '-'}\nPrimary CTA: ${plan.primary_cta_text || '-'} (${plan.primary_cta_type || '-'})\nSlide Count Reason: ${plan.slide_count_reason || '-'}\n\n` +
                slides.map((s: any) => formatSlideFullText(s)).join('\n\n========================================\n\n');
              handleCopyText('carousel_plan_all', combinedText);
            }}
            className="px-3.5 py-1.5 bg-[#fffdf8] hover:bg-stone-100 text-[#1f2933] border border-[#e7e0d4] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedStates['carousel_plan_all'] ? (
              <>
                <Check size={13} className="text-[#0f766e]" />
                <span className="text-[#0f766e]">Semua Slide Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Salin Seluruh Blueprint</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Strategy Overview Card (Belief Shift, Core Promise & Alignment) */}
      <div className="bg-[#fffdf8] border border-[#e7e0d4] p-4 rounded-2xl space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e7e0d4] pb-2.5">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-[#0f766e]" />
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Belief Journey &amp; Goal Strategy</span>
          </div>
          {alignmentCheck && (
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${
              alignmentCheck.isAligned
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {alignmentCheck.isAligned ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span>Sesuai Corong {funnelStage}</span>
                </>
              ) : (
                <>
                  <AlertCircle size={12} className="text-amber-600" />
                  <span>Penyesuaian Corong Diterapkan</span>
                </>
              )}
            </div>
          )}
        </div>

        {alignmentCheck && !alignmentCheck.isAligned && alignmentCheck.issue && (
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertCircle size={13} className="text-amber-700" />
              <span>Catatan Penyelarasan Pesan:</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">{alignmentCheck.issue}</p>
            {alignmentCheck.fixApplied && (
              <p className="text-emerald-800 text-[11px] font-medium pt-1">
                <strong>Koreksi:</strong> {alignmentCheck.fixApplied}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {plan.current_belief && plan.desired_belief && (
            <div className="bg-[#f6f3ee] p-3 rounded-xl border border-[#e7e0d4] space-y-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Transformasi Persepsi</span>
              <div className="flex items-start gap-2 text-stone-700">
                <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 text-[10px] font-bold shrink-0">Lama</span>
                <p className="text-[11px] leading-snug">{plan.current_belief}</p>
              </div>
              <div className="flex items-center justify-center py-0.5 text-stone-400">
                <ArrowRight size={13} />
              </div>
              <div className="flex items-start gap-2 text-stone-900">
                <span className="px-1.5 py-0.5 rounded bg-[#0f766e]/15 text-[#0f766e] text-[10px] font-bold shrink-0">Baru</span>
                <p className="text-[11px] font-medium leading-snug">{plan.desired_belief}</p>
              </div>
            </div>
          )}

          <div className="bg-[#f6f3ee] p-3 rounded-xl border border-[#e7e0d4] space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Core Promise</span>
              <p className="text-stone-900 font-semibold text-xs leading-relaxed">{plan.core_promise || plan.content_goal || '-'}</p>
            </div>
            {plan.primary_cta_text && (
              <div className="pt-2 border-t border-[#e7e0d4] flex items-center justify-between text-[11px]">
                <span className="text-stone-500 font-medium">Primary CTA ({plan.primary_cta_type || 'Action'}):</span>
                <span className="font-bold text-[#0f766e] bg-[#0f766e]/10 px-2 py-0.5 rounded-md border border-[#0f766e]/20">
                  {plan.primary_cta_text}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Horizontal Slide Timeline Navigator */}
      <div className="bg-[#fffdf8] p-3.5 rounded-2xl border border-[#e7e0d4] shadow-xs">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-[#0f766e]" />
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">Navigasi Alur Slide ({slides.length} Slide)</span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">Klik slide untuk melihat struktur 3-lapis</span>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 custom-scrollbar">
          {slides.map((slide: any) => {
            const isActive = activeSlide && activeSlide.slide === slide.slide;
            const slideVf = slide.visual_format || (slide.slide === 1 ? 'photography' : 'infographic');
            return (
              <button
                key={slide.slide}
                onClick={() => setActiveSlideNumber(slide.slide)}
                className={`px-3 py-2.5 rounded-xl border text-center transition-all min-w-[110px] cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#0f766e] border-[#0f766e] text-white font-bold shadow-xs'
                    : 'bg-[#f6f3ee] border-[#e7e0d4] text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest opacity-85 mb-0.5">
                  <span>Slide {slide.slide}</span>
                  <span className={`px-1 rounded text-[8px] font-bold ${
                    slideVf === 'photography' 
                      ? (isActive ? 'bg-teal-900/50 text-teal-100' : 'bg-stone-200 text-stone-700')
                      : slideVf === 'infographic'
                      ? (isActive ? 'bg-emerald-900/50 text-emerald-100' : 'bg-emerald-100 text-emerald-800')
                      : (isActive ? 'bg-amber-900/50 text-amber-100' : 'bg-amber-100 text-amber-800')
                  }`}>
                    {slideVf === 'photography' ? 'PHOTO' : slideVf === 'infographic' ? 'INFO' : 'HYBRID'}
                  </span>
                </div>
                <div className="text-xs font-bold capitalize truncate max-w-[100px]">{slide.role || `Slide ${slide.slide}`}</div>
                {slide.emotional_state && (
                  <div className={`text-[9px] truncate max-w-[100px] mt-0.5 ${isActive ? 'text-teal-100' : 'text-stone-500'}`}>
                    {slide.emotional_state}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Slide Content & 3-Layer Structure */}
      {activeSlide && (
        <div className="bg-[#fffdf8] border border-[#e7e0d4] p-5 rounded-2xl space-y-4 shadow-xs">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e7e0d4]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#0f766e] text-white text-[11px] font-mono font-bold uppercase tracking-wider shadow-xs">
                Slide {activeSlide.slide} / {slides.length}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 border border-[#e7e0d4] text-[11px] font-bold text-stone-800 capitalize">
                Peran: {activeSlide.role}
              </span>
              
              {/* Visual Format Badge */}
              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                visualFormat === 'photography'
                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                  : visualFormat === 'infographic'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {visualFormat === 'photography' ? (
                  <>
                    <Camera size={12} />
                    <span>Photography</span>
                  </>
                ) : visualFormat === 'infographic' ? (
                  <>
                    <BarChart3 size={12} />
                    <span>Infographic</span>
                  </>
                ) : (
                  <>
                    <Layers2 size={12} />
                    <span>Hybrid</span>
                  </>
                )}
              </div>

              {activeSlide.emotional_state && (
                <span className="px-2.5 py-0.5 rounded-lg bg-[#f6f3ee] border border-[#e7e0d4] text-[10px] font-medium text-stone-600">
                  Emosi: {activeSlide.emotional_state}
                </span>
              )}
            </div>

            {/* Single Unified Copy Button on Main UI */}
            <button
              onClick={() => {
                const slideCopy = formatSlideFullText(activeSlide);
                handleCopyText(`slide_main_copy_${activeSlideNum}`, slideCopy);
              }}
              className="px-3.5 py-1.5 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copiedStates[`slide_main_copy_${activeSlideNum}`] ? (
                <>
                  <Check size={13} />
                  <span>Prompt Slide {activeSlideNum} Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Salin Prompt Slide {activeSlideNum}</span>
                </>
              )}
            </button>
          </div>

          {/* Next Step Links when prompt slide is copied */}
          <PromptNextStepLinks 
            show={Boolean(nextStepVisibleKeys?.[`slide_main_copy_${activeSlideNum}`])} 
            onDismiss={() => handleDismissNextStep?.(`slide_main_copy_${activeSlideNum}`)}
          />

          {/* Headline & Body Copy */}
          <div className="space-y-3.5">
            <div className="bg-[#f6f3ee]/60 p-3.5 rounded-xl border border-[#e7e0d4] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Headline Slide</span>
                <button
                  onClick={() => handleCopyText(`slide_hl_${activeSlide.slide}`, activeSlide.headline)}
                  className="text-[10px] font-bold text-stone-600 hover:text-[#0f766e] flex items-center gap-1 transition-colors"
                >
                  {copiedStates[`slide_hl_${activeSlide.slide}`] ? <Check size={11} className="text-[#0f766e]" /> : <Copy size={11} />}
                  <span>{copiedStates[`slide_hl_${activeSlide.slide}`] ? 'Tersalin' : 'Salin Headline'}</span>
                </button>
              </div>
              <h3 className="text-stone-900 font-bold text-base md:text-lg leading-snug">
                {activeSlide.headline}
              </h3>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Isi Naskah / Body Copy</span>
                <button
                  onClick={() => handleCopyText(`slide_body_${activeSlide.slide}`, activeSlide.body)}
                  className="text-[10px] font-bold text-stone-600 hover:text-[#0f766e] flex items-center gap-1 transition-colors"
                >
                  {copiedStates[`slide_body_${activeSlide.slide}`] ? <Check size={11} className="text-[#0f766e]" /> : <Copy size={11} />}
                  <span>{copiedStates[`slide_body_${activeSlide.slide}`] ? 'Tersalin' : 'Salin Body'}</span>
                </button>
              </div>
              <div className="text-stone-800 font-medium text-xs leading-relaxed bg-[#f6f3ee] p-4 rounded-xl border border-[#e7e0d4] whitespace-pre-wrap">
                {activeSlide.body}
              </div>
            </div>

            {activeSlide.swipe_bridge && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Swipe Bridge:</span>
                <span className="text-xs font-semibold text-[#0f766e] bg-[#0f766e]/10 border border-[#0f766e]/20 px-3 py-1 rounded-lg">
                  &rarr; {activeSlide.swipe_bridge}
                </span>
              </div>
            )}

            {/* 3-LAYER ARCHITECTURE DISPLAY */}
            <div className="pt-2 space-y-3">
              {/* LAPISAN 1: CREATIVE STRATEGY */}
              <div className="bg-[#fffdf8] border border-[#e7e0d4] p-4 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#e7e0d4] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#0f766e]/10 text-[#0f766e] rounded text-[10px] font-mono font-bold">LAPISAN 1</span>
                    <span className="text-xs font-bold text-stone-900">Creative Strategy (Strategi Pesan)</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase">{creativeStrategy.slide_role || activeSlide.role} &bull; {funnelStage}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="bg-[#f6f3ee] p-2.5 rounded-lg border border-[#e7e0d4]">
                    <span className="text-stone-500 text-[9px] uppercase font-bold block mb-0.5">Visual Objective</span>
                    <p className="text-stone-800 leading-snug">{creativeStrategy.visual_objective || activeSlide.visual_intent || '-'}</p>
                  </div>

                  <div className="bg-[#f6f3ee] p-2.5 rounded-lg border border-[#e7e0d4]">
                    <span className="text-stone-500 text-[9px] uppercase font-bold block mb-0.5">Core Message</span>
                    <p className="text-stone-800 font-semibold leading-snug">{creativeStrategy.core_message || activeSlide.headline || '-'}</p>
                  </div>

                  <div className="bg-[#f6f3ee] p-2.5 rounded-lg border border-[#e7e0d4]">
                    <span className="text-stone-500 text-[9px] uppercase font-bold block mb-0.5">Audience Emotion</span>
                    <p className="text-stone-800 leading-snug">{creativeStrategy.audience_emotion || activeSlide.emotional_state || '-'}</p>
                  </div>

                  <div className="bg-[#f6f3ee] p-2.5 rounded-lg border border-[#e7e0d4]">
                    <span className="text-stone-500 text-[9px] uppercase font-bold block mb-0.5">Visual Concept &amp; Text Overlay</span>
                    <p className="text-stone-800 leading-snug">
                      <strong className="text-stone-900">Overlay:</strong> &ldquo;{creativeStrategy.text_overlay || activeSlide.headline}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* LAPISAN 2 & 3: VISUAL FORMAT & VISUAL PRODUCTION */}
              <div className="bg-[#fffdf8] border border-[#e7e0d4] p-4 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#e7e0d4] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-[10px] font-mono font-bold">LAPISAN 2 &amp; 3</span>
                    <span className="text-xs font-bold text-stone-900">Visual Format &amp; Visual Production (Instruksi Eksekusi)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    visualFormat === 'photography' ? 'bg-sky-100 text-sky-800' : visualFormat === 'infographic' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Format: {visualFormat}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="bg-[#f6f3ee] p-2.5 rounded-lg border border-[#e7e0d4] md:col-span-2">
                    <span className="text-stone-500 text-[9px] uppercase font-bold block mb-0.5">
                      {visualFormat === 'photography' ? 'Subject & Action (Real Person / Scene)' : 'Subject / Object Diagram & Graphic Metaphor'}
                    </span>
                    <p className="text-stone-800 leading-snug font-medium">{visualProduction.subject || '-'}</p>
                    {visualProduction.action && (
                      <p className="text-stone-600 text-[10px] mt-1 pt-1 border-t border-[#e7e0d4]">
                        <strong>Aksi/Anotasi:</strong> {visualProduction.action}
                      </p>
                    )}
                  </div>

                  <div className="bg-[#f6f3ee] p-2.5 rounded-lg border border-[#e7e0d4]">
                    <span className="text-stone-500 text-[9px] uppercase font-bold block mb-0.5">Composition &amp; Layout</span>
                    <p className="text-stone-800 leading-snug">{visualProduction.composition || activeSlide.text_zone || 'Upper Third'}</p>
                    {visualProduction.negative_space && (
                      <p className="text-stone-500 text-[10px] mt-1">
                        Neg. Space: {visualProduction.negative_space}
                      </p>
                    )}
                  </div>

                  <div className="bg-[#f6f3ee] p-2.5 rounded-lg border border-[#e7e0d4]">
                    <span className="text-stone-500 text-[9px] uppercase font-bold block mb-0.5">Typography &amp; Layout Grid</span>
                    <p className="text-stone-800 leading-snug">{visualProduction.typography || 'Headline 28pt bold, body 16pt'}</p>
                  </div>

                  <div className="bg-[#f6f3ee] p-2.5 rounded-lg border border-[#e7e0d4]">
                    <span className="text-stone-500 text-[9px] uppercase font-bold block mb-0.5">Background &amp; Palette Mood</span>
                    <p className="text-stone-800 leading-snug">{visualProduction.background || '#FAF9F6'} &bull; {visualProduction.color_mood || 'Professional'}</p>
                  </div>

                  <div className="bg-[#f6f3ee] p-2.5 rounded-lg border border-[#e7e0d4]">
                    <span className="text-stone-500 text-[9px] uppercase font-bold block mb-0.5">Format Guard</span>
                    <p className="text-stone-800 leading-snug">
                      {visualFormat === 'infographic' 
                        ? 'Tanpa lensa/kamera fisik. Fokus pada struktur kartu UI, diagram alur, dan hierarki tipografi.'
                        : visualFormat === 'photography'
                        ? 'Gaya fotografi editorial otentik dengan pencahayaan natural hangat.'
                        : 'Kombinasi foto subjek nyata dengan overlay kartu informasi grafis.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. COLLAPSIBLE TECHNICAL / DETAIL TEKNIS SECTION */}
            <details className="group border border-[#e7e0d4] bg-[#f6f3ee]/80 rounded-xl overflow-hidden shadow-xs transition-all">
              <summary className="p-3 flex items-center justify-between font-bold text-xs text-stone-700 hover:text-stone-900 cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <Sliders size={13} className="text-[#0f766e]" />
                  <span>Detail Teknis &bull; Slide {activeSlide.slide}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-500 text-[11px]">
                  <span>Prompt Image &amp; Layout</span>
                  <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                </div>
              </summary>
              
              <div className="p-4 pt-2 border-t border-[#e7e0d4] space-y-3 text-xs bg-[#fffdf8]">
                {/* Detail Teknis 1: Prompt Image Saja */}
                {activeSlide.slide_image_prompt && (
                  <div className="bg-stone-900 text-stone-100 p-3.5 rounded-xl space-y-2 border border-stone-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-teal-400 text-[11px] font-bold">
                        <Sparkles size={12} />
                        <span>Prompt Image Saja &bull; Slide {activeSlide.slide} (4:5 Format)</span>
                      </div>
                      <button
                        onClick={() => handleCopyText(`slide_img_prompt_only_${activeSlide.slide}`, activeSlide.slide_image_prompt)}
                        className="px-2.5 py-1 bg-[#0f766e] hover:bg-[#0f766e]/85 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        {copiedStates[`slide_img_prompt_only_${activeSlide.slide}`] ? (
                          <>
                            <Check size={11} />
                            <span>Prompt Image Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Salin Prompt Image Saja</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-[10px] leading-relaxed text-stone-300 bg-stone-950/80 p-3 rounded-lg border border-stone-800 whitespace-pre-wrap select-all">
                      {activeSlide.slide_image_prompt}
                    </div>
                  </div>
                )}

                {/* Detail Teknis 2: Prompt Layout Saja */}
                {activeSlide.production_prompt && (
                  <div className="bg-[#f6f3ee] text-stone-800 p-3.5 rounded-xl space-y-2 border border-[#e7e0d4]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-stone-700 text-[11px] font-bold">
                        <Palette size={12} className="text-[#0f766e]" />
                        <span>Prompt Layout Saja &bull; Slide {activeSlide.slide}</span>
                      </div>
                      <button
                        onClick={() => handleCopyText(`slide_layout_prompt_only_${activeSlide.slide}`, activeSlide.production_prompt)}
                        className="px-2.5 py-1 bg-[#fffdf8] hover:bg-stone-200 text-stone-800 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border border-[#e7e0d4] cursor-pointer"
                      >
                        {copiedStates[`slide_layout_prompt_only_${activeSlide.slide}`] ? (
                          <>
                            <Check size={11} className="text-[#0f766e]" />
                            <span className="text-[#0f766e]">Prompt Layout Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Salin Prompt Layout Saja</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-[10px] leading-relaxed text-stone-700 bg-[#fffdf8] p-3 rounded-lg border border-[#e7e0d4] whitespace-pre-wrap select-all">
                      {activeSlide.production_prompt}
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      )}

      {/* 6. Collapsible Technical & Visual System Details */}
      <details className="group border border-[#e7e0d4] bg-[#f6f3ee]/60 rounded-2xl overflow-hidden shadow-xs transition-all">
        <summary className="p-3.5 flex items-center justify-between font-bold text-xs text-stone-700 hover:text-stone-900 cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-[#0f766e]" />
            <span>Detail Teknis, Alasan Slide &amp; Sistem Visual Carousel</span>
          </div>
          <ChevronDown size={14} className="text-stone-500 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="p-4 pt-2 border-t border-[#e7e0d4] space-y-3 text-xs">
          {plan.belief_journey_summary && (
            <div className="bg-[#fffdf8] p-3.5 rounded-xl border border-[#e7e0d4]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Ringkasan Alur Keyakinan (Belief Journey)</span>
              <p className="text-stone-800 leading-relaxed">{plan.belief_journey_summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.slide_count_reason && (
              <div className="bg-[#fffdf8] p-3.5 rounded-xl border border-[#e7e0d4]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Alasan Jumlah Slide ({plan.slide_count || slides.length} Slide)</span>
                <p className="text-stone-800 leading-relaxed">{plan.slide_count_reason}</p>
              </div>
            )}
            {plan.visual_system_notes && (
              <div className="bg-[#fffdf8] p-3.5 rounded-xl border border-[#e7e0d4]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">Catatan Sistem Visual</span>
                <p className="text-stone-800 leading-relaxed">{plan.visual_system_notes}</p>
              </div>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}
