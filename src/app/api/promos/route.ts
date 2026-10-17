import { NextResponse } from "next/server";
import { runtimeStore } from "@/lib/db/runtime-store";
import { CatalogRepository } from "@/repositories";

export async function GET() {
  return NextResponse.json({
    vouchers: runtimeStore.vouchers.filter((v) => v.isActive),
    banners: runtimeStore.banners.filter((b) => b.isActive),
    flashSales: CatalogRepository.getFlashSaleVariants(),
  });
}
