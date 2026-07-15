"use client";

import { notFound, useParams } from "next/navigation";

import { ProductDetailView } from "@/components/dashboard/shop/ProductDetailView";
import { getProductDetail } from "@/lib/shop/data";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = String(params?.productId ?? "");
  const product = getProductDetail(productId);
  if (!product) notFound();
  return <ProductDetailView product={product} />;
}
