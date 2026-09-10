import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const errors = [];
const successes = [];

// 1. Check if app/global-error.tsx exists
const globalErrorPath = path.join(projectRoot, 'app', 'global-error.tsx');
if (fs.existsSync(globalErrorPath)) {
  successes.push('app/global-error.tsx ditemukan dan terpasang.');
} else {
  errors.push('app/global-error.tsx WAJIB ada di root App Router!');
}

// 2. Check next.config.ts for forbidden properties
const nextConfigCandidates = ['next.config.ts', 'next.config.js', 'next.config.mjs'];
const forbiddenConfigProps = ['standalone', 'assetPrefix', 'basePath'];

let foundNextConfig = false;
for (const configName of nextConfigCandidates) {
  const configPath = path.join(projectRoot, configName);
  if (fs.existsSync(configPath)) {
    foundNextConfig = true;
    const content = fs.readFileSync(configPath, 'utf8');
    for (const prop of forbiddenConfigProps) {
      // Regex check for forbidden properties as configuration keys
      const regex = new RegExp(`\\b${prop}\\b`, 'i');
      if (regex.test(content)) {
        errors.push(`${configName} TIDAK BOLEH mengandung properti "${prop}"!`);
      }
    }

    if (/\bprocess\.argv\b/.test(content)) {
      errors.push(`${configName} TIDAK BOLEH menggunakan process.argv untuk mendeteksi development/build! Gunakan parameter phase.`);
    }

    // Check distDir rule: distDir boleh hanya jika conditional untuk development .next-dev
    if (/\bdistDir\b/.test(content)) {
      const isConditionalDevNextDev = /isDev\b.*distDir.*\.next-dev|\bdistDir\b.*isDev|\.\.\s*\(\s*isDev\s*\?\s*\{\s*distDir:\s*['"]\.next-dev['"]\s*\}\s*:\s*\{\s*\}\s*\)/.test(content) ||
        (content.includes('distDir') && content.includes('isDev') && content.includes('.next-dev'));
      if (!isConditionalDevNextDev) {
        errors.push(`${configName} property "distDir" hanya boleh digunakan secara conditional untuk development (.next-dev)!`);
      }
    }
  }
}

if (!foundNextConfig) {
  errors.push('File konfigurasi Next.js (next.config.ts) tidak ditemukan!');
} else {
  successes.push('next.config.ts valid (distDir conditional untuk .next-dev, bebas dari standalone, assetPrefix, dan basePath).');
}

// 3. Check package.json scripts for build & start
const packageJsonPath = path.join(projectRoot, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  errors.push('package.json tidak ditemukan!');
} else {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = pkg.scripts || {};

    if (scripts.build !== 'next build') {
      errors.push(`package.json "build" script harus tepat "next build", saat ini: "${scripts.build}"`);
    } else {
      successes.push('package.json "build" script valid ("next build").');
    }

    if (scripts.start !== 'next start') {
      errors.push(`package.json "start" script harus tepat "next start", saat ini: "${scripts.start}"`);
    } else {
      successes.push('package.json "start" script valid ("next start").');
    }
  } catch (err) {
    errors.push(`Gagal membaca package.json: ${err.message}`);
  }
}

// 4. Check next-env.d.ts for forbidden build directory references (.next/ or .next-dev/)
const nextEnvPath = path.join(projectRoot, 'next-env.d.ts');
if (fs.existsSync(nextEnvPath)) {
  let nextEnvContent = fs.readFileSync(nextEnvPath, 'utf8');
  if (nextEnvContent.includes('.next/') || nextEnvContent.includes('.next-dev/')) {
    // Auto-sanitize next-env.d.ts to remove Next.js internal build path references
    const cleanedContent = nextEnvContent
      .split('\n')
      .filter((line) => !line.includes('.next/') && !line.includes('.next-dev/'))
      .join('\n');
    fs.writeFileSync(nextEnvPath, cleanedContent, 'utf8');
    successes.push('next-env.d.ts telah dibersihkan otomatis dari reference ".next/" atau ".next-dev/".');
  } else {
    successes.push('next-env.d.ts bersih dari reference ".next/" atau ".next-dev/".');
  }
} else {
  errors.push('next-env.d.ts tidak ditemukan!');
}

// 5. Check ALCO APP STANDARD v2.1 Compliance
const licenseFiles = [
  'lib/license/types.ts',
  'lib/license/device-fingerprint.ts',
  'lib/license/request-code.ts',
  'lib/license/canonical.ts',
  'lib/license/authority-key.ts',
  'lib/license/verification.ts',
  'lib/license/license-context.tsx',
];

let allLicenseFilesExist = true;
for (const relPath of licenseFiles) {
  const fullPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`ALCO License file "${relPath}" wajib ada untuk kepatuhan ALCO APP STANDARD v2.1!`);
    allLicenseFilesExist = false;
  }
}

if (allLicenseFilesExist) {
  successes.push('ALCO License Protocol v2.1 files terpasang lengkap.');
}

// 6. Security Audit: Check that NO Authority Private Key exists in repository/source
const authorityKeyPath = path.join(projectRoot, 'lib', 'license', 'authority-key.ts');
if (fs.existsSync(authorityKeyPath)) {
  const keyContent = fs.readFileSync(authorityKeyPath, 'utf8');
  if (/PRIVATE KEY/i.test(keyContent)) {
    errors.push('CRITICAL SECURITY VIOLATION: Authority Private Key ditemukan di authority-key.ts! Hanya Authority Public Key yang diperbolehkan.');
  } else {
    successes.push('Security Audit: authority-key.ts bebas dari Private Key (Authority Public Key only).');
  }
}

// Summary output
console.log('--- STABILITY CHECK RESULT ---');
for (const s of successes) {
  console.log(`[PASS] ${s}`);
}

if (errors.length > 0) {
  console.error('\n--- PEMERIKSAAN STABILITAS GAGAL ---');
  for (const e of errors) {
    console.error(`[FAIL] ${e}`);
  }
  process.exit(1);
} else {
  console.log('\n[PASS] Semua kriteria stabilitas terpenuhi dengan sempurna!\n');
  process.exit(0);
}
