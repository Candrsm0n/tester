import React from "react";
import { notFound } from "next/navigation";
import { CatalogRepository } from "@/repositories";
import { GameCheckoutClient } from "@/components/product/game-checkout-client";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = CatalogRepository.getProductBySlug(params.slug);
  if (!product) {
    return { title: "Produk Tidak Ditemukan" };
  }
  return {
    title: `Top Up ${product.name} Murah & Instan 24 Jam`,
    description: product.description,
  };
}

export default function GameDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = CatalogRepository.getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }
  return <GameCheckoutClient product={product} />;
}
