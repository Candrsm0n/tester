// ============================================================================
// TOPUPKU - CORE ORDER, PRICING, PROMO, PAYMENT & SUPPLIER ORCHESTRATION SERVICE
// Handles:
// - Backend-only price & promo calculation (prevents frontend price tampering)
// - Order creation with idempotency key protection
// - Dynamic QRIS generation via Midtrans
// - Webhook processing with signature verification & idempotency
// - Automatic Digiflazz order dispatch upon verified payment
// - Isolated DEMO payment simulation (blocked in PRODUCTION mode)
// ============================================================================

import crypto from "crypto";
import { getAppMode, isProductionMode } from "@/config/env";
import { runtimeStore } from "@/lib/db/runtime-store";
import {
  createDynamicQrisCharge,
  mapMidtransStatus,
  verifyMidtransStatusFromApi,
  verifyMidtransWebhookSignature,
} from "@/lib/midtrans";
import {
  dispatchOrderToDigiflazz,
  validateGamePlayerId,
} from "@/lib/digiflazz";
import { dispatchMultiChannelNotification } from "@/lib/notifications";
import { computeIdempotencyHash } from "@/lib/security";
import { generateInvoiceNumber } from "@/lib/utils";
import type { CheckoutInput } from "@/validations";
import type { MemberLevel, OrderDTO, RoleType, VoucherDTO } from "@/types";

export interface PriceCalculationBreakdown {
  baseCost: number;
  unitPrice: number;
  subtotalAmount: number;
  discountAmount: number;
  cashbackAmount: number;
  feeAmount: number;
  uniqueCode: number;
  totalAmount: number;
  profitAmount: number;
  appliedVoucher?: VoucherDTO | null;
}

export function evaluateVoucherAndPricing(params: {
  productSlug: string;
  variantId: string;
  voucherCode?: string;
  userRole?: RoleType;
  memberLevel?: MemberLevel;
}): PriceCalculationBreakdown {
  const product = runtimeStore.products.find((p) => p.slug === params.productSlug);
  if (!product || product.status !== "ACTIVE") {
    throw new Error("Produk tidak ditemukan atau sedang tidak aktif.");
  }

  const variant = product.variants.find((v) => v.id === params.variantId);
  if (!variant || variant.status !== "ACTIVE" || variant.stock <= 0) {
    throw new Error("Varian nominal produk sedang kosong atau tidak aktif.");
  }

  // Determine base unit price from server database (never from client payload!)
  let unitPrice = variant.sellingPrice;
  if (
    variant.isFlashSale &&
    variant.flashSalePrice &&
    (variant.flashSaleStock ?? 0) > variant.flashSaleSold
  ) {
    unitPrice = variant.flashSalePrice;
  } else if (params.userRole === "VIP" || params.memberLevel === "DIAMOND" || params.memberLevel === "PLATINUM") {
    unitPrice = variant.vipPrice;
  } else if (params.userRole === "RESELLER" || params.memberLevel === "GOLD") {
    unitPrice = variant.resellerPrice;
  }

  const subtotalAmount = Math.round(unitPrice);
  let discountAmount = 0;
  let cashbackAmount = 0;
  let appliedVoucher: VoucherDTO | null = null;

  if (params.voucherCode) {
    const cleanCode = params.voucherCode.trim().toUpperCase();
    const voucher = runtimeStore.vouchers.find(
      (v) => v.code === cleanCode && v.isActive
    );
    if (!voucher) {
      throw new Error(`Kode promo "${cleanCode}" tidak ditemukan atau tidak aktif.`);
    }

    const now = Date.now();
    if (
      now < new Date(voucher.startsAt).getTime() ||
      now > new Date(voucher.expiresAt).getTime()
    ) {
      throw new Error(`Kode promo "${cleanCode}" sudah kedaluwarsa.`);
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      throw new Error(`Kuota penggunaan kode promo "${cleanCode}" sudah habis.`);
    }

    if (subtotalAmount < voucher.minTransaction) {
      throw new Error(
        `Minimal transaksi untuk kode "${cleanCode}" adalah Rp ${voucher.minTransaction.toLocaleString("id-ID")}.`
      );
    }

    if (voucher.categorySlug && voucher.categorySlug !== product.categorySlug) {
      throw new Error(
        `Kode promo "${cleanCode}" tidak berlaku untuk kategori produk ini.`
      );
    }

    if (voucher.discountType === "PERCENTAGE") {
      const rawDisc = Math.round((subtotalAmount * voucher.discountValue) / 100);
      discountAmount = voucher.maxDiscountAmount
        ? Math.min(rawDisc, voucher.maxDiscountAmount)
        : rawDisc;
    } else if (voucher.discountType === "FIXED_AMOUNT") {
      discountAmount = Math.min(subtotalAmount, Math.round(voucher.discountValue));
    } else if (voucher.discountType === "CASHBACK") {
      const rawCb = Math.round((subtotalAmount * voucher.discountValue) / 100);
      cashbackAmount = voucher.maxDiscountAmount
        ? Math.min(rawCb, voucher.maxDiscountAmount)
        : rawCb;
    }

    appliedVoucher = voucher;
  }

  const uniqueCode = Math.floor(Math.random() * 89) + 10; // 10..98 for dynamic reconciliation
  const feeAmount = 0; // Free QRIS fee promo
  const totalAmount = Math.max(1000, subtotalAmount - discountAmount + feeAmount + uniqueCode);
  const profitAmount = Math.max(0, subtotalAmount - discountAmount - variant.baseCost);

  return {
    baseCost: variant.baseCost,
    unitPrice,
    subtotalAmount,
    discountAmount,
    cashbackAmount,
    feeAmount,
    uniqueCode,
    totalAmount,
    profitAmount,
    appliedVoucher,
  };
}

