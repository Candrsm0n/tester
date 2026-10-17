import { NextRequest, NextResponse } from "next/server";
import { CatalogRepository } from "@/repositories";

export async function GET(
  _req: NextRequest,
  context: { params: { slug: string } }
) {
  const product = CatalogRepository.getProductBySlug(context.params.slug);
  if (!product) {
    return NextResponse.json(
      { error: "Produk tidak ditemukan." },
      { status: 404 }
    );
  }
  return NextResponse.json({ product });
}
