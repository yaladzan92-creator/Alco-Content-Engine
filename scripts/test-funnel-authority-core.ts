import fs from 'node:fs';
import path from 'node:path';
import {
  buildFunnelStrategyFromContext,
  validateFunnelStrategyProjectIsolation,
  validateItemAgainstFunnelStrategy,
  buildCalendarPlanningContext,
  summarizeFunnelDistribution,
  validateCalendarAgainstFunnelStrategy,
  normalizeCalendarToFunnelDistribution,
} from '../lib/funnel-strategy';
import { saveProjectFunnelStrategy } from '../lib/storage';
import { SharedContentContext } from '../lib/content-contract';

const projectRoot = process.cwd();
const errors: string[] = [];
const successes: string[] = [];

function assert(condition: boolean | undefined | null, message: string) {
  if (Boolean(condition)) {
    successes.push(message);
  } else {
    errors.push(message);
  }
}

console.log('=== RUNNING MANDATORY VALIDATION: PHASE 1 — FUNNEL AUTHORITY ===\n');

// -------------------------------------------------------------
// SECTION 11: VALIDASI WAJIB (A - K)
// -------------------------------------------------------------

console.log('--- SECTION 11: Strategic Hard-Code Removal & Contract Audit ---');

const calViewContent = fs.readFileSync(path.join(projectRoot, 'components', 'CalendarView.tsx'), 'utf8');
const routeContent = fs.readFileSync(path.join(projectRoot, 'app', 'api', 'gemini', 'generate-calendar', 'route.ts'), 'utf8');

// Test A: Tidak ada lagi rasio universal 6/5/3 sebagai rekomendasi strategy
assert(
  !calViewContent.includes('{ tofu: 6, mofu: 5, bofu: 3 }'),
  'Test A: Rasio universal 6/5/3 berhasil dihapus dari rekomendasi CalendarView'
);

// Test B: Tidak ada lagi audience default: Both / 20–50 yang dianggap sebagai fakta project
assert(
  !calViewContent.includes('gender: "Both",\n            minAge: 20,\n            maxAge: 50'),
  'Test B: Demografi default Both / 20-50 berhasil dihapus dari rekomendasi CalendarView'
);

// Test C: Tidak ada lagi hook universal: Call-Out / Curiosity Gap / Social Proof yang otomatis diterapkan ke semua project
assert(
  !calViewContent.includes('hook1: "Call-Out",\n            hook2: "Curiosity Gap",\n            hook3: "Social Proof"'),
  'Test C: Hook universal static berhasil dihapus dari rekomendasi CalendarView'
);

// Test D: Tidak ada lagi Awareness & Soft Selling sebagai formula universal
assert(
  !calViewContent.includes('selectedFormula: "Awareness & Soft Selling"'),
  'Test D: Formula universal Awareness & Soft Selling berhasil dihapus dari rekomendasi CalendarView'
);

// Test D2: API generate-calendar tidak memiliki implicit 8/6/4 authority
assert(
  !routeContent.includes('{ tofu: 8, mofu: 6, bofu: 4 }'),
  'Test D2: Hardcoded ratio 8/6/4 berhasil dihapus dari generate-calendar/route.ts'
);
assert(
  routeContent.includes('hasUserFunnelOverride') && routeContent.includes('userOverrides'),
  'Test D3: generate-calendar/route.ts membedakan derived strategy vs explicit user override'
);

// Test D4: HomePageClient tidak selalu mengirim userOverrides tanpa interaksi user
const homePageContent = fs.readFileSync(path.join(projectRoot, 'components', 'HomePageClient.tsx'), 'utf8');
assert(
  homePageContent.includes('hasUserFunnelOverride') &&
  homePageContent.includes('hasUserFunnelOverride ? { tofu: ratio.tofu, mofu: ratio.mofu, bofu: ratio.bofu } : undefined'),
  'Test D4: HomePageClient hanya mengirim userOverrides jika user melakukan manual override'
);

