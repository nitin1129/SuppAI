import type { LucideIcon } from "lucide-react";

export type ShopCategory = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  blurb: string;
  productCount: number;
  icon: LucideIcon;
  accent: string;       // background hex
  accentSoft: string;   // soft tint
  emoji: string;        // visual accent for tiles
  featured?: boolean;
};

export type ShopProduct = {
  id: string;
  categoryId: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  tags: string[];
  badge?: "Bestseller" | "New" | "Editor's pick";
  swatch: string; // background hex (fallback / loader tint)
  image?: string;  // optional product image URL
};

export type ProductReview = {
  id: string;
  author: string;
  age: number;
  gender: "F" | "M";
  rating: number;
  date: string; // e.g. "2 weeks ago"
  body: string;
};

export type BrandStat = {
  value: string;
  label: string;
  accent?: boolean;
};

export type ProductDetail = ShopProduct & {
  tagline: string;
  longDescription: string;
  dosage: string;
  ingredients: string[];
  gallery: string[];        // image URLs
  reviewsList: ProductReview[];
  ratingBreakdown: number[]; // [5★ count, 4★, 3★, 2★, 1★]
  brandStats: BrandStat[];
};

