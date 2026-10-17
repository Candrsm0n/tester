// ============================================================================
// TOPUPKU - INTEGRATION TEST SUITE (tests/integration.test.ts)
// Tests End-to-End Checkout, Order Idempotency, Midtrans Webhook Verification,
// Payment Idempotency, Digiflazz Auto-Dispatch Lock, and DEMO/PROD Isolation
// ============================================================================

import assert from "assert";
import {
  createTopupOrder,
  processMidtransWebhook,
  simulateDemoPayment,
} from "../src/services/order-service";
import { computeMidtransSignature } from "../src/lib/midtrans";
import { dispatchOrderToDigiflazz, syncDigiflazzPricelist } from "../src/lib/digiflazz";
import { OrderRepository } from "../src/repositories";

export async function runIntegrationTests(): Promise<{
  passed: number;
  details: string[];
}> {
  const details: string[] = [];
  let passed = 0;

  // Integration Test 1: End-to-End Checkout & Order Idempotency
  const idemKey = `test_idem_${Date.now()}`;
  const firstOrderRes = await createTopupOrder({
    productSlug: "mobile-legends",
    variantId: "var_ml_86",
    gameUserId: "123456789",
    gameZoneId: "2456",
    paymentMethod: "QRIS_DYNAMIC",
    voucherCode: "TOPUPKU10",
    customerWhatsapp: "081234567890",
    customerEmail: "tester@topupku.id",
    customerName: "Integration Tester",
    idempotencyKey: idemKey,
  });

  assert.strictEqual(firstOrderRes.idempotentReplay, false);
  assert.strictEqual(firstOrderRes.order.status, "PENDING_PAYMENT");
  assert.strictEqual(firstOrderRes.order.paymentStatus, "PENDING");
  assert.ok(firstOrderRes.order.qrisString.includes(firstOrderRes.order.invoiceNumber));

  // Replay with exact same idempotencyKey -> must return identical order without creating duplicate
  const replayOrderRes = await createTopupOrder({
    productSlug: "mobile-legends",
    variantId: "var_ml_86",
    gameUserId: "123456789",
    gameZoneId: "2456",
    paymentMethod: "QRIS_DYNAMIC",
    voucherCode: "TOPUPKU10",
    customerWhatsapp: "081234567890",
    customerEmail: "tester@topupku.id",
    customerName: "Integration Tester",
    idempotencyKey: idemKey,
  });

  assert.strictEqual(replayOrderRes.idempotentReplay, true);
  assert.strictEqual(
    replayOrderRes.order.invoiceNumber,
    firstOrderRes.order.invoiceNumber,
    "Idempotent replay must return the exact same invoiceNumber"
  );
  passed++;
  details.push(
    "PASS [Integration 1]: Checkout flow creates Dynamic QRIS & enforces order idempotency"
  );

  // Integration Test 2: Supplier Security Guard (Unpaid Order Cannot Be Dispatched)
  let guardTriggered = false;
  try {
    await dispatchOrderToDigiflazz(firstOrderRes.order);
  } catch (err: any) {
    if (String(err.message).includes("SECURITY VIOLATION")) {
      guardTriggered = true;
    }
  }
  assert.strictEqual(
    guardTriggered,
    true,
    "Unpaid order must be blocked from Digiflazz dispatch"
  );
  passed++;
  details.push(
    "PASS [Integration 2]: Supplier guard blocks Digiflazz dispatch before payment settlement"
  );

  // Integration Test 3: Midtrans Webhook Rejects Forged Signature & Nominal Manipulation
  const forgedWebhook = await processMidtransWebhook({
    order_id: firstOrderRes.order.invoiceNumber,
    status_code: "200",
    gross_amount: `${firstOrderRes.order.totalAmount}.00`,
    signature_key: "invalid_sha512_signature",
    transaction_status: "settlement",
    fraud_status: "accept",
  });
  assert.strictEqual(forgedWebhook.statusCode, 401);
  assert.strictEqual(forgedWebhook.success, false);

  const tamperedAmountSig = computeMidtransSignature(
    firstOrderRes.order.invoiceNumber,
    "200",
    "1000.00" // wrong amount!
  );
  const tamperedWebhook = await processMidtransWebhook({
    order_id: firstOrderRes.order.invoiceNumber,
    status_code: "200",
    gross_amount: "1000.00",
    signature_key: tamperedAmountSig,
    transaction_status: "settlement",
    fraud_status: "accept",
  });
  assert.strictEqual(tamperedWebhook.statusCode, 400);
  assert.strictEqual(tamperedWebhook.success, false);
  passed++;
  details.push(
    "PASS [Integration 3]: Webhook rejects forged SHA-512 signatures (401) & tampered amounts (400)"
  );

  // Integration Test 4: Valid Midtrans Webhook Settles Payment & Auto-Dispatches to Digiflazz
  const grossStr = `${firstOrderRes.order.totalAmount}.00`;
  const validSig = computeMidtransSignature(
    firstOrderRes.order.invoiceNumber,
    "200",
    grossStr
  );
  const validWebhook = await processMidtransWebhook({
    order_id: firstOrderRes.order.invoiceNumber,
    status_code: "200",
    gross_amount: grossStr,
    signature_key: validSig,
    transaction_status: "settlement",
    fraud_status: "accept",
  });

  assert.strictEqual(validWebhook.statusCode, 200);
  assert.strictEqual(validWebhook.success, true);
  assert.strictEqual(validWebhook.order?.paymentStatus, "SETTLEMENT");
  assert.strictEqual(validWebhook.order?.supplierStatus, "SUCCESS");
  assert.strictEqual(validWebhook.order?.status, "SUCCESS");
  assert.ok(
    validWebhook.order?.serialNumber && validWebhook.order.serialNumber.length > 5,
    "Serial Number (SN) must be populated after Digiflazz dispatch"
  );
  passed++;
  details.push(
    "PASS [Integration 4]: Valid Midtrans webhook verifies status & auto-dispatches to Digiflazz"
  );

  // Integration Test 5: Webhook Idempotency & Anti Double-Dispatch Lock
  const firstSn = validWebhook.order?.serialNumber;
  const duplicateWebhook = await processMidtransWebhook({
    order_id: firstOrderRes.order.invoiceNumber,
    status_code: "200",
    gross_amount: grossStr,
    signature_key: validSig,
    transaction_status: "settlement",
    fraud_status: "accept",
  });
  assert.strictEqual(duplicateWebhook.statusCode, 200);
  assert.strictEqual(duplicateWebhook.idempotentReplay, true);
  assert.strictEqual(duplicateWebhook.order?.serialNumber, firstSn);

  const directDispatchRetry = await dispatchOrderToDigiflazz(validWebhook.order!);
  assert.strictEqual(
    directDispatchRetry.alreadyDispatched,
    true,
    "supplierDispatchLock must prevent sending order to Digiflazz twice"
  );
  passed++;
  details.push(
    "PASS [Integration 5]: Webhook idempotency & supplierDispatchLock prevent double dispatch"
  );

  // Integration Test 6: DEMO vs PRODUCTION Mode Isolation
  const prevMode = process.env.APP_MODE;
  process.env.APP_MODE = "PRODUCTION";
  let prodBlockedDemoSim = false;
  try {
    await simulateDemoPayment(firstOrderRes.order.invoiceNumber);
  } catch (err: any) {
    if (String(err.message).includes("FORBIDDEN")) {
      prodBlockedDemoSim = true;
    }
  } finally {
    process.env.APP_MODE = prevMode || "DEMO";
  }
  assert.strictEqual(
    prodBlockedDemoSim,
    true,
    "PRODUCTION mode must forbid DEMO payment simulations"
  );
  passed++;
  details.push(
    "PASS [Integration 6]: PRODUCTION mode strictly blocks DEMO payment simulation"
  );

  // Integration Test 7: Admin Stats & Digiflazz Pricelist Sync
  const syncRes = await syncDigiflazzPricelist(9);
  assert.ok(syncRes.syncedSkus >= 30, "Must sync all catalog SKUs");
  const adminStats = OrderRepository.getAdminDashboardStats();
  assert.ok(adminStats.totalRevenue > 0);
  assert.ok(adminStats.bestSellers.length === 5);
  passed++;
  details.push(
    "PASS [Integration 7]: Digiflazz SKU sync & Admin financial analytics verified"
  );

  return { passed, details };
}