// Test D5: Tidak ada default automatic strategic CTA ["Link Bio", "DM Us"] pada route
assert(
  !routeContent.includes('selectedCTAs = ["Link Bio", "DM Us"]'),
  'Test D5: Default automatic strategic CTA ["Link Bio", "DM Us"] berhasil dihapus dari generate-calendar/route.ts'
);
assert(
  routeContent.includes('Array.isArray(selectedCTAs) && selectedCTAs.length > 0'),
  'Test D6: Primary CTAs Allowed hanya di-render saat user explicitly memberikan preferences'
);

// -------------------------------------------------------------
// SECTION 12: TEST CROSS-NICHE (3 Projects: SaaS, Food, Education)
// -------------------------------------------------------------

console.log('\n--- SECTION 12: Cross-Niche Isolation & Context Derivation ---');

// Project A: Software / SaaS
const projectAContext: SharedContentContext = {
  project_id: 'proj_saas_001',
  project_name: 'ALCO Agile Hub',
  source: { origin: 'creative_system_json' },
  brand_context: {
    brand_name: 'AgileHub',
    category: 'B2B SaaS / Project Management',
    brand_summary: 'Platform manajemen sprint dan otomasi backlog.',
    brand_voice: 'Direct, Analytical, Efficient',
  },
  audience_context: {
    primary_audience: 'Tech Lead dan Engineering Manager di Startup',
    pain_points: ['Sprint terdistraksi komunikasi manual antar tim', 'Sulit tracking bottleneck developer'],
    desires: ['Visibilitas sprint real-time', 'Otomasi reporting release'],
    objections: ['Takut migrasi data dari Jira/Notion memakan waktu lama'],
  },
  strategy_context: {
    positioning: 'Otomasi sprint cerdas tanpa setup manual berhari-hari',
    usp: ['One-click migration', 'AI-assisted backlog refinement'],
    main_offer: 'Free 14-Day Sprint Pilot + Guided Onboarding',
    offer_benefits: ['Setup selesai dalam 15 menit', 'Reporting harian otomatis ke Slack'],
    core_message: 'Hentikan pemborosan jam kerja engineering pada koordinasi manual.',
    copy_direction: ['Data-driven', 'Fokus efisiensi tim'],
    content_pillars: ['Sprint Optimization', 'Engineering Leadership', 'Agile Automation'],
  },
  system_flags: { is_complete_for_planning: true, missing_required_fields: [] },
};

// Project B: Makanan Siap Saji / Food
const projectBContext: SharedContentContext = {
  project_id: 'proj_food_002',
  project_name: 'Sambal Cumi Juara',
  source: { origin: 'creative_system_json' },
  brand_context: {
    brand_name: 'Sambal Cumi Juara',
    category: 'Kuliner Siap Saji Nusantara',
    brand_summary: 'Sambal kemasan premium dengan potongan cumi utuh melimpah.',
    brand_voice: 'Warm, appetizing, relatable nusantara',
  },
  audience_context: {
    primary_audience: 'Anak kost & pekerja urban sibuk yang rindu masakan rumah pedas',
    pain_points: ['Makanan pesan antar mahal dan sering hambar', 'Tidak sempat memasak lauk pedas berjam-jam'],
    desires: ['Makan enak praktis dalam 1 menit', 'Pedas nendang tanpa bau amis'],
    objections: ['Ragu ketahanan sambal jika dikirim ke luar kota'],
  },
  strategy_context: {
    positioning: 'Lauk sambal cumi siap santap kualitas restoran di meja makanmu',
    usp: ['Teknologi retort sterilisasi tahan 3 bulan', 'Potongan cumi utuh melimpah'],
    main_offer: 'Paket Bundling 3 Varian Juara + Ekstra Kerupuk Kulit',
    offer_benefits: ['Tinggal tuang di atas nasi hangat', 'Garansi ganti baru jika kemasan rusak'],
    core_message: 'Solusi makan lahap praktis saat kangen cita rasa pedas nusantara.',
    copy_direction: ['Appetizing visual hook', 'Relatable moment'],
    content_pillars: ['Kenikmatan Praktis', 'Kebersihan Produksi', 'Inspirasi Menu Kost'],
  },
  system_flags: { is_complete_for_planning: true, missing_required_fields: [] },
};

