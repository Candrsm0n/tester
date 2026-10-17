import { NextResponse } from "next/server";
import { CatalogRepository } from "@/repositories";

export async function GET() {
  return NextResponse.json({
    categories: CatalogRepository.getAllCategories(),
  });
}
