import { NextRequest, NextResponse } from "next/server";
import { OrderRepository } from "@/repositories";
import { formatJakartaDateTime, formatRupiah } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  context: { params: { invoice: string } }
) {
  const order = OrderRepository.getOrderByInvoice(context.params.invoice);
  if (!order) {
    return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  }

  const htmlInvoice = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${order.invoiceNumber} - TOPUPKU</title>
  <style>
    body { font-family: Arial, sans-serif; background: #0A0F24; color: #F8FAFC; padding: 32px; }
    .card { max-width: 680px; margin: 0 auto; background: #111936; border: 1px solid #334155; border-radius: 16px; padding: 32px; }
    .header { display: flex; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px; }
    .badge { padding: 6px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; background: #10B981; color: #052E16; }
    .row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 14px; }
    .total { font-size: 20px; font-weight: bold; color: #00E5FF; border-top: 1px solid #334155; padding-top: 14px; margin-top: 16px; }
    .sn-box { background: #1E293B; border: 1px dashed #8B5CF6; padding: 14px; border-radius: 10px; margin-top: 20px; font-family: monospace; }
    @media print { body { background: #FFFFFF; color: #0F172A; } .card { background: #FFFFFF; border-color: #CBD5E1; } }
  </style>
</head>
<body onload="window.print()">
  <div class="card">
    <div class="header">
      <div>
        <h1 style="margin:0;color:#8B5CF6;">TOPUPKU OFFICIAL INVOICE</h1>
        <p style="margin:4px 0 0;color:#94A3B8;font-size:13px;">No. Invoice: ${order.invoiceNumber}</p>
      </div>
      <div><span class="badge">${order.status}</span></div>
    </div>
    <div class="row"><span>Waktu Transaksi</span><strong>${formatJakartaDateTime(order.createdAt)}</strong></div>
    <div class="row"><span>Produk Game</span><strong>${order.productName}</strong></div>
    <div class="row"><span>Item Denom</span><strong>${order.variantName} (${order.sku})</strong></div>
    <div class="row"><span>Tujuan / User ID</span><strong>${order.gameUserId} ${order.gameZoneId ? `(${order.gameZoneId})` : ""}</strong></div>
    <div class="row"><span>Nickname Terverifikasi</span><strong>${order.gamePlayerNickname || "-"}</strong></div>
    <div class="row"><span>Metode Pembayaran</span><strong>${order.paymentMethod}</strong></div>
    <div class="row"><span>Harga Produk</span><span>${formatRupiah(order.subtotalAmount)}</span></div>
    <div class="row"><span>Diskon Voucher</span><span>- ${formatRupiah(order.discountAmount)}</span></div>
    <div class="row"><span>Kode Unik QRIS</span><span>+ ${formatRupiah(order.uniqueCode)}</span></div>
    <div class="row total"><span>Total Pembayaran</span><span>${formatRupiah(order.totalAmount)}</span></div>
    <div class="sn-box">
      <strong>Serial Number (SN) / Bukti Pengiriman Resmi:</strong><br/>
      ${order.serialNumber || "Menunggu Konfirmasi Penyelesaian Pembayaran"}
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(htmlInvoice, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
