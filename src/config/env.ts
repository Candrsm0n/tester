// ============================================================================
// TOPUPKU - CENTRALIZED ENVIRONMENT & MODE CONFIGURATION
// ============================================================================

import type { AppExecutionMode } from "@/types";

export function getAppMode(): AppExecutionMode {
  const raw = (process.env.APP_MODE || "DEMO").toUpperCase();
  return raw === "PRODUCTION" ? "PRODUCTION" : "DEMO";
}

export function isDemoMode(): boolean {
  return getAppMode() === "DEMO";
}

export function isProductionMode(): boolean {
  return getAppMode() === "PRODUCTION";
}

export const ENV_CONFIG = {
  get appMode(): AppExecutionMode {
    return getAppMode();
  },
  appName: process.env.NEXT_PUBLIC_APP_NAME || "TOPUPKU",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  timezone: process.env.TZ || "Asia/Jakarta",
  databaseUrl: process.env.DATABASE_URL || "",
  authSecret:
    process.env.AUTH_SECRET || "topupku_default_dev_secret_key_change_in_prod_2026",
  sessionCookieName: process.env.SESSION_COOKIE_NAME || "topupku_session",
  csrfSecret: process.env.CSRF_SECRET || "topupku_csrf_secret_2026",
  midtrans: {
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    merchantId: process.env.MIDTRANS_MERCHANT_ID || "G000000000",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    coreApiUrl:
      process.env.MIDTRANS_IS_PRODUCTION === "true"
        ? "https://api.midtrans.com/v2"
        : process.env.MIDTRANS_CORE_API_URL || "https://api.sandbox.midtrans.com/v2",
    snapUrl:
      process.env.MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/v1/transactions"
        : process.env.MIDTRANS_SNAP_URL ||
          "https://app.sandbox.midtrans.com/snap/v1/transactions",
    qrisExpiryMinutes: Number(process.env.MIDTRANS_QRIS_EXPIRY_MINUTES || "15"),
  },
  digiflazz: {
    username: process.env.DIGIFLAZZ_USERNAME || "",
    apiKey: process.env.DIGIFLAZZ_API_KEY || "",
    webhookSecret: process.env.DIGIFLAZZ_WEBHOOK_SECRET || "",
    apiUrl: process.env.DIGIFLAZZ_API_URL || "https://api.digiflazz.com/v1",
    defaultMarginPercent: Number(
      process.env.DIGIFLAZZ_DEFAULT_MARGIN_PERCENT || "8"
    ),
  },
  whatsapp: {
    enabled: process.env.WHATSAPP_ENABLED === "true",
    provider: process.env.WHATSAPP_PROVIDER || "fonnte",
    apiUrl: process.env.WHATSAPP_API_URL || "https://api.fonnte.com/send",
    apiToken: process.env.WHATSAPP_API_TOKEN || "",
    csNumber: process.env.NEXT_PUBLIC_WHATSAPP_CS || "6281234567890",
  },
  smtp: {
    enabled: process.env.SMTP_ENABLED === "true",
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "TOPUPKU Official <noreply@topupku.id>",
  },
  security: {
    rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || "60"),
    rateLimitWindowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS || "60"),
    maintenanceMode: process.env.MAINTENANCE_MODE === "true",
  },
};

export function maskSecret(secret?: string | null): string {
  if (!secret || secret.trim().length === 0) return "BELUM DIKONFIGURASI";
  if (secret.length <= 8) return "••••••••";
  return `${secret.slice(0, 4)}••••••••••••${secret.slice(-4)}`;
}
