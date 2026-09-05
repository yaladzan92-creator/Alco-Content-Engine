export type FunnelStage = 'TOFU' | 'MOFU' | 'BOFU';

export const FUNNEL_CONTENT_RULES = {
  TOFU: {
    goal: 'Awareness, relate, curiosity, edukasi ringan.',
    audienceState: 'Audiens belum sadar penuh terhadap masalah atau belum mengenal solusi.',
    contentStyle: 'Natural, ringan, relatable, edukatif, tidak terasa jualan.',
    visualStyle: 'Organic social content, editorial lifestyle, simple hook, clean visual.',
    ctaStyle: 'Soft CTA: simpan, geser, baca caption, cek contoh, pikirkan ulang.',
    allowedCta: ['Simpan ide ini', 'Cek contoh lanjutannya', 'Baca sampai akhir', 'Geser untuk lihat pola'],
    forbiddenPhrases: ['link bio', 'link di bio', 'klik link bio', 'klik link di bio', 'daftar sekarang', 'ambil penawaran', 'mumpung gratis', 'beli sekarang', 'dm', 'dm kami'],
    avoid: 'Hard selling, diskon, klaim bombastis, urgency, link bio agresif, testimoni berlebihan.'
  },
  MOFU: {
    goal: 'Membantu audiens mengevaluasi masalah dan memahami framework solusi.',
    audienceState: 'Audiens sudah sadar masalah dan mulai mencari cara yang lebih masuk akal.',
    contentStyle: 'Edukasi, framework, checklist, comparison, myth-busting, objection handling.',
    visualStyle: 'Explainer visual, diagram, checklist, side-by-side comparison, step-by-step.',
    ctaStyle: 'Soft action CTA: cek framework, bandingkan, simpan checklist, audit kontenmu.',
    allowedCta: ['Cek framework ini', 'Simpan checklist ini', 'Bandingkan dengan kontenmu', 'Audit alur kontenmu'],
    forbiddenPhrases: ['link bio', 'link di bio', 'klik link bio', 'klik link di bio', 'daftar sekarang', 'ambil penawaran', 'mumpung gratis', 'beli sekarang', 'dm', 'dm kami'],
    avoid: 'Hard closing, diskon besar, scarcity berlebihan, klaim hasil instan.'
  },
  BOFU: {
    goal: 'Mendorong keputusan dengan bukti, demo, offer clarity, dan CTA jelas.',
    audienceState: 'Audiens sudah tertarik dan butuh alasan terakhir untuk bertindak.',
    contentStyle: 'Proof, demo, before-after, testimonial, case study, offer explanation.',
    visualStyle: 'Product/demo focused, proof card, testimonial layout, clear offer breakdown.',
    ctaStyle: 'Direct CTA: lihat demo, daftar, konsultasi, ambil penawaran, mulai sekarang.',
    allowedCta: ['Lihat demo', 'Daftar sekarang', 'Ambil penawaran', 'Konsultasi sekarang'],
    forbiddenPhrases: [],
    avoid: 'Konten terlalu abstrak, edukasi terlalu panjang, CTA terlalu lemah.'
  }
} as const;

export function normalizeFunnelStage(value?: string): FunnelStage {
  const raw = (value || '').toUpperCase();
  if (raw.includes('BOFU')) return 'BOFU';
  if (raw.includes('MOFU')) return 'MOFU';
  return 'TOFU';
}

export function getFunnelRules(value?: string) {
  return FUNNEL_CONTENT_RULES[normalizeFunnelStage(value)];
}

export function sanitizeCtaForFunnel(cta: string, stageInput?: string): string {
  const stage = normalizeFunnelStage(stageInput);
  const rules = FUNNEL_CONTENT_RULES[stage];
  const lower = (cta || '').toLowerCase();
  const hasForbidden = rules.forbiddenPhrases.some((phrase) => lower.includes(phrase));
  if (!cta || hasForbidden) return rules.allowedCta[0];
  return cta;
}

export function isRawOrShortCta(cta: string): boolean {
  if (!cta) return true;
  const cleaned = cta.trim();
  if (cleaned.length < 25) return true;
  const words = cleaned.split(/\s+/);
  if (words.length < 5) return true;

  const lower = cleaned.toLowerCase();
  const rawKeywords = [
    'link bio', 'link di bio', 'klik link', 'klik bio', 'cek bio',
    'cek link', 'dm kami', 'dm', 'pm', 'inbox', 'hubungi kami',
    'mumpung gratis', 'ambil sekarang', 'beli sekarang', 'daftar sekarang'
  ];
  if (rawKeywords.some((k) => lower.includes(k))) {
    if (cleaned.length < 40) return true;
  }
  return false;
}

