import React from "react";
import { notFound } from "next/navigation";
import { OrderRepository } from "@/repositories";
import { InvoicePaymentClient } from "@/components/payment/invoice-payment-client";

export default function InvoiceDetailPage({
  params,
}: {
  params: { invoiceNumber: string };
}) {
  const order = OrderRepository.getOrderByInvoice(params.invoiceNumber);
  if (!order) {
    notFound();
  }
  return <InvoicePaymentClient initialOrder={order} />;
}
