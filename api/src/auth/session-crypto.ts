/**
 * Session Cookie Encryption
 *
 * Encrypts and decrypts session data for httpOnly cookies.
 * Uses AES-256-GCM for authenticated encryption — tamper-proof and confidential.
 *
 * The cookie is:
 * - Encrypted (tokens not visible in devtools)
 * - Authenticated (GCM tag prevents tampering)
 * - Signed by cookie-parser (additional layer via COOKIE_SECRET)
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derive a 256-bit key from a secret string using scrypt
 */
function deriveKey(secret: string): Buffer {
  return scryptSync(secret, 'lp-extend-session', KEY_LENGTH);
}

/**
 * Session data stored in the cookie
 */
export interface SessionPayload {
  lpAccountId: string;
  lpUserId: string;
  lpAccessToken: string;
  isLPA: boolean;
  lpRole?: string;
  loginName?: string;
  cbToken?: string;
  cbOrg?: string;
  expiresAt: number;
}

/**
 * Encrypt a session payload into a base64 string suitable for a cookie value
 */
export function encryptSession(payload: SessionPayload, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: base64(iv + tag + ciphertext)
  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString('base64url');
}

/**
 * Decrypt a session cookie value back into a SessionPayload.
 * Returns null if decryption fails (tampered, wrong key, corrupted).
 */
export function decryptSession(cookieValue: string, secret: string): SessionPayload | null {
  try {
    const key = deriveKey(secret);
    const combined = Buffer.from(cookieValue, 'base64url');

    if (combined.length < IV_LENGTH + TAG_LENGTH + 1) return null;

    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8')) as SessionPayload;
  } catch {
    return null;
  }
}
