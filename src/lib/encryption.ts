import "server-only";

import crypto from "crypto";

// ==================================================
// ENCRYPTION — AES-256-GCM
// ==================================================
// Used for encrypting sensitive credentials before storing in DB.
//
// Why AES-256-GCM:
//   - Authenticated encryption (tamper-proof)
//   - Industry standard
//   - Node.js native (no extra deps)
//
// Format of encrypted value:
//   "iv:authTag:ciphertext"  (all base64)
//
// ⚠️ NEVER change APP_SECRET_KEY after credentials are encrypted.
//    Doing so makes existing credentials unreadable.
// ==================================================

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;        // 96 bits (recommended for GCM)
const AUTH_TAG_LENGTH = 16;  // 128 bits

function getMasterKey(): Buffer {
  const key = process.env.APP_SECRET_KEY;

  if (!key) {
    throw new Error(
      "APP_SECRET_KEY missing from environment. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    );
  }

  // Key must be 32 bytes for AES-256
  // We accept base64 (44 chars) or hex (64 chars)
  let buffer: Buffer;

  if (key.length === 44) {
    // Base64 encoded 32 bytes
    buffer = Buffer.from(key, "base64");
  } else if (key.length === 64) {
    // Hex encoded 32 bytes
    buffer = Buffer.from(key, "hex");
  } else {
    // Try to derive a 32-byte key via SHA-256 (fallback for user-supplied keys)
    buffer = crypto.createHash("sha256").update(key).digest();
  }

  if (buffer.length !== 32) {
    throw new Error(
      "APP_SECRET_KEY must decode to exactly 32 bytes (AES-256)"
    );
  }

  return buffer;
}

// ==================================================
// ENCRYPT
// ==================================================
export function encrypt(plaintext: string): string {
  if (!plaintext) return "";

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

// ==================================================
// DECRYPT
// ==================================================
export function decrypt(encryptedValue: string): string {
  if (!encryptedValue) return "";

  const parts = encryptedValue.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted value format");
  }

  const [ivB64, authTagB64, ciphertextB64] = parts;

  const key = getMasterKey();
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// ==================================================
// MASK — for display in admin UI
// ==================================================
// "982d381360a69d419689740d9f2e26ce36fb7a50" → "••••••••••••••••••••••1f3a"
// ==================================================
export function maskSecret(value: string, visibleChars = 4): string {
  if (!value) return "";
  if (value.length <= visibleChars) return "•".repeat(value.length);

  const visible = value.slice(-visibleChars);
  const hidden = "•".repeat(Math.min(value.length - visibleChars, 32));

  return `${hidden}${visible}`;
}

// ==================================================
// IS ENCRYPTED — check format
// ==================================================
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(":");
  if (parts.length !== 3) return false;

  try {
    Buffer.from(parts[0], "base64");
    Buffer.from(parts[1], "base64");
    Buffer.from(parts[2], "base64");
    return true;
  } catch {
    return false;
  }
}