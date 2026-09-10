/**
 * Standard CRC-16 / CCITT-FALSE implementation for ALCO Request Code v2
 * CRC16 is used exclusively to detect copy-paste/transmission corruption, NOT as a cryptographic signature.
 */
export function calculateCRC16(data: string): string {
  let crc = 0xffff;
  const bytes = new TextEncoder().encode(data);

  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i] << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function verifyCRC16(data: string, expectedHex: string): boolean {
  if (!expectedHex || expectedHex.length !== 4) return false;
  const calculated = calculateCRC16(data);
  return calculated.toUpperCase() === expectedHex.toUpperCase();
}
