import React from "react";
import { notFound } from "next/navigation";
import { CatalogRepository } from "@/repositories";
import { GameCheckoutClient } from "@/components/product/game-checkout-client";

export const metadata = {
  title: "Top Up Token Listrik PLN Murah & Otomatis via QRIS",
  description: "Halaman resmi top up Token Listrik PLN instan 24 jam di TOPUPKU.",
};

export default function DedicatedProductPage() {
  const product = CatalogRepository.getProductBySlug("token-pln");
  if (!product) {
    notFound();
  }
  return <GameCheckoutClient product={product} />;
}
