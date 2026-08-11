'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Sparkles, FileText, Image as ImageIcon, Video, Layers, Users, Star, 
  Target, Zap, Check, Copy, RefreshCw, Eye, BrainCircuit, MessageSquare, Clipboard, 
  AlertCircle, CheckSquare, ListTodo, Sliders, PlayCircle, ExternalLink, Download, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentItem, SharedContentContext, CharacterDNA, CarouselPlan, CarouselSlidePlan } from '@/lib/content-contract';
import { getActiveProjectId, loadProjectData, saveProjectData, removeProjectData, getProjectCharacterDNA, saveProjectCharacterDNA } from '@/lib/storage';
import CharacterDNASection from '@/components/CharacterDNA';

// Helper to copy to clipboard safely
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

// Fallbacks for graceful empty-state handling
const itemFallback: ContentItem = {
  no: 1,
  tanggal: 'Rencana Hari Ini',
  jenis: 'TOFU (Awareness)',
  tujuan: 'Mengedukasi audiens tentang pentingnya optimasi digital funnel',
  hookType: 'Problem-Agitation-Solution (PAS)',
  headline: '3 Tanda Utama Konten Bisnis Anda Gagal Menghasilkan Penjualan!',
  body: 'Banyak pemilik bisnis merasa frustrasi karena konten mereka ditonton ribuan orang tapi nihil pembelian. Masalahnya bukan pada kualitas video, melainkan absennya penataan corong penjualan (funnel) yang selaras.',
  caption: 'Kenapa konten rame tapi sepi pembeli? 🤔 Jawabannya sederhana: Anda belum menata funnel TOFU-MOFU-BOFU! Yuk baca blueprint selengkapnya di bio. 🚀 #ALCOEngine #ContentFunnel',
  format: 'Single Image / Carousel',
  referensi: 'Blueprint ALCO v2',
  visual: 'Visual ilustrasi grafik corong 3D yang bocor di bagian tengah dengan neon aksen merah.',
  keterangan: 'Tampilkan teks headline berukuran besar (font minimal 64pt) dengan kontras yang kuat.',
  cta: 'Link Bio'
};

const contextFallback: SharedContentContext = {
  project_id: 'default_project',
  project_name: 'ALCO Engine Default',
  source: {
    origin: 'manual_context',
  },
  system_flags: {
    is_complete_for_planning: true,
    missing_required_fields: [],
  },
  brand_context: {
    brand_name: 'ALCO Engine',
    category: 'Software & Productivity Tool',
    brand_summary: 'Sistem terintegrasi untuk mendesain dan memetakan alur strategi konten berbasis corong pemasaran otomatis.',
    brand_voice: 'Profesional, Berwibawa, Edukatif, Solutif namun tetap bersahabat'
  },
  audience_context: {
    primary_audience: 'Creators, Course Sellers & Solopreneurs yang ingin melakukan skala bisnis secara digital.',
    pain_points: [
      'Membuat konten secara acak setiap hari tanpa strategi konversi terukur',
      'Kehabisan waktu merencanakan konten bulanan',
      'Kecemasan karena traffic melimpah namun tingkat konversi penjualan rendah'
    ],
    desires: [
      'Membuat sistem kalender konten otomatis berbasis corong strategis',
      'Memangkas waktu penyusunan brief konten hingga 80%',
      'Membangun alur penjualan otomatis dari konten media sosial'
    ],
    objections: [
      'Khawatir hasil copywriting terkesan kaku dan generik layaknya robot',
      'Takut sistem terlalu kompleks untuk pemula',
      'Meragukan fleksibilitas penyesuaian industri spesifik'
    ]
  },
  strategy_context: {
    positioning: 'Pusat otomatisasi pemetaan strategi konten komprehensif pertama yang mengutamakan funnel strategis.',
    usp: [
      'Strategy Blueprint intake yang intuitif',
      'Automated content calendar terintegrasi TOFU-MOFU-BOFU',
      'Production Studio instan untuk berbagai variasi aset'
    ],
    main_offer: 'Free Strategy Intake & Automated Content Blueprint',
    offer_benefits: [
      'Blueprint strategi bisnis & konten senilai Rp 1.500.000 secara gratis',
      'Visualisasi kalender visual konten digital langsung siap eksekusi'
    ],
    core_message: 'Hentikan memproduksi konten acak. Saatnya bangun mesin konten otomatis yang mendatangkan penjualan berkelanjutan.',
    copy_direction: [
      'Gunakan data statistik rujukan kuat',
      'Sederhanakan terminologi pemasaran teknis agar ramah pemula',
      'Tekankan penghematan waktu rill'
    ],
    content_pillars: [
      'Edukasi Funneling & Pemetaan Pembeli',
      'Sistemasi & Manajemen Alur Kerja Kreator',
      'Formula Copywriting Konversi Tinggi'
    ]
  }
};

interface ImageAngle {
  id: 'A' | 'B' | 'C';
  name: string;
  funnelStage?: string;
  contentGoal?: string;
  targetEmotion: string;
  visualStrategy: string;
  hookStrategy: string;
  colorPsychology?: string;
  layoutStrategy: string;
  textOverlay?: string;
  ctaRecommendation?: string;
  finalPrompt: string;
}

interface ImageAnglesPackage {
  recommendedAngleId: 'A' | 'B' | 'C';
  recommendationReason: string;
  angles: ImageAngle[];
}

interface CarouselSlide {
  slide: number;
  role: string;
  headline: string;
  body: string;
  swipe_bridge: string;
  visual_intent: string;
  emotional_state: string;
  text_zone: string;
}

interface CarouselOption {
  id: 'A' | 'B' | 'C';
  name: string;
  content_goal: string;
  current_belief: string;
  desired_belief: string;
  core_promise: string;
  slide_count: number;
  slide_count_reason: string;
  cta_type: string;
  cta_text: string;
  slides: CarouselSlide[];
}

interface VideoScript {
  hook: string;
  masalah: string;
  solusi: string;
  proof: string;
  cta: string;
}

interface VideoStyle {
  id: 'A' | 'B' | 'C';
  name: string;
  hookStyle: string;
  pacingStyle: string;
  audioDirection: string;
  voiceoverOutline: string;
  script: VideoScript;
  videoPrompt: string;
  visualPlan: string;
}

interface UgcPack {
  characterProfile: string;
  characterReferenceImagePrompt: string;
  scene1_image_prompt: string;
  scene2_image_prompt: string;
  scene3_image_prompt: string;
  scene1_google_flow_prompt: string;
  scene2_google_flow_prompt: string;
  scene3_google_flow_prompt: string;
  script_scene_1: string;
  script_scene_2: string;
  script_scene_3: string;
}

const tryParseJSON = (text: string) => {
  if (!text) return null;
  let cleanText = text.trim();

  // Try direct parse first
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // If direct parse fails, try cleaning up markdown blocks or extra text
  }

  // Comprehensive cleaning of markdown wrappers or backticks anywhere
  cleanText = cleanText.replace(/```json/gi, '');
  cleanText = cleanText.replace(/```/g, '');
  cleanText = cleanText.trim();

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // Try to extract pure JSON block
  }

  // Find boundaries of potential JSON array or object
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');
  const firstBracket = cleanText.indexOf('[');
  const lastBracket = cleanText.lastIndexOf(']');

  // Attempt 1: Extract array from first [ to last ]
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const arrayCandidate = cleanText.substring(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(arrayCandidate);
    } catch (err) {
      // Keep going
    }
  }

  // Attempt 2: Extract object from first { to last }
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const objectCandidate = cleanText.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(objectCandidate);
    } catch (err) {
      // Keep going
    }
  }

  return null;
};

const getItemKey = (item?: ContentItem | null) => {
  if (!item) return '';
  const no = item.no !== undefined && item.no !== null ? String(item.no) : '0';
  const tanggal = item.tanggal || '';
  const headline = item.headline || '';
  const format = item.format || '';
  const jenis = item.jenis || '';
  const rawKey = `item_${no}_${tanggal}_${headline}_${format}_${jenis}`;
  return rawKey.replace(/[^a-zA-Z0-9_]/g, '_');
};

// Helper function to validate and normalize Image Angles JSON output to canonical TOFU Content Engine format
const validateAndNormalizeImageAngles = (rawText: string): string | null => {
  if (!rawText) return null;
  const parsed = tryParseJSON(rawText);
  if (!parsed) return null;

  let anglesArray: any[] = [];
  let recommendedAngleId: 'A' | 'B' | 'C' = 'A';
  let recommendationReason = '';

  if (typeof parsed === 'object' && parsed !== null) {
    if (Array.isArray((parsed as any).angles)) {
      anglesArray = (parsed as any).angles;
    } else if (Array.isArray(parsed)) {
      anglesArray = parsed as any[];
    }

    if ((parsed as any).recommendedAngleId) {
      const rawRecId = String((parsed as any).recommendedAngleId).toUpperCase().trim();
      if (rawRecId === 'A' || rawRecId === 'B' || rawRecId === 'C') {
        recommendedAngleId = rawRecId as 'A' | 'B' | 'C';
      }
    }

    if ((parsed as any).recommendationReason) {
      recommendationReason = String((parsed as any).recommendationReason).trim();
    }
  }

  if (!Array.isArray(anglesArray) || anglesArray.length === 0) {
    return null;
  }

  const validAngles: ImageAngle[] = [];
  const requiredIds: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];

  for (let i = 0; i < anglesArray.length; i++) {
    const item = anglesArray[i];
    if (!item || typeof item !== 'object') continue;

    const rawId = (item.id || requiredIds[i] || 'A').toString().toUpperCase().trim();
    const id: 'A' | 'B' | 'C' = (rawId === 'A' || rawId === 'B' || rawId === 'C') 
      ? (rawId as 'A' | 'B' | 'C') 
      : (requiredIds[i] || 'A');

    let name = item.name || '';
    if (!name || typeof name !== 'string') {
      if (id === 'A') name = 'Relatable Hook';
      else if (id === 'B') name = 'Insight Hook';
      else if (id === 'C') name = 'Curiosity Hook';
      else name = `Angle ${id}`;
    }

    const funnelStage = String(item.funnelStage || item.funnel_stage || 'TOFU').trim();
    const contentGoal = String(item.contentGoal || item.content_goal || '').trim();
    const targetEmotion = String(item.targetEmotion || item.target_emotion || '').trim();
    const visualStrategy = String(item.visualStrategy || item.visual_strategy || '').trim();
    const hookStrategy = String(item.hookStrategy || item.hook_strategy || '').trim();
    const layoutStrategy = String(item.layoutStrategy || item.layout_strategy || '').trim();
    const textOverlay = String(item.textOverlay || item.text_overlay || '').trim();
    const colorPsychology = String(item.colorPsychology || item.color_psychology || '').trim();
    const ctaRecommendation = String(item.ctaRecommendation || item.cta_recommendation || '').trim();
    const finalPrompt = String(item.finalPrompt || item.final_prompt || '').trim();

    if (!finalPrompt || finalPrompt.length < 15) {
      return null;
    }

    validAngles.push({
      id,
      name,
      funnelStage,
      contentGoal,
      targetEmotion,
      visualStrategy,
      hookStrategy,
      layoutStrategy,
      textOverlay,
      colorPsychology,
      ctaRecommendation,
      finalPrompt,
    });
  }

  if (validAngles.length < 3) {
    return null;
  }

  if (!recommendationReason) {
    recommendationReason = "Angle ini paling cocok untuk rencana konten hari ini dalam membangun kesadaran awal (TOFU) dan membuat audiens berhenti scroll secara alami.";
  }

  return JSON.stringify({
    recommendedAngleId,
    recommendationReason,
    angles: validAngles
  }, null, 2);
};

