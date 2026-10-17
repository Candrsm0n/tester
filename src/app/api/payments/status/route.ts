import { NextRequest, NextResponse } from "next/server";
import { OrderRepository } from "@/repositories";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invoice = searchParams.get("invoice") || "";
  const order = OrderRepository.getOrderByInvoice(invoice);
  if (!order) {
    return NextResponse.json(
      { error: "Invoice tidak ditemukan" },
      { status: 404 }
    );
  }

  // Auto-expire if past expiredAt and still pending
  if (
    order.paymentStatus === "PENDING" &&
    new Date(order.expiredAt).getTime() < Date.now()
  ) {
    order.paymentStatus = "EXPIRED";
    order.status = "EXPIRED";
    order.updatedAt = new Date().toISOString();
  }

  return NextResponse.json({
    invoiceNumber: order.invoiceNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    supplierStatus: order.supplierStatus,
    serialNumber: order.serialNumber,
    paidAt: order.paidAt,
    completedAt: order.completedAt,
    expiredAt: order.expiredAt,
    executionMode: order.executionMode,
  });
}
