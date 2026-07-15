/* ------------------------------- Auth ------------------------------- */

export type AdminRole = "owner" | "editor" | "support";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarInitials: string;
};

export type AdminSession = {
  user: AdminUser;
  issuedAt: string;
  expiresAt: string;
};

/* ------------------------------ Blogs ------------------------------ */

export type BlogStatus = "draft" | "published" | "scheduled";

export type BlogPost = {
  id: string;

  // Core content
  title: string;
  slug: string;            // URL slug, lowercase-kebab
  excerpt: string;         // 1-2 sentence summary
  body: string;            // Markdown body
  coverImage: string;      // URL

  // Authorship
  author: string;
  authorRole: string;

  // Taxonomy
  category: string;
  tags: string[];

  // Publishing
  status: BlogStatus;
  publishedAt?: string;    // ISO string when published
  scheduledFor?: string;   // ISO string for scheduled posts
  readMinutes: number;

  // SEO metadata
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  keywords: string[];
  canonicalUrl?: string;
  noIndex: boolean;        // Tell search engines to skip

  // Stats
  views: number;

  // Audit
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------ Products ------------------------------ */

export type ProductStatus = "active" | "draft" | "archived" | "out_of_stock";

export type AdminProduct = {
  id: string;

  // Identity
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  sku: string;

  // Descriptions
  description: string;
  longDescription: string;
  dosage?: string;
  ingredients: string[];

  // Pricing
  cost: number;            // Vendor cost (for margin)
  mrp: number;             // Listed MRP
  price: number;           // Selling price
  taxPercent: number;

  // Inventory
  stock: number;
  lowStockThreshold: number;

  // Media
  coverImage: string;
  gallery: string[];

  // Discovery
  tags: string[];
  badge?: "Bestseller" | "New" | "Editor's pick";

  // Status & flags
  status: ProductStatus;
  isFeatured: boolean;
  subscribable: boolean;   // Eligible for Subscribe & Save

  // Stats
  rating: number;
  reviews: number;

  // Vendor (set when the product originated from a product vendor)
  vendorId?: string;
  vendorName?: string;

  // SEO
  metaTitle: string;
  metaDescription: string;

  // Audit
  createdAt: string;
  updatedAt: string;
};

/* ------------------------------ Misc ------------------------------ */

export type AdminMetric = {
  label: string;
  value: string;
  delta?: { dir: "up" | "down"; pct: number };
  hint?: string;
};
