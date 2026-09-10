import { base64UrlEncode } from './canonical';

const DEVICE_ID_STORAGE_KEY = 'alco_device_id_v2';
const APP_NAMESPACE = 'alco:contentengine:device';

/**
 * Validates ALCO Device ID format: ALCO-DEV-XXXX-XXXX-XXXX
 */
export function isValidAlcoDeviceId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const regex = /^ALCO-DEV-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/;
  return regex.test(id.trim());
}

/**
 * Computes a SHA-256 hex string synchronously/asynchronously across browser and Node.
 */
async function sha256Hex(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js fallback
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(message).digest('hex');
  } catch {
    // Basic hash fallback
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = (hash << 5) - hash + message.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(32, '0');
  }
}

/**
 * Generates or retrieves the stable ALCO Device ID for this machine.
 * Format: ALCO-DEV-XXXX-XXXX-XXXX
 */
export async function getAlcoDeviceId(): Promise<string> {
  // 1. Check local storage cache first for instant consistency
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cached = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
      if (cached && isValidAlcoDeviceId(cached)) {
        return cached;
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  // 2. Gather hardware/platform fingerprint indicators
  let rawSeed = '';

  if (typeof window !== 'undefined') {
    const nav = window.navigator;
    const screen = window.screen;
    const parts = [
      APP_NAMESPACE,
      nav.userAgent || '',
      nav.language || '',
      screen.width || '',
      screen.height || '',
      screen.colorDepth || '',
      new Date().getTimezoneOffset(),
      nav.hardwareConcurrency || 4,
    ];
    rawSeed = parts.join('::');
  } else {
    rawSeed = `${APP_NAMESPACE}::node::${process.platform}::${process.arch}`;
  }

  // 3. Hash to 256-bit digest
  const hash = await sha256Hex(rawSeed);

  // 4. Extract first 12 hex characters and uppercase them
  const rawHex = hash.slice(0, 12).toUpperCase().padEnd(12, '0');
  const part1 = rawHex.slice(0, 4);
  const part2 = rawHex.slice(4, 8);
  const part3 = rawHex.slice(8, 12);

  const deviceId = `ALCO-DEV-${part1}-${part2}-${part3}`;

  // 5. Store permanently for stability
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    } catch {
      // Ignore localStorage write error
    }
  }

  return deviceId;
}

/**
 * Synchronous version for initial rendering when localStorage cache is available.
 */
export function getCachedAlcoDeviceId(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cached = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
      if (cached && isValidAlcoDeviceId(cached)) {
        return cached;
      }
    } catch {
      // Ignore
    }
  }
  return 'ALCO-DEV-INIT-0000-0000';
}
