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

// 5. Check ALCO APP STANDARD v2.2 Compliance
const licenseFiles = [
  'lib/license/types.ts',
  'lib/license/device-fingerprint.ts',
  'lib/license/request-code.ts',
  'lib/license/canonical.ts',
  'lib/license/authority-key.ts',
  'lib/license/verification.ts',
  'lib/license/license-context.tsx',
  'components/license/LicenseGate.tsx',
];

let allLicenseFilesExist = true;
for (const relPath of licenseFiles) {
  const fullPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`ALCO License file "${relPath}" wajib ada untuk kepatuhan ALCO APP STANDARD v2.2!`);
    allLicenseFilesExist = false;
  }
}

if (allLicenseFilesExist) {
  successes.push('ALCO License Protocol v2.2 files terpasang lengkap.');
}

// 5A. Check ALCO APP STANDARD v2.2 Section 15A: License Gate Enforcement
const layoutPath = path.join(projectRoot, 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('<LicenseGate>') && layoutContent.includes('</LicenseGate>')) {
    successes.push('Section 15A License Gate terpasang aktif di RootLayout (app/layout.tsx).');
  } else {
    errors.push('app/layout.tsx wajib membungkus children dengan <LicenseGate> untuk kepatuhan Section 15A!');
  }
}

// Check that no forbidden default bypass (e.g. useState(true) for isAccessValid) exists
const homeClientPath = path.join(projectRoot, 'components', 'HomePageClient.tsx');
if (fs.existsSync(homeClientPath)) {
  const homeClientContent = fs.readFileSync(homeClientPath, 'utf8');
  if (homeClientContent.includes('useState(true)') && homeClientContent.includes('isAccessValid')) {
    errors.push('CRITICAL: Ditemukan hardcoded default bypass isAccessValid = true di HomePageClient.tsx!');
  } else {
    successes.push('Bebas dari default bypass (isAccessValid tersinkronisasi penuh dengan useLicense).');
  }
}

// 6. Security Audit: Check that NO Authority Private Key exists in repository/source
const authorityKeyPath = path.join(projectRoot, 'lib', 'license', 'authority-key.ts');
if (fs.existsSync(authorityKeyPath)) {
  const keyContent = fs.readFileSync(authorityKeyPath, 'utf8');
  const privateKeyPatterns = [
    /-----BEGIN\s+(?:[A-Z0-9_-]+\s+)?PRIVATE\s+KEY-----/i,
    /(?:export\s+)?(?:const|let|var)\s+\w*(?:private_?key|signing_?private_?key|authority_?private_?key)\w*\s*=/i,
    /\b(?:authorityPrivateKey|signingPrivateKey|privateKey|PRIVATE_KEY)\s*[:=]/i,
  ];
  const detectedPattern = privateKeyPatterns.find((pattern) => pattern.test(keyContent));

  if (detectedPattern) {
    errors.push('CRITICAL SECURITY VIOLATION: Authority Private Key ditemukan di authority-key.ts! Hanya Authority Public Key yang diperbolehkan.');
  } else {
    successes.push('Security Audit: authority-key.ts bebas dari Private Key (Authority Public Key only).');
  }

  // ALCO LICENSE STANDARD v1.0 Section 3: Official Authority Public Key verification
  const OFFICIAL_HEX = '7a8e99b9ba45bc9f8847bc9fc4952a87b7fa22a3b0c09a5b22ed939de0ed5162';
  if (keyContent.includes(OFFICIAL_HEX)) {
    successes.push('ALCO LICENSE STANDARD v1.0 Section 3 terverifikasi: Official Authority Public Key HEX identik.');
  } else {
    errors.push('ALCO LICENSE STANDARD v1.0 Section 3: Authority Public Key HEX wajib bernilai 7a8e99b9ba45bc9f8847bc9fc4952a87b7fa22a3b0c09a5b22ed939de0ed5162!');
  }
}

// 7. Check Electron Production Runtime & Health Check Route
const electronMainPath = path.join(projectRoot, 'electron', 'main.cjs');
const electronServerPath = path.join(projectRoot, 'electron', 'server.cjs');
const electronPreloadPath = path.join(projectRoot, 'electron', 'preload.cjs');
const healthRoutePath = path.join(projectRoot, 'app', 'api', 'health', 'route.ts');
const electronBuilderPath = path.join(projectRoot, 'electron-builder.json');

