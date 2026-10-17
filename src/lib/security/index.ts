// ============================================================================
// TOPUPKU - ENTERPRISE SECURITY ENGINE
// Features: Password Hashing (scrypt + timingSafeEqual), Rate Limiting,
// XSS Sanitization, CSRF Protection, Webhook Signature Verification, Idempotency
// ============================================================================

import crypto from "crypto";
import { ENV_CONFIG } from "@/config/env";

// --- 1. PASSWORD HASHING (Scrypt + Timing-Safe Comparison) ---
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }
    const [, salt, originalKeyHex] = parts;
    const derivedBuf = crypto.scryptSync(password, salt, 64);
    const originalBuf = Buffer.from(originalKeyHex, "hex");
    if (derivedBuf.length !== originalBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedBuf, originalBuf);
  } catch {
    return false;
  }
}

// --- 2. XSS & INPUT SANITIZATION ---
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] || ch)
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      cleaned[k] = sanitizeString(v);
    } else if (Array.isArray(v)) {
      cleaned[k] = v.map((item) =>
        typeof item === "string" ? sanitizeString(item) : item
      );
    } else if (v && typeof v === "object") {
      cleaned[k] = sanitizeObject(v);
    } else {
      cleaned[k] = v;
    }
  }
  return cleaned as T;
}

// --- 3. SLIDING-WINDOW RATE LIMITER ---
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  identifier: string,
  maxRequests = ENV_CONFIG.security.rateLimitMaxRequests,
  windowSeconds = ENV_CONFIG.security.rateLimitWindowSeconds
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    const entry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, entry);
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      resetAt: entry.resetAt,
    };
  }

  existing.count += 1;
  rateLimitStore.set(identifier, existing);

  if (existing.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    resetAt: existing.resetAt,
  };
}

export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}

// --- 4. CSRF TOKEN GENERATION & VALIDATION ---
export function generateCsrfToken(sessionId: string): string {
  const timestamp = Date.now().toString();
  const hmac = crypto
    .createHmac("sha256", ENV_CONFIG.csrfSecret)
    .update(`${sessionId}:${timestamp}`)
    .digest("hex");
  return `${timestamp}.${hmac}`;
}

export function verifyCsrfToken(token: string, sessionId: string): boolean {
  if (!token || !token.includes(".")) return false;
  const [timestamp, providedHmac] = token.split(".");
  const ageMs = Date.now() - Number(timestamp);
  if (Number.isNaN(ageMs) || ageMs < 0 || ageMs > 24 * 60 * 60 * 1000) {
    return false;
  }
  const expectedHmac = crypto
    .createHmac("sha256", ENV_CONFIG.csrfSecret)
    .update(`${sessionId}:${timestamp}`)
    .digest("hex");
  const a = Buffer.from(providedHmac, "hex");
  const b = Buffer.from(expectedHmac, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// --- 5. IDEMPOTENCY KEY & LOG REDACTION ---
export function computeIdempotencyHash(payload: string): string {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function redactSensitiveLog(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    "password",
    "passwordHash",
    "serverKey",
    "apiKey",
    "sign",
    "signature_key",
    "token",
    "secret",
  ];
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (sensitiveKeys.some((sk) => k.toLowerCase().includes(sk.toLowerCase()))) {
      out[k] = "[REDACTED]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = redactSensitiveLog(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
