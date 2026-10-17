import { NextRequest, NextResponse } from "next/server";
import { processMidtransWebhook } from "@/services/order-service";

export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => ({}))) as Record<string, any>;
  const result = await processMidtransWebhook(payload);
  return NextResponse.json(
    {
      success: result.success,
      idempotentReplay: result.idempotentReplay,
      message: result.message,
      invoiceNumber: result.order?.invoiceNumber,
      status: result.order?.status,
    },
    { status: result.statusCode }
  );
}