export function getVoiceoverCtaForFunnel(ctaInput: string, stageInput?: string): string {
  const stage = normalizeFunnelStage(stageInput);
  const cleaned = (ctaInput || '').trim();

  if (cleaned && !isRawOrShortCta(cleaned)) {
    const lower = cleaned.toLowerCase();
    const rules = FUNNEL_CONTENT_RULES[stage];
    const hasForbidden = rules.forbiddenPhrases.some((phrase) => lower.includes(phrase));
    if (!hasForbidden) {
      return cleaned;
    }
  }

  if (stage === 'MOFU') {
    return 'Kalau mau cek struktur kontenmu, simpan ini dulu lalu lanjut cek panduan lengkapnya.';
  }
  if (stage === 'BOFU') {
    return 'Kalau kamu ingin mulai lebih cepat, cek detail penawaran dan langkah berikutnya di link bio.';
  }
  // TOFU
  return 'Simpan ide ini dulu supaya kamu bisa pakai saat menyusun konten berikutnya.';
}

export function buildFunnelPromptBlock(stageInput?: string) {
  const stage = normalizeFunnelStage(stageInput);
  const rules = FUNNEL_CONTENT_RULES[stage];

  return `
FUNNEL STAGE: ${stage}
FUNNEL GOAL: ${rules.goal}
AUDIENCE STATE: ${rules.audienceState}
CONTENT STYLE: ${rules.contentStyle}
VISUAL STYLE: ${rules.visualStyle}
CTA STYLE: ${rules.ctaStyle}
ALLOWED CTA EXAMPLES: ${rules.allowedCta.join('; ')}
FORBIDDEN PHRASES: ${rules.forbiddenPhrases.join('; ') || '-'}
AVOID: ${rules.avoid}
`;
}

/**
 * Helper to count words in a dialogue or script string.
 */
export function countWords(text?: string | null): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Cleans markdown formatting, extra spacing, and dangerous quotes from dialogue strings.
 */