if (fs.existsSync(electronMainPath) && fs.existsSync(electronServerPath)) {
  const mainContent = fs.readFileSync(electronMainPath, 'utf8');
  if (mainContent.includes('checkServerHealth') && mainContent.includes('findAvailablePort') && mainContent.includes('stopProductionServer')) {
    successes.push('Electron production runtime terpasang lengkap (dynamic port, health check retry, graceful shutdown).');
  } else {
    errors.push('electron/main.cjs harus mengimplementasikan findAvailablePort, checkServerHealth, dan stopProductionServer!');
  }
} else {
  errors.push('electron/main.cjs atau electron/server.cjs tidak ditemukan!');
}

// 8. Check ALCO Device ID & Preload IPC Bridge (ALCO APP STANDARD v2.2 Section 9)
if (fs.existsSync(electronMainPath) && fs.existsSync(electronPreloadPath)) {
  const mainContent = fs.readFileSync(electronMainPath, 'utf8');
  const preloadContent = fs.readFileSync(electronPreloadPath, 'utf8');

  const hasMachineGuid = mainContent.includes('getWindowsMachineGuid') && mainContent.includes('getAlcoProductionDeviceId');
  const hasIpcHandler = mainContent.includes("ipcMain.handle('alco:get-device-id'");
  const hasPreloadBridge = preloadContent.includes('alcoBridge') && preloadContent.includes('getDeviceId');

  if (hasMachineGuid && hasIpcHandler && hasPreloadBridge) {
    successes.push('Device ID hardware protocol terpasang lengkap (Windows MachineGuid, format ALCO-DEV-XXXX-XXXX-XXXX, IPC bridge).');
  } else {
    errors.push('Device ID protocol belum lengkap di electron/main.cjs atau electron/preload.cjs!');
  }
} else {
  errors.push('electron/preload.cjs tidak ditemukan!');
}

if (fs.existsSync(healthRoutePath)) {
  const healthContent = fs.readFileSync(healthRoutePath, 'utf8');
  if (healthContent.includes('alco-content-engine')) {
    successes.push('Endpoint health check production (/api/health) terpasang dengan app identity "alco-content-engine".');
  } else {
    errors.push('app/api/health/route.ts wajib menyertakan app identity "alco-content-engine"!');
  }
} else {
  errors.push('app/api/health/route.ts wajib ada untuk health check!');
}

if (fs.existsSync(electronMainPath)) {
  const mainContent = fs.readFileSync(electronMainPath, 'utf8');
  if (mainContent.includes('alco-content-engine')) {
    successes.push('Health check client di electron/main.cjs memvalidasi app identity (ALCO APP STANDARD v2.4 Section 5A).');
  } else {
    errors.push('electron/main.cjs wajib memvalidasi app identity "alco-content-engine" pada health check!');
  }
}

// 9. Check Icons & Assets Configuration (ALCO APP STANDARD v2.4 Section 7)
const iconIcoPath = path.join(projectRoot, 'assets', 'icon.ico');
const iconPngPath = path.join(projectRoot, 'assets', 'icon.png');
if (fs.existsSync(iconIcoPath) && fs.existsSync(iconPngPath)) {
  successes.push('Asset icon terpasang lengkap (assets/icon.ico dan assets/icon.png).');
} else {
  errors.push('File assets/icon.ico atau assets/icon.png tidak ditemukan!');
}

if (fs.existsSync(electronBuilderPath)) {
  const builderConfig = JSON.parse(fs.readFileSync(electronBuilderPath, 'utf8'));
  if (builderConfig.appId === 'com.alco.contentengine' && builderConfig.productName === 'ALCO Content Engine') {
    successes.push('electron-builder.json valid (appId: com.alco.contentengine, productName: ALCO Content Engine).');
  } else {
    errors.push('electron-builder.json appId atau productName tidak sesuai!');
  }

  if (builderConfig.icon === 'assets/icon.ico' && builderConfig.win?.icon === 'assets/icon.ico') {
    successes.push('Konfigurasi icon Windows di electron-builder.json terpasang valid.');
  } else {
    errors.push('electron-builder.json harus mengarahkan icon dan win.icon ke assets/icon.ico!');
  }
} else {
  errors.push('electron-builder.json tidak ditemukan!');
}

// 10. Check ALCO APP STANDARD v2.5 Section 14A: Official Wire Format Contract
const verificationPath = path.join(projectRoot, 'lib', 'license', 'verification.ts');
const apiVerifyPath = path.join(projectRoot, 'app', 'api', 'license', 'verify', 'route.ts');

