import { NextRequest, NextResponse } from "next/server";
import { OrderRepository } from "@/repositories";

export async function GET(
  _req: NextRequest,
  context: { params: { invoice: string } }
) {
  const order = OrderRepository.getOrderByInvoice(context.params.invoice);
  if (!order) {
    return NextResponse.json(
      { error: "Transaksi dengan nomor invoice tersebut tidak ditemukan." },
      { status: 404 }
    );
  }
  return NextResponse.json({ order });
}
