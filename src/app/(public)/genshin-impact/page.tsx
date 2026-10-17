import React from "react";
import { notFound } from "next/navigation";
import { CatalogRepository } from "@/repositories";
import { GameCheckoutClient } from "@/components/product/game-checkout-client";

export const metadata = {
  title: "Top Up Genshin Impact Murah & Otomatis via QRIS",
  description: "Halaman resmi top up Genshin Impact instan 24 jam di TOPUPKU.",
};

export default function DedicatedProductPage() {
  const product = CatalogRepository.getProductBySlug("genshin-impact");
  if (!product) {
    notFound();
  }
  return <GameCheckoutClient product={product} />;
}