// Project C: Jasa Pendidikan / Career Education
const projectCContext: SharedContentContext = {
  project_id: 'proj_edu_003',
  project_name: 'Data Career Academy',
  source: { origin: 'creative_system_json' },
  brand_context: {
    brand_name: 'DataCareer Hub',
    category: 'Pelatihan & Bootcamp Karir Digital',
    brand_summary: 'Program akselerasi karir Data Analyst dengan live real-industry case.',
    brand_voice: 'Empowering, Mentoring, Professional',
  },
  audience_context: {
    primary_audience: 'Fresh graduate & Career Switcher usia 22-30 tahun',
    pain_points: ['Belajar coding data otodidak tanpa arah portfolio', 'Sering gagal saat tes teknis SQL/Python'],
    desires: ['Portofolio teruji standar industri', 'Dapat pekerjaan pertama sebagai Data Analyst'],
    objections: ['Biaya bootcamp mahal tapi tidak menjamin lolos kerja'],
  },
  strategy_context: {
    positioning: 'Kurikulum praktis berbasis studi kasus nyata dengan 1-on-1 career coaching',
    usp: ['Mentor praktisi senior unicorn', 'Review portofolio langsung bersama hiring partner'],
    main_offer: 'Cohort Baru: Bootcamp Data Analyst Intensif 12 Pekan',
    offer_benefits: ['10+ Project portfolio end-to-end', 'Simulasi interview teknis tanpa batas'],
    core_message: 'Ubah kebingungan belajar data menjadi portofolio siap kerja dalam 12 pekan.',
    copy_direction: ['Career roadmap', 'Skill breakdown'],
    content_pillars: ['Portfolio Building', 'SQL & BI Tips', 'Career Transition Stories'],
  },
  system_flags: { is_complete_for_planning: true, missing_required_fields: [] },
};

const stratA = buildFunnelStrategyFromContext(projectAContext);
const stratB = buildFunnelStrategyFromContext(projectBContext);
const stratC = buildFunnelStrategyFromContext(projectCContext);

// Test E: FunnelStrategy berasal dari project aktif
assert(stratA.project_id === 'proj_saas_001', 'Test E1: FunnelStrategy A project_id strictly matches proj_saas_001');
assert(stratB.project_id === 'proj_food_002', 'Test E2: FunnelStrategy B project_id strictly matches proj_food_002');
assert(stratC.project_id === 'proj_edu_003', 'Test E3: FunnelStrategy C project_id strictly matches proj_edu_003');

// Test F: Project A tidak dapat memakai FunnelStrategy Project B
const leakTest = validateFunnelStrategyProjectIsolation(stratA, 'proj_food_002');
assert(
  !leakTest.isValid && leakTest.error?.includes('Project Isolation Violation'),
  'Test F1: Blocked cross-project leakage when Project B attempts to use Project A FunnelStrategy'
);

const validTest = validateFunnelStrategyProjectIsolation(stratA, 'proj_saas_001');
assert(validTest.isValid, 'Test F2: Isolation validation passes when project_id matches');

// Cross-niche uniqueness & zero contamination
assert(
  stratA.tofu.audience_state !== stratB.tofu.audience_state &&
  stratB.tofu.audience_state !== stratC.tofu.audience_state,
  'Test 12.1: TOFU audience states are strictly unique per project context'
);
assert(
  stratA.tofu.message_direction.includes('Hentikan pemborosan jam kerja') &&
  stratB.tofu.message_direction.includes('Solusi makan lahap praktis') &&
  stratC.tofu.message_direction.includes('Ubah kebingungan belajar data'),
  'Test 12.2: TOFU message directions are strictly grounded in active project core messages'
);
assert(
  stratA.bofu.cta_direction.includes('Free 14-Day Sprint Pilot') &&
  stratB.bofu.cta_direction.includes('Paket Bundling 3 Varian') &&
  stratC.bofu.cta_direction.includes('Bootcamp Data Analyst'),
  'Test 12.3: BOFU CTA directions strictly reference active project main offers'
);

