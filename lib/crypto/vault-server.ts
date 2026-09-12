import "server-only";
import crypto from "crypto";

/**
 * UXI-HQ Server-Side Envelope Encryption Module
 *
 * Implements hardware-grade envelope encryption:
 * - KEK (Key Encryption Key): Derived from server-only process.env.VAULT_MASTER_KEY
 * - DEK (Data Encryption Key): 256-bit cryptographically random key generated per secret
 * - IV: 12-byte cryptographically random IV generated per AES-256-GCM encryption
 * - Envelope format (v1): v1:<b64(enc_dek)>:<b64(dek_iv)>:<b64(dek_tag)>:<b64(payload_iv)>:<b64(payload_tag)>:<b64(ciphertext)>
 *
 * This module runs strictly on the Node.js server and must NEVER be imported by client components.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const DEK_LENGTH = 32; // 256 bits

/**
 * Resolves the server-only Master Key (KEK) buffer.
 * Enforces strictly valid 256-bit key from process.env.VAULT_MASTER_KEY.
 * Throws immediately if missing, invalid, or malformed with ZERO fallbacks.
 */
function getMasterKey(): Buffer {
  const masterHex = process.env.VAULT_MASTER_KEY?.trim();

  if (!masterHex) {
    throw new Error(
      "CRITICAL: VAULT_MASTER_KEY environment variable is not configured."
    );
  }

  if (
    masterHex.length === 64 &&
    /^[0-9a-fA-F]+$/.test(masterHex)
  ) {
    return Buffer.from(masterHex, "hex");
  }

  const buf = Buffer.from(masterHex, "base64");

  if (buf.length === 32) {
    return buf;
  }

  throw new Error(
    "CRITICAL: VAULT_MASTER_KEY must be a valid 256-bit (64-character hex or 32-byte base64) key."
  );
}

/**
 * Encrypt a plaintext secret using server-side envelope encryption.
 * Returns a versioned envelope string: v1:<enc_dek>:<dek_iv>:<dek_tag>:<payload_iv>:<payload_tag>:<ciphertext>
 */
export function encryptSecretServer(plainText: string): string {
  if (!plainText) return "";

  const kek = getMasterKey();

  // 1. Generate random 256-bit Data Encryption Key (DEK)
  const dek = crypto.randomBytes(DEK_LENGTH);

  // 2. Encrypt plaintext payload with DEK
  const payloadIv = crypto.randomBytes(IV_LENGTH);
  const payloadCipher = crypto.createCipheriv(ALGORITHM, dek, payloadIv);
  const encryptedPayload = Buffer.concat([
    payloadCipher.update(plainText, "utf8"),
    payloadCipher.final(),
  ]);
  const payloadAuthTag = payloadCipher.getAuthTag();

  // 3. Encrypt DEK with KEK (Master Key)
  const dekIv = crypto.randomBytes(IV_LENGTH);
  const dekCipher = crypto.createCipheriv(ALGORITHM, kek, dekIv);
  const encryptedDek = Buffer.concat([
    dekCipher.update(dek),
    dekCipher.final(),
  ]);
  const dekAuthTag = dekCipher.getAuthTag();

  // Zero out the plain DEK from memory buffer
  dek.fill(0);

  // 4. Construct versioned envelope
  return [
    "v1",
    encryptedDek.toString("base64"),
    dekIv.toString("base64"),
    dekAuthTag.toString("base64"),
    payloadIv.toString("base64"),
    payloadAuthTag.toString("base64"),
    encryptedPayload.toString("base64"),
  ].join(":");
}

/**
 * Decrypt a v1 envelope string back into plaintext.
 * Strictly requires versioned v1 envelope format.
 */
export function decryptSecretServer(storedValue: string): string {
  if (!storedValue) return "";

  if (!storedValue.startsWith("v1:")) {
    throw new Error("Invalid or unsupported envelope format.");
  }

  const parts = storedValue.split(":");
  if (parts.length !== 7) {
    throw new Error("Corrupted envelope format.");
  }

  const [
    ,
    encDekB64,
    dekIvB64,
    dekTagB64,
    payloadIvB64,
    payloadTagB64,
    payloadCipherB64,
  ] = parts;

  const kek = getMasterKey();

  // 1. Decrypt DEK using KEK
  const encDek = Buffer.from(encDekB64, "base64");
  const dekIv = Buffer.from(dekIvB64, "base64");
  const dekTag = Buffer.from(dekTagB64, "base64");

  const dekDecipher = crypto.createDecipheriv(ALGORITHM, kek, dekIv);
  dekDecipher.setAuthTag(dekTag);
  const dek = Buffer.concat([
    dekDecipher.update(encDek),
    dekDecipher.final(),
  ]);

  // 2. Decrypt Payload using decrypted DEK
  const payloadIv = Buffer.from(payloadIvB64, "base64");
  const payloadTag = Buffer.from(payloadTagB64, "base64");
  const encryptedPayload = Buffer.from(payloadCipherB64, "base64");

  const payloadDecipher = crypto.createDecipheriv(ALGORITHM, dek, payloadIv);
  payloadDecipher.setAuthTag(payloadTag);
  const decryptedPayload = Buffer.concat([
    payloadDecipher.update(encryptedPayload),
    payloadDecipher.final(),
  ]);

  // Zero out DEK
  dek.fill(0);

  return decryptedPayload.toString("utf8");
}
