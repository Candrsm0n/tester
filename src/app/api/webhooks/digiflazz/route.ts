import { NextRequest, NextResponse } from "next/server";
import { verifyDigiflazzWebhookSignature } from "@/lib/digiflazz";
import { runtimeStore } from "@/lib/db/runtime-store";
import { getAppMode } from "@/config/env";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature") || "";

  if (
    getAppMode() === "PRODUCTION" &&
    !verifyDigiflazzWebhookSignature(rawBody, signature)
  ) {
    return NextResponse.json(
      { error: "Signature webhook Digiflazz tidak valid." },
      { status: 401 }
    );
  }

  const parsed = JSON.parse(rawBody || "{}") as Record<string, any>;
  const data = parsed.data || {};
  const refId = String(data.ref_id || "");
  const invoiceNumber = refId.replace(/^DGF-/, "");
  const order = runtimeStore.ordersByInvoice.get(invoiceNumber);

  if (!order) {
    return NextResponse.json(
      { error: "Ref ID transaksi tidak ditemukan." },
      { status: 404 }
    );
  }

  const statusStr = String(data.status || "").toLowerCase();
  if (statusStr === "sukses") {
    order.supplierStatus = "SUCCESS";
    order.status = "SUCCESS";
    order.serialNumber = data.sn || order.serialNumber;
    order.supplierMessage = data.message || "Sukses";
    order.completedAt = new Date().toISOString();
  } else if (statusStr === "gagal") {
    order.supplierStatus = "FAILED";
    order.status = "FAILED";
    order.supplierMessage = data.message || "Transaksi gagal di supplier";
  }

  order.updatedAt = new Date().toISOString();
  runtimeStore.ordersByInvoice.set(order.invoiceNumber, order);

  return NextResponse.json({
    success: true,
    invoiceNumber: order.invoiceNumber,
    supplierStatus: order.supplierStatus,
  });
}
