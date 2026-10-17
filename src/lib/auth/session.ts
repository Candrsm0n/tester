// ============================================================================
// TOPUPKU - SERVER-SIDE AUTHENTICATION & RBAC SESSION ENGINE
// Uses HMAC-SHA256 signed HTTP-Only Cookies & Role-Based Access Control
// ============================================================================

import crypto from "crypto";
import { ENV_CONFIG } from "@/config/env";
import type { RoleType, SessionUser } from "@/types";

export interface SignedSessionPayload {
  user: SessionUser;
  iat: number;
  exp: number;
  jti: string;
}

export function signSessionToken(user: SessionUser, ttlSeconds = 86400 * 7): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: SignedSessionPayload = {
    user,
    iat: nowSec,
    exp: nowSec + ttlSeconds,
    jti: crypto.randomUUID(),
  };
  const base64Payload = Buffer.from(JSON.stringify(payload), "utf-8").toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", ENV_CONFIG.authSecret)
    .update(base64Payload)
    .digest("base64url");
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token?: string | null): SignedSessionPayload | null {
  if (!token || !token.includes(".")) return null;
  try {
    const [base64Payload, providedSig] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", ENV_CONFIG.authSecret)
      .update(base64Payload)
      .digest("base64url");
    const a = Buffer.from(providedSig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }
    const decoded = JSON.parse(
      Buffer.from(base64Payload, "base64url").toString("utf-8")
    ) as SignedSessionPayload;
    const nowSec = Math.floor(Date.now() / 1000);
    if (decoded.exp < nowSec) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function hasRequiredRole(userRole: RoleType, allowedRoles: RoleType[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isAdminRole(role?: RoleType | null): boolean {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export function isSuperAdminRole(role?: RoleType | null): boolean {
  return role === "SUPERADMIN";
}

export function buildHttpOnlyCookieHeader(token: string, maxAgeSeconds = 86400 * 7): string {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ENV_CONFIG.sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureFlag}`;
}

export function buildLogoutCookieHeader(): string {
  return `${ENV_CONFIG.sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function extractCookieValue(cookieHeader: string | null, name = ENV_CONFIG.sessionCookieName): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return part.substring(name.length + 1);
    }
  }
  return null;
}