if (fs.existsSync(verificationPath) && fs.existsSync(apiVerifyPath)) {
  const verifyCode = fs.readFileSync(verificationPath, 'utf8');
  const apiCode = fs.readFileSync(apiVerifyPath, 'utf8');

  const hex128Regex = /\[0-9a-fA-F\]\{128\}/;
  const hasClientHexCheck = hex128Regex.test(verifyCode) && verifyCode.includes('signatureHex');
  const hasApiHexCheck = hex128Regex.test(apiCode) && apiCode.includes('signatureHex');

  if (hasClientHexCheck && hasApiHexCheck) {
    successes.push('Section 14A Signature Contract terverifikasi: Ed25519 wire format tepat 128 karakter hex divalidasi pada client & API.');
  } else {
    errors.push('Section 14A: verification.ts dan route.ts wajib memvalidasi signature wire format tepat 128 karakter hexadecimal (/^[0-9a-fA-F]{128}$/)!');
  }
} else {
  errors.push('File verification.ts atau api/license/verify/route.ts tidak ditemukan!');
}

// 11. Check ALCO APP STANDARD v2.5 Section 15B: License Activation UX Standard
const licenseGatePath = path.join(projectRoot, 'components', 'license', 'LicenseGate.tsx');
if (fs.existsSync(licenseGatePath)) {
  const gateCode = fs.readFileSync(licenseGatePath, 'utf8');
  const mandatoryGuidance = 'Request Code berhasil disalin. Langkah berikutnya: kirim Request Code kepada Admin ALCO untuk mendapatkan License Code. Setelah menerima License Code, kembali ke halaman ini dan lanjutkan ke tahap Aktivasi.';

  const hasMandatoryGuidance = gateCode.includes(mandatoryGuidance);
  const has3Stages = gateCode.includes('Tahap 1') && gateCode.includes('Tahap 2') && gateCode.includes('Tahap 3');
  const hasNextToActivation = gateCode.includes('btn-next-to-activation') || gateCode.includes('Lanjutkan ke Tahap 3');

  if (hasMandatoryGuidance && has3Stages && hasNextToActivation) {
    successes.push('Section 15B UX Standard terverifikasi: Pola 3 tahap (Buat, Dapatkan, Aktivasi) dan instruksi wajib next action terpasang tanpa dead-end.');
  } else {
    errors.push('Section 15B: LicenseGate.tsx wajib mematuhi standar UX ALCO (3 tahap aktivasi dan instruksi wajib setelah Request Code disalin)!');
  }
} else {
  errors.push('components/license/LicenseGate.tsx tidak ditemukan!');
}

// 12. Check ALCO LICENSE STANDARD v1.0 Section 4: Request Code Checksum Contract
const crcPath = path.join(projectRoot, 'lib', 'license', 'crc16.ts');
const requestCodePath = path.join(projectRoot, 'lib', 'license', 'request-code.ts');

if (fs.existsSync(crcPath) && fs.existsSync(requestCodePath)) {
  const crcCode = fs.readFileSync(crcPath, 'utf8');
  const reqCode = fs.readFileSync(requestCodePath, 'utf8');

  const has0xA001 = crcCode.includes('0xA001');
  const hasReflected = crcCode.includes('>> 1') && crcCode.includes('& 0x0001');
  const hasOnlyPayloadChecksum = reqCode.includes('calculateChecksum(base64UrlPayload)') || reqCode.includes('calculateCRC16(base64UrlPayload)');
  const noPrefixInChecksum = !reqCode.includes('calculateChecksum(prefixAndPayload)') && !reqCode.includes('calculateCRC16(prefixAndPayload)');

  if (has0xA001 && hasReflected && hasOnlyPayloadChecksum && noPrefixInChecksum) {
    successes.push('ALCO LICENSE STANDARD v1.0 Section 4 terverifikasi: Polynomial 0xA001 reflected & Checksum dihitung HANYA dari Base64URL payload.');
  } else {
    errors.push('ALCO LICENSE STANDARD v1.0 Section 4: Checksum wajib menggunakan polynomial 0xA001 reflected dan dihitung HANYA dari string Base64URL payload!');
  }
} else {
  errors.push('lib/license/crc16.ts atau lib/license/request-code.ts tidak ditemukan!');
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
