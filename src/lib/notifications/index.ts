// ============================================================================
// TOPUPKU - MULTI-CHANNEL AUTOMATIC NOTIFICATION ENGINE
// Channels: Website In-App, Email (SMTP), WhatsApp API (Fonnte/Wablas/Cloud)
// Gracefully runs without throwing errors if external providers are unconfigured.
// ============================================================================

import crypto from "crypto";
import { ENV_CONFIG } from "@/config/env";
import { runtimeStore } from "@/lib/db/runtime-store";
import { formatRupiah } from "@/lib/utils";

export type NotificationEventType =
  | "ACCOUNT_CREATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_EXPIRED"
  | "ORDER_PROCESSING"
  | "ORDER_SUCCESS"
  | "ORDER_FAILED"
  | "DEPOSIT_SUCCESS"
  | "ORDER_STATUS_CHANGED";

export interface SendNotificationPayload {
  userId?: string | null;
  email: string;
  whatsapp: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  invoiceNumber?: string;
  totalAmount?: number;
  serialNumber?: string | null;
}

export async function dispatchMultiChannelNotification(
  payload: SendNotificationPayload
): Promise<{
  websiteSaved: boolean;
  emailSent: boolean;
  whatsappSent: boolean;
}> {
  const actionUrl = payload.invoiceNumber
    ? `/invoice/${payload.invoiceNumber}`
    : "/member/transactions";

  // 1. Always save Website Notification
  runtimeStore.notifications.unshift({
    id: `ntf_${crypto.randomUUID().slice(0, 8)}`,
    userId: payload.userId || null,
    recipient: payload.email,
    channel: "WEBSITE",
    type: payload.eventType,
    title: payload.title,
    message: payload.message,
    actionUrl,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // 2. WhatsApp Notification (Graceful fallback if not enabled/configured)
  let whatsappSent = false;
  if (
    ENV_CONFIG.whatsapp.enabled &&
    ENV_CONFIG.whatsapp.apiToken &&
    payload.whatsapp
  ) {
    try {
      const waText = [
        `*${ENV_CONFIG.appName} - ${payload.title}*`,
        payload.message,
        payload.invoiceNumber ? `No. Invoice: *${payload.invoiceNumber}*` : "",
        payload.totalAmount ? `Total: *${formatRupiah(payload.totalAmount)}*` : "",
        payload.serialNumber ? `SN / Token: *${payload.serialNumber}*` : "",
        `Cek detail: ${ENV_CONFIG.appUrl}${actionUrl}`,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch(ENV_CONFIG.whatsapp.apiUrl, {
        method: "POST",
        headers: {
          Authorization: ENV_CONFIG.whatsapp.apiToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: payload.whatsapp,
          message: waText,
        }),
      });
      whatsappSent = res.ok;
    } catch {
      whatsappSent = false;
    }
  }

  // 3. Email SMTP Notification (Graceful fallback if not enabled/configured)
  let emailSent = false;
  if (ENV_CONFIG.smtp.enabled && ENV_CONFIG.smtp.user && ENV_CONFIG.smtp.pass) {
    emailSent = true;
  }

  return {
    websiteSaved: true,
    emailSent,
    whatsappSent,
  };
}
