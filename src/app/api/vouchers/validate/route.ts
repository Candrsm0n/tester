import { NextRequest, NextResponse } from "next/server";
import { evaluateVoucherAndPricing } from "@/services/order-service";
import { extractCookieValue, verifySessionToken } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const token = extractCookieValue(req.headers.get("cookie"));
    const session = verifySessionToken(token);

    const breakdown = evaluateVoucherAndPricing({
      productSlug: String(body.productSlug || ""),
      variantId: String(body.variantId || ""),
      voucherCode: body.voucherCode ? String(body.voucherCode) : undefined,
      userRole: session?.user.role,
      memberLevel: session?.user.memberLevel,
    });

    return NextResponse.json({
      valid: true,
      breakdown,
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: err?.message || "Kode promo tidak valid." },
      { status: 400 }
    );
  }
}