export function cleanDialogueText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/[#*`_]/g, '')
    .replace(/[«»"“”]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Prevents duplicated brand phrases (e.g., "Dengan ALCO, kamu dapat Dengan ALCO, kamu bisa...").
 */
export function removeBrandDuplication(text?: string | null, brandName?: string): string {
  if (!text) return '';
  let cleaned = text;

  if (brandName) {
    const escaped = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern1 = new RegExp(`(?:dengan\\s+${escaped}[^,]*,?\\s*)+(?:dengan\\s+${escaped})`, 'gi');
    cleaned = cleaned.replace(pattern1, `Dengan ${brandName}`);

    const pattern2 = new RegExp(`(${escaped})\\s+(?:kamu\\s+(?:dapat|bisa)\\s+)?(?:dengan\\s+)?\\1`, 'gi');
    cleaned = cleaned.replace(pattern2, '$1');
  }

  // Generic phrase duplication: "Dengan X, kamu dapat Dengan X, kamu bisa"
  cleaned = cleaned.replace(/dengan\s+([a-zA-Z0-9\s]+?),\s*kamu\s+dapat\s+dengan\s+\1,?\s*kamu\s+bisa/gi, 'dengan $1, kamu bisa');
  cleaned = cleaned.replace(/dengan\s+([a-zA-Z0-9\s]+?),\s*dengan\s+\1/gi, 'dengan $1');

  // Duplicate consecutive words or phrases (e.g. "kamu bisa kamu bisa")
  cleaned = cleaned.replace(/\b(\w+(?:\s+\w+){1,3})\s+\1\b/gi, '$1');

  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes 3-scene Google Flow UGC dialogues for 8-second video shots:
 * - Target: 24-30 words per scene (Min: 22 words, Max: 32 words)
 * - Natural spoken Indonesian, easy and pleasant to pronounce
 * - Scene 1: Hook / Problem
 * - Scene 2: Solusi / Demo / Framework
 * - Scene 3: Proof / Value + Complete CTA (never just a short CTA)
 * - Safe against brand duplication and generic placeholders
 */
export function normalizeGoogleFlowDialogue(
  scene: 1 | 2 | 3,
  stageInput?: string,
  rawDialogue?: string | null,
  context?: any
): string {
  const stage = normalizeFunnelStage(stageInput);
  const brandName =
    context?.brand_context?.brand_name ||
    context?.brandName ||
    'ALCO Engine';

  let cleaned = cleanDialogueText(rawDialogue || '');
  cleaned = removeBrandDuplication(cleaned, brandName);

  const currentCount = countWords(cleaned);
  const isTooShort = currentCount < 18;
  const isShortCta =
    scene === 3 &&
    (currentCount < 20 ||
      /^(simpan|follow|cek|lihat|klik|daftar|beli|link bio|dm|amankan|konsultasi|baca|ambil)/i.test(cleaned));

  // SCENE 1: Hook / Problem (Target: 24-30 kata, min 22, max 32)
  if (scene === 1) {
    if (!cleaned || isTooShort) {
      if (stage === 'TOFU') {
        cleaned = `Pernah gak ngerasa udah rajin bikin konten tiap hari tapi views tetap sepi? Ternyata masalah terbesarnya bukan di konsistensi, tapi hook awal yang kurang memikat audiens.`;
      } else if (stage === 'MOFU') {
        cleaned = `Banyak yang terjebak di views tinggi tapi penjualannya tetap nol karena alur funnel kontennya bolong di tengah. Tanpa struktur yang jelas, audiens cuma nonton tanpa pernah konversi.`;
      } else {
        cleaned = `Masih ragu apakah konten bisnismu beneran bisa menghasilkan penjualan konsisten? Kuncinya bukan coba-coba format acak, tapi pakai sistem terbukti yang langsung mengarahkan audiens untuk mengambil keputusan.`;
      }
    } else if (currentCount < 22) {
      if (stage === 'TOFU') {
        cleaned = `${cleaned.replace(/[.!?]+$/, '')}. Padahal kalau hook awal diperbaiki, audiens bakal langsung berhenti scroll dan menyimak sampai selesai.`;
      } else if (stage === 'MOFU') {
        cleaned = `${cleaned.replace(/[.!?]+$/, '')}. Masalah ini sering terjadi kalau kontenmu belum punya alur evaluasi yang terarah bagi audiens.`;
      } else {
        cleaned = `${cleaned.replace(/[.!?]+$/, '')}. Di titik ini, kamu butuh sistem yang langsung membuktikan hasil nyata tanpa buang-buang waktu lagi.`;
      }
    }
  }

  // SCENE 2: Solusi / Demo / Framework (Target: 24-30 kata, min 22, max 32)
  else if (scene === 2) {
    if (!cleaned || isTooShort) {
      if (stage === 'TOFU') {
        cleaned = `Kuncinya ada di pola tiga detik pertama: bangun rasa penasaran yang kuat, berikan satu insight praktis, dan akhiri dengan pesan yang bikin mereka langsung paham nilainya.`;
      } else if (stage === 'MOFU') {
        cleaned = `Pakai framework tiga langkah ini: petakan masalah utama audiens, susun perbandingan solusi yang masuk akal dengan ${brandName}, lalu tunjukkan cara kerja sistemnya secara transparan dan terarah.`;
      } else {
        cleaned = `Lewat sistem ${brandName}, semua naskah video, arahan visual, sampai penawaran utama langsung dirancang terstruktur sehingga kamu tinggal eksekusi tanpa perlu pusing mikir dari nol lagi.`;
      }
    } else if (currentCount < 22) {
      if (stage === 'TOFU') {
        cleaned = `Solusinya sederhana: ${cleaned.replace(/[.!?]+$/, '')}, lalu sajikan dengan visual relevan agar pesan intinya langsung dipahami audiens dengan cepat.`;
      } else if (stage === 'MOFU') {
        cleaned = `Pakai alur terstruktur ini: ${cleaned.replace(/[.!?]+$/, '')}, sehingga audiens dengan mudah membandingkan solusi terbaik untuk kebutuhan mereka.`;
      } else {
        cleaned = `Dengan sistem terintegrasi: ${cleaned.replace(/[.!?]+$/, '')}, membuat seluruh eksekusi kontenmu berjalan otomatis dan siap menghasilkan konversi maksimal.`;
      }
    }
  }

  // SCENE 3: Proof / Value + Complete CTA (Target: 24-30 kata, min 22, max 32)
  else if (scene === 3) {
    if (!cleaned || isShortCta) {
      if (stage === 'TOFU') {
        cleaned = `Simpan video ini sekarang biar kamu gak bingung pas bikin konten nanti, dan follow akun ini untuk tips strategi pembuatan konten yang terbukti efektif setiap harinya.`;
      } else if (stage === 'MOFU') {
        cleaned = `Kalau kamu mau lihat studi kasus dan alur framework lengkapnya secara detail, langsung klik link di bio sekarang untuk mempelajari panduan praktis yang siap kamu terapkan.`;
      } else {
        // BOFU standard proof/value + CTA:
        cleaned = `Yang paling penting, kamu tidak perlu mulai dari nol lagi. Cek demonya sekarang, lihat alurnya, lalu putuskan apakah sistem ini cocok untuk mengakselerasi bisnismu hari ini.`;
      }
    } else if (currentCount < 22) {
      if (stage === 'TOFU') {
        cleaned = `Simpan video ini sekarang biar tidak hilang saat eksekusi nanti, dan follow akun ini untuk update tips pembuatan konten yang praktis dan terbukti setiap harinya.`;
      } else if (stage === 'MOFU') {
        cleaned = `Pelajari alur framework lengkapnya sekarang juga, lalu klik link di bio untuk mendapatkan panduan praktis yang bisa langsung kamu terapkan pada konten bisnismu.`;
      } else {
        cleaned = `Yang paling penting, kamu tidak perlu mulai dari nol lagi. Cek demonya sekarang, pelajari alurnya, lalu putuskan apakah sistem ini pilihan terbaik untuk bisnismu.`;
      }
    }
  }

  cleaned = removeBrandDuplication(cleaned, brandName);

  // If word count > 32 words, trim gracefully to 26-28 words with proper sentence ending
  const words = cleaned.trim().split(/\s+/).filter(Boolean);
  if (words.length > 32) {
    const trimmedWords = words.slice(0, 28);
    let trimmed = trimmedWords.join(' ');
    if (!/[.!?]$/.test(trimmed)) {
      trimmed += '.';
    }
    cleaned = trimmed;
  }

  return cleaned.trim();
}

