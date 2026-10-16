// Server-only: imported from route handlers and server actions, never the client.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Encrypts user-supplied API keys before they're stored (AES-256-GCM).
 *
 * The 32-byte key comes from APP_ENCRYPTION_KEY (base64), which lives only in
 * the server environment — so a leaked database row is useless on its own.
 * Format: `v1:<iv>:<auth tag>:<ciphertext>`, each part base64.
 */

function encryptionKey(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw) throw new Error("APP_ENCRYPTION_KEY is not set — the server can't store API keys.");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("APP_ENCRYPTION_KEY must be 32 bytes, base64-encoded.");
  return key;
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), data.toString("base64")].join(":");
}

export function decryptSecret(stored: string): string {
  const [version, iv, tag, data] = stored.split(":");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Unrecognised secret format.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}

/** What the UI may show of a key: its last four characters. */
export function secretHint(plain: string): string {
  return `••••${plain.slice(-4)}`;
}
