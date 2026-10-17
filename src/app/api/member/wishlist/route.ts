import { NextRequest, NextResponse } from "next/server";
import { extractCookieValue, verifySessionToken } from "@/lib/auth/session";
import { runtimeStore } from "@/lib/db/runtime-store";

export async function POST(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const productId = String(body.productId || "");
  if (!productId) {
    return NextResponse.json({ error: "Product ID wajib diisi" }, { status: 400 });
  }

  const userSet = runtimeStore.wishlists.get(session.user.id) ?? new Set<string>();
  let added = false;
  if (userSet.has(productId)) {
    userSet.delete(productId);
  } else {
    userSet.add(productId);
    added = true;
  }
  runtimeStore.wishlists.set(session.user.id, userSet);

  return NextResponse.json({
    success: true,
    added,
    wishlistProductIds: Array.from(userSet),
  });
}
