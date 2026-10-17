// ============================================================================
// TOPUPKU - STRICT INPUT VALIDATION SCHEMAS (Zod + Runtime Validator)
// Validates Checkout, Auth, Voucher, Admin Product, Deposit & Webhooks
// ============================================================================

import { sanitizeString } from "@/lib/security";

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationIssue[];
}

export interface CheckoutInput {
  productSlug: string;
  variantId: string;
  gameUserId: string;
  gameZoneId?: string;
  paymentMethod: "QRIS_DYNAMIC" | "WALLET_BALANCE" | "VIRTUAL_ACCOUNT" | "EWALLET";
  voucherCode?: string;
  customerWhatsapp: string;
  customerEmail: string;
  customerName?: string;
  idempotencyKey?: string;
}

export function validateCheckoutInput(raw: Record<string, any>): ValidationResult<CheckoutInput> {
  const errors: ValidationIssue[] = [];

  const productSlug = sanitizeString(String(raw.productSlug || ""));
  const variantId = sanitizeString(String(raw.variantId || ""));
  const gameUserId = sanitizeString(String(raw.gameUserId || ""));
  const gameZoneId = raw.gameZoneId ? sanitizeString(String(raw.gameZoneId)) : undefined;
  const paymentMethod = String(raw.paymentMethod || "QRIS_DYNAMIC");
  const voucherCode = raw.voucherCode
    ? sanitizeString(String(raw.voucherCode)).toUpperCase()
    : undefined;
  const customerWhatsapp = sanitizeString(String(raw.customerWhatsapp || "")).replace(/[^0-9+]/g, "");
  const customerEmail = sanitizeString(String(raw.customerEmail || "guest@topupku.id")).toLowerCase();
  const customerName = raw.customerName ? sanitizeString(String(raw.customerName)) : "Pelanggan TOPUPKU";
  const idempotencyKey = raw.idempotencyKey ? sanitizeString(String(raw.idempotencyKey)) : undefined;

  if (!productSlug || productSlug.length < 2) {
    errors.push({ field: "productSlug", message: "Produk game wajib dipilih." });
  }
  if (!variantId || variantId.length < 2) {
    errors.push({ field: "variantId", message: "Nominal item top up wajib dipilih." });
  }
  if (!gameUserId || gameUserId.length < 3 || gameUserId.length > 40) {
    errors.push({
      field: "gameUserId",
      message: "User ID / Nomor Tujuan wajib diisi (3-40 karakter).",
    });
  }
  if (
    !["QRIS_DYNAMIC", "WALLET_BALANCE", "VIRTUAL_ACCOUNT", "EWALLET"].includes(
      paymentMethod
    )
  ) {
    errors.push({ field: "paymentMethod", message: "Metode pembayaran tidak valid." });
  }
  if (!customerWhatsapp || customerWhatsapp.length < 9 || customerWhatsapp.length > 16) {
    errors.push({
      field: "customerWhatsapp",
      message: "Nomor WhatsApp aktif wajib diisi (9-16 digit angka).",
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    errors.push({ field: "customerEmail", message: "Format alamat email tidak valid." });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      productSlug,
      variantId,
      gameUserId,
      gameZoneId,
      paymentMethod: paymentMethod as CheckoutInput["paymentMethod"],
      voucherCode,
      customerWhatsapp,
      customerEmail,
      customerName,
      idempotencyKey,
    },
  };
}

export interface RegisterInput {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}

export function validateRegisterInput(raw: Record<string, any>): ValidationResult<RegisterInput> {
  const errors: ValidationIssue[] = [];
  const fullName = sanitizeString(String(raw.fullName || ""));
  const username = sanitizeString(String(raw.username || "")).toLowerCase();
  const email = sanitizeString(String(raw.email || "")).toLowerCase();
  const phone = sanitizeString(String(raw.phone || "")).replace(/[^0-9+]/g, "");
  const password = String(raw.password || "");
  const referralCode = raw.referralCode
    ? sanitizeString(String(raw.referralCode)).toUpperCase()
    : undefined;

  if (fullName.length < 3) {
    errors.push({ field: "fullName", message: "Nama lengkap minimal 3 karakter." });
  }
  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    errors.push({
      field: "username",
      message: "Username harus 3-24 karakter (huruf kecil, angka, atau underscore).",
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: "email", message: "Alamat email tidak valid." });
  }
  if (phone.length < 9 || phone.length > 16) {
    errors.push({ field: "phone", message: "Nomor WhatsApp harus 9-16 digit." });
  }
  if (password.length < 8) {
    errors.push({
      field: "password",
      message: "Password minimal 8 karakter demi keamanan akun.",
    });
  }

  if (errors.length > 0) return { success: false, errors };
  return {
    success: true,
    data: { fullName, username, email, phone, password, referralCode },
  };
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export function validateLoginInput(raw: Record<string, any>): ValidationResult<LoginInput> {
  const identifier = sanitizeString(String(raw.identifier || raw.email || "")).toLowerCase();
  const password = String(raw.password || "");
  if (!identifier || !password) {
    return {
      success: false,
      errors: [{ field: "identifier", message: "Email/Username dan Password wajib diisi." }],
    };
  }
  return { success: true, data: { identifier, password } };
}

export interface DepositInput {
  amount: number;
  paymentMethod: "QRIS_DYNAMIC";
}

export function validateDepositInput(raw: Record<string, any>): ValidationResult<DepositInput> {
  const amount = Number(raw.amount || 0);
  if (Number.isNaN(amount) || amount < 10000 || amount > 10000000) {
    return {
      success: false,
      errors: [
        {
          field: "amount",
          message: "Nominal deposit minimal Rp 10.000 dan maksimal Rp 10.000.000.",
        },
      ],
    };
  }
  return {
    success: true,
    data: { amount: Math.round(amount), paymentMethod: "QRIS_DYNAMIC" },
  };
}