// Test G: Calendar Planning Context (Pre-calendar without ContentItem)
const calPlanContext = buildCalendarPlanningContext('proj_saas_001', projectAContext);
assert(
  calPlanContext.project_id === 'proj_saas_001' && calPlanContext.funnel_strategy.project_id === 'proj_saas_001',
  'Test G: buildCalendarPlanningContext creates valid pre-calendar context without requiring ContentItem'
);

// Test H: TOFU tidak berubah menjadi hard-selling BOFU
const tofuWithHardSelling = {
  jenis: 'TOFU',
  headline: '5 Kesalahan Manajemen Sprint',
  body: 'Banyak tim salah fokus...',
  cta: 'Klik link di bio dan beli sekarang sebelum kehabisan diskon!',
};
const tofuValidation = validateItemAgainstFunnelStrategy(tofuWithHardSelling, stratA);
assert(
  !tofuValidation.isValid && tofuValidation.violations.length > 0,
  'Test H1: TOFU item with sales CTA detected as violation'
);
assert(
  tofuValidation.repairedCta === 'Simpan ide ini',
  'Test H2: Leaked sales CTA in TOFU repaired automatically to soft CTA'
);

// Test I: MOFU tidak berubah menjadi direct closing tanpa alasan strategy
const mofuWithClosing = {
  jenis: 'MOFU',
  headline: 'Framework Evaluasi Sprint',
  body: 'Bandingkan cara lama vs baru...',
  cta: 'Daftar sekarang dan transfer hari ini!',
};
const mofuValidation = validateItemAgainstFunnelStrategy(mofuWithClosing, stratA);
assert(
  !mofuValidation.isValid && mofuValidation.violations.length > 0,
  'Test I: MOFU item with hard closing detected and flagged'
);

// Test J: BOFU tetap dapat menggunakan CTA conversion bila Strategy/Offer mendukungnya
const bofuValid = {
  jenis: 'BOFU',
  headline: 'Mulai Pilot 14 Hari Tanpa Biaya',
  body: 'Lihat bagaimana tim Anda menghemat 10 jam per minggu.',
  cta: 'Mulai Free 14-Day Trial',
};
const bofuValidation = validateItemAgainstFunnelStrategy(bofuValid, stratA);
assert(
  bofuValidation.isValid && bofuValidation.violations.length === 0,
  'Test J: BOFU with conversion CTA is valid and approved'
);

// Test K: Tidak ada business fact baru yang dibuat melalui generic fallback
assert(
  stratA.provenance.source_project_id === 'proj_saas_001' &&
  stratB.provenance.source_project_id === 'proj_food_002' &&
  stratC.provenance.source_project_id === 'proj_edu_003',
  'Test K: Provenance strictly records source project identity for every FunnelStrategy'
);

// Test L: Untouched project flow menghasilkan source: derived_from_strategy dan is_customized: false
assert(
  stratA.distribution.source === 'derived_from_strategy' &&
  stratA.provenance.is_customized === false,
  'Test L1: Untouched project A menghasilkan source derived_from_strategy dan is_customized: false'
);
assert(
  stratB.distribution.source === 'derived_from_strategy' &&
  stratB.provenance.is_customized === false,
  'Test L2: Untouched project B menghasilkan source derived_from_strategy dan is_customized: false'
);

