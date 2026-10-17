import { NextRequest, NextResponse } from "next/server";
import { simulateDemoPayment } from "@/services/order-service";
import { sanitizeString } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const invoiceNumber = sanitizeString(String(body.invoiceNumber || "")).toUpperCase();
    if (!invoiceNumber) {
      return NextResponse.json(
        { error: "Nomor invoice wajib disertakan." },
        { status: 400 }
      );
    }

    const updatedOrder = await simulateDemoPayment(invoiceNumber);
    return NextResponse.json({
      success: true,
      message:
        "[DEMO MODE] Pembayaran QRIS berhasil disimulasikan dan pesanan telah dikirim otomatis ke Digiflazz!",
      order: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Gagal menjalankan simulasi pembayaran demo." },
      { status: 403 }
    );
  }
}
