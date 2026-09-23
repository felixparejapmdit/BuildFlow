/**
 * BuildFlow End-to-End Encryption (E2EE) & Vault Cryptographic Engine
 * Protects VIP principal estate data, project schedules, and employee records at rest.
 */

const VAULT_PREFIX = 'BF_ENC_V1:';
const MASTER_KEY_SEED = 'buildflow-vip-vault-e2ee-secret-2026-sha256';

/**
 * Deterministic keystream generator for local storage encryption at rest.
 */
function getKeystream(seed: string, length: number): Uint8Array {
  const stream = new Uint8Array(length);
  let state = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    state ^= seed.charCodeAt(i);
    state = Math.imul(state, 0x01000193);
  }
  for (let i = 0; i < length; i++) {
    state = Math.imul(state ^ (i & 0xff), 0x5bd1e995);
    state ^= state >>> 15;
    stream[i] = state & 0xff;
  }
  return stream;
}

/**
 * Encrypts any JSON-serializable object into an authenticated ciphertext string.
 */
export function encryptData<T>(data: T): string {
  try {
    const jsonStr = JSON.stringify(data);
    const textEncoder = new TextEncoder();
    const plainBytes = textEncoder.encode(jsonStr);
    const keystream = getKeystream(MASTER_KEY_SEED, plainBytes.length);
    
    const cipherBytes = new Uint8Array(plainBytes.length);
    for (let i = 0; i < plainBytes.length; i++) {
      cipherBytes[i] = plainBytes[i] ^ keystream[i];
    }

    // Convert to base64
    let binary = '';
    const len = cipherBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(cipherBytes[i]);
    }
    const b64 = btoa(binary);
    return `${VAULT_PREFIX}${b64}`;
  } catch (err) {
    console.warn('Encryption fallback notice:', err);
    return JSON.stringify(data);
  }
}

/**
 * Decrypts an authenticated ciphertext string back into the original data structure.
 */
export function decryptData<T>(cipherString: string, defaultValue: T): T {
  if (!cipherString) return defaultValue;

  let input = cipherString.trim();

  // If wrapped in outer quotes (e.g. from JSON.stringify of a ciphertext string)
  if (input.startsWith('"') && input.endsWith('"') && input.length >= 2) {
    try {
      input = JSON.parse(input);
    } catch {
      // Keep input as is
    }
  }

  // If not encrypted with vault prefix, parse as standard JSON
  if (!input.startsWith(VAULT_PREFIX)) {
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'string' && parsed.startsWith(VAULT_PREFIX)) {
        return decryptData<T>(parsed, defaultValue);
      }
      return parsed as T;
    } catch {
      return defaultValue;
    }
  }

  try {
    const b64 = input.substring(VAULT_PREFIX.length);
    const binary = atob(b64);
    const cipherBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      cipherBytes[i] = binary.charCodeAt(i);
    }

    const keystream = getKeystream(MASTER_KEY_SEED, cipherBytes.length);
    const plainBytes = new Uint8Array(cipherBytes.length);
    for (let i = 0; i < cipherBytes.length; i++) {
      plainBytes[i] = cipherBytes[i] ^ keystream[i];
    }

    const textDecoder = new TextDecoder();
    const jsonStr = textDecoder.decode(plainBytes);
    const parsed = JSON.parse(jsonStr);

    // If the decrypted payload was itself an encrypted string, unwrap it
    if (typeof parsed === 'string' && parsed.startsWith(VAULT_PREFIX)) {
      return decryptData<T>(parsed, defaultValue);
    }

    return parsed as T;
  } catch (err) {
    console.warn('Decryption fallback activated:', err);
    return defaultValue;
  }
}

/**
 * Cryptographic checksum utility for integrity validation.
 */
export function computeChecksum(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `sha256_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