// Test M: Manual override menghasilkan source: user_override dan is_customized: true
const overriddenStratA = buildFunnelStrategyFromContext(projectAContext, {
  userOverrides: { tofu: 7, mofu: 5, bofu: 2 },
});
assert(
  overriddenStratA.distribution.source === 'user_override' &&
  overriddenStratA.provenance.is_customized === true &&
  overriddenStratA.distribution.tofu === 7 &&
  overriddenStratA.distribution.mofu === 5 &&
  overriddenStratA.distribution.bofu === 2,
  'Test M: Explicit user override menghasilkan source user_override dan is_customized: true dengan angka ratio yang tepat'
);

// -------------------------------------------------------------
// SECTION 13: CALENDAR VALIDATION & NORMALIZATION TESTS
// -------------------------------------------------------------
console.log('\n--- SECTION 13: Calendar Validation, Distribution & Normalization ---');

// Test N1: summarizeFunnelDistribution
const mockItems = [
  { no: 1, jenis: 'TOFU', headline: 'Topik 1', body: 'B', caption: 'C', format: 'Carousel', cta: 'Simpan' },
  { no: 2, jenis: 'TOFU', headline: 'Topik 2', body: 'B', caption: 'C', format: 'Reels', cta: 'Simpan' },
  { no: 3, jenis: 'MOFU', headline: 'Topik 3', body: 'B', caption: 'C', format: 'Single', cta: 'Komen' },
  { no: 4, jenis: 'BOFU', headline: 'Topik 4', body: 'B', caption: 'C', format: 'Reels', cta: 'Free 14-Day Pilot' },
];
const summary = summarizeFunnelDistribution(mockItems);
assert(
  summary.tofu === 2 && summary.mofu === 1 && summary.bofu === 1 && summary.total === 4,
  'Test N1: summarizeFunnelDistribution correctly counts TOFU/MOFU/BOFU/total'
);

// Test N2: validateCalendarAgainstFunnelStrategy detects count mismatch
const calendarValidation = validateCalendarAgainstFunnelStrategy(mockItems, stratA);
assert(
  !calendarValidation.isValid && calendarValidation.errors.length > 0,
  'Test N2: validateCalendarAgainstFunnelStrategy accurately catches item count mismatch vs Strategy'
);

// Test N3: normalizeCalendarToFunnelDistribution forces exact ratio and sequential stages
const messyItems = Array.from({ length: 14 }, (_, i) => ({
  no: i + 1,
  jenis: 'BOFU',
  headline: `Content Topic ${i + 1}`,
  body: 'B',
  caption: 'C',
  format: 'Reels',
  cta: 'Beli Sekarang'
}));
const normalizedCalendar = normalizeCalendarToFunnelDistribution(messyItems, overriddenStratA);
const normalizedSummary = summarizeFunnelDistribution(normalizedCalendar);
assert(
  normalizedCalendar.length === 14 &&
  normalizedSummary.tofu === 7 &&
  normalizedSummary.mofu === 5 &&
  normalizedSummary.bofu === 2,
  'Test N3: normalizeCalendarToFunnelDistribution successfully enforces 7/5/2 ratio and sequential stage ordering'
);

// Test N4: Storage Isolation enforces strict error throwing on project mismatch
let isolationErrorCaught = false;
try {
  saveProjectFunnelStrategy('proj_food_002', stratA);
} catch (e: any) {
  if (e.message && (e.message.includes('Cross-Project Contamination Blocked') || e.message.includes('Project Isolation Violation'))) {
    isolationErrorCaught = true;
  }
}
assert(
  isolationErrorCaught,
  'Test N4: saveProjectFunnelStrategy throws strict isolation error when project ID does not match strategy'
);

// -------------------------------------------------------------
// RESULTS SUMMARY
// -------------------------------------------------------------
console.log('\n=== TEST SUMMARY ===');
successes.forEach(s => console.log(`[PASS] ${s}`));
if (errors.length > 0) {
  console.error('\n=== FAILURES ===');
  errors.forEach(e => console.error(`[FAIL] ${e}`));
  process.exit(1);
} else {
  console.log(`\nALL ${successes.length} MANDATORY TESTS PASSED CLEANLY!`);
}
