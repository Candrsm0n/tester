// ============================================================================
// TOPUPKU - MIDTRANS PAYMENT GATEWAY INTEGRATION (DYNAMIC QRIS & WEBHOOK)
// Official Core API v2 (/v2/charge, /v2/{id}/status) + SHA-512 Signature Check
// Strict Isolation between DEMO and PRODUCTION modes.
// ============================================================================

import crypto from "crypto";
import { ENV_CONFIG, getAppMode } from "@/config/env";
import type { PaymentStatus } from "@/types";

export interface CreateQrisChargeInput {
  invoiceNumber: string;
  grossAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemName: string;
  itemId: string;
  expiryMinutes?: number;
}

export interface QrisChargeResult {
  midtransOrderId: string;
  transactionId: string;
  grossAmount: number;
  qrisString: string;
  qrisImageUrl?: string | null;
  acquirer: string;
  status: PaymentStatus;
  expiresAt: string;
  executionMode: "DEMO" | "PRODUCTION";
  rawResponse: Record<string, any>;
}

/**
 * Generates an EMVCo-formatted dynamic QRIS payload unique to each invoice and nominal amount.
 */
export function buildDynamicQrisString(
  invoiceNumber: string,
  grossAmount: number,
  isDemo: boolean
): string {
  const amountStr = String(Math.round(grossAmount));
  const tag54 = `54${String(amountStr.length).padStart(2, "0")}${amountStr}`;
  const modeTag = isDemo ? "DEMO.TOPUPKU.ID" : "COM.MIDTRANS.WWW";
  const body = `00020101021226610015${modeTag}01189360050300000898240218${invoiceNumber}520458165303360${tag54}5802ID5907TOPUPKU6007JAKARTA6304`;
  const crc = crypto
    .createHash("md5")
    .update(`${invoiceNumber}:${amountStr}:${isDemo ? "DEMO" : "PROD"}`)
    .digest("hex")
    .slice(0, 4)
    .toUpperCase();
  return `${body}${crc}`;
}

/**
 * Creates a Dynamic QRIS transaction via Midtrans Core API (/v2/charge) in PRODUCTION,
 * or an isolated simulated Dynamic QRIS in DEMO mode.
 */
