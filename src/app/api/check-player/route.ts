import { NextRequest, NextResponse } from "next/server";
import { validateGamePlayerId } from "@/lib/digiflazz";
import { sanitizeString } from "@/lib/security";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const productSlug = sanitizeString(String(body.productSlug || ""));
  const gameUserId = sanitizeString(String(body.gameUserId || ""));
  const gameZoneId = body.gameZoneId ? sanitizeString(String(body.gameZoneId)) : undefined;

  if (!gameUserId || gameUserId.length < 3) {
    return NextResponse.json(
      { valid: false, error: "Masukkan User ID yang valid terlebih dahulu." },
      { status: 400 }
    );
  }

  const result = await validateGamePlayerId({
    productSlug,
    gameUserId,
    gameZoneId,
  });

  return NextResponse.json(result);
}
