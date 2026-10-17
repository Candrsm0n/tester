import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { extractCookieValue, isAdminRole, verifySessionToken } from "@/lib/auth/session";
import { runtimeStore } from "@/lib/db/runtime-store";
import { sanitizeString } from "@/lib/security";

export async function GET(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ products: runtimeStore.products });
}

export async function POST(req: NextRequest) {
  const token = extractCookieValue(req.headers.get("cookie"));
  const session = verifySessionToken(token);
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  const name = sanitizeString(String(body.name || ""));
  const slug = sanitizeString(String(body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")));
  const publisher = sanitizeString(String(body.publisher || "Official Publisher"));
  const categorySlug = sanitizeString(String(body.categorySlug || "mobile-games"));

  if (!name) {
    return NextResponse.json({ error: "Nama produk wajib diisi." }, { status: 400 });
  }

  const cat =
    runtimeStore.categories.find((c) => c.slug === categorySlug) ||
    runtimeStore.categories[0];

  const newProduct = {
    id: `prod_${crypto.randomUUID().slice(0, 8)}`,
    categoryId: cat.id,
    categorySlug: cat.slug,
    categoryName: cat.name,
    name,
    slug,
    publisher,
    subtitle: sanitizeString(String(body.subtitle || "Pengiriman Instan 24 Jam")),
    description: sanitizeString(String(body.description || `Top up ${name} resmi dan instan.`)),
    thumbnailUrl: "/icons/logo-topupku.svg",
    bannerUrl: "/banners/hero-mlbb.svg",
    requiresZoneId: Boolean(body.requiresZoneId),
    userIdLabel: "User ID",
    userIdPlaceholder: "Masukkan User ID",
    instructionText: "Masukkan User ID akun Anda.",
    supportsIdCheck: true,
    isPopular: Boolean(body.isPopular),
    isNew: true,
    isFeatured: false,
    rating: 4.95,
    reviewCount: 10,
    totalSold: 0,
    status: "ACTIVE" as const,
    variants: [],
  };

  runtimeStore.products.unshift(newProduct);
  runtimeStore.addAuditLog({
    actorEmail: session.user.email,
    actorRole: session.user.role,
    action: "CREATE_PRODUCT",
    module: "CATALOG",
    targetId: newProduct.slug,
    details: { name: newProduct.name, publisher: newProduct.publisher },
  });

  return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
}
