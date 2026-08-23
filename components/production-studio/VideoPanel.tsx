import React from 'react';
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Zap,
  ChevronLeft,
  Video,
  Clipboard,
  Sliders,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  PlayCircle,
  MessageSquare,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';
import { Json2VideoApiKeyControl } from '@/components/Json2VideoApiKeyControl';
import { VideoAssetUrlInput } from '@/components/VideoAssetUrlInput';
import { PromptNextStepLinks } from './PromptNextStepLinks';

export default function VideoPanel(props: any) {
  const {
    activeItem,
    activeContext,
    handleCopyText,
    copiedStates,
    nextStepVisibleKeys,
    handleDismissNextStep,
    getInitialDraft,
    videoOutput,
    tryParseJSON,
    normalizeFunnelStage,
    getFunnelRules,
    selectedVideoId,
    handleSelectany,
    videoMode,
    setVideoMode,
    characterImageUrl,
    setCharacterImageUrl,
    productScreenImageUrl,
    setProductScreenImageUrl,
    coverImageUrl,
    setCoverImageUrl,
    videoOutputMode,
    setVideoOutputMode,
    showToast,
    handleGenerateJson2VideoPayload,
    isRenderingVideo,
    renderJobId,
    renderJobData,
    renderError,
    isCheckingStatus,
    flowCustomCreator,
    flowCustomSetting,
    flowCustomDialogues,
    handleRenderVideo,
    handleCheckRenderStatus,
    json2VideoPayload,
    characterDNA,
    getGoogleFlowVideoPack,
  } = props;

  if (!videoOutput) {
    return (
      <div className="whitespace-pre-wrap font-sans text-stone-800 text-xs leading-relaxed">
        {videoOutput || getInitialDraft('video', activeItem, activeContext)}
      </div>
    );
  }

  let videoStyles: any[] | null = null;
  try {
    const parsed = tryParseJSON(videoOutput);
    if (Array.isArray(parsed) && parsed.length > 0) {
      videoStyles = parsed as any[];
    }
  } catch (e) {
    videoStyles = null;
  }

  if (!videoStyles) {
    return (
      <div className="whitespace-pre-wrap font-sans text-stone-800 text-xs leading-relaxed">
        {videoOutput}
      </div>
    );
  }

  const activeVideo = videoStyles.find((v) => v.id === selectedVideoId) || videoStyles[0];
  const videoFunnelStage = normalizeFunnelStage(activeItem.jenis);

  // VIEW 1: Initial State - Belum ada mode yang dipilih (HANYA 2 PILIHAN BESAR)
  if (!videoOutputMode) {
    return (
      <div className="space-y-6">
        <div className="bg-[#fffdf8] border border-[#e7e0d4] p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e0d4]">
            <div>
              <div className="flex items-center gap-2">
                <Video size={16} className="text-[#0f766e]" />
                <h3 className="text-sm font-bold text-[#1f2933]">Pilih Alur Produksi Video Vertikal (9:16)</h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Tentukan alur produksi video yang ingin digunakan untuk naskah ini.
              </p>
            </div>

            {/* Video Style Selection Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              {videoStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleSelectany(style.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    selectedVideoId === style.id
                      ? 'bg-[#0f766e] text-white shadow-xs'
                      : 'bg-[#f6f3ee] text-stone-600 hover:text-stone-900 hover:bg-stone-200 border border-[#e7e0d4]'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${selectedVideoId === style.id ? 'bg-white' : 'bg-stone-400'}`} />
                  <span>{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DUA PILIHAN BESAR ALUR VIDEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* OPSI 1: Google Flow Prompt */}
            <button
              type="button"
              onClick={() => setVideoOutputMode('google_flow')}
              className="p-5 rounded-2xl border-2 border-[#0f766e]/30 bg-[#fffdf8] hover:border-[#0f766e] hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#0f766e]/10 text-[#0f766e] border border-[#0f766e]/20">
                    Alur Prompt AI &bull; 3 Scene
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#0f766e]/10 group-hover:bg-[#0f766e] text-[#0f766e] group-hover:text-white flex items-center justify-center transition-colors">
                    <Sparkles size={13} />
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1f2933] group-hover:text-[#0f766e] transition-colors">
                    Google Flow Prompt
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mt-1">
                    Naskah 3 scene vertikal (9:16) berdurasi @ 8 detik tersinkronisasi dialog Bahasa Indonesia &amp; visual prompt untuk Google FX Studio / Flow.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[#e7e0d4] flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>Format ALCO Creative System</span>
                <span className="text-[#0f766e] font-bold group-hover:translate-x-0.5 transition-transform">
                  Pilih Google Flow &rarr;
                </span>
              </div>
            </button>

            {/* OPSI 2: Render via API JSON2Video */}
            <button
              type="button"
              onClick={() => setVideoOutputMode('api')}
              className="p-5 rounded-2xl border-2 border-[#b7791f]/30 bg-[#fffdf8] hover:border-[#b7791f] hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    Otomatisasi Render &bull; Cloud Engine
                  </span>
                  <span className="w-6 h-6 rounded-full bg-amber-100 group-hover:bg-[#b7791f] text-[#b7791f] group-hover:text-white flex items-center justify-center transition-colors">
                    <Video size={13} />
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1f2933] group-hover:text-[#b7791f] transition-colors">
                    Render via API JSON2Video
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mt-1">
                    Render video otomatis langsung menggunakan API Key JSON2Video pribadi, atau salin payload JSON lengkap untuk eksekusi manual.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-[#e7e0d4] flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>BYO API Key &bull; Free 600 credits</span>
                <span className="text-[#b7791f] font-bold group-hover:translate-x-0.5 transition-transform">
                  Pilih Render API &rarr;
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: Tampilan Setelah Memilih Alur ('google_flow' atau 'api')
  return (
    <div className="space-y-5">
      {/* Active Mode Navigation Bar & Style Selection */}
      <div className="bg-[#fffdf8] border border-[#e7e0d4] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setVideoOutputMode(null)}
            className="px-3 py-1.5 bg-[#f6f3ee] hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 border border-[#e7e0d4] cursor-pointer shadow-xs"
            title="Ganti Pilihan Alur Video"
          >
            <ChevronLeft size={14} />
            <span>Ganti Alur</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                videoOutputMode === 'google_flow'
                  ? 'bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/25'
                  : 'bg-amber-100 text-amber-900 border-amber-200'
              }`}
            >
              {videoOutputMode === 'google_flow' ? 'Alur: Google Flow Prompt' : 'Alur: Render via API JSON2Video'}
            </span>
          </div>
        </div>

        {/* Style Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {videoStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleSelectany(style.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                selectedVideoId === style.id
                  ? 'bg-[#0f766e] text-white shadow-xs'
                  : 'bg-[#f6f3ee] text-stone-600 hover:text-stone-900 hover:bg-stone-200 border border-[#e7e0d4]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${selectedVideoId === style.id ? 'bg-white' : 'bg-stone-400'}`} />
              <span>{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ALUR 1: GOOGLE FLOW PROMPT WORKFLOW */}
      {videoOutputMode === 'google_flow' && (
        <div className="space-y-5">
          {/* SCRIPT STORYBOARD RINGKAS (Hook -> Masalah -> Solusi -> Proof -> CTA) */}
          <div className="bg-[#fffdf8] border border-[#e7e0d4] p-4.5 rounded-2xl space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7e0d4]">
              <div className="flex items-center gap-2">
                <PlayCircle size={15} className="text-[#0f766e]" />
                <h4 className="text-xs font-bold text-[#1f2933]">Naskah Monolog &amp; Struktur Alur Video</h4>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">Ikuti urutan salin per scene di bawah</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1.5">
                <span className="px-2 py-0.5 rounded bg-rose-100 border border-rose-200 text-[9px] font-bold text-rose-800 uppercase tracking-wide block w-fit">
                  1. Hook
                </span>
                <p className="text-stone-900 leading-relaxed font-semibold italic text-[11px]">
                  &ldquo;{activeVideo.script?.hook}&rdquo;
                </p>
              </div>

              <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1.5">
                <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-200 text-[9px] font-bold text-amber-800 uppercase tracking-wide block w-fit">
                  2. Masalah
                </span>
                <p className="text-stone-800 leading-relaxed text-[11px]">
                  &ldquo;{activeVideo.script?.masalah}&rdquo;
                </p>
              </div>

              <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-[9px] font-bold text-emerald-800 uppercase tracking-wide block w-fit">
                  3. Solusi
                </span>
                <p className="text-stone-800 leading-relaxed text-[11px]">
                  &ldquo;{activeVideo.script?.solusi}&rdquo;
                </p>
              </div>

              <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1.5">
                <span className="px-2 py-0.5 rounded bg-blue-100 border border-blue-200 text-[9px] font-bold text-blue-800 uppercase tracking-wide block w-fit">
                  4. Proof
                </span>
                <p className="text-stone-800 leading-relaxed text-[11px]">
                  &ldquo;{activeVideo.script?.proof}&rdquo;
                </p>
              </div>

              <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1.5">
                <span className="px-2 py-0.5 rounded bg-purple-100 border border-purple-200 text-[9px] font-bold text-purple-800 uppercase tracking-wide block w-fit">
                  5. CTA
                </span>
                <p className="text-stone-900 leading-relaxed font-bold text-[11px]">
                  &ldquo;{activeVideo.script?.cta}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* 3 Scene Google Flow Action Toolbar & Cards */}
          <div className="space-y-4">
            {/* Blok Instruksi Urutan Kerja di Google Flow */}
            <div className="bg-[#fffdf8] border border-[#e7e0d4] rounded-2xl p-4.5 space-y-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7e0d4]">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#0f766e]" />
                  <h4 className="text-sm font-bold text-[#1f2933]">Urutan Kerja di Google Flow</h4>
                </div>
                <a
                  href="https://labs.google/fx/tools/flow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>Buka Google Flow</span>
                </a>
              </div>

              <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs text-stone-700">
                <li className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="leading-relaxed">
                    Salin <strong>Prompt Image Scene 1</strong>.
                  </span>
                </li>
                <li className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="leading-relaxed">
                    Klik <strong>Buka Google Flow</strong>, paste prompt image, lalu generate sampai gambar berhasil dibuat.
                  </span>
                </li>
                <li className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span className="leading-relaxed">
                    Salin <strong>Prompt Video Scene 1</strong>, paste ke Flow, lalu generate video.
                  </span>
                </li>
                <li className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    4
                  </span>
                  <span className="leading-relaxed">
                    Ulangi urutan yang sama untuk <strong>Scene 2</strong>.
                  </span>
                </li>
                <li className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    5
                  </span>
                  <span className="leading-relaxed">
                    Ulangi urutan yang sama untuk <strong>Scene 3</strong>.
                  </span>
                </li>
              </ol>
            </div>

            {/* Render 3 Scene Cards */}
            {(() => {
              const googleFlowScenes = getGoogleFlowVideoPack(
                videoFunnelStage,
                activeItem,
                activeContext,
                activeVideo,
                characterDNA,
                flowCustomCreator,
                flowCustomSetting,
                flowCustomDialogues[activeVideo.id]
              );

              return (
                <div className="grid grid-cols-1 gap-4">
                  {googleFlowScenes.map((scene: any) => {
                    const sceneBadgeColor =
                      scene.sceneNumber === 1
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : scene.sceneNumber === 2
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                    const isImgCopied = copiedStates[`gflow_img_${scene.sceneNumber}_${activeVideo.id}`];
                    const isPromptCopied = copiedStates[`gflow_prompt_${scene.sceneNumber}_${activeVideo.id}`];

                    return (
                      <div
                        key={scene.sceneNumber}
                        className="bg-[#fffdf8] border border-[#e7e0d4] rounded-2xl p-5 space-y-4 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e7e0d4]">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${sceneBadgeColor}`}
                            >
                              Scene {scene.sceneNumber} &bull; {scene.duration}
                            </span>
                            <h4 className="text-sm font-bold text-[#1f2933]">{scene.title}</h4>
                            <span className="text-xs text-stone-500 font-mono">({scene.shotType})</span>
                          </div>
                        </div>

                        {/* Dialogue Field */}
                        <div className="p-3 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-stone-600 flex items-center gap-1">
                              <MessageSquare size={12} className="text-[#0f766e]" /> Naskah Dialog Audio (Bahasa Indonesia):
                            </span>
                            <span className="text-[10px] text-stone-500">{scene.role}</span>
                          </div>
                          <p className="text-xs text-stone-900 font-medium leading-relaxed italic bg-[#fffdf8] p-2.5 rounded-lg border border-[#e7e0d4]/80">
                            &ldquo;{scene.dialogue}&rdquo;
                          </p>
                        </div>

                        {/* 2 Sub-boxes: Step 1 (Image Prompt) and Step 2 (Video Prompt) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                          {/* Box 1: Step 1 - Start Frame Image Prompt */}
                          <div className="space-y-2.5 flex flex-col justify-between p-4 bg-[#f6f3ee]/60 border border-[#e7e0d4] rounded-xl">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <ImageIcon size={13} className="text-blue-600" /> 1. Start Frame Image Prompt (9:16)
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
                              onClick={() =>
                                handleCopyText(`gflow_img_${scene.sceneNumber}_${activeVideo.id}`, scene.imagePrompt)
                              }
                              className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border ${
                                isImgCopied
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : 'bg-[#fffdf8] hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300'
                              }`}
                            >
                              {isImgCopied ? (
                                <>
                                  <Check size={14} className="text-emerald-600" />
                                  <span>Prompt Image Scene {scene.sceneNumber} Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  <span>1. Salin Prompt Image Scene {scene.sceneNumber}</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Box 2: Step 2 - Google Flow Video Prompt */}
                          <div className="space-y-2.5 flex flex-col justify-between p-4 bg-[#f6f3ee]/60 border border-[#e7e0d4] rounded-xl">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#0f766e] uppercase tracking-wider flex items-center gap-1.5">
                                  <Sparkles size={13} className="text-[#0f766e]" /> 2. Google Flow Video Prompt (Veo / FX Studio)
                                </span>
                              </div>
                              <div className="p-3 bg-[#fffdf8] border border-[#e7e0d4] rounded-xl min-h-[90px]">
                                <p className="text-stone-800 font-mono text-[11px] leading-relaxed select-all">
                                  {scene.googleFlowPrompt}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(
                                  `gflow_prompt_${scene.sceneNumber}_${activeVideo.id}`,
                                  scene.googleFlowPrompt
                                )
                              }
                              className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border ${
                                isPromptCopied
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : 'bg-[#0f766e] hover:bg-[#0f766e]/90 border-[#0f766e] text-white'
                              }`}
                            >
                              {isPromptCopied ? (
                                <>
                                  <Check size={14} className="text-emerald-600" />
                                  <span>Prompt Video Scene {scene.sceneNumber} Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles size={14} />
                                  <span>2. Salin Prompt Video Scene {scene.sceneNumber}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Next step links when either prompt image or prompt video in this scene is copied */}
                        <PromptNextStepLinks
                          show={Boolean(
                            nextStepVisibleKeys?.[`gflow_img_${scene.sceneNumber}_${activeVideo.id}`] ||
                            nextStepVisibleKeys?.[`gflow_prompt_${scene.sceneNumber}_${activeVideo.id}`]
                          )}
                          onDismiss={() => {
                            handleDismissNextStep?.(`gflow_img_${scene.sceneNumber}_${activeVideo.id}`);
                            handleDismissNextStep?.(`gflow_prompt_${scene.sceneNumber}_${activeVideo.id}`);
                          }}
                          className="mt-2"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ALUR 2: RENDER VIA API (JSON2VIDEO) WORKFLOW */}
      {videoOutputMode === 'api' && (
        <div className="space-y-5">
          <div className="bg-[#fffdf8] border border-[#e7e0d4] p-5 rounded-2xl space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#e7e0d4]">
              <div>
                <h3 className="text-xs font-bold uppercase text-[#1f2933] tracking-wider flex items-center gap-1.5">
                  <Video size={14} className="text-[#b7791f]" />
                  Render Video Otomatis &amp; JSON2Video Payload
                </h3>
                <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                  Render video langsung dengan API Key JSON2Video, atau generate payload untuk salin manual.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Json2VideoApiKeyControl onToast={showToast} variant="compact" />

                <button
                  type="button"
                  onClick={() => handleGenerateJson2VideoPayload(activeVideo)}
                  className="px-3.5 py-2 bg-[#f6f3ee] hover:bg-stone-200 text-stone-800 border border-[#e7e0d4] font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Clipboard size={13} />
                  Generate Payload
                </button>

                <button
                  type="button"
                  disabled={isRenderingVideo}
                  onClick={() => handleRenderVideo(activeVideo)}
                  className="px-4 py-2 bg-[#b7791f] hover:bg-[#b7791f]/90 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isRenderingVideo ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Rendering...
                    </>
                  ) : (
                    <>
                      <Zap size={13} />
                      Render Video
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {renderError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>Render Error / API Key Alert</span>
                </div>
                <p className="text-[11px] leading-relaxed">{renderError}</p>
              </div>
            )}

            {/* Active Render Job Status Panel */}
            {(isRenderingVideo || renderJobId || renderJobData) && (
              <div className="p-4 bg-[#f6f3ee] border border-[#e7e0d4] rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#e7e0d4]">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                    </span>
                    <span className="text-xs font-bold text-stone-900">Status Production Job</span>
                    {renderJobId && (
                      <span className="text-[10px] font-mono text-stone-600 bg-[#fffdf8] px-2 py-0.5 rounded border border-[#e7e0d4]">
                        ID: {renderJobId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {renderJobId && (
                      <button
                        type="button"
                        disabled={isCheckingStatus}
                        onClick={() => handleCheckRenderStatus(renderJobId)}
                        className="px-3 py-1 bg-[#fffdf8] hover:bg-stone-100 text-xs font-bold text-stone-700 rounded-lg transition border border-[#e7e0d4] flex items-center gap-1.5 shadow-xs"
                      >
                        {isCheckingStatus ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        Check Status
                      </button>
                    )}

                    {(renderJobData?.movie?.url ||
                      renderJobData?.url ||
                      renderJobData?.movie?.draft_url ||
                      renderJobData?.draft_url) && (
                      <a
                        href={
                          renderJobData?.movie?.url ||
                          renderJobData?.url ||
                          renderJobData?.movie?.draft_url ||
                          renderJobData?.draft_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1 bg-[#0f766e] hover:bg-[#0f766e]/90 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5"
                      >
                        <ExternalLink size={12} />
                        Open Video
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-500 text-[10px] font-bold uppercase block">Render Status</span>
                    <span className="text-stone-900 font-mono font-bold capitalize">
                      {isRenderingVideo
                        ? 'Rendering...'
                        : renderJobData?.movie?.status || renderJobData?.status || 'Submitted'}
                    </span>
                  </div>
                  {(renderJobData?.movie?.message || renderJobData?.message) && (
                    <div>
                      <span className="text-stone-500 text-[10px] font-bold uppercase block">Pesan API</span>
                      <span className="text-stone-800 font-mono">
                        {renderJobData?.movie?.message || renderJobData?.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generated JSON Payload Display */}
            {json2VideoPayload?.key === `${activeItem.no || 1}_${activeVideo.id}` ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Free account JSON2Video menyediakan 600 credits awal, maksimal 60 detik per video.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyText(`json2video_${activeVideo.id}`, json2VideoPayload.text)}
                    className="px-3 py-1.5 bg-[#f6f3ee] hover:bg-stone-200 text-stone-800 border border-[#e7e0d4] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    {copiedStates[`json2video_${activeVideo.id}`] ? (
                      <>
                        <Check size={12} className="text-[#0f766e]" />
                        <span className="text-[#0f766e]">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Payload</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="max-h-80 overflow-auto custom-scrollbar whitespace-pre-wrap break-words rounded-xl border border-[#e7e0d4] bg-[#f6f3ee] p-3 text-[10px] leading-relaxed text-stone-800 font-mono">
                  {json2VideoPayload.text}
                </pre>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#e7e0d4] bg-[#f6f3ee]/50 p-4 text-xs text-stone-500 leading-relaxed">
                Klik &quot;Render Video&quot; untuk langsung merender video via API, atau &quot;Generate Payload&quot; untuk menyalin payload JSON.
              </div>
            )}
          </div>

          {/* Collapsible Section: Detail Teknis & Konfigurasi Aset Video (UX Focus #4 & #6) */}
          <details className="group border border-[#e7e0d4] bg-[#f6f3ee]/50 rounded-2xl overflow-hidden shadow-xs transition-all">
            <summary className="p-3.5 flex items-center justify-between font-bold text-xs text-stone-700 hover:text-stone-900 cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <Sliders size={14} className="text-[#0f766e]" />
                <span>Detail Teknis, Konfigurasi Mode &amp; Aset Video</span>
              </div>
              <ChevronDown size={15} className="group-open:rotate-180 transition-transform text-stone-500" />
            </summary>
            <div className="p-4 pt-2 border-t border-[#e7e0d4] space-y-4 text-xs">
              {/* Video Mode Selection */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Mode Produksi Visual</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {[
                    { id: 'text_motion', title: 'Text Motion', desc: 'Video berbasis teks & motion graphic' },
                    { id: 'ugc_video', title: 'UGC Video', desc: 'Video dengan talent / karakter pembawa pesan' },
                    { id: 'asset_product', title: 'Asset Product', desc: 'Video memakai aset screenshot / produk' },
                  ].map((mode) => {
                    const isSelected = videoMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setVideoMode(mode.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#fffdf8] border-[#0f766e] shadow-xs'
                            : 'bg-[#fffdf8]/60 border-[#e7e0d4] text-stone-600 hover:bg-[#fffdf8]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#0f766e]' : 'text-stone-800'}`}>
                            {mode.title}
                          </span>
                          {isSelected && <Check size={12} className="text-[#0f766e]" />}
                        </div>
                        <p className="text-[10px] text-stone-500 leading-snug">{mode.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Video Visual Assets URLs */}
              <div className="space-y-3 pt-2 border-t border-[#e7e0d4]">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Aset Visual &amp; Direct URLs (HTTPS)</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <VideoAssetUrlInput
                    id="char-image-url-input"
                    label="Character Image URL"
                    badgeText="Latar UGC 9:16"
                    value={characterImageUrl}
                    onChange={setCharacterImageUrl}
                    placeholder="https://example.com/character.jpg"
                    aspectRatio="9:16"
                    helperText="Wajib URL HTTPS publik (Cloudinary, Imgur, Supabase)."
                    isCharacterUrl={true}
                  />
                  <VideoAssetUrlInput
                    id="product-screen-url-input"
                    label="Product Screen URL"
                    badgeText="Overlay Mockup"
                    value={productScreenImageUrl}
                    onChange={setProductScreenImageUrl}
                    placeholder="https://example.com/mockup.png"
                    aspectRatio="16:9"
                    helperText="URL HTTPS untuk tangkapan layar antarmuka atau produk."
                  />
                  <VideoAssetUrlInput
                    id="cover-image-url-input"
                    label="Cover Image URL"
                    badgeText="Poster / Scene 1"
                    value={coverImageUrl}
                    onChange={setCoverImageUrl}
                    placeholder="https://example.com/cover.jpg"
                    aspectRatio="9:16"
                    helperText="URL HTTPS untuk thumbnail atau visual pembuka."
                  />
                </div>
              </div>

              {/* Technical Strategy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#e7e0d4]">
                <div className="p-3 bg-[#fffdf8] border border-[#e7e0d4] rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Hook &amp; Pacing</span>
                  <p className="text-stone-800 font-semibold">{activeVideo.hookStyle || '-'}</p>
                  <p className="text-stone-500 text-[10px]">Pacing: {activeVideo.pacingStyle || '-'}</p>
                </div>
                <div className="p-3 bg-[#fffdf8] border border-[#e7e0d4] rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Arah Audio &amp; Voiceover</span>
                  <p className="text-stone-800">{activeVideo.audioDirection || '-'}</p>
                </div>
                <div className="p-3 bg-[#fffdf8] border border-[#e7e0d4] rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Raw Generator Prompt</span>
                  <p className="text-stone-700 font-mono text-[10px] leading-snug line-clamp-3">{activeVideo.videoPrompt || '-'}</p>
                </div>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
