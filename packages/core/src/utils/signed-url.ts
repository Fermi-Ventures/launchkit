/**
 * HMAC-signed URL utility for time-limited download links.
 *
 * Generates and validates download URLs with an expiry timestamp and
 * HMAC-SHA256 signature. Used for secure, time-limited access to resources.
 *
 * Uses NEXTAUTH_SECRET as the signing key — same secret already required
 * for auth, so no additional env configuration needed.
 *
 * @example
 * ```ts
 * // Generate a download URL valid for 1 hour
 * const url = generateSignedDownloadUrl('file-123', '/api/files/file-123/download');
 * // Returns: /api/files/file-123/download?expires=1234567890&token=abc123...
 *
 * // Validate the URL
 * const { valid, reason } = validateSignedUrl('file-123', expires, token);
 * if (!valid) {
 *   return res.status(403).json({ error: reason });
 * }
 * ```
 */
import { createHmac } from "crypto";

const SIGNING_KEY = process.env.NEXTAUTH_SECRET || "";
const DEFAULT_TTL_SECONDS = 3600; // 1 hour

/**
 * Generate a signed download path with expiry.
 * Returns the path portion only (e.g., `/api/resume/abc/download?expires=...&token=...`).
 */
export function generateSignedDownloadUrl(
  resourceId: string,
  basePath: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): string {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = sign(resourceId, expires);
  return `${basePath}?expires=${expires}&token=${token}`;
}

/**
 * Validate a signed URL token. Returns true if the signature is valid
 * and the link hasn't expired.
 */
export function validateSignedUrl(
  resourceId: string,
  expires: number,
  token: string
): { valid: boolean; reason?: string } {
  const now = Math.floor(Date.now() / 1000);
  if (now > expires) {
    return { valid: false, reason: "Link expired" };
  }

  const expected = sign(resourceId, expires);
  if (token !== expected) {
    return { valid: false, reason: "Invalid signature" };
  }

  return { valid: true };
}

function sign(resourceId: string, expires: number): string {
  return createHmac("sha256", SIGNING_KEY)
    .update(`${resourceId}:${expires}`)
    .digest("hex")
    .slice(0, 32); // 128-bit truncation — sufficient for URL signing
}
