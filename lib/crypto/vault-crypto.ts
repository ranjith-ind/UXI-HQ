/**
 * UXI-HQ Vault Cryptographic Utility
 *
 * Uses the Web Crypto API (AES-GCM, 256-bit) to encrypt secrets in the browser
 * before persisting to Supabase, and to decrypt on demand when viewing or copying.
 *
 * Ciphertext format: base64(iv) + ":" + base64(ciphertext)
 */

const DEFAULT_SALT = "uxi-hq-vault-secure-salt-2026";
const APP_SECRET =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "uxi-hq-vault-master-secret-key-32b";

// Derive an AES-GCM CryptoKey using PBKDF2
async function getDerivedKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(APP_SECRET),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(DEFAULT_SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Helper: Uint8Array to base64
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: base64 to Uint8Array
function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt a secret plain text string into a formatted iv:ciphertext string.
 */
export async function encryptSecret(plainText: string): Promise<string> {
  if (!plainText) return "";
  try {
    const key = await getDerivedKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encoded
    );

    const ivB64 = toBase64(iv);
    const cipherB64 = toBase64(new Uint8Array(ciphertextBuffer));
    return `${ivB64}:${cipherB64}`;
  } catch (err) {
    console.error("Encryption error:", err);
    throw new Error("Failed to encrypt secret.");
  }
}

/**
 * Decrypt an iv:ciphertext string back into the original plain text.
 */
export async function decryptSecret(cipherWithIv: string): Promise<string> {
  if (!cipherWithIv) return "";
  // If not formatted as iv:ciphertext, return plain text (for backward compatibility if any)
  if (!cipherWithIv.includes(":")) {
    return cipherWithIv;
  }

  try {
    const [ivB64, cipherB64] = cipherWithIv.split(":");
    const iv = fromBase64(ivB64);
    const ciphertext = fromBase64(cipherB64);
    const key = await getDerivedKey();

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as any,
      },
      key,
      ciphertext as any
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error("Decryption error:", err);
    return "••••••••";
  }
}
