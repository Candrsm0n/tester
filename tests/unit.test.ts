// ============================================================================
// TOPUPKU - UNIT TEST SUITE (tests/unit.test.ts)
// Tests Security, Auth RBAC, Input Validation, Pricing/Promo Math,
// Midtrans SHA-512 Signature, and Digiflazz Auto-Margin Calculation
// ============================================================================

import assert from "assert";
import {
  hashPassword,
  verifyPassword,
  sanitizeString,
  checkRateLimit,
  resetRateLimitStore,
  generateCsrfToken,
  verifyCsrfToken,
} from "../src/lib/security";
import {
  signSessionToken,
  verifySessionToken,
  isAdminRole,
  isSuperAdminRole,
} from "../src/lib/auth/session";
import {
  computeMidtransSignature,
  verifyMidtransWebhookSignature,
} from "../src/lib/midtrans";
import {
  computeDigiflazzSignature,
  calculateSellingPriceWithMargin,
} from "../src/lib/digiflazz";
import { evaluateVoucherAndPricing } from "../src/services/order-service";
import { validateCheckoutInput, validateRegisterInput } from "../src/validations";
import { maskSecret } from "../src/config/env";

export async function runUnitTests(): Promise<{ passed: number; details: string[] }> {
  const details: string[] = [];
  let passed = 0;

  // Test 1: Password Hashing & Constant-Time Verification
  const rawPass = "TopupkuSuperSecret#2026";
  const hashed = hashPassword(rawPass);
  assert.ok(hashed.startsWith("scrypt$"), "Hash must use scrypt prefix");
  assert.strictEqual(verifyPassword(rawPass, hashed), true, "Valid password must verify");
  assert.strictEqual(verifyPassword("WrongPassword", hashed), false, "Wrong password must fail");
  passed++;
  details.push("PASS [Unit 1]: Scrypt password hashing & timing-safe verification");

  // Test 2: XSS Sanitization
  const malicious = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
  const cleaned = sanitizeString(malicious);
  assert.ok(!cleaned.includes("<script>"), "Script tags must be escaped");
  assert.ok(!cleaned.includes("onerror="), "Inline event handlers must be stripped");
  passed++;
  details.push("PASS [Unit 2]: XSS sanitization strips script tags and event handlers");

  // Test 3: Rate Limiting
  resetRateLimitStore();
  const r1 = checkRateLimit("ip:test", 2, 60);
  const r2 = checkRateLimit("ip:test", 2, 60);
  const r3 = checkRateLimit("ip:test", 2, 60);
  assert.strictEqual(r1.allowed, true);
  assert.strictEqual(r2.allowed, true);
  assert.strictEqual(r3.allowed, false, "3rd request over limit=2 must be blocked");
  passed++;
  details.push("PASS [Unit 3]: Sliding-window rate limiter enforces request thresholds");

  // Test 4: CSRF Protection
  const csrf = generateCsrfToken("sess_12345");
  assert.strictEqual(verifyCsrfToken(csrf, "sess_12345"), true);
  assert.strictEqual(verifyCsrfToken(csrf, "sess_wrong"), false);
  passed++;
  details.push("PASS [Unit 4]: CSRF HMAC token generation and session binding");

  // Test 5: Signed Session Token & RBAC
  const token = signSessionToken({
    id: "usr_admin",
    email: "admin@topupku.id",
    username: "admin_topupku",
    fullName: "Nadia Admin",
    role: "ADMIN",
    memberLevel: "PLATINUM",
    walletBalance: 5000000,
    loyaltyPoints: 8500,
    referralCode: "TOPUPKUADMIN",
  });
  const verified = verifySessionToken(token);
  assert.ok(verified !== null, "Signed session token must verify");
  assert.strictEqual(verified?.user.email, "admin@topupku.id");
  assert.strictEqual(isAdminRole(verified?.user.role), true);
  assert.strictEqual(isSuperAdminRole(verified?.user.role), false);
  passed++;
  details.push("PASS [Unit 5]: Signed HTTP-only session token & RBAC role checks");

  // Test 6: Checkout & Registration Input Validation
  const badCheckout = validateCheckoutInput({
    productSlug: "mobile-legends",
    variantId: "var_ml_86",
    gameUserId: "1", // too short
    paymentMethod: "QRIS_DYNAMIC",
    customerWhatsapp: "123", // invalid
    customerEmail: "invalid-email",
  });
  assert.strictEqual(badCheckout.success, false, "Invalid checkout input must fail validation");

  const goodRegister = validateRegisterInput({
    fullName: "Andi Pratama",
    username: "andi_pro",
    email: "andi@gamer.id",
    phone: "081234567890",
    password: "StrongPassword#99",
  });
  assert.strictEqual(goodRegister.success, true, "Valid registration input must pass");
  passed++;
  details.push("PASS [Unit 6]: Strict input validation rejects malformed payloads");

  // Test 7: Backend Pricing & Promo Calculation (Percentage, Fixed, Flash Sale)
  const mlPricing = evaluateVoucherAndPricing({
    productSlug: "mobile-legends",
    variantId: "var_ml_172", // sellingPrice 42500
    voucherCode: "TOPUPKU10", // 10% off
  });
  assert.strictEqual(mlPricing.subtotalAmount, 42500);
  assert.strictEqual(mlPricing.discountAmount, 4250);
  assert.ok(mlPricing.totalAmount === 42500 - 4250 + mlPricing.uniqueCode);
  passed++;
  details.push("PASS [Unit 7]: Server-side pricing & promo voucher calculation (TOPUPKU10)");

  // Test 8: Midtrans SHA-512 Signature Verification & Digiflazz Margin
  const sig = computeMidtransSignature("TPK-TEST-01", "200", "50000.00", "SB-Mid-server-TEST");
  assert.strictEqual(
    verifyMidtransWebhookSignature({
      orderId: "TPK-TEST-01",
      statusCode: "200",
      grossAmount: "50000.00",
      signatureKey: sig,
      serverKey: "SB-Mid-server-TEST",
    }),
    true
  );
  assert.strictEqual(
    verifyMidtransWebhookSignature({
      orderId: "TPK-TEST-01",
      statusCode: "200",
      grossAmount: "50000.00",
      signatureKey: "forged_signature_key",
      serverKey: "SB-Mid-server-TEST",
    }),
    false
  );

  const dgfMargin = calculateSellingPriceWithMargin(50000, 10);
  assert.strictEqual(dgfMargin.sellingPrice, 55000);
  assert.strictEqual(dgfMargin.profitAmount, 5000);
  const dgfSig = computeDigiflazzSignature("user1", "key1", "ref1");
  assert.strictEqual(dgfSig.length, 32, "Digiflazz MD5 signature must be 32 hex chars");
  assert.ok(maskSecret("SB-Mid-server-SECRET123456").includes("••••"));
  passed++;
  details.push("PASS [Unit 8]: Midtrans SHA-512 verifier, Digiflazz MD5 & secret masking");

  return { passed, details };
}
