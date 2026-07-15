"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductForm } from "@/components/admin/forms/ProductForm";
import { fetchAdminProduct } from "@/lib/admin/service";
import type { AdminProduct } from "@/lib/admin/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [product, setProduct] = useState<AdminProduct | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!id) return;
    fetchAdminProduct(id).then((p) => setProduct(p));
  }, [id]);

  if (product === undefined) {
    return (
      <div className="grid flex-1 place-items-center text-[12.5px] text-[#0f3a26]/55">
        Loading product…
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="grid flex-1 place-items-center px-8 text-center">
        <div>
          <p className="text-[14px] font-bold text-[#0f3a26]">Product not found.</p>
          <button
            onClick={() => router.push("/admin/products")}
            className="mt-3 text-[12.5px] font-semibold text-[#006E42] hover:underline"
          >
            Back to all products
          </button>
        </div>
      </div>
    );
  }

  return <ProductForm initial={product} />;
}
