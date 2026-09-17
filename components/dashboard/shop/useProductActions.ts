"use client";

import { useEffect, useRef, useState } from "react";

import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/cart/WishlistContext";
import type { ShopProduct } from "@/lib/shop/types";

/** Add-to-cart and wishlist wiring shared by every place a product is sold. */
export function useProductActions(p: ShopProduct) {
  const { addItem, hasProduct } = useCart();
  const { isProductWished, togglProduct } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function add() {
    addItem({
      kind: "product-onetime",
      productId: p.id,
      name: p.name,
      brand: p.brand,
      categoryId: p.categoryId,
      image: p.image ?? "",
      unitPrice: p.price,
      unitMrp: p.mrp,
      qty: 1,
    });
    setJustAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustAdded(false), 1600);
  }

  function toggleWish() {
    togglProduct(p.id, {
      productId: p.id,
      name: p.name,
      brand: p.brand,
      categoryId: p.categoryId,
      image: p.image ?? "",
      price: p.price,
      mrp: p.mrp,
    });
  }

  return {
    add,
    justAdded,
    inCart: hasProduct(p.id, "product-onetime"),
    wished: isProductWished(p.id),
    toggleWish,
  };
}

export function percentOff(p: Pick<ShopProduct, "price" | "mrp">): number {
  return p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