// Pure top-level function for building high-converting initial drafts for instant feedback
const getInitialDraft = (
  tab: 'review' | 'image' | 'carousel' | 'video' | 'ugc',
  currentItem?: ContentItem | null,
  currentContext?: SharedContentContext | null
) => {
  const activeItem = currentItem || itemFallback;
  const activeContext = currentContext || contextFallback;

  switch (tab) {
    case 'review':
      return `### 📊 EVALUASI KESELARASAN STRATEGI KONTEN

**Skor Penyelarasan Strategi:** 96/100 (SANGAT BAIK)

**1. Analisis Keselarasan Corong (${activeItem.jenis}):**
- Item konten ini sangat cocok dengan tahap corong **${activeItem.jenis}**. Tujuan utama yaitu **"${activeItem.tujuan}"** tersampaikan secara alami tanpa terkesan memaksa.
- Pemilihan hook **"${activeItem.hookType}"** sangat efektif untuk menangkap atensi segmen audiens utama: **${activeContext.audience_context?.primary_audience || 'Target Buyers'}**.

**2. Integrasi Suara Merek (Brand Voice):**
- Selaras dengan suara merek **"${activeContext.brand_context?.brand_voice || 'Profesional & Edukatif'}"**. Teks mengedukasi audiens sambil membangun otoritas di bidangnya.

**3. Rekomendasi Optimasi Kilat:**
- Pastikan kalimat pembuka (headline) menggunakan huruf tebal yang sangat mencolok secara visual.
- Gunakan CTA **"${activeItem.cta || 'Link Bio'}"** di bagian akhir teks/caption dengan ikon penunjuk arah visual agar audiens segera terdorong mengambil tindakan.`;

    case 'image': {
      const canonicalOutput = {
        recommendedAngleId: "A",
        recommendationReason: "Angle Relatable Hook sangat ampuh untuk tahap TOFU karena langsung menargetkan situasi emosional sehari-hari audiens tanpa kesan jualan.",
        angles: [
          {
            id: "A",
            name: "Relatable Hook",
            funnelStage: "TOFU",
            contentGoal: "Membuat audiens merasa relate dan berhenti scroll.",
            targetEmotion: "Merasa dipahami, penasaran, dan ingin membaca.",
            visualStrategy: "Visual menggambarkan suasana kerja sehari-hari audiens yang sedang kewalahan di depan laptop dengan ekspresi berpikir.",
            hookStrategy: "Gunakan hook visual yang memancing rasa 'ini gue banget'.",
            layoutStrategy: "Komposisi sederhana, fokus pada satu subjek utama, ruang kosong cukup untuk teks pendek di bagian atas.",
            textOverlay: "Pernah merasa bikin konten tapi serasa sia-sia?",
            finalPrompt: `Template Prompt Konten Visual TOFU

Funnel Stage:
TOFU

Tujuan Konten:
Membangun awareness, menarik perhatian audiens baru, dan membuat mereka merasa konten ini relevan dengan hidup atau masalah mereka.

Ide Utama Konten:
${activeItem.headline || 'Strategi Pembuatan Konten Organik yang Relatable'}

Angle Visual:
Relatable Hook

Konteks Audiens:
${activeContext.audience_context?.primary_audience || 'Kreator & Solopreneur'} yang sering merasa lelah memikirkan ide konten harian.

Emosi yang Ingin Dibangun:
Merasa dipahami, penasaran, dan terdorong untuk membaca caption lebih lanjut.

Adegan Visual:
Seorang kreator duduk santai di meja kayu hangat dengan cangkir kopi, menatap layar laptop dengan ekspresi berpikir tenang di pagi hari.

Subjek Utama:
Pria/wanita usia 27 tahun, pakaian kasual nyaman, ekspresi wajah alami dan realistis.

Pesan Visual:
Proses kreatif yang dekat dengan kehidupan sehari-hari audiens tanpa tekanan berlebih.

Komposisi:
Subjek utama berada di kanan tengah, ruang bersih di sisi kiri atas untuk teks overlay pendek, latar belakang alami yang soft/bokeh.

Gaya Visual:
Organic social media content, editorial lifestyle, natural lighting, clean composition, premium but approachable, not advertising, not poster-like.

Teks Dalam Gambar:
Pernah merasa bikin konten tapi serasa sia-sia?

Rasio:
4:5 Instagram feed

Negative Prompt:
Hard-selling ad, discount banner, fake button, exaggerated expression, crowded layout, cheap promotional poster, broken text, unreadable typography, distorted face, extra fingers, overdesigned graphic, generic stock photo, corporate cliché.

Hasil Akhir:
Gambar konten TOFU yang terasa natural, relatable, dan membuat audiens berhenti scroll karena merasa dekat dengan masalah atau insight yang dibahas.`
          },
          {
            id: "B",
            name: "Insight Hook",
            funnelStage: "TOFU",
            contentGoal: "Memberi insight ringan yang membuat audiens merasa mendapat sudut pandang baru.",
            targetEmotion: "Tersadar, penasaran, ingin tahu lanjutan.",
            visualStrategy: "Visual menampilkan sudut pandang editorial bersih yang menyoroti catatan sederhana dan perangkat kerja terorganisir.",
            hookStrategy: "Gunakan visual yang terasa edukatif tapi tetap ringan.",
            layoutStrategy: "Komposisi editorial modern dengan titik fokus jelas pada jurnal/tablet.",
            textOverlay: "Bukan kurang rajin, cuma belum punya sistem.",
            finalPrompt: `Template Prompt Konten Visual TOFU

Funnel Stage:
TOFU

Tujuan Konten:
Membangun awareness, menarik perhatian audiens baru, dan membuat mereka merasa konten ini relevan dengan hidup atau masalah mereka.

Ide Utama Konten:
${activeItem.headline || 'Sudut Pandang Baru Dalam Konsistensi Konten'}

Angle Visual:
Insight Hook

Konteks Audiens:
${activeContext.audience_context?.primary_audience || 'Kreator & Pebisnis Digital'} yang ingin menyederhanakan alur kerja konten.

Emosi yang Ingin Dibangun:
Momen 'Aha!', merasa tersadar bahwa ada cara kerja yang lebih terstruktur.

Adegan Visual:
Tangan seseorang sedang membuka buku catatan bersih berdampingan dengan smartphone yang menampilkan draf ide rapi di atas meja kopi.

Subjek Utama:
Tangan bersih memegang pena di atas jurnal kerja, fokus pada aksi penulisan ide.

Pesan Visual:
Kesederhanaan dan kejelasan dalam merencanakan ide konten.

Komposisi:
Top-down / flatlay shot dari sudut 45 derajat, pencahayaan matahari pagi dari samping, ruang teks di area atas.

Gaya Visual:
Organic social media content, editorial lifestyle, natural lighting, clean composition, premium but approachable, not advertising, not poster-like.

Teks Dalam Gambar:
Bukan kurang rajin, cuma belum punya sistem.

Rasio:
4:5 Instagram feed

Negative Prompt:
Hard-selling ad, discount banner, fake button, exaggerated expression, crowded layout, cheap promotional poster, broken text, unreadable typography, distorted face, extra fingers, overdesigned graphic, generic stock photo, corporate cliché.

Hasil Akhir:
Gambar konten TOFU yang terasa natural, relatable, dan membuat audiens berhenti scroll karena merasa dekat dengan masalah atau insight yang dibahas.`
          },
          {
            id: "C",
            name: "Curiosity Hook",
            funnelStage: "TOFU",
            contentGoal: "Membangun rasa penasaran agar audiens ingin membuka caption atau carousel lanjutan.",
            targetEmotion: "Penasaran, merasa ada sesuatu yang belum mereka sadari.",
            visualStrategy: "Visual menyiratkan pertanyaan ringan dengan framing dramatis lembut pada detail objek harian.",
            hookStrategy: "Gunakan visual yang membuat orang ingin tahu maksudnya.",
            layoutStrategy: "Framing dramatis ringan, tetap bersih, minimalis dan kontras tinggi.",
            textOverlay: "Satu kebiasaan kecil yang ngubah hasil konten.",
            finalPrompt: `Template Prompt Konten Visual TOFU

Funnel Stage:
TOFU

Tujuan Konten:
Membangun awareness, menarik perhatian audiens baru, dan membuat mereka merasa konten ini relevan dengan hidup atau masalah mereka.

Ide Utama Konten:
${activeItem.headline || 'Rahasia Di Balik Konten Yang Berjalan Otomatis'}

Angle Visual:
Curiosity Hook

Konteks Audiens:
${activeContext.audience_context?.primary_audience || 'Audiens Kreatif & Digital'} yang penasaran dengan metode optimasi ide.

Emosi yang Ingin Dibangun:
Rasa ingin tahu tinggi, terdorong untuk membaca caption atau menggeser slide.

Adegan Visual:
Suasana kafe tenang dengan sorotan cahaya lembut pada sebuah tablet yang menampilkan garis grafik tumbuh alami.

Subjek Utama:
Tablet tipis di atas meja dengan latar belakang interior kafe hangat yang sedikit blur.

Pesan Visual:
Misteri tentang proses di balik layar yang menghasilkan dampak besar.

Komposisi:
Depth of field dangkal (bokeh), sudut pandang sinematik lembut, ruang kosong yang pas untuk teks misteri.

Gaya Visual:
Organic social media content, editorial lifestyle, natural lighting, clean composition, premium but approachable, not advertising, not poster-like.

Teks Dalam Gambar:
Satu kebiasaan kecil yang ngubah hasil konten.

Rasio:
4:5 Instagram feed

Negative Prompt:
Hard-selling ad, discount banner, fake button, exaggerated expression, crowded layout, cheap promotional poster, broken text, unreadable typography, distorted face, extra fingers, overdesigned graphic, generic stock photo, corporate cliché.

Hasil Akhir:
Gambar konten TOFU yang terasa natural, relatable, dan membuat audiens berhenti scroll karena merasa dekat dengan masalah atau insight yang dibahas.`
          }
        ]
      };
      return JSON.stringify(canonicalOutput, null, 2);
    }

    case 'carousel': {
      if (activeItem?.carousel_plan) {
        return JSON.stringify(activeItem.carousel_plan, null, 2);
      }
      const initialPlan: CarouselPlan = {
        content_goal: activeItem?.tujuan || 'Mengedukasi audiens tentang pentingnya optimasi digital funnel',
        funnel_stage: activeItem?.jenis || 'TOFU (Awareness)',
        current_belief: 'Membuat konten viral secara acak sudah cukup untuk mendatangkan penjualan.',
        desired_belief: 'Konten membutuhkan sistem funnel (TOFU-MOFU-BOFU) agar setiap penonton terarah menjadi pembeli.',
        core_promise: 'Membangun alur konten strategis yang otomatis menyaring pembeli.',
        primary_cta_type: 'click',
        primary_cta_text: activeItem?.cta || 'Klik Link di Bio',
        slide_count: 5,
        slide_count_reason: '5 Slide merupakan panjang optimal untuk membangun belief journey dari Hook hingga Aksi tanpa membuat penonton lelah.',
        belief_journey_summary: 'Mengubah pola pikir dari sekadar membuat konten viral acak menjadi membangun sistem funnel konten yang konsisten menghasilkan pembeli.',
        visual_system_notes: 'Tema visual konsisten menggunakan typography kontras tinggi dan elemen grafis 3D minimalis.',
        slides: [
          {
            slide: 1,
            role: 'hook',
            communication_job: 'Menghentikan scroll dan memicu kesadaran akan masalah utama',
            headline: activeItem?.headline || '3 Tanda Utama Konten Bisnis Anda Gagal Menghasilkan Penjualan!',
            body: activeItem?.body || 'Banyak pemilik bisnis merasa frustrasi karena konten mereka ditonton ribuan orang tapi nihil pembelian.',
            swipe_bridge: 'Geser ke slide berikutnya untuk melihat solusinya ➔',
            emotional_state: 'Empati & Penasaran',
            visual_intent: activeItem?.visual || 'Visual ilustrasi grafik corong 3D yang bocor dengan aksen neon merah.',
            visual_type: 'diagram',
            text_zone: 'Upper Third',
            negative_space_plan: 'Ruang bersih di bagian atas untuk headline besar'
          },
          {
            slide: 2,
            role: 'recognition',
            communication_job: 'Membantu audiens mengenali kesalahan dalam pendekatan mereka saat ini',
            headline: 'Kesalahan Fatal: Melakukan Spam Konten Tanpa Jalur Konversi',
            body: 'Membuat konten rame itu bagus. Tapi jika tidak ada alur yang mengarahkan penonton menjadi pembeli, Anda membuang waktu.',
            swipe_bridge: 'Mengapa ini terjadi? ➔',
            emotional_state: 'Kesadaran Masalah',
            visual_intent: 'Diagram alur terputus dengan tanda peringatan.',
            visual_type: 'comparison',
            text_zone: 'Center',
            negative_space_plan: 'Sisi kiri kosong untuk perbandingan visual'
          },
          {
            slide: 3,
            role: 'reframe',
            communication_job: 'Mengubah sudut pandang audiens menuju solusi berbasis sistem',
            headline: 'Solusi: Funnel Konten TOFU-MOFU-BOFU',
            body: 'Bagi konten Anda ke dalam 3 tahap strategis: Penarikan Atensi, Pembinaan Keyakinan, dan Eksekusi Penjualan.',
            swipe_bridge: 'Bagaimana cara kerjanya? ➔',
            emotional_state: 'Pencerahan (Aha Moment)',
            visual_intent: 'Diagram 3 tingkatan corong pemasaran yang rapi dan berkilau.',
            visual_type: 'custom',
            text_zone: 'Center',
            negative_space_plan: 'Latar belakang netral dengan aksen hijau'
          },
          {
            slide: 4,
            role: 'proof',
            communication_job: 'Memberikan bukti manfaat nyata dari penerapan sistem',
            headline: 'Hasil Efisiensi: Hemat 80% Waktu & Konversi Terarah',
            body: 'Dengan alur terstruktur, Anda tidak perlu lagi pusing memikirkan ide dadakan setiap hari.',
            swipe_bridge: 'Mulai sekarang ➔',
            emotional_state: 'Optimisme & Kepercayaan',
            visual_intent: 'Grafik pertumbuhan efisiensi dan ikon jam produktivitas.',
            visual_type: 'stat',
            text_zone: 'Upper Third',
            negative_space_plan: 'Ruang lega di sekitar grafik'
          },
          {
            slide: 5,
            role: 'cta',
            communication_job: 'Mendorong tindakan langsung penonton',
            headline: 'Klaim Blueprint Strategi Konten Anda Sekarang!',
            body: activeItem?.caption || 'Klik link di bio untuk mendapatkan kalender konten dan strategi funnel gratis.',
            swipe_bridge: 'Klik link di bio sekarang!',
            emotional_state: 'Dorongan Aksi',
            visual_intent: 'Binder blueprint digital dengan tombol penunjuk arah yang mencolok.',
            visual_type: 'ui-mock',
            text_zone: 'Center',
            negative_space_plan: 'Latar bersih dengan tombol CTA kontras tinggi'
          }
        ]
      };
      return JSON.stringify(initialPlan, null, 2);
    }

    case 'video': {
      const vStyles = [
        {
          id: "A",
          name: "Style A: UGC (Casual Review)",
          hookStyle: "Pertanyaan spontan langsung menyentuh masalah utama",
          pacingStyle: "Natural, santai, banyak jeda natural",
          audioDirection: "Suara asli kreator (casual tone) dengan musik latar lofi santai",
          voiceoverOutline: `Mengeluhkan capek riset konten -> Menyebutkan solusi ${activeContext.brand_context?.brand_name || 'ALCO Engine'} -> Menunjukkan visual corong kalender -> Ajakan klaim gratis`,
          script: {
            hook: `Capek nggak sih ngurusin konten tiap hari tapi leads yang masuk zonk terus?`,
            masalah: `Banyak yang asal bikin konten tanpa paham funnel TOFU-MOFU-BOFU. Padahal itu kunci konversinya.`,
            solusi: `Tapi untungnya sekarang ada ${activeContext.brand_context?.brand_name || 'ALCO Engine'} yang bikin visual kalender konten otomatis berbasis corong strategi dalam hitungan detik.`,
            proof: `Saya udah cobain sendiri, waktu kerja kepangkas sampai 80% dan leads meningkat stabil.`,
            cta: `Mumpung gratis, klik link bio saya buat ambil Content Calendar & Funnel Strategy Blueprint sekarang!`
          },
          videoPrompt: "A friendly creator looking at their laptop screen, showing surprise and happiness, warm aesthetic home office, soft background, vertical 9:16.",
          visualPlan: "0-5s: Talent close-up bingung menatap ponsel. 5-15s: Tampilkan rekaman layar dasbor kalender konten. 15-25s: Penjelasan visual funneling. 25-30s: Tersenyum mengarahkan telunjuk ke link bio."
        },
        {
          id: "B",
          name: "Style B: TikTok Loop (Infinite Trick)",
          hookStyle: "Kalimat pembuka menggantung menyambung dari CTA akhir",
          pacingStyle: "Sangat cepat, transisi secepat kilat, ketukan ritmis",
          audioDirection: "Musik up-beat trend TikTok yang catchy dengan sulih suara energik",
          voiceoverOutline: `Membuka loop -> Fakta mengejutkan kegagalan konten -> Solusi praktis ${activeContext.brand_context?.brand_name || 'ALCO Engine'} -> CTA menggantung`,
          script: {
            hook: `Inilah alasan kenapa konten Anda sepi...`,
            masalah: `Anda memproduksi konten acak tanpa strategi funnel yang terukur, sehingga penonton cuma lewat tanpa beli.`,
            solusi: `Jawabannya ada di ${activeContext.brand_context?.brand_name || 'ALCO Engine'}, pembuat sistem kalender konten otomatis berbasis corong TOFU-MOFU-BOFU.`,
            proof: `Lebih dari ribuan solopreneur pakai sistem ini untuk bikin naskah konversi tinggi dalam hitungan detik.`,
            cta: `Buktikan sendiri dengan klik link di bio, dan...`
          },
          videoPrompt: "Satisfying looping motion graphic of abstract futuristic clockwork gears spinning seamlessly on a clean minimalist gray background, 3D render vertical 9:16.",
          visualPlan: "0-5s: Teks tebal kontras tinggi berkedip cepat di layar. 5-15s: Animasi transisi corong warna neon. 15-25s: Grafik panah menanjak cepat. 25-30s: Layar meredup cepat bersiap menyambung ke awal loop."
        },
        {
          id: "C",
          name: "Style C: Sinematik (Storytelling)",
          hookStyle: "Pernyataan filosofis tentang waktu dan kebebasan waktu",
          pacingStyle: "Lambat, dramatis, transisi halus, mengedepankan estetika visual",
          audioDirection: "Musik piano instrumental emosional dengan voiceover mendalam dan hangat",
          voiceoverOutline: `Narasi perjuangan solopreneur -> Menemukan titik balik otomatisasi -> Kedamaian sistem kerja baru -> Penutup anggun`,
          script: {
            hook: `Berapa banyak waktu yang hilang karena Anda memproduksi konten tanpa arah?`,
            masalah: `Sebagai solopreneur, waktu adalah aset berharga Anda. Namun, menghabiskan belasan jam sehari hanya untuk konten tanpa leads murni adalah pengorbanan yang sia-sia.`,
            solusi: `Titik baliknya ada ketika sistem mengalahkan kekacauan. ${activeContext.brand_context?.brand_name || 'ALCO Engine'} mendesain ulang alur kerja Anda.`,
            proof: `Mengotomatiskan seluruh corong strategi sehingga bisnis tetap bekerja menarik pelanggan, bahkan ketika Anda beristirahat.`,
            cta: `Mulailah melangkah lebih cerdas. Ambil langkah pertama dengan klaim blueprint gratis di bio kami sekarang.`
          },
          videoPrompt: "Cinematic slow motion shot of a professional looking relaxed in a beautiful plant-filled cafe, soft golden hour sunlight filtering through glass windows, 8k vertical 9:16.",
          visualPlan: "0-10s: Slow motion talent menikmati minumannya dengan tenang. 10-20s: Close-up tablet menampilkan kurva grafik melesat naik. 20-30s: Teks estetik berukuran sedang muncul perlahan di layar kafe yang asri."
        }
      ];
      return JSON.stringify(vStyles, null, 2);
    }

    case 'ugc': {
      const ugcData = {
        characterProfile: `Berusia 22-35 tahun, percaya diri di depan kamera, berpenampilan rapi, bergaya kasual-profesional. Nada bicara antusias, energik, dan bersahabat seolah-olah merekomendasikan solusi rahasia ke sahabat dekat.`,
        characterReferenceImagePrompt: `A highly detailed commercial portrait of a 28-year-old Indonesian content creator smiling warmly, wearing a casual beige blazer over a white t-shirt, clean aesthetic minimal background, soft studio lighting, 85mm lens, photorealistic.`,
        scene1_image_prompt: `Close-up shot of a content creator looking frustrated and rubbing their temples in front of a glowing computer monitor at night, cozy home office, warm dramatic lighting, 9:16 aspect ratio.`,
        scene2_image_prompt: `A close-up of clean hands holding a smartphone displaying a beautifully organized colorful digital marketing calendar dashboard, clean modern desk setup, bright morning light, 9:16 aspect ratio.`,
        scene3_image_prompt: `A smiling young creator holding up a physical black binder embossed with the gold logo '${activeContext.brand_context?.brand_name || 'ALCO ENGINE'}', standing in a bright minimalist room, warm lighting, 9:16 aspect ratio.`,
        scene1_google_flow_prompt: `An exhausted creator staring blankly at a screen in a dark room with light leaks, slow camera push-in, capturing frustration and fatigue, photorealistic cinematic video, 9:16 format.`,
        scene2_google_flow_prompt: `Smooth screen capture animation of a content calendar interface where tasks and funnel sections automatically organize themselves with glowing green fluid line animations.`,
        scene3_google_flow_prompt: `A joyful person looking at the camera, holding up their phone showing a green checkout notification, giving a friendly thumbs up with a warm background, soft cinematic panning.`,
        script_scene_1: `Sumpah capek banget bikin konten tiap hari tapi views-nya rame doang, sales-nya zonk! Kalian ngerasa gini juga nggak sih? Capek riset, capek syuting, tapi hasilnya nol besar.`,
        script_scene_2: `Ternyata salahnya karena nggak ada jalur funnel yang bener. Tapi untungnya nemu sistem otomatis ini dari ${activeContext.brand_context?.brand_name || 'ALCO Engine'}. Tinggal pencet-pencet, draf strategi konten dari TOFU sampai BOFU langsung jadi rapi!`,
        script_scene_3: `Asli, ini ngebantu banget hemat waktu sampai 80 persen. Daripada ngasal bikin konten, mending klik link di bio saya buat ambil blueprint gratisnya sekarang juga ya!`
      };
      return JSON.stringify(ugcData, null, 2);
    }
  }
};

