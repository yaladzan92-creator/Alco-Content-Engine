/**
 * ALCO Authority Public Key Configuration
 * CRITICAL RULE (ALCO APP STANDARD v2.1 Section 14):
 * Distributed apps MUST ONLY hold the Authority Public Key.
 * Private signing keys MUST NEVER be present in the user app or public repository.
 */

// Official ALCO Ecosystem Authority Ed25519 Public Key (Raw 32-byte hex & SPKI PEM)
export const ALCO_AUTHORITY_PUBLIC_KEY_HEX = '9c9431e78465b40cf6ce78d8a7c18a287a989f6655c3c2f9d501b1625f68a867';

export const ALCO_AUTHORITY_PUBLIC_KEY_SPKI = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA9pQx54RltAz2znjYp8GKKHqYn2ZVw8L51QGxYl9oqGc=
-----END PUBLIC KEY-----`;

export const ALCO_APP_ID = 'alco-content-engine';
