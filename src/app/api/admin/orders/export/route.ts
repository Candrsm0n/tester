import { NextRequest, NextResponse } from "next/server";
import { extractCookieValue, isAdminRole, verifySessionToken } from "@/lib/auth/session";
import { OrderRepository } from "@/repositories";

export async function GET(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "csv").toLowerCase();
  const orders = OrderRepository.getAllOrders();

  const headers = [
    "No Invoice",
    "Mode",
    "Waktu Transaksi",
    "Produk",
    "Varian",
    "SKU Supplier",
    "User ID Tujuan",
    "WhatsApp Pelanggan",
    "Harga Modal (IDR)",
    "Total Bayar (IDR)",
    "Keuntungan (IDR)",
    "Status Pembayaran",
    "Status Pesanan",
    "Serial Number (SN)",
  ];

  const rows = orders.map((o) => [
    o.invoiceNumber,
    o.executionMode,
    o.createdAt,
    o.productName,
    o.variantName,
    o.supplierSku,
    `${o.gameUserId}${o.gameZoneId ? ` (${o.gameZoneId})` : ""}`,
    o.customerWhatsapp,
    String(o.costAmount),
    String(o.totalAmount),
    String(o.profitAmount),
    o.paymentStatus,
    o.status,
    o.serialNumber || "-",
  ]);

  const separator = format === "excel" ? "\t" : ",";
  const csvContent = [
    headers.join(separator),
    ...rows.map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(separator)
    ),
  ].join("\n");

  const filename =
    format === "excel"
      ? `TOPUPKU-Laporan-Transaksi-${new Date().toISOString().slice(0, 10)}.xls`
      : `TOPUPKU-Laporan-Transaksi-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type":
        format === "excel"
          ? "application/vnd.ms-excel; charset=utf-8"
          : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
