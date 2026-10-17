import { NextRequest, NextResponse } from "next/server";
import { CatalogRepository } from "@/repositories";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("q") || undefined;
  const popularOnly = searchParams.get("popular") === "true";
  const newOnly = searchParams.get("new") === "true";
  const flashSaleOnly = searchParams.get("flashSale") === "true";
  const sort = (searchParams.get("sort") as any) || "popular";

  const products = CatalogRepository.getAllProducts({
    category,
    search,
    popularOnly,
    newOnly,
    flashSaleOnly,
    sort,
  });

  return NextResponse.json({
    count: products.length,
    products,
  });
}
