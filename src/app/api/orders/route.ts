import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security";
import { extractCookieValue, verifySessionToken } from "@/lib/auth/session";
import { validateCheckoutInput } from "@/validations";
import { createTopupOrder } from "@/services/order-service";
import { OrderRepository } from "@/repositories";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invoice = searchParams.get("invoice");
  if (invoice) {
    const order = OrderRepository.getOrderByInvoice(invoice);
    if (!order) {
      return NextResponse.json(
        { error: "Nomor Invoice tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({ order });
  }

  const orders = OrderRepository.getAllOrders({
    status: searchParams.get("status") || undefined,
    search: searchParams.get("q") || undefined,
  });

  return NextResponse.json({ orders: orders.slice(0, 50) });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const rl = checkRateLimit(`checkout:${ip}`, 20, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan checkout. Silakan tunggu sebentar." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const validation = validateCheckoutInput(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        {
          error:
            validation.errors?.[0]?.message ||
            "Mohon lengkapi data pesanan dengan benar.",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const token = extractCookieValue(req.headers.get("cookie"));
    const session = verifySessionToken(token);

    const { order, idempotentReplay } = await createTopupOrder(
      validation.data,
      session?.user || null
    );

    return NextResponse.json(
      {
        success: true,
        idempotentReplay,
        order,
      },
      { status: idempotentReplay ? 200 : 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Gagal membuat pesanan top up." },
      { status: 400 }
    );
  }
}