const isErrorContent = (str: string | null | undefined): boolean => {
  if (!str) return false;
  const upper = str.toUpperCase();
  return upper.includes('RATE LIMIT') || upper.includes('QUOTA EXCEEDED') || upper.includes('PERMINTAAN AI SEDANG DIBATASI');
};

export default function ProductionStudioPage() {
  const router = useRouter();

  // State structure for the Production Studio
  const [sourceItem, setSourceItem] = useState<ContentItem | null>(null);
  const [sharedContextSnapshot, setSharedContextSnapshot] = useState<SharedContentContext | null>(null);
  const [characterDNA, setCharacterDNA] = useState<CharacterDNA | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'dna' | 'image' | 'carousel' | 'video' | 'ugc'>('review');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Core production outputs states
  const [imageOutput, setImageOutput] = useState<string>('');
  const [carouselOutput, setCarouselOutput] = useState<string>('');
  const [videoOutput, setVideoOutput] = useState<string>('');
  const [ugcOutput, setUgcOutput] = useState<string>('');
  const [reviewOutput, setReviewOutput] = useState<string>('');
  const [revisionNotes, setRevisionNotes] = useState<string>('');

  // Selected sub-tabs inside Production Studio
  const [selectedAngleId, setSelectedAngleId] = useState<'A' | 'B' | 'C'>('A');
  const [selectedCarouselId, setSelectedCarouselId] = useState<'A' | 'B' | 'C'>('A');
  const [selectedVideoId, setSelectedVideoId] = useState<'A' | 'B' | 'C'>('A');
  const [activeSlideNumber, setActiveSlideNumber] = useState<number>(1);

  // Direct image generation state
  const [generatedImages, setGeneratedImages] = useState<Record<string, { imageDataUrl: string; model?: string; aspectRatio?: string }>>({});
  const [imageGeneratingKey, setImageGeneratingKey] = useState<string | null>(null);
  const [imageGenerateError, setImageGenerateError] = useState<string | null>(null);

  const handleGenerateImage = async (promptText: string, angleId: string) => {
    if (!promptText || !promptText.trim()) return;
    const itemNo = sourceItem?.no || 1;
    const key = `${itemNo}_${angleId}`;

    setImageGeneratingKey(key);
    setImageGenerateError(null);

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          aspectRatio: '4:5',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.imageDataUrl) {
        const errMsg = data.error || data.message || "Gagal generate image. Coba lagi nanti.";
        setImageGenerateError(errMsg);
      } else {
        setGeneratedImages(prev => ({
          ...prev,
          [key]: {
            imageDataUrl: data.imageDataUrl,
            model: data.model,
            aspectRatio: data.aspectRatio,
          },
        }));
      }
    } catch (err: any) {
      console.error('Client Image Generation Error:', err);
      setImageGenerateError("Gagal generate image. Coba lagi nanti.");
    } finally {
      setImageGeneratingKey(null);
    }
  };

  const handleDownloadImage = (dataUrl: string, angleId: string) => {
    try {
      const itemNo = sourceItem?.no || 1;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `alcocontent_item_${itemNo}_angle_${angleId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download image error:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load from local storage on mount
  useEffect(() => {
    // Check URL params for active tab first
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['review', 'dna', 'image', 'carousel', 'video', 'ugc'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }

    // Reset all outputs to clean state first to prevent any potential cache carry-over
    setImageOutput('');
    setCarouselOutput('');
    setVideoOutput('');
    setUgcOutput('');
    setReviewOutput('');
    setRevisionNotes('');
    setSourceItem(null);
    setSharedContextSnapshot(null);

    try {
      const storedItem = localStorage.getItem('alco_selected_item');
      const storedContext = localStorage.getItem('alco_shared_context');
      
      const projectId = getActiveProjectId() || 'default';
      const storedDNA = getProjectCharacterDNA(projectId);
      if (storedDNA) setCharacterDNA(storedDNA);
      
      let parsedItem: ContentItem | null = null;
      let parsedContext: SharedContentContext | null = null;

      if (storedItem) {
        parsedItem = JSON.parse(storedItem);
        setSourceItem(parsedItem);
      }
      if (storedContext) {
        parsedContext = JSON.parse(storedContext);
        setSharedContextSnapshot(parsedContext);
      }

      if (parsedItem) {
        const itemKey = getItemKey(parsedItem);
        const projectId = getActiveProjectId() || 'default';
        
        const storedImage = loadProjectData(projectId, `studio_image_${itemKey}`);
        const storedCarousel = loadProjectData(projectId, `studio_carousel_${itemKey}`);
        const storedVideo = loadProjectData(projectId, `studio_video_${itemKey}`);
        const storedUgc = loadProjectData(projectId, `studio_ugc_${itemKey}`);
        const storedReview = loadProjectData(projectId, `studio_review_${itemKey}`);
        const storedRevision = loadProjectData(projectId, `studio_revision_${itemKey}`);

        if (storedImage && !isErrorContent(storedImage)) {
          setImageOutput(storedImage);
        } else {
          if (storedImage && isErrorContent(storedImage)) {
            removeProjectData(projectId, `studio_image_${itemKey}`);
          }
          setImageOutput(getInitialDraft('image', parsedItem, parsedContext));
        }

        if (storedCarousel && !isErrorContent(storedCarousel)) {
          setCarouselOutput(storedCarousel);
        } else {
          if (storedCarousel && isErrorContent(storedCarousel)) {
            removeProjectData(projectId, `studio_carousel_${itemKey}`);
          }
          setCarouselOutput(getInitialDraft('carousel', parsedItem, parsedContext));
        }

        if (storedVideo && !isErrorContent(storedVideo)) {
          setVideoOutput(storedVideo);
        } else {
          if (storedVideo && isErrorContent(storedVideo)) {
            removeProjectData(projectId, `studio_video_${itemKey}`);
          }
          setVideoOutput(getInitialDraft('video', parsedItem, parsedContext));
        }

        if (storedUgc && !isErrorContent(storedUgc)) {
          setUgcOutput(storedUgc);
        } else {
          if (storedUgc && isErrorContent(storedUgc)) {
            removeProjectData(projectId, `studio_ugc_${itemKey}`);
          }
          setUgcOutput(getInitialDraft('ugc', parsedItem, parsedContext));
        }

        if (storedReview && !isErrorContent(storedReview)) {
          setReviewOutput(storedReview);
        } else {
          if (storedReview && isErrorContent(storedReview)) {
            removeProjectData(projectId, `studio_review_${itemKey}`);
          }
          setReviewOutput(getInitialDraft('review', parsedItem, parsedContext));
        }

        if (storedRevision) {
          setRevisionNotes(storedRevision);
        } else {
          setRevisionNotes('');
        }
      }
    } catch (e) {
      console.error('Failed to parse storage data in Production Studio', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save setters with local storage persistence
  const saveImageOutput = (val: string) => {
    setImageOutput(val);
    if (sourceItem) {
      const itemKey = getItemKey(sourceItem);
      const projectId = getActiveProjectId() || 'default';
      saveProjectData(projectId, `studio_image_${itemKey}`, val);
    }
  };
  const saveCarouselOutput = (val: string) => {
    setCarouselOutput(val);
    if (sourceItem) {
      const itemKey = getItemKey(sourceItem);
      const projectId = getActiveProjectId() || 'default';
      saveProjectData(projectId, `studio_carousel_${itemKey}`, val);
    }
  };
  const saveVideoOutput = (val: string) => {
    setVideoOutput(val);
    if (sourceItem) {
      const itemKey = getItemKey(sourceItem);
      const projectId = getActiveProjectId() || 'default';
      saveProjectData(projectId, `studio_video_${itemKey}`, val);
    }
  };
  const saveUgcOutput = (val: string) => {
    setUgcOutput(val);
    if (sourceItem) {
      const itemKey = getItemKey(sourceItem);
      const projectId = getActiveProjectId() || 'default';
      saveProjectData(projectId, `studio_ugc_${itemKey}`, val);
    }
  };
  const saveReviewOutput = (val: string) => {
    setReviewOutput(val);
    if (sourceItem) {
      const itemKey = getItemKey(sourceItem);
      const projectId = getActiveProjectId() || 'default';
      saveProjectData(projectId, `studio_review_${itemKey}`, val);
    }
  };
  const saveRevisionNotes = (val: string) => {
    setRevisionNotes(val);
    if (sourceItem) {
      const itemKey = getItemKey(sourceItem);
      const projectId = getActiveProjectId() || 'default';
      saveProjectData(projectId, `studio_revision_${itemKey}`, val);
    }
  };

  const handleCopyText = (key: string, text: string) => {
    void (async () => {
      const success = await safeCopyToClipboard(text);
      if (success) {
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        showToast('Teks berhasil disalin ke clipboard!');
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [key]: false }));
        }, 2000);
      } else {
        showToast('Gagal menyalin teks.');
      }
    })();
  };

  // Generate customized production asset using Gemini API
  const handleGenerateWithAI = async () => {
    if (isLoadingAI) return;
    setIsLoadingAI(true);
    showToast(`Gemini AI sedang memproses naskah ${activeTab.toUpperCase()}...`);
    try {
      let promptTitle = '';
      let formatDirection = '';

      const activeItem = sourceItem || itemFallback;
      const activeContext = sharedContextSnapshot || contextFallback;

      if (activeTab === 'image') {
        promptTitle = '3 IMAGE ANGLES (TOFU CONTENT ENGINE CANONICAL JSON)';
        formatDirection = `Hasilkan 3 angle konten visual TOFU (Top of Funnel) untuk Content Engine dalam bentuk JSON murni dengan format canonical wajib berikut:

{
  "recommendedAngleId": "A",
  "recommendationReason": "Alasan singkat kenapa angle ini paling cocok untuk rencana konten hari ini.",
  "angles": [
    {
      "id": "A",
      "name": "Relatable Hook",
      "funnelStage": "TOFU",
      "contentGoal": "Membuat audiens merasa relate dan berhenti scroll.",
      "targetEmotion": "Merasa dipahami, penasaran, dan ingin membaca.",
      "visualStrategy": "Visual harus menggambarkan situasi sehari-hari audiens yang dekat dengan masalah utama.",
      "hookStrategy": "Gunakan hook visual yang memancing rasa 'ini gue banget'.",
      "layoutStrategy": "Komposisi sederhana, fokus pada satu subjek utama, ruang kosong cukup untuk teks pendek.",
      "textOverlay": "Kalimat pendek maksimal 8 kata, natural, bukan headline iklan.",
      "finalPrompt": "[Isi lengkap sesuai template finalPrompt TOFU di bawah]"
    },
    {
      "id": "B",
      "name": "Insight Hook",
      "funnelStage": "TOFU",
      "contentGoal": "Memberi insight ringan yang membuat audiens merasa mendapat sudut pandang baru.",
      "targetEmotion": "Tersadar, penasaran, ingin tahu lanjutan.",
      "visualStrategy": "Visual menampilkan kontras antara kebiasaan lama dan cara berpikir baru.",
      "hookStrategy": "Gunakan visual yang terasa edukatif tapi tetap ringan.",
      "layoutStrategy": "Gunakan komposisi editorial dengan titik fokus jelas.",
      "textOverlay": "Kalimat insight singkat maksimal 10 kata.",
      "finalPrompt": "[Isi lengkap sesuai template finalPrompt TOFU di bawah]"
    },
    {
      "id": "C",
      "name": "Curiosity Hook",
      "funnelStage": "TOFU",
      "contentGoal": "Membangun rasa penasaran agar audiens ingin membuka caption atau carousel lanjutan.",
      "targetEmotion": "Penasaran, merasa ada sesuatu yang belum mereka sadari.",
      "visualStrategy": "Visual harus menyiratkan pertanyaan, ketegangan ringan, atau pola yang belum selesai.",
      "hookStrategy": "Gunakan visual yang membuat orang ingin tahu maksudnya.",
      "layoutStrategy": "Gunakan framing dramatis ringan, tetap bersih dan mudah dibaca.",
      "textOverlay": "Kalimat misteri pendek maksimal 7 kata.",
      "finalPrompt": "[Isi lengkap sesuai template finalPrompt TOFU di bawah]"
    }
  ]
}

ATURAN UTAMA DENGAN KETAT:
1. Jangan gunakan format Meta Ads!
2. Jangan gunakan bahasa hard-selling, diskon, scarcity, klaim berlebihan, atau CTA iklan!
3. Image TOFU harus terasa seperti konten sosial media organik (organic social media content).
4. Otomatis rekomendasikan 1 angle terbaik di field "recommendedAngleId" ('A', 'B', atau 'C') beserta alasannya di "recommendationReason".

FORMAT finalPrompt WAJIB MENGIKUTI STRUKTUR LENGKAP BERIKUT (TANPA PLACEHOLDER, TERISI LENGKAP DALAM BAHASA INDONESIA):

Template Prompt Konten Visual TOFU

Funnel Stage:
TOFU

Tujuan Konten:
Membangun awareness, menarik perhatian audiens baru, dan membuat mereka merasa konten ini relevan dengan hidup atau masalah mereka.

Ide Utama Konten:
[ambil dari rencana kalender / headline: ${activeItem.headline || 'Ide Konten TOFU'}]

Angle Visual:
[Relatable Hook / Insight Hook / Curiosity Hook]

Konteks Audiens:
[jelaskan siapa audiens dan situasi yang sedang mereka alami berdasarkan data: ${activeContext.audience_context?.primary_audience || 'Target Audiens'}]

Emosi yang Ingin Dibangun:
[jelaskan emosi utama]

Adegan Visual:
[gambarkan satu adegan visual yang konkret, natural, dan mudah dibayangkan]

Subjek Utama:
[jelaskan orang, objek, atau situasi utama dalam gambar]

Pesan Visual:
[jelaskan pesan yang harus terasa dari gambar tanpa perlu membaca caption]

Komposisi:
[jelaskan posisi subjek, ruang teks, foreground, background, dan arah pandang]

Gaya Visual:
Organic social media content, editorial lifestyle, natural lighting, clean composition, premium but approachable, not advertising, not poster-like.

Teks Dalam Gambar:
[tulis teks overlay singkat, maksimal 8-10 kata]

Rasio:
4:5 Instagram feed atau 1:1 jika tidak ada format khusus.

Negative Prompt:
Hard-selling ad, discount banner, fake button, exaggerated expression, crowded layout, cheap promotional poster, broken text, unreadable typography, distorted face, extra fingers, overdesigned graphic, generic stock photo, corporate cliché.

Hasil Akhir:
Gambar konten TOFU yang terasa natural, relatable, dan membuat audiens berhenti scroll karena merasa dekat dengan masalah atau insight yang dibahas.

CATATAN PENTING:
- SEMUA bagian finalPrompt harus terisi lengkap tanpa placeholder.
- Seluruh teks ditulis dalam Bahasa Indonesia.
- Kembalikan HANYA JSON murni tanpa markdown pembungkus tambahan di luar JSON.
- Setiap angle (A, B, C) WAJIB menghasilkan adegan visual yang benar-benar berbeda.`;
      } else if (activeTab === 'carousel') {
        promptTitle = '3 CAROUSEL OPTIONS (JSON ARRAY)';
        formatDirection = `Hasilkan 3 opsi carousel, masing-masing berdasarkan "belief journey" (Stop -> Recognize -> Reframe -> Understand -> Learn -> Apply -> Act).
Gunakan struktur slide yang ditentukan oleh kebutuhan ide, bukan jumlah kaku.
WAJIB kembalikan HANYA array JSON murni (tanpa markdown):
[
  {
    "id": "A",
    "name": "Opsi A",
    "content_goal": "...",
    "current_belief": "...",
    "desired_belief": "...",
    "core_promise": "...",
    "slide_count": 7,
    "slide_count_reason": "...",
    "cta_type": "...",
    "cta_text": "...",
    "slides": [
      {
        "slide": 1,
        "role": "...",
        "headline": "...",
        "body": "...",
        "swipe_bridge": "...",
        "visual_intent": "...",
        "emotional_state": "...",
        "text_zone": "..."
      }
    ]
  }
]`;
      } else if (activeTab === 'video') {
        promptTitle = '3 VIDEO STYLE OPTIONS (JSON ARRAY)';
        formatDirection = `Hasilkan 3 opsi gaya video (A = UGC, B = TikTok Loop, C = Sinematik).
WAJIB kembalikan HANYA array JSON murni (tanpa markdown):
[
  {
    "id": "A",
    "name": "Style A",
    "hookStyle": "...",
    "pacingStyle": "...",
    "audioDirection": "...",
    "voiceoverOutline": "...",
    "script": { "hook": "...", "masalah": "...", "solusi": "...", "proof": "...", "cta": "..." },
    "videoPrompt": "Prompt deskriptif (Inggris, 9:16)",
    "visualPlan": "..."
  }
]`;
      } else if (activeTab === 'ugc') {
        promptTitle = 'UGC 3-SCENE PACK (JSON OBJECT)';
        formatDirection = `Hasilkan paket video UGC 3-scene.
WAJIB kembalikan HANYA objek JSON murni (tanpa markdown):
{
  "characterProfile": "...",
  "characterReferenceImagePrompt": "...",
  "scene1_image_prompt": "...",
  "scene2_image_prompt": "...",
  "scene3_image_prompt": "...",
  "scene1_google_flow_prompt": "...",
  "scene2_google_flow_prompt": "...",
  "scene3_google_flow_prompt": "...",
  "script_scene_1": "...",
  "script_scene_2": "...",
  "script_scene_3": "..."
}`;
      } else if (activeTab === 'review') {
        promptTitle = 'STRATEGY ALIGNMENT REVIEW';
        formatDirection = `Berikan skor penyelarasan (0-100), analisis kesesuaian dengan funnel ${activeItem.jenis} & brand voice, serta 3 langkah optimasi taktis (Gunakan Markdown rapi).`;
      }

      // Append revision notes if user typed any custom notes!
      const revisionDirective = revisionNotes.trim() 
        ? `\n\n### CATATAN REVISI KHUSUS DARI USER (WAJIB DIIKUTI):\n- ${revisionNotes.trim()}`
        : '';

      const systemPrompt = `Buatkan ${promptTitle} (Bahasa Indonesia, profesional).

### ITEM:
No: #${activeItem.no} | Funnel: ${activeItem.jenis} | Objective: ${activeItem.tujuan} | Hook: ${activeItem.hookType} | Format: ${activeItem.format}
Headline: ${activeItem.headline}
Body: ${activeItem.body}
Caption: ${activeItem.caption}
Visual: ${activeItem.visual}
CTA: ${activeItem.cta}
Keterangan: ${activeItem.keterangan}

### BRAND:
Name: ${activeContext.brand_context?.brand_name}
Summary: ${activeContext.brand_context?.brand_summary}
Voice: ${activeContext.brand_context?.brand_voice}
Audience: ${activeContext.audience_context?.primary_audience}
USP: ${activeContext.strategy_context?.usp?.join(', ')}
Offer: ${activeContext.strategy_context?.main_offer}

### OUTPUT FORMAT:
${formatDirection}${revisionDirective}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      try {
        const response = await fetch('/api/gemini/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: systemPrompt }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errText = 'API request failed';
          let is429 = response.status === 429;
          try {
            const errData = await response.json();
            if (errData && errData.error) {
              errText = errData.error;
            }
            if (errData?.isRateLimit) {
              is429 = true;
            }
          } catch (_) {}

          if (is429 || /dibatasi|rate.*limit|quota|429/i.test(errText)) {
            setGenerationError("Permintaan AI sedang dibatasi (Rate Limit / Quota Exceeded). Coba lagi beberapa saat.");
            showToast("Permintaan AI sedang dibatasi. Coba lagi beberapa saat.");
          } else {
            setGenerationError(errText || "Gagal memproses permintaan AI. Silakan coba lagi.");
            showToast(`Gagal memproses: ${errText}`);
          }
          return;
        }

        const data = await response.json();
        const generatedText = data.text || '';
        
        if (generatedText) {
          if (activeTab === 'image') {
            const normalized = validateAndNormalizeImageAngles(generatedText);
            if (normalized) {
              setGenerationError(null);
              saveImageOutput(normalized);
              showToast(`Aset IMAGE (3 Angle) berhasil dioptimalkan oleh Gemini AI!`);
            } else {
              setGenerationError("Format respon AI tidak valid atau tidak memenuhi skema Image Angle canonical. Silakan coba lagi.");
              showToast("Gagal: Format respon AI tidak sesuai skema.");
              return;
            }
          } else {
            setGenerationError(null);
            if (activeTab === 'carousel') saveCarouselOutput(generatedText);
            else if (activeTab === 'video') saveVideoOutput(generatedText);
            else if (activeTab === 'ugc') saveUgcOutput(generatedText);
            else if (activeTab === 'review') saveReviewOutput(generatedText);
            showToast(`Aset ${activeTab.toUpperCase()} berhasil dioptimalkan oleh Gemini AI!`);
          }
        } else {
          setGenerationError("Tidak ada konten yang dikembalikan dari AI.");
          showToast("Gagal: Tidak ada respon dari AI.");
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err: any) {
      console.error(err);
      if (err.name === 'AbortError') {
        setGenerationError("Permintaan AI melebihi batas waktu (Timeout 45 detik). Silakan coba lagi.");
        showToast("Permintaan AI melebihi batas waktu (Timeout 45s).");
      } else {
        const errMsg = err.message || '';
        const isRateLimited = /dibatasi/i.test(errMsg) || /rate.*limit/i.test(errMsg) || /quota/i.test(errMsg) || /429/i.test(errMsg);
        if (isRateLimited) {
          setGenerationError("Permintaan AI sedang dibatasi (Rate Limit / Quota Exceeded). Coba lagi beberapa saat.");
          showToast("Permintaan AI sedang dibatasi.");
        } else {
          setGenerationError(`Gagal memproses: ${errMsg || 'Error tidak diketahui'}`);
          showToast(`Gagal memproses: ${errMsg || 'Error tidak diketahui'}`);
        }
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Get current active content based on state or defaults
  const activeItem = sourceItem || itemFallback;
  const activeContext = sharedContextSnapshot || contextFallback;

  const currentOutputText = useMemo(() => {
    if (activeTab === 'image') return imageOutput;
    if (activeTab === 'carousel') return carouselOutput;
    if (activeTab === 'video') return videoOutput;
    if (activeTab === 'ugc') return ugcOutput;
    if (activeTab === 'review') return reviewOutput || getInitialDraft('review', activeItem, activeContext);
    return '';
  }, [activeTab, imageOutput, carouselOutput, videoOutput, ugcOutput, reviewOutput, activeItem, activeContext]);

  const handleUpdateOutputText = (val: string) => {
    if (activeTab === 'image') saveImageOutput(val);
    else if (activeTab === 'carousel') saveCarouselOutput(val);
    else if (activeTab === 'video') saveVideoOutput(val);
    else if (activeTab === 'ugc') saveUgcOutput(val);
    else if (activeTab === 'review') saveReviewOutput(val);
  };

  // Memoized parsed image angles package
  const imageAnglesPackage = useMemo<ImageAnglesPackage | null>(() => {
    const textToParse = imageOutput || getInitialDraft('image', activeItem, activeContext);
    const parsed = tryParseJSON(textToParse);
    if (!parsed) return null;

    let list: any[] = [];
    let recommendedAngleId: 'A' | 'B' | 'C' = 'A';
    let recommendationReason = '';

    if (typeof parsed === 'object' && parsed !== null) {
      if (Array.isArray((parsed as any).angles)) {
        list = (parsed as any).angles;
      } else if (Array.isArray(parsed)) {
        list = parsed;
      }

      if ((parsed as any).recommendedAngleId) {
        const rawRecId = String((parsed as any).recommendedAngleId).toUpperCase().trim();
        if (rawRecId === 'A' || rawRecId === 'B' || rawRecId === 'C') {
          recommendedAngleId = rawRecId as 'A' | 'B' | 'C';
        }
      }

      if ((parsed as any).recommendationReason) {
        recommendationReason = String((parsed as any).recommendationReason).trim();
      }
    }

    if (!Array.isArray(list) || list.length === 0) return null;

    const requiredIds: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];
    const formattedAngles: ImageAngle[] = list.map((item: any, i: number) => {
      const rawId = (item.id || requiredIds[i] || 'A').toString().toUpperCase().trim();
      const id: 'A' | 'B' | 'C' = (rawId === 'A' || rawId === 'B' || rawId === 'C') 
        ? (rawId as 'A' | 'B' | 'C') 
        : (requiredIds[i] || 'A');

      let name = item.name || '';
      if (!name || typeof name !== 'string') {
        if (id === 'A') name = 'Relatable Hook';
        else if (id === 'B') name = 'Insight Hook';
        else if (id === 'C') name = 'Curiosity Hook';
        else name = `Angle ${id}`;
      }

      return {
        id,
        name,
        funnelStage: String(item.funnelStage || item.funnel_stage || 'TOFU'),
        contentGoal: String(item.contentGoal || item.content_goal || 'Membuat audiens relate dan tertarik.'),
        targetEmotion: String(item.targetEmotion || item.target_emotion || ''),
        visualStrategy: String(item.visualStrategy || item.visual_strategy || ''),
        hookStrategy: String(item.hookStrategy || item.hook_strategy || ''),
        colorPsychology: String(item.colorPsychology || item.color_psychology || ''),
        layoutStrategy: String(item.layoutStrategy || item.layout_strategy || ''),
        textOverlay: String(item.textOverlay || item.text_overlay || ''),
        ctaRecommendation: String(item.ctaRecommendation || item.cta_recommendation || ''),
        finalPrompt: String(item.finalPrompt || item.final_prompt || ''),
      };
    });

    return {
      recommendedAngleId,
      recommendationReason: recommendationReason || 'Angle ini direkomendasikan untuk membangun keterikatan awal audiens secara alami tanpa rasa jualan.',
      angles: formattedAngles,
    };
  }, [imageOutput, activeItem, activeContext]);

  // Sync selected angle when recommended angle is parsed
  useEffect(() => {
    if (imageAnglesPackage?.recommendedAngleId) {
      setSelectedAngleId(imageAnglesPackage.recommendedAngleId);
    }
  }, [imageAnglesPackage?.recommendedAngleId]);

  // Memoized parsed carousel options
  const carouselOptions = useMemo<CarouselOption[] | null>(() => {
    const parsed = tryParseJSON(carouselOutput);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as CarouselOption[];
    }
    return null;
  }, [carouselOutput]);

  // Render content of active tab dynamically with premium workshop components
  const renderTabContent = () => {
    if (activeTab === 'image') {
      if (!imageAnglesPackage || imageAnglesPackage.angles.length === 0) {
        return (
          <div className="whitespace-pre-wrap font-sans text-zinc-300 text-xs leading-relaxed">
            {imageOutput || getInitialDraft('image', activeItem, activeContext)}
          </div>
        );
      }

      const activeAngle = imageAnglesPackage.angles.find(a => a.id === selectedAngleId) || imageAnglesPackage.angles[0];
      const recommendedAngle = imageAnglesPackage.angles.find(a => a.id === imageAnglesPackage.recommendedAngleId) || imageAnglesPackage.angles[0];

      return (
        <div className="space-y-5">
          {/* AI Recommendation Banner */}
          {imageAnglesPackage.recommendationReason && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-3.5 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
                <Sparkles size={16} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Rekomendasi AI Engine: Angle {recommendedAngle.id} ({recommendedAngle.name})
                  </span>
                </div>
                <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                  {imageAnglesPackage.recommendationReason}
                </p>
              </div>
            </div>
          )}

          {/* Angle Selection Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3 overflow-x-auto custom-scrollbar">
            {imageAnglesPackage.angles.map((angle) => {
              const isRecommended = angle.id === imageAnglesPackage.recommendedAngleId;
              const isSelected = selectedAngleId === angle.id;

              return (
                <button
                  key={angle.id}
                  onClick={() => setSelectedAngleId(angle.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-blue-500/15 border border-blue-500/40 text-blue-400 font-black shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-zinc-800/40'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-zinc-600'}`} />
                  <span>{angle.name || `Angle ${angle.id}`}</span>
                  {isRecommended && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">
                      Rekomendasi
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Angle Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                <BrainCircuit size={13} className="text-blue-400" />
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">Parameter TOFU & Strategi Hook</h4>
              </div>
              <div className="space-y-3 text-[11px]">
                <div className="flex items-center justify-between gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-850">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Funnel Stage</span>
                    <span className="text-xs text-blue-400 font-extrabold">{activeAngle.funnelStage || 'TOFU'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Tujuan Konten</span>
                    <span className="text-[10px] text-zinc-300 font-medium">{activeAngle.contentGoal || 'Awareness & Relatability'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Target Emosi</span>
                  <p className="text-zinc-200 font-medium">{activeAngle.targetEmotion || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Strategi Hook Visual</span>
                  <p className="text-zinc-200 font-medium">{activeAngle.hookStrategy || '-'}</p>
                </div>
                {activeAngle.textOverlay && (
                  <div>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mb-0.5">Teks Dalam Gambar (Overlay)</span>
                    <p className="text-emerald-300 font-semibold bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-xs">
                      &quot;{activeAngle.textOverlay}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                <Sliders size={13} className="text-purple-400" />
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">Komposisi & Visual Strategy</h4>
              </div>
              <div className="space-y-3 text-[11px]">
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Strategi Visual</span>
                  <p className="text-zinc-200 font-medium">{activeAngle.visualStrategy || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Strategi Layout (Tata Letak)</span>
                  <p className="text-zinc-200 font-medium">{activeAngle.layoutStrategy || '-'}</p>
                </div>
                {activeAngle.colorPsychology && (
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Nuansa & Psikologi Warna</span>
                    <p className="text-zinc-200 font-medium">{activeAngle.colorPsychology}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prompt Box */}
          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-brand" />
                <span className="text-[10px] font-black text-white uppercase tracking-wider">Template Prompt Konten Visual TOFU (Midjourney v6 / Imagen)</span>
              </div>
              <button
                onClick={() => handleCopyText(`prompt_${selectedAngleId}`, activeAngle.finalPrompt)}
                className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 text-[10px] transition-all font-bold"
              >
                {copiedStates[`prompt_${selectedAngleId}`] ? (
                  <>
                    <Check size={11} className="text-brand" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    Salin Prompt
                  </>
                )}
              </button>
            </div>
            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/30 rounded-lg text-zinc-300 font-mono text-[10.5px] leading-relaxed select-all whitespace-pre-wrap">
              {activeAngle.finalPrompt}
            </div>
            <p className="text-[9px] text-zinc-500 leading-normal italic">
              💡 Tips: Salin prompt di atas untuk menghasilkan ilustrasi visual TOFU yang bernuansa organik sosial media (bukan iklan/poster jualan).
            </p>
          </div>

          {/* Direct Gemini Image Generation Box */}
          {(() => {
            const imageKey = `${sourceItem?.no || 1}_${activeAngle.id}`;
            const generatedImg = generatedImages[imageKey];
            const isGenerating = imageGeneratingKey === imageKey;

            return (
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-900">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={15} className="text-blue-400" />
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-zinc-200 tracking-wider">
                        Hasil Generasi Visual Gemini
                      </h4>
                      <p className="text-[10px] text-zinc-500">
                        Satu-klik untuk membuat aset visual langsung dari prompt angle ini.
                      </p>
                    </div>
                  </div>

                  {!generatedImg && (
                    <button
                      onClick={() => handleGenerateImage(activeAngle.finalPrompt, activeAngle.id)}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-white" />
                          <span>Generating image...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Generate Image</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Error Message if any */}
                {imageGenerateError && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-start gap-2.5 text-red-300 text-xs">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                    <div className="space-y-1">
                      <p className="font-semibold">{imageGenerateError}</p>
                    </div>
                  </div>
                )}

                {/* Generated Image Preview & Controls */}
                {generatedImg && (
                  <div className="space-y-3 pt-1">
                    <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex justify-center max-w-md mx-auto">
                      <img
                        src={generatedImg.imageDataUrl}
                        alt={`Generated Visual Angle ${activeAngle.id}`}
                        className="w-full h-auto object-contain max-h-[500px]"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[9px] font-mono text-zinc-300 border border-white/10">
                        {generatedImg.model || 'gemini-3.1-flash-image'}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2.5 pt-1">
                      <button
                        onClick={() => handleDownloadImage(generatedImg.imageDataUrl, activeAngle.id)}
                        className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Download size={13} className="text-blue-400" />
                        <span>Download Image</span>
                      </button>

                      <button
                        onClick={() => handleGenerateImage(activeAngle.finalPrompt, activeAngle.id)}
                        disabled={isGenerating}
                        className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-blue-400" />
                            <span>Generating image...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw size={13} className="text-purple-400" />
                            <span>Regenerate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      );
    }

    if (activeTab === 'carousel') {
      let plan: CarouselPlan | null = activeItem?.carousel_plan || null;
      
      if (!plan) {
        const rawOutput = carouselOutput || getInitialDraft('carousel', activeItem, activeContext);
        if (rawOutput) {
          const parsed = tryParseJSON(rawOutput);
          if (parsed && typeof parsed === 'object') {
            if ('slides' in parsed && Array.isArray(parsed.slides)) {
              plan = parsed as CarouselPlan;
            }
          }
        }
      }

      if (!plan || !plan.slides || plan.slides.length === 0) {
        return (
          <div className="whitespace-pre-wrap font-sans text-zinc-300 text-xs leading-relaxed">
            {carouselOutput || getInitialDraft('carousel', activeItem, activeContext)}
          </div>
        );
      }

      const slides = plan.slides;
      const activeSlide = slides.find(s => s.slide === activeSlideNumber) || slides[0];

      return (
        <div className="space-y-5">
          {/* Strategy Summary Card */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
              <span className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={13} />
                Carousel Funnel Blueprint
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full">
                {plan.slide_count || slides.length} Slides • {plan.funnel_stage || activeItem?.jenis || 'TOFU'}
              </span>
            </div>

            {plan.belief_journey_summary && (
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Belief Journey Summary</span>
                <p className="text-zinc-200 text-xs font-medium leading-relaxed bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850/60">
                  {plan.belief_journey_summary}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              {plan.slide_count_reason && (
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Slide Count Reason</span>
                  <p className="text-zinc-300 font-medium text-[11px] leading-snug">{plan.slide_count_reason}</p>
                </div>
              )}
              {(plan.primary_cta_text || plan.primary_cta_type) && (
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Primary CTA</span>
                  <p className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 mt-0.5">
                    {plan.primary_cta_type && (
                      <span className="uppercase text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md font-mono">
                        {plan.primary_cta_type}
                      </span>
                    )}
                    {plan.primary_cta_text}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Slide Timeline Navigator */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Navigasi Timeline Slide ({slides.length} Slide)</span>
              <button
                onClick={() => {
                  const combinedText = slides.map(s => 
                    `[SLIDE ${s.slide}]\nRole: ${s.role}\nCommunication Job: ${s.communication_job}\nHeadline: ${s.headline}\nBody: ${s.body}\nSwipe Bridge: ${s.swipe_bridge}\nVisual Intent: ${s.visual_intent}\nVisual Type: ${s.visual_type || '-'}\nText Zone: ${s.text_zone || '-'}\nNegative Space: ${s.negative_space_plan || '-'}`
                  ).join('\n\n-------------------\n\n');
                  handleCopyText('carousel_plan_all', combinedText);
                }}
                className="text-[9px] font-bold text-brand hover:underline flex items-center gap-1 transition"
              >
                {copiedStates['carousel_plan_all'] ? 'Tersalin!' : 'Salin Seluruh Slide Plan 📋'}
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
              {slides.map((slide) => {
                const isActive = activeSlide && activeSlide.slide === slide.slide;
                return (
                  <button
                    key={slide.slide}
                    onClick={() => setActiveSlideNumber(slide.slide)}
                    className={`px-3 py-2 rounded-lg border text-center transition-all min-w-[85px] ${
                      isActive
                        ? 'bg-purple-600 border-purple-500 text-white font-black scale-[1.02]'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="text-[8px] font-mono uppercase tracking-widest opacity-70">Slide {slide.slide}</div>
                    <div className="text-[10px] font-bold capitalize truncate max-w-[80px]">{slide.role}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Slide Details */}
          {activeSlide && (
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-black text-purple-400 uppercase tracking-widest">
                    Slide {activeSlide.slide} / {slides.length}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono font-bold text-zinc-300 capitalize">
                    Role: {activeSlide.role}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyText(`slide_plan_${activeSlide.slide}`, `Slide ${activeSlide.slide} (${activeSlide.role})\nCommunication Job: ${activeSlide.communication_job}\nHeadline: ${activeSlide.headline}\nBody: ${activeSlide.body}\nSwipe Bridge: ${activeSlide.swipe_bridge}\nVisual Intent: ${activeSlide.visual_intent}`)}
                  className="text-[9.5px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition-all"
                >
                  {copiedStates[`slide_plan_${activeSlide.slide}`] ? <Check size={10} className="text-brand" /> : <Copy size={10} />}
                  Salin Slide
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block mb-0.5">Communication Job</span>
                  <p className="text-purple-300 font-medium text-xs bg-purple-950/20 p-2.5 rounded-lg border border-purple-900/30">{activeSlide.communication_job}</p>
                </div>

                <div>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block mb-0.5">Headline</span>
                  <p className="text-zinc-100 font-bold text-sm leading-snug">{activeSlide.headline}</p>
                </div>

                <div>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block mb-0.5">Body Copy</span>
                  <p className="text-zinc-300 font-medium text-xs leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-850/60 whitespace-pre-wrap">{activeSlide.body}</p>
                </div>

                {activeSlide.swipe_bridge && (
                  <div>
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block mb-0.5">Swipe Bridge</span>
                    <p className="text-emerald-400 font-semibold text-xs bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30">{activeSlide.swipe_bridge}</p>
                  </div>
                )}

                {/* Visual Intent & Layout Specs */}
                <div className="p-3 bg-zinc-900/60 border border-zinc-800/50 rounded-xl space-y-2">
                  <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={12} className="text-purple-400" />
                    Visual Intent & Layout Strategy
                  </span>
                  <p className="text-zinc-300 text-xs leading-relaxed font-mono bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                    {activeSlide.visual_intent}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] pt-1">
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-850">
                      <span className="text-zinc-500 text-[8px] uppercase font-bold block">Visual Type</span>
                      <span className="text-zinc-200 font-semibold">{activeSlide.visual_type || '-'}</span>
                    </div>
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-850">
                      <span className="text-zinc-500 text-[8px] uppercase font-bold block">Text Zone</span>
                      <span className="text-zinc-200 font-semibold">{activeSlide.text_zone || '-'}</span>
                    </div>
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-850">
                      <span className="text-zinc-500 text-[8px] uppercase font-bold block">Negative Space Plan</span>
                      <span className="text-zinc-200 font-semibold">{activeSlide.negative_space_plan || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'video') {
      if (!videoOutput) {
        return (
          <div className="whitespace-pre-wrap font-sans text-zinc-300 text-xs leading-relaxed">
            {videoOutput || getInitialDraft('video', activeItem, activeContext)}
          </div>
        );
      }

      let videoStyles: VideoStyle[] | null = null;
      try {
        const parsed = tryParseJSON(videoOutput);
        if (Array.isArray(parsed) && parsed.length > 0) {
          videoStyles = parsed as VideoStyle[];
        }
      } catch (e) {
        videoStyles = null;
      }

      if (!videoStyles) {
        return (
          <div className="whitespace-pre-wrap font-sans text-zinc-350 text-xs leading-relaxed">
            {videoOutput}
          </div>
        );
      }

      const activeVideo = videoStyles.find(v => v.id === selectedVideoId) || videoStyles[0];

      return (
        <div className="space-y-5">
          {/* Style Selection Tabs */}
          <div className="flex items-center gap-1.5 border-b border-zinc-800/60 pb-3 overflow-x-auto custom-scrollbar">
            {videoStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedVideoId(style.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedVideoId === style.id
                    ? 'bg-rose-500/15 border border-rose-500/35 text-rose-400 font-black'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedVideoId === style.id ? 'bg-rose-400' : 'bg-transparent'}`} />
                {style.name}
              </button>
            ))}
          </div>

          {/* Active Style Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                <BrainCircuit size={13} className="text-rose-400" />
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">Metode Hook & Pacing</h4>
              </div>
              <div className="space-y-2.5 text-[11px]">
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Hook Style</span>
                  <p className="text-zinc-200 font-medium">{activeVideo.hookStyle || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Pacing Video</span>
                  <p className="text-zinc-200 font-medium">{activeVideo.pacingStyle || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                <Sliders size={13} className="text-amber-400" />
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">Arah Suara & Musik</h4>
              </div>
              <div className="space-y-2.5 text-[11px]">
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Audio Direction</span>
                  <p className="text-zinc-200 font-medium">{activeVideo.audioDirection || '-'}</p>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Voiceover Outline</span>
                  <p className="text-zinc-200 font-medium">{activeVideo.voiceoverOutline || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900">
                <ImageIcon size={13} className="text-blue-400" />
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">Video Generator Prompt & Alur</h4>
              </div>
              <div className="space-y-2.5 text-[11px]">
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Aset Visual Plan</span>
                  <p className="text-zinc-200 font-medium">{activeVideo.visualPlan || '-'}</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Luma/Runway Prompt</span>
                  <button
                    onClick={() => handleCopyText(`vprompt_${activeVideo.id}`, activeVideo.videoPrompt)}
                    className="text-[9.5px] font-bold text-rose-400 hover:underline flex items-center gap-1"
                  >
                    {copiedStates[`vprompt_${activeVideo.id}`] ? 'Tersalin!' : 'Copy Prompt'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Script Copywriting (Hook, Masalah, Solusi, Proof, CTA) */}
          <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <PlayCircle size={14} className="text-rose-500" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">Struktur Naskah Copywriting Utama</h3>
              </div>
              <button
                onClick={() => {
                  const combinedScript = `[Naskah Video - ${activeVideo.name}]\n- HOOK: ${activeVideo.script?.hook}\n- MASALAH: ${activeVideo.script?.masalah}\n- SOLUSI: ${activeVideo.script?.solusi}\n- PROOF: ${activeVideo.script?.proof}\n- CTA: ${activeVideo.script?.cta}`;
                  handleCopyText(`script_all_${activeVideo.id}`, combinedScript);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-rose-400 hover:text-rose-300 rounded-xl border border-zinc-800 text-[10px] font-bold transition-all"
              >
                {copiedStates[`script_all_${activeVideo.id}`] ? (
                  <>
                    <Check size={12} />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Salin Seluruh Naskah Video
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
              <div className="p-3 bg-zinc-900/50 border border-zinc-850/60 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[8px] font-black font-mono text-rose-400 uppercase tracking-widest block w-fit">
                  1. Hook
                </span>
                <p className="text-zinc-200 leading-relaxed font-semibold italic">&ldquo;{activeVideo.script?.hook}&rdquo;</p>
              </div>

              <div className="p-3 bg-zinc-900/50 border border-zinc-850/60 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] font-black font-mono text-amber-400 uppercase tracking-widest block w-fit">
                  2. Masalah
                </span>
                <p className="text-zinc-200 leading-relaxed font-medium">&ldquo;{activeVideo.script?.masalah}&rdquo;</p>
              </div>

              <div className="p-3 bg-zinc-900/50 border border-zinc-850/60 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black font-mono text-emerald-400 uppercase tracking-widest block w-fit">
                  3. Solusi
                </span>
                <p className="text-zinc-200 leading-relaxed font-medium">&ldquo;{activeVideo.script?.solusi}&rdquo;</p>
              </div>

              <div className="p-3 bg-zinc-900/50 border border-zinc-850/60 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[8px] font-black font-mono text-blue-400 uppercase tracking-widest block w-fit">
                  4. Proof
                </span>
                <p className="text-zinc-200 leading-relaxed font-medium">&ldquo;{activeVideo.script?.proof}&rdquo;</p>
              </div>

              <div className="p-3 bg-zinc-900/50 border border-zinc-850/60 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[8px] font-black font-mono text-purple-400 uppercase tracking-widest block w-fit">
                  5. CTA
                </span>
                <p className="text-zinc-200 leading-relaxed font-bold">&ldquo;{activeVideo.script?.cta}&rdquo;</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/20 border border-zinc-900 rounded-xl text-[10.5px] text-zinc-400 leading-relaxed font-mono">
              <span className="font-bold text-zinc-300">Prompt Video Generator (Runway / Luma / Kling):</span>
              <p className="mt-1 select-all">{activeVideo.videoPrompt}</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'ugc') {
      if (!ugcOutput) {
        return (
          <div className="whitespace-pre-wrap font-sans text-zinc-300 text-xs leading-relaxed">
            {ugcOutput || getInitialDraft('ugc', activeItem, activeContext)}
          </div>
        );
      }

      let ugcPack: UgcPack | null = null;
      try {
        const parsed = tryParseJSON(ugcOutput);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          ugcPack = parsed as UgcPack;
        }
      } catch (e) {
        ugcPack = null;
      }

      if (!ugcPack) {
        return (
          <div className="whitespace-pre-wrap font-sans text-zinc-350 text-xs leading-relaxed">
            {ugcOutput}
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {/* URUTAN KERJA UTAMA PRODUKSI */}
          <div className="bg-zinc-950 border border-zinc-850 p-4.5 rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-900">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={13} />
                Langkah Alur Utama Produksi UGC
              </span>
              <span className="text-[9px] text-zinc-500 italic">Ikuti instruksi sesuai urutan nomor</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  const combinedImagePrompts = `[UGC Character Reference Image Prompt]\n${ugcPack?.characterReferenceImagePrompt}\n\n[Scene 1 Image Prompt]\n${ugcPack?.scene1_image_prompt}\n\n[Scene 2 Image Prompt]\n${ugcPack?.scene2_image_prompt}\n\n[Scene 3 Image Prompt]\n${ugcPack?.scene3_image_prompt}`;
                  handleCopyText('ugc_all_images', combinedImagePrompts);
                }}
                className="flex items-center justify-between p-3.5 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition text-left group"
              >
                <div className="space-y-0.5">
                  <div className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Langkah 1</div>
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-white transition">Copy Prompt Image</div>
                </div>
                <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 group-hover:text-emerald-400 transition">
                  {copiedStates['ugc_all_images'] ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </div>
              </button>

              <button
                onClick={() => {
                  const combinedVideoPrompts = `[Scene 1 Google Flow / Video Prompt]\n${ugcPack?.scene1_google_flow_prompt}\n\n[Scene 2 Google Flow / Video Prompt]\n${ugcPack?.scene2_google_flow_prompt}\n\n[Scene 3 Google Flow / Video Prompt]\n${ugcPack?.scene3_google_flow_prompt}`;
                  handleCopyText('ugc_all_videos', combinedVideoPrompts);
                }}
                className="flex items-center justify-between p-3.5 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition text-left group"
              >
                <div className="space-y-0.5">
                  <div className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Langkah 2</div>
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-white transition">Copy Prompt Video</div>
                </div>
                <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 group-hover:text-emerald-400 transition">
                  {copiedStates['ugc_all_videos'] ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </div>
              </button>

              <a
                href="https://g.co/flow"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-500/25 rounded-xl transition text-left group"
              >
                <div className="space-y-0.5">
                  <div className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Langkah 3</div>
                  <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-100 transition">Buka Google Flow</div>
                </div>
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ExternalLink size={11} />
                </div>
              </a>
            </div>
          </div>

          {/* CHARACTER PROFILE CARD */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 bg-zinc-950 border border-zinc-850 p-4.5 rounded-xl space-y-3.5">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-zinc-900">
                <Users size={13} className="text-emerald-400" />
                <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">UGC Creator Profile</h4>
              </div>
              <div className="space-y-3 text-[11px] leading-relaxed">
                <div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Karakter Kreator</span>
                  <p className="text-zinc-200 font-medium bg-zinc-900/30 p-2 rounded-lg border border-zinc-900">{ugcPack.characterProfile}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Character Ref Prompt</span>
                    <button
                      onClick={() => handleCopyText('ugc_char_ref', ugcPack.characterReferenceImagePrompt)}
                      className="text-[9.5px] font-bold text-emerald-400 hover:underline"
                    >
                      {copiedStates['ugc_char_ref'] ? 'Tersalin!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-zinc-400 font-mono text-[9px] bg-zinc-900/60 p-2 rounded-lg border border-zinc-850 select-all">{ugcPack.characterReferenceImagePrompt}</p>
                </div>
              </div>
            </div>

            {/* SCENE BLOCKS */}
            <div className="md:col-span-8 space-y-4">
              {/* Scene 1 = Hook */}
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-900">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8.5px] font-black font-mono text-emerald-400 uppercase tracking-widest">
                      Scene 1 (Hook)
                    </span>
                    <span className="text-[10px] font-bold text-zinc-300">Penarik Perhatian Spontan</span>
                  </div>
                  <button
                    onClick={() => {
                      const sceneText = `[SCENE 1 (HOOK)]\nScript: ${ugcPack?.script_scene_1}\nVideo Prompt: ${ugcPack?.scene1_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene1_image_prompt}`;
                      handleCopyText('ugc_scene_1', sceneText);
                    }}
                    className="text-[9px] font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition"
                  >
                    {copiedStates['ugc_scene_1'] ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    Salin Scene 1
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-[11px] leading-relaxed">
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">Script Scene</span>
                    <p className="text-zinc-200 font-semibold italic bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/55">&ldquo;{ugcPack.script_scene_1}&rdquo;</p>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">Video Prompt (Google Flow)</span>
                    <p className="text-zinc-300 font-mono text-[9px] bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/55 select-all">{ugcPack.scene1_google_flow_prompt}</p>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">Image Prompt</span>
                    <p className="text-zinc-300 font-mono text-[9px] bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/55 select-all">{ugcPack.scene1_image_prompt}</p>
                  </div>
                </div>
              </div>

              {/* Scene 2 = Solution */}
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-900">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8.5px] font-black font-mono text-blue-400 uppercase tracking-widest">
                      Scene 2 (Solution)
                    </span>
                    <span className="text-[10px] font-bold text-zinc-300">Penyelesaian Masalah Intuitif</span>
                  </div>
                  <button
                    onClick={() => {
                      const sceneText = `[SCENE 2 (SOLUTION)]\nScript: ${ugcPack?.script_scene_2}\nVideo Prompt: ${ugcPack?.scene2_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene2_image_prompt}`;
                      handleCopyText('ugc_scene_2', sceneText);
                    }}
                    className="text-[9px] font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition"
                  >
                    {copiedStates['ugc_scene_2'] ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    Salin Scene 2
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-[11px] leading-relaxed">
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">Script Scene</span>
                    <p className="text-zinc-200 font-medium italic bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/55">&ldquo;{ugcPack.script_scene_2}&rdquo;</p>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">Video Prompt (Google Flow)</span>
                    <p className="text-zinc-300 font-mono text-[9px] bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/55 select-all">{ugcPack.scene2_google_flow_prompt}</p>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">Image Prompt</span>
                    <p className="text-zinc-300 font-mono text-[9px] bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/55 select-all">{ugcPack.scene2_image_prompt}</p>
                  </div>
                </div>
              </div>

              {/* Scene 3 = CTA */}
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-900">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[8.5px] font-black font-mono text-purple-400 uppercase tracking-widest">
                      Scene 3 (CTA)
                    </span>
                    <span className="text-[10px] font-bold text-zinc-300">Ajakan Bertindak Konversi Tinggi</span>
                  </div>
                  <button
                    onClick={() => {
                      const sceneText = `[SCENE 3 (CTA)]\nScript: ${ugcPack?.script_scene_3}\nVideo Prompt: ${ugcPack?.scene3_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene3_image_prompt}`;
                      handleCopyText('ugc_scene_3', sceneText);
                    }}
                    className="text-[9px] font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition"
                  >
                    {copiedStates['ugc_scene_3'] ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    Salin Scene 3
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-[11px] leading-relaxed">
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">Script Scene</span>
                    <p className="text-zinc-200 font-bold italic bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/55">&ldquo;{ugcPack.script_scene_3}&rdquo;</p>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">Video Prompt (Google Flow)</span>
                    <p className="text-zinc-300 font-mono text-[9px] bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/55 select-all">{ugcPack.scene3_google_flow_prompt}</p>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">Image Prompt</span>
                    <p className="text-zinc-300 font-mono text-[9px] bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/55 select-all">{ugcPack.scene3_image_prompt}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FULL PACKAGE SUMMARY */}
          <div className="bg-zinc-950 border border-zinc-850 p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Clipboard size={14} className="text-emerald-400" />
              <div>
                <h5 className="text-xs font-black uppercase text-white tracking-wider">UGC 3-Scene Production Pack Bundle</h5>
                <p className="text-[9px] text-zinc-400 font-medium">Salin seluruh detail draf naskah, kriteria profil, dan prompt visual dalam satu klik.</p>
              </div>
            </div>
            <button
              onClick={() => {
                const fullPackText = `[UGC CREATOR BRIEF & SCRIPT PACK]\n\nCHARACTER PROFILE:\n${ugcPack?.characterProfile}\n\nCHARACTER IMAGE PROMPT:\n${ugcPack?.characterReferenceImagePrompt}\n\n=========================================\n\nSCENE 1 (HOOK):\nScript: ${ugcPack?.script_scene_1}\nVideo Prompt: ${ugcPack?.scene1_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene1_image_prompt}\n\n=========================================\n\nSCENE 2 (SOLUTION):\nScript: ${ugcPack?.script_scene_2}\nVideo Prompt: ${ugcPack?.scene2_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene2_image_prompt}\n\n=========================================\n\nSCENE 3 (CTA):\nScript: ${ugcPack?.script_scene_3}\nVideo Prompt: ${ugcPack?.scene3_google_flow_prompt}\nImage Prompt: ${ugcPack?.scene3_image_prompt}`;
                handleCopyText('ugc_full_package', fullPackText);
              }}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-xl text-xs transition shadow-md"
            >
              {copiedStates['ugc_full_package'] ? (
                <>
                  <Check size={13} />
                  Full Pack Tersalin!
                </>
              ) : (
                <>
                  <Clipboard size={13} />
                  Copy Full Pack
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    // Default Fallbacks for fallback cases
    return (
      <div className="whitespace-pre-wrap font-sans text-zinc-350 text-xs leading-relaxed">
        {currentOutputText}
      </div>
    );
  };

  // Calculate readiness metrics
  const readinessChecklist = useMemo(() => {
    const checks = [
      { id: 'source', label: 'Source Item Tersedia', status: !!sourceItem },
      { id: 'context', label: 'Strategy Context Tersedia', status: !!sharedContextSnapshot },
      { id: 'headline', label: 'Headline Tersedia', status: !!activeItem.headline },
      { id: 'objective', label: 'Objective / Tujuan Tersedia', status: !!activeItem.tujuan },
      { id: 'cta', label: 'Call to Action (CTA) Tersedia', status: !!activeItem.cta },
      { id: 'visual', label: 'Visual Direction Tersedia', status: !!activeItem.visual }
    ];
    const passedCount = checks.filter(c => c.status).length;
    const percentage = Math.round((passedCount / checks.length) * 100);
    return { checks, passedCount, total: checks.length, percentage };
  }, [sourceItem, sharedContextSnapshot, activeItem]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
          <BrainCircuit size={20} className="text-purple-400 absolute top-3.5 animate-pulse" />
          <p className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Memuat Production Studio...</p>
        </div>
      </main>
    );
  }

  if (isLoaded && !sourceItem) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-brand selection:text-black">
        <header className="border-b border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800/80 transition flex items-center justify-center"
              title="Kembali ke Kalender Konten"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                <BrainCircuit size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black tracking-tight text-white uppercase">ALCO PRODUCTION STUDIO</h1>
                  <span className="px-2 py-0.5 rounded-full bg-brand/10 border border-brand/25 text-brand text-[8px] font-mono font-bold tracking-widest uppercase">
                    Studio v1.0
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">Pusat Produksi & Penyelarasan Strategi Aset Konten</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 font-bold rounded-xl text-xs transition"
          >
            Kembali ke Kalender
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Belum Ada Item Kalender yang Dipilih</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Silakan kembali ke Kalender Utama dan pilih salah satu item konten dengan mengklik tombol <span className="text-purple-400 font-semibold">Buka Production Studio ✨</span> pada panel detail item.
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full py-2.5 bg-brand hover:brightness-105 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={13} />
              Kembali ke Kalender Utama
            </button>
          </div>
        </div>

        <footer className="border-t border-zinc-900 bg-zinc-950 py-3.5 px-6 text-center text-[10px] text-zinc-500 font-mono">
          ALCO Production Studio — Memproduksi Konten Bernilai Konversi Tinggi
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-brand selection:text-black">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[9999] bg-brand text-black font-extrabold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-brand/40"
          >
            <Sparkles size={14} className="animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Studio Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800/80 transition flex items-center justify-center"
            title="Kembali ke Kalender Konten"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
              <BrainCircuit size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-white uppercase">ALCO PRODUCTION STUDIO</h1>
                <span className="px-2 py-0.5 rounded-full bg-brand/10 border border-brand/25 text-brand text-[8px] font-mono font-bold tracking-widest uppercase">
                  Studio v1.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Pusat Produksi & Penyelarasan Strategi Aset Konten</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
            <Target size={12} className="text-brand" />
            Campaign: <span className="font-bold text-zinc-200">{activeContext.brand_context?.brand_name || 'ALCO Engine'}</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 font-bold rounded-xl text-xs transition"
          >
            Kembali ke Kalender
          </button>
        </div>
      </header>

      {/* Main Studio Workspace Grid */}
      <div className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: ACTIVE CALENDAR ITEM & BRAND SUMMARY SIDEBAR (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Quick Context Reference Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black border ${
                  (activeItem.jenis || '').includes('TOFU') ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' :
                  (activeItem.jenis || '').includes('MOFU') ? 'bg-purple-500/10 text-purple-400 border-purple-500/25' :
                  'bg-brand/15 text-brand border-brand/25'
                }`}>
                  #{activeItem.no || '1'}
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-tight">Item Kalender</h2>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{activeItem.tanggal}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                (activeItem.jenis || '').includes('TOFU') ? 'bg-blue-500/10 text-blue-400' :
                (activeItem.jenis || '').includes('MOFU') ? 'bg-purple-500/10 text-purple-400' :
                'bg-brand/10 text-brand'
              }`}>
                {activeItem.jenis}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <Zap size={11} className="text-brand" /> Headline Utama
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800/50 p-2.5 rounded-xl text-zinc-200 font-semibold leading-relaxed">
                  {activeItem.headline}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/50">
                  <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Tujuan (Objective)</div>
                  <p className="text-[10px] text-zinc-300 font-medium">{activeItem.tujuan}</p>
                </div>
                <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/50">
                  <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Format Konten</div>
                  <p className="text-[10px] text-zinc-300 font-medium">{activeItem.format}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/50">
                  <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Tipe Hook</div>
                  <p className="text-[10px] text-zinc-300 font-medium">{activeItem.hookType}</p>
                </div>
                <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/50">
                  <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Panggilan Aksi (CTA)</div>
                  <p className="text-[10px] text-zinc-300 font-medium">{activeItem.cta}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <FileText size={11} /> Naskah Kasar / Body
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800/50 p-3 rounded-xl text-zinc-300 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar whitespace-pre-wrap text-[11px]">
                  {activeItem.body}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <MessageSquare size={11} /> Visual Direction
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800/50 p-3 rounded-xl text-zinc-300 leading-relaxed text-[11px]">
                  {activeItem.visual}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Brand Metadata Context Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/60">
              <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Target size={13} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-tight">Pembuat Strategi</h3>
                <p className="text-[9px] text-zinc-500 font-medium">Informasi Suara Brand & Audiens</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Nama Brand</div>
                  <p className="text-[11px] text-zinc-200 font-semibold">{activeContext.brand_context?.brand_name || 'ALCO Engine'}</p>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Suara Brand</div>
                  <p className="text-[10px] text-zinc-400 font-medium line-clamp-1">{activeContext.brand_context?.brand_voice || '-'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                  <Users size={10} className="text-brand/80" /> Audiens Utama
                </div>
                <p className="text-[10px] text-zinc-300 font-medium leading-relaxed bg-zinc-950/40 p-2 rounded-xl border border-zinc-800/50">
                  {activeContext.audience_context?.primary_audience}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Pain Points Teratas</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeContext.audience_context?.pain_points?.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-red-500/5 border border-red-500/15 text-[9px] text-red-400 font-medium">
                      {p}
                    </span>
                  )) || <span className="text-zinc-500">-</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE TAB NAVIGATION & DYNAMIC WORKSHOP CONTENT (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {generationError && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-3.5 rounded-2xl flex items-start justify-between gap-3 text-xs shadow-lg">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-300">Pemberitahuan Sistem AI</span>
                  <p className="text-[11px] leading-relaxed text-amber-200/90 mt-0.5">{generationError}</p>
                </div>
              </div>
              <button 
                onClick={() => setGenerationError(null)}
                className="text-amber-400 hover:text-white text-[10px] font-bold px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition shrink-0"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Tab Selection Header */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-1.5 rounded-2xl flex items-center justify-between gap-1 shadow-lg overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-1 min-w-max">
              {[
                { id: 'review', label: 'Review & Kesiapan', icon: Eye },
                { id: 'image', label: 'Image Prompt', icon: ImageIcon },
                { id: 'carousel', label: 'Carousel', icon: Layers },
                { id: 'video', label: 'Video Script', icon: Video },
                { id: 'ugc', label: 'UGC Brief', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsEditingMode(false); // Reset to preview mode upon switching tabs
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-brand text-black shadow-md font-black scale-[1.02]' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleGenerateWithAI}
              disabled={isLoadingAI}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs transition-all disabled:opacity-50 min-w-max shadow-md"
            >
              <RefreshCw size={13} className={`text-purple-200 ${isLoadingAI ? 'animate-spin' : ''}`} />
              {isLoadingAI ? 'Memproses...' : 'Optimalkan via Gemini AI ✨'}
            </button>
          </div>

          {/* DYNAMIC STUDIO WORKSPACE */}
          <div className="flex-1 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-xl min-h-[550px]">
            
            {/* TAB CONTENT: REVIEW */}
            {activeTab === 'review' ? (
              <div className="space-y-6 flex-1">
                
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/60 gap-3">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Sliders size={16} className="text-brand" /> Evaluasi Strategis & Kesiapan Produksi
                    </h3>
                    <p className="text-[10px] text-zinc-400">Pastikan seluruh data penawaran selaras dengan corong pemasaran sebelum eksekusi</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 text-[10px] font-mono">Status Kesiapan:</span>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                      readinessChecklist.percentage === 100 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {readinessChecklist.percentage}% Siap
                    </span>
                  </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* BLOK 1: Selected Content Item Details */}
                  <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/60 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
                      <FileText size={14} className="text-brand" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wide">1. Selected Content Item</h4>
                    </div>
                    <div className="space-y-2.5 text-[11px] leading-relaxed text-zinc-300">
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Headline Utama</span>
                        <p className="font-semibold text-white">{activeItem.headline}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Funnel Stage</span>
                          <p className="text-zinc-200">{activeItem.jenis}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Objective / Tujuan</span>
                          <p className="text-zinc-200">{activeItem.tujuan}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Format Konten</span>
                          <p className="text-zinc-200">{activeItem.format}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Panggilan Aksi (CTA)</span>
                          <p className="text-zinc-200 font-medium text-brand">{activeItem.cta}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Naskah Kasar / Body</span>
                        <p className="text-zinc-400 line-clamp-3 bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/30 font-mono text-[10px] leading-normal">{activeItem.body}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Rencana Caption</span>
                        <p className="text-zinc-400 line-clamp-3 bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/30 font-mono text-[10px] leading-normal">{activeItem.caption}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Visual Direction</span>
                        <p className="text-zinc-300 italic">{activeItem.visual}</p>
                      </div>
                    </div>
                  </div>

                  {/* BLOK 2: Brand & Strategy Context */}
                  <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/60 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
                      <Target size={14} className="text-purple-400" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wide">2. Brand & Strategy Context</h4>
                    </div>
                    <div className="space-y-2.5 text-[11px] leading-relaxed text-zinc-300">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Nama Brand</span>
                          <p className="font-bold text-white">{activeContext.brand_context?.brand_name || 'ALCO Engine'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Brand Voice</span>
                          <p className="text-zinc-200">{activeContext.brand_context?.brand_voice || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Target Audiens</span>
                        <p className="text-zinc-200 font-medium">{activeContext.audience_context?.primary_audience}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Core Positioning</span>
                        <p className="text-zinc-400 leading-normal">{activeContext.strategy_context?.positioning || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Unique Selling Proposition (USP)</span>
                        <p className="text-zinc-400 leading-normal">{activeContext.strategy_context?.usp?.join(' | ') || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Penawaran Utama (Main Offer)</span>
                        <p className="text-brand font-semibold">{activeContext.strategy_context?.main_offer || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Core Message</span>
                        <p className="text-zinc-400 italic bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/30 leading-normal">{activeContext.strategy_context?.core_message || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Pilar Konten Utama (Content Pillars)</span>
                        <p className="text-zinc-300 font-medium">{activeContext.strategy_context?.content_pillars?.join(' • ') || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Pain Points Terdeteksi</span>
                        <p className="text-red-400 leading-normal">{activeContext.audience_context?.pain_points?.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Sub-section: 3 & 4 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                  
                  {/* BLOK 3: Production Readiness Checklist (md:col-span-5) */}
                  <div className="md:col-span-5 bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/60 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
                        <CheckSquare size={14} className="text-emerald-400" />
                        <h4 className="text-xs font-black text-white uppercase tracking-wide">3. Production Readiness</h4>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="space-y-1 py-1">
                        <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                          <span>Validasi Kelayakan Data</span>
                          <span className="font-bold text-brand">{readinessChecklist.percentage}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800/80">
                          <motion.div 
                            className="bg-brand h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${readinessChecklist.percentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      {/* Checklist List */}
                      <div className="space-y-2 pt-1">
                        {readinessChecklist.checks.map((check) => (
                          <div key={check.id} className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400">{check.label}</span>
                            {check.status ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[9px] bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                <Check size={10} /> Valid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-amber-500 font-bold text-[9px] bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                                <AlertCircle size={10} /> Kosong
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-500 italic mt-4 pt-2 border-t border-zinc-900/40">
                      * Apabila ada field kosong, silakan sesuaikan ulang isian di strategi masukan atau formulir detail kalender.
                    </div>
                  </div>

                  {/* BLOK 4: Choose Production Path (md:col-span-7) */}
                  <div className="md:col-span-7 bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/60 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
                      <ListTodo size={14} className="text-indigo-400" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wide">4. Choose Production Path</h4>
                    </div>

                    <p className="text-[10px] text-zinc-400 leading-relaxed pb-1">
                      Pilih format aset produksi yang ingin Anda optimalkan menggunakan parameter strategi yang sudah diselaraskan di atas:
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Path Character DNA */}
                      <button
                        onClick={() => setActiveTab('dna')}
                        className="p-3 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/60 rounded-xl text-left transition group"
                      >
                        <div className="flex items-center gap-2 text-white font-bold text-[11px] group-hover:text-brand transition mb-1">
                          <BrainCircuit size={13} className="text-yellow-400" />
                          <span>Character DNA</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 line-clamp-2 leading-normal">
                          Membangun identitas visual karakter yang konsisten untuk konten.
                        </p>
                      </button>

                      {/* Path Image */}
                      <button
                        onClick={() => setActiveTab('image')}
                        className="p-3 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/60 rounded-xl text-left transition group"
                      >
                        <div className="flex items-center gap-2 text-white font-bold text-[11px] group-hover:text-brand transition mb-1">
                          <ImageIcon size={13} className="text-blue-400" />
                          <span>Image Prompt Workshop</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 line-clamp-2 leading-normal">
                          Membuat prompt gambar Midjourney/Imagen siap pakai berdasarkan detail visual.
                        </p>
                      </button>

                      {/* Path Carousel */}
                      <button
                        onClick={() => setActiveTab('carousel')}
                        className="p-3 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/60 rounded-xl text-left transition group"
                      >
                        <div className="flex items-center gap-2 text-white font-bold text-[11px] group-hover:text-brand transition mb-1">
                          <Layers size={13} className="text-purple-400" />
                          <span>Carousel Slide Blueprint</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 line-clamp-2 leading-normal">
                          Mengembangkan alur slide-by-slide lengkap dengan trigger visual psikologis.
                        </p>
                      </button>

                      {/* Path Video */}
                      <button
                        onClick={() => setActiveTab('video')}
                        className="p-3 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/60 rounded-xl text-left transition group"
                      >
                        <div className="flex items-center gap-2 text-white font-bold text-[11px] group-hover:text-brand transition mb-1">
                          <Video size={13} className="text-pink-400" />
                          <span>Video Script Storyboard</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 line-clamp-2 leading-normal">
                          Menyusun script Reels/TikTok lengkap dengan kolom waktu, visual b-roll dan SFX.
                        </p>
                      </button>

                      {/* Path UGC */}
                      <button
                        onClick={() => setActiveTab('ugc')}
                        className="p-3 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/60 rounded-xl text-left transition group"
                      >
                        <div className="flex items-center gap-2 text-white font-bold text-[11px] group-hover:text-brand transition mb-1">
                          <Users size={13} className="text-emerald-400" />
                          <span>UGC Creator Brief</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 line-clamp-2 leading-normal">
                          Brief instruksi terperinci untuk talent eksternal, lengkap dengan panduan do dan don&apos;t.
                        </p>
                      </button>

                    </div>
                  </div>

                </div>

                {/* BLOK 5: AI Strategic Alignment Report */}
                <div className="bg-zinc-950/60 rounded-xl p-4.5 border border-purple-500/15 space-y-3 mt-5">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                      <BrainCircuit size={14} className="text-purple-400" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wide">5. AI Strategic Alignment Report</h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsEditingMode(prev => !prev);
                        }}
                        className="px-2.5 py-1 rounded-lg font-bold text-[10px] bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 transition"
                      >
                        {isEditingMode ? 'Preview' : 'Edit Report'}
                      </button>
                      <button
                        onClick={() => handleCopyText('review_report', reviewOutput || getInitialDraft('review', activeItem, activeContext))}
                        className="p-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded border border-zinc-800 transition"
                        title="Salin Laporan"
                      >
                        {copiedStates['review_report'] ? <Check size={11} className="text-brand" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>

                  {isEditingMode ? (
                    <textarea
                      value={reviewOutput || getInitialDraft('review', activeItem, activeContext)}
                      onChange={(e) => saveReviewOutput(e.target.value)}
                      className="w-full h-64 p-3 bg-zinc-950 text-zinc-200 text-xs font-mono leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-brand/40 custom-scrollbar rounded-xl border border-zinc-850"
                      placeholder="Sesuaikan laporan evaluasi strategis di sini..."
                    />
                  ) : (
                    <div className="whitespace-pre-wrap font-sans text-zinc-300 text-xs leading-relaxed bg-zinc-900/30 p-4 rounded-xl border border-zinc-850 max-h-96 overflow-y-auto custom-scrollbar">
                      {reviewOutput || getInitialDraft('review', activeItem, activeContext)}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              // TAB CONTENT: IMAGE, CAROUSEL, VIDEO, UGC WORKSHOPS
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                {activeTab === 'dna' && (
                  <CharacterDNASection onDNAUpdate={(dna) => console.log('DNA updated', dna)} />
                )}
                
                {/* Workshop Header & Mode Toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Production Output: <span className="text-brand font-black">{activeTab.toUpperCase()}</span>
                      </h3>
                      <p className="text-[9px] text-zinc-500">Anda dapat beralih ke Mode Edit untuk merapikan copywriting secara instan</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 flex items-center gap-1 text-[10px]">
                      <button
                        onClick={() => setIsEditingMode(false)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          !isEditingMode 
                            ? 'bg-zinc-800 text-white' 
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Preview (Markdown)
                      </button>
                      <button
                        onClick={() => setIsEditingMode(true)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          isEditingMode 
                            ? 'bg-zinc-800 text-white' 
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Edit Naskah (Direct)
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyText(activeTab, currentOutputText)}
                      className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-all"
                      title="Salin Naskah"
                    >
                      {copiedStates[activeTab] ? <Check size={14} className="text-brand" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Primary Content Editor / Preview Stage */}
                <div className="relative rounded-xl bg-zinc-950 border border-zinc-800/80 flex-1 flex flex-col min-h-[340px] overflow-hidden">
                  
                  {/* Loader overlay during AI execution */}
                  <AnimatePresence mode="wait">
                    {isLoadingAI ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3.5"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full border-2 border-brand/20 border-t-brand animate-spin" />
                          <Sparkles size={16} className="text-brand absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <div className="text-center space-y-1 px-4">
                          <p className="text-xs font-black text-white tracking-wide uppercase">Gemini AI Membaca Strategi Anda...</p>
                          <p className="text-[10px] text-zinc-400 max-w-xs leading-relaxed">
                            Menerjemahkan pilar bisnis, headline, dan target pemosisian menjadi aset iklan siap pakai berkonversi tinggi...
                          </p>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {/* Body Content Renderer */}
                  {isEditingMode ? (
                    <textarea
                      value={currentOutputText}
                      onChange={(e) => handleUpdateOutputText(e.target.value)}
                      className="w-full flex-1 p-4 bg-zinc-950 text-zinc-200 text-xs font-mono leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-brand/40 custom-scrollbar"
                      placeholder="Tuliskan atau sesuaikan draf produksi naskah di sini secara bebas..."
                    />
                  ) : (
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar text-zinc-300 text-xs leading-relaxed space-y-3 font-sans">
                      {renderTabContent()}
                    </div>
                  )}

                  {/* Bottom Stats inside Editor */}
                  <div className="p-2 bg-zinc-900/40 border-t border-zinc-800/40 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                    <span>Panjang Karakter: {currentOutputText?.length || 0}</span>
                    <span>Format Editor: {isEditingMode ? 'Text / Raw Mode' : 'Markdown Visual Mode'}</span>
                  </div>
                </div>

                {/* REVISION NOTES INPUT BOX (Prompts Customization Helper) */}
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-purple-500/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-purple-400 animate-pulse" />
                      Sesuaikan Hasil: Tambahkan Instruksi Khusus / Catatan Revisi
                    </label>
                    <span className="text-[8px] text-zinc-500 font-mono">Opsional</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={revisionNotes}
                      onChange={(e) => saveRevisionNotes(e.target.value)}
                      placeholder="Contoh: 'Buat gaya naskah lebih kasual', 'Fokuskan pada USP menghemat waktu', atau 'Tambahkan hook pertanyaan baru'..."
                      className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={handleGenerateWithAI}
                      disabled={isLoadingAI}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition whitespace-nowrap"
                    >
                      Optimalkan
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Controls */}
            <div className="mt-5 pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={12} className="text-zinc-500" />
                <span>Naskah siap eksekusi. Silakan salin naskah untuk diletakkan di platform desain atau diserahkan ke kreator.</span>
              </div>
              
              {activeTab !== 'review' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(activeTab, currentOutputText)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-lg border border-zinc-700/60 transition"
                  >
                    <Clipboard size={11} />
                    Salin Hasil
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Modern Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-3.5 px-6 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
        <div>ALCO Production Studio — Memproduksi Konten Bernilai Konversi Tinggi</div>
        <div className="flex gap-4">
          <span>Funnel Stage: {activeItem.jenis}</span>
          <span>Access Level: Full Enterprise</span>
        </div>
      </footer>
    </main>
  );
}
