"use client";

import { notFound, useParams } from "next/navigation";

import { CategoryView } from "@/components/dashboard/shop/CategoryView";
import { getCategory } from "@/lib/shop/data";

export default function ShopCategoryPage() {
  const params = useParams();
  const slug = String(params?.slug ?? "");
  const category = getCategory(slug);
  if (!category) notFound();
  return <CategoryView category={category} />;
}
