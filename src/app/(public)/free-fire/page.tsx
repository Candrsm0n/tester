import React from "react";
import { notFound } from "next/navigation";
import { CatalogRepository } from "@/repositories";
import { GameCheckoutClient } from "@/components/product/game-checkout-client";

export const metadata = {
  title: "Top Up Free Fire Murah & Otomatis via QRIS",
  description: "Halaman resmi top up Free Fire instan 24 jam di TOPUPKU.",
};

export default function DedicatedProductPage() {
  const product = CatalogRepository.getProductBySlug("free-fire");
  if (!product) {
    notFound();
  }
  return <GameCheckoutClient product={product} />;
}
