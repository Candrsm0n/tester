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
  const orders = OrderRepository.getAllOrders({
    status: searchParams.get("status") || undefined,
    search: searchParams.get("q") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  });

  return NextResponse.json({ orders });
}