/**
 * Creates a new top-up order with idempotency protection and Dynamic QRIS generation.
 */
export async function createTopupOrder(
  input: CheckoutInput,
  sessionUser?: {
    id: string;
    role: RoleType;
    memberLevel: MemberLevel;
  } | null
): Promise<{ order: OrderDTO; idempotentReplay: boolean }> {
  const idemKey =
    input.idempotencyKey ||
    computeIdempotencyHash(
      `${input.productSlug}:${input.variantId}:${input.gameUserId}:${input.gameZoneId || ""}:${input.customerWhatsapp}:${Math.floor(Date.now() / 30000)}`
    );

  // Idempotency check: return existing order if key already exists
  const existingInvoice = runtimeStore.idempotencyMap.get(idemKey);
  if (existingInvoice) {
    const existingOrder = runtimeStore.ordersByInvoice.get(existingInvoice);
    if (existingOrder) {
      return { order: existingOrder, idempotentReplay: true };
    }
  }

  const product = runtimeStore.products.find((p) => p.slug === input.productSlug);
  if (!product) {
    throw new Error("Produk game tidak ditemukan.");
  }
  if (product.requiresZoneId && (!input.gameZoneId || input.gameZoneId.trim().length === 0)) {
    throw new Error(`${product.zoneIdLabel || "Zone ID"} wajib diisi untuk ${product.name}.`);
  }

  const variant = product.variants.find((v) => v.id === input.variantId);
  if (!variant) {
    throw new Error("Varian nominal tidak ditemukan.");
  }

  const pricing = evaluateVoucherAndPricing({
    productSlug: input.productSlug,
    variantId: input.variantId,
    voucherCode: input.voucherCode,
    userRole: sessionUser?.role,
    memberLevel: sessionUser?.memberLevel,
  });

  const playerCheck = await validateGamePlayerId({
    productSlug: product.slug,
    gameUserId: input.gameUserId,
    gameZoneId: input.gameZoneId,
  });

  const invoiceNumber = generateInvoiceNumber("TPK");
  const mode = getAppMode();

  // Handle WALLET_BALANCE payment if authenticated member selected it
  if (input.paymentMethod === "WALLET_BALANCE") {
    if (!sessionUser) {
      throw new Error("Silakan login terlebih dahulu untuk membayar menggunakan Saldo Akun.");
    }
    const storedUser = runtimeStore.users.get(sessionUser.id);
    if (!storedUser || storedUser.walletBalance < pricing.totalAmount) {
      throw new Error("Saldo Akun TOPUPKU Anda tidak mencukupi untuk transaksi ini.");
    }
    storedUser.walletBalance -= pricing.totalAmount;
  }

  const qrisCharge = await createDynamicQrisCharge({
    invoiceNumber,
    grossAmount: pricing.totalAmount,
    customerName: input.customerName || "Pelanggan TOPUPKU",
    customerEmail: input.customerEmail,
    customerPhone: input.customerWhatsapp,
    itemName: `${product.name} - ${variant.name}`,
    itemId: variant.sku,
  });

  const nowIso = new Date().toISOString();
  const newOrder: OrderDTO = {
    id: `ord_${crypto.randomUUID().slice(0, 12)}`,
    invoiceNumber,
    idempotencyKey: idemKey,
    executionMode: mode,
    userId: sessionUser?.id || null,
    customerName: input.customerName || "Pelanggan TOPUPKU",
    customerEmail: input.customerEmail,
    customerWhatsapp: input.customerWhatsapp,
    gameUserId: input.gameUserId,
    gameZoneId: input.gameZoneId || null,
    gamePlayerNickname: playerCheck.nickname,
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    variantId: variant.id,
    variantName: variant.name,
    sku: variant.sku,
    supplierSku: variant.supplierSku,
    subtotalAmount: pricing.subtotalAmount,
    discountAmount: pricing.discountAmount,
    feeAmount: pricing.feeAmount,
    uniqueCode: pricing.uniqueCode,
    totalAmount: pricing.totalAmount,
    costAmount: pricing.baseCost,
    profitAmount: pricing.profitAmount,
    cashbackAmount: pricing.cashbackAmount,
    voucherCode: pricing.appliedVoucher?.code || null,
    paymentMethod: input.paymentMethod,
    status: "PENDING_PAYMENT",
    paymentStatus: "PENDING",
    supplierStatus: "PENDING",
    serialNumber: null,
    supplierRefId: null,
    supplierMessage: "Menunggu pembayaran QRIS Dinamis",
    qrisString: qrisCharge.qrisString,
    qrisImageUrl: qrisCharge.qrisImageUrl || null,
    paidAt: null,
    completedAt: null,
    expiredAt: qrisCharge.expiresAt,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  if (pricing.appliedVoucher) {
    pricing.appliedVoucher.usedCount += 1;
  }

  runtimeStore.ordersByInvoice.set(invoiceNumber, newOrder);
  runtimeStore.idempotencyMap.set(idemKey, invoiceNumber);

  // If paid via Wallet Balance, immediately mark settled and dispatch to Digiflazz
  if (input.paymentMethod === "WALLET_BALANCE") {
    await settleOrderAndDispatchSupplier(newOrder, "WALLET_INTERNAL");
  }

  return { order: newOrder, idempotentReplay: false };
}

/**
 * Transitions a verified paid order to SETTLEMENT and automatically dispatches to Digiflazz.
 * Idempotent: if already settled & dispatched, returns existing state without double-sending.
 */
export async function settleOrderAndDispatchSupplier(
  order: OrderDTO,
  verificationSource: "MIDTRANS_WEBHOOK" | "DEMO_SIMULATION" | "WALLET_INTERNAL"
): Promise<{
  order: OrderDTO;
  alreadyProcessed: boolean;
}> {
  if (order.paymentStatus === "SETTLEMENT" && order.status === "SUCCESS") {
    return { order, alreadyProcessed: true };
  }

  const nowIso = new Date().toISOString();
  order.paymentStatus = "SETTLEMENT";
  order.status = "PROCESSING_SUPPLIER";
  order.paidAt = order.paidAt || nowIso;
  order.updatedAt = nowIso;

  await dispatchMultiChannelNotification({
    userId: order.userId,
    email: order.customerEmail,
    whatsapp: order.customerWhatsapp,
    eventType: "PAYMENT_SUCCESS",
    title: "Pembayaran Berhasil Diverifikasi",
    message: `Pembayaran QRIS untuk pesanan ${order.invoiceNumber} (${order.productName} - ${order.variantName}) telah diterima via ${verificationSource}. Pesanan sedang dikirim otomatis ke server game.`,
    invoiceNumber: order.invoiceNumber,
    totalAmount: order.totalAmount,
  });

  // Automatically dispatch to Digiflazz
  const dispatchRes = await dispatchOrderToDigiflazz(order);
  order.supplierRefId = dispatchRes.refId;
  order.supplierStatus = dispatchRes.status;
  order.serialNumber = dispatchRes.serialNumber || null;
  order.supplierMessage = dispatchRes.message;

  if (dispatchRes.status === "SUCCESS") {
    order.status = "SUCCESS";
    order.completedAt = new Date().toISOString();

    // Update product sold counter and user loyalty points/cashback
    const prod = runtimeStore.products.find((p) => p.id === order.productId);
    if (prod) {
      prod.totalSold += 1;
    }

    if (order.userId) {
      const usr = runtimeStore.users.get(order.userId);
      if (usr) {
        const earnedPoints = Math.max(10, Math.floor(order.totalAmount / 1000));
        usr.loyaltyPoints += earnedPoints;
        if (order.cashbackAmount > 0) {
          usr.walletBalance += order.cashbackAmount;
        }
      }
    }

    await dispatchMultiChannelNotification({
      userId: order.userId,
      email: order.customerEmail,
      whatsapp: order.customerWhatsapp,
      eventType: "ORDER_SUCCESS",
      title: "Top Up Berhasil Dikirim!",
      message: `${order.variantName} (${order.productName}) telah berhasil dikirim ke akun ${order.gameUserId}. SN: ${order.serialNumber}`,
      invoiceNumber: order.invoiceNumber,
      totalAmount: order.totalAmount,
      serialNumber: order.serialNumber,
    });
  } else if (dispatchRes.status === "FAILED") {
    order.status = "FAILED";
    await dispatchMultiChannelNotification({
      userId: order.userId,
      email: order.customerEmail,
      whatsapp: order.customerWhatsapp,
      eventType: "ORDER_FAILED",
      title: "Pengiriman Pesanan Mengalami Kendala",
      message: `Pesanan ${order.invoiceNumber} sedang dalam antrean pengecekan ulang otomatis oleh sistem.`,
      invoiceNumber: order.invoiceNumber,
      totalAmount: order.totalAmount,
    });
  }

  order.updatedAt = new Date().toISOString();
  runtimeStore.ordersByInvoice.set(order.invoiceNumber, order);

  return { order, alreadyProcessed: dispatchRes.alreadyDispatched };
}

/**
 * Processes an incoming Midtrans Webhook notification with:
 * 1. SHA-512 Signature Verification
 * 2. Idempotency Guard
 * 3. Gross Amount validation
 * 4. Server-to-Server API Re-Verification
 */
export async function processMidtransWebhook(payload: Record<string, any>): Promise<{
  statusCode: number;
  success: boolean;
  idempotentReplay: boolean;
  message: string;
  order?: OrderDTO;
}> {
  const orderId = String(payload.order_id || "");
  const statusCodeStr = String(payload.status_code || "");
  const grossAmountStr = String(payload.gross_amount || "");
  const signatureKey = String(payload.signature_key || "");
  const transactionStatus = String(payload.transaction_status || "");
  const fraudStatus = String(payload.fraud_status || "accept");

  if (!orderId || !signatureKey) {
    return {
      statusCode: 400,
      success: false,
      idempotentReplay: false,
      message: "Payload webhook tidak lengkap (order_id / signature_key kosong).",
    };
  }

  const isSignatureValid = verifyMidtransWebhookSignature({
    orderId,
    statusCode: statusCodeStr,
    grossAmount: grossAmountStr,
    signatureKey,
  });

  const idempotencyHash = computeIdempotencyHash(
    `MIDTRANS:${orderId}:${transactionStatus}:${statusCodeStr}:${grossAmountStr}`
  );

  runtimeStore.webhookLogs.unshift({
    id: `wh_${crypto.randomUUID().slice(0, 8)}`,
    provider: "MIDTRANS",
    orderId,
    transactionStatus,
    signatureKey: `${signatureKey.slice(0, 10)}...`,
    isSignatureValid,
    isProcessed: isSignatureValid,
    idempotencyHash,
    payload,
    receivedAt: new Date().toISOString(),
  });

  if (!isSignatureValid) {
    return {
      statusCode: 401,
      success: false,
      idempotentReplay: false,
      message: "Signature webhook Midtrans tidak valid (SHA-512 mismatch).",
    };
  }

  if (runtimeStore.webhookIdempotencySet.has(idempotencyHash)) {
    const existingOrder = runtimeStore.ordersByInvoice.get(orderId);
    return {
      statusCode: 200,
      success: true,
      idempotentReplay: true,
      message: "Webhook sudah diproses sebelumnya (Idempotent OK).",
      order: existingOrder,
    };
  }

  const order = runtimeStore.ordersByInvoice.get(orderId);
  if (!order) {
    return {
      statusCode: 404,
      success: false,
      idempotentReplay: false,
      message: `Pesanan dengan nomor invoice ${orderId} tidak ditemukan.`,
    };
  }

  // Verify gross_amount matches order totalAmount to prevent nominal manipulation
  const webhookAmount = Math.round(Number(grossAmountStr));
  if (webhookAmount !== Math.round(order.totalAmount)) {
    return {
      statusCode: 400,
      success: false,
      idempotentReplay: false,
      message: `Nominal pembayaran webhook (${webhookAmount}) tidak sesuai dengan tagihan pesanan (${order.totalAmount}).`,
    };
  }

  runtimeStore.webhookIdempotencySet.add(idempotencyHash);

  const mappedStatus = mapMidtransStatus(transactionStatus, fraudStatus);

  if (mappedStatus === "SETTLEMENT") {
    // Re-verify against Midtrans Status API before dispatching product
    const apiVerification = await verifyMidtransStatusFromApi(
      order.invoiceNumber,
      order.totalAmount
    );
    if (!apiVerification.verified || apiVerification.status !== "SETTLEMENT") {
      return {
        statusCode: 400,
        success: false,
        idempotentReplay: false,
        message: "Verifikasi ulang API Midtrans gagal atau status belum settlement.",
      };
    }

    const settled = await settleOrderAndDispatchSupplier(order, "MIDTRANS_WEBHOOK");
    return {
      statusCode: 200,
      success: true,
      idempotentReplay: settled.alreadyProcessed,
      message: "Pembayaran terverifikasi dan pesanan otomatis dikirim ke Digiflazz.",
      order: settled.order,
    };
  }

  if (mappedStatus === "EXPIRED") {
    order.paymentStatus = "EXPIRED";
    order.status = "EXPIRED";
    order.updatedAt = new Date().toISOString();
    await dispatchMultiChannelNotification({
      userId: order.userId,
      email: order.customerEmail,
      whatsapp: order.customerWhatsapp,
      eventType: "PAYMENT_EXPIRED",
      title: "Waktu Pembayaran QRIS Kedaluwarsa",
      message: `Batas waktu pembayaran untuk pesanan ${order.invoiceNumber} telah berakhir.`,
      invoiceNumber: order.invoiceNumber,
      totalAmount: order.totalAmount,
    });
  } else if (mappedStatus === "FAILED") {
    order.paymentStatus = "FAILED";
    order.status = "FAILED";
    order.updatedAt = new Date().toISOString();
  } else if (mappedStatus === "REFUNDED") {
    order.paymentStatus = "REFUNDED";
    order.status = "REFUNDED";
    order.updatedAt = new Date().toISOString();
  }

  runtimeStore.ordersByInvoice.set(order.invoiceNumber, order);
  return {
    statusCode: 200,
    success: true,
    idempotentReplay: false,
    message: `Status transaksi diperbarui menjadi ${mappedStatus}.`,
    order,
  };
}

/**
 * Simulates a QRIS payment in DEMO mode.
 * STRICT SECURITY RULE: Blocked completely if APP_MODE === "PRODUCTION" or if order.executionMode === "PRODUCTION".
 */
export async function simulateDemoPayment(invoiceNumber: string): Promise<OrderDTO> {
  if (isProductionMode()) {
    throw new Error(
      "FORBIDDEN: Simulasi pembayaran DEMO dinonaktifkan secara permanen pada mode PRODUCTION."
    );
  }

  const order = runtimeStore.ordersByInvoice.get(invoiceNumber);
  if (!order) {
    throw new Error(`Pesanan ${invoiceNumber} tidak ditemukan.`);
  }

  if (order.executionMode === "PRODUCTION") {
    throw new Error(
      "FORBIDDEN: Mode DEMO tidak diizinkan mengubah status transaksi PRODUCTION."
    );
  }

  const result = await settleOrderAndDispatchSupplier(order, "DEMO_SIMULATION");
  return result.order;
}