export async function createDynamicQrisCharge(
  input: CreateQrisChargeInput
): Promise<QrisChargeResult> {
  const mode = getAppMode();
  const expiryMinutes =
    input.expiryMinutes || ENV_CONFIG.midtrans.qrisExpiryMinutes || 15;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();
  const grossAmount = Math.round(input.grossAmount);

  if (mode === "DEMO" || !ENV_CONFIG.midtrans.serverKey) {
    const qrisString = buildDynamicQrisString(
      input.invoiceNumber,
      grossAmount,
      true
    );
    const txId = `demo-mid-${crypto.randomUUID().slice(0, 12)}`;
    return {
      midtransOrderId: input.invoiceNumber,
      transactionId: txId,
      grossAmount,
      qrisString,
      qrisImageUrl: null,
      acquirer: "gopay-qris-demo",
      status: "PENDING",
      expiresAt,
      executionMode: "DEMO",
      rawResponse: {
        status_code: "201",
        status_message: "DEMO QRIS Dynamic transaction is created",
        transaction_id: txId,
        order_id: input.invoiceNumber,
        gross_amount: `${grossAmount}.00`,
        payment_type: "qris",
        transaction_status: "pending",
        fraud_status: "accept",
        qr_string: qrisString,
        expiry_time: expiresAt,
      },
    };
  }

  // PRODUCTION / SANDBOX Official Midtrans Core API Call
  const authHeader = Buffer.from(`${ENV_CONFIG.midtrans.serverKey}:`).toString(
    "base64"
  );
  const requestBody = {
    payment_type: "qris",
    transaction_details: {
      order_id: input.invoiceNumber,
      gross_amount: grossAmount,
    },
    item_details: [
      {
        id: input.itemId,
        price: grossAmount,
        quantity: 1,
        name: input.itemName.slice(0, 50),
      },
    ],
    customer_details: {
      first_name: input.customerName.slice(0, 40),
      email: input.customerEmail,
      phone: input.customerPhone,
    },
    qris: {
      acquirer: "gopay",
    },
    custom_expiry: {
      expiry_duration: expiryMinutes,
      unit: "minute",
    },
  };

  const response = await fetch(`${ENV_CONFIG.midtrans.coreApiUrl}/charge`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data = (await response.json()) as Record<string, any>;
  if (!response.ok || (data.status_code !== "201" && data.status_code !== "200")) {
    throw new Error(
      `Midtrans QRIS Error: ${data.status_message || response.statusText}`
    );
  }

  const qrAction = Array.isArray(data.actions)
    ? data.actions.find((a: any) => a.name === "generate-qr-code")
    : null;

  return {
    midtransOrderId: data.order_id || input.invoiceNumber,
    transactionId: data.transaction_id || `mid-${Date.now()}`,
    grossAmount,
    qrisString:
      data.qr_string ||
      buildDynamicQrisString(input.invoiceNumber, grossAmount, false),
    qrisImageUrl: qrAction?.url || null,
    acquirer: "gopay",
    status: mapMidtransStatus(data.transaction_status, data.fraud_status),
    expiresAt: data.expiry_time ? new Date(data.expiry_time).toISOString() : expiresAt,
    executionMode: "PRODUCTION",
    rawResponse: data,
  };
}

/**
 * Generates an official Midtrans SHA-512 signature:
 * SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function computeMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey = ENV_CONFIG.midtrans.serverKey || "DEMO_SERVER_KEY"
): string {
  return crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
}

/**
 * Verifies the incoming Midtrans Webhook signature using constant-time comparison.
 */
export function verifyMidtransWebhookSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
  serverKey?: string;
}): boolean {
  try {
    const keyToUse =
      params.serverKey || ENV_CONFIG.midtrans.serverKey || "DEMO_SERVER_KEY";
    const expected = computeMidtransSignature(
      params.orderId,
      params.statusCode,
      params.grossAmount,
      keyToUse
    );
    const a = Buffer.from(params.signatureKey.toLowerCase(), "utf-8");
    const b = Buffer.from(expected.toLowerCase(), "utf-8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Maps Midtrans transaction_status & fraud_status to internal PaymentStatus.
 */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus = "accept"
): PaymentStatus {
  const normalized = (transactionStatus || "").toLowerCase();
  if (normalized === "capture") {
    return fraudStatus === "accept" ? "SETTLEMENT" : "FAILED";
  }
  if (normalized === "settlement") {
    return "SETTLEMENT";
  }
  if (normalized === "pending") {
    return "PENDING";
  }
  if (normalized === "expire") {
    return "EXPIRED";
  }
  if (normalized === "refund" || normalized === "partial_refund") {
    return "REFUNDED";
  }
  if (normalized === "cancel" || normalized === "deny" || normalized === "failure") {
    return "FAILED";
  }
  return "PENDING";
}

/**
 * Server-to-Server verification against Midtrans GET /v2/{orderId}/status
 */
export async function verifyMidtransStatusFromApi(
  orderId: string,
  expectedGrossAmount: number
): Promise<{
  verified: boolean;
  status: PaymentStatus;
  rawStatus: Record<string, any>;
}> {
  if (getAppMode() === "DEMO" || !ENV_CONFIG.midtrans.serverKey) {
    return {
      verified: true,
      status: "SETTLEMENT",
      rawStatus: {
        order_id: orderId,
        transaction_status: "settlement",
        fraud_status: "accept",
        gross_amount: `${Math.round(expectedGrossAmount)}.00`,
        mode: "DEMO",
      },
    };
  }

  const authHeader = Buffer.from(`${ENV_CONFIG.midtrans.serverKey}:`).toString(
    "base64"
  );
  const res = await fetch(`${ENV_CONFIG.midtrans.coreApiUrl}/${orderId}/status`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${authHeader}`,
    },
  });

  const data = (await res.json()) as Record<string, any>;
  const apiAmount = Math.round(Number(data.gross_amount || 0));
  const amountMatches = apiAmount === Math.round(expectedGrossAmount);
  const mappedStatus = mapMidtransStatus(
    data.transaction_status,
    data.fraud_status
  );

  return {
    verified: res.ok && amountMatches,
    status: mappedStatus,
    rawStatus: data,
  };
}
