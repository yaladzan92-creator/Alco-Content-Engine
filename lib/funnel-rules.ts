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
