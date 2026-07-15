"use client";

import type {
  AdminMetric,
  AdminProduct,
  BlogPost,
} from "./types";

const DELAY = 200;
const delay = <T,>(v: T, ms = DELAY): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

/* ----------------------------- Storage ----------------------------- */

const LS_BLOGS = "suppai.admin.blogs";
const LS_PRODUCTS = "suppai.admin.products";

function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function nowISO() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/* --------------------------- Seed data --------------------------- */

const SEED_BLOGS: BlogPost[] = [
  {
    id: "blog-vitamin-d",
    title: "Why most Indian adults are low on Vitamin D",
    slug: "why-most-indian-adults-are-low-on-vitamin-d",
    excerpt:
      "Vitamin D is meant to come from sunlight, but our routines and skin tones make supplementation almost mandatory.",
    body:
      "## The hidden epidemic\n\nVitamin D deficiency affects an estimated 70% of Indian adults...",
    coverImage: "https://picsum.photos/seed/blog-vd/1200/800",
    author: "Dr. Meera Nair",
    authorRole: "Clinical Nutritionist",
    category: "Nutrition",
    tags: ["vitamin d", "deficiency", "supplements"],
    status: "published",
    publishedAt: "2026-04-12T08:00:00.000Z",
    readMinutes: 6,
    metaTitle: "Vitamin D deficiency in India: Why and what to do",
    metaDescription:
      "70% of Indian adults are low on Vitamin D. Learn the causes and the supplement protocol that actually moves your levels.",
    ogImage: "https://picsum.photos/seed/blog-vd/1200/630",
    keywords: ["vitamin d", "deficiency", "indian adults", "supplements"],
    noIndex: false,
    views: 12480,
    createdAt: "2026-04-10T00:00:00.000Z",
    updatedAt: "2026-04-12T08:00:00.000Z",
  },
  {
    id: "blog-protein",
    title: "How much protein do you actually need?",
    slug: "how-much-protein-do-you-actually-need",
    excerpt:
      "Forget the 1g per kg myth. Here's how to calibrate protein to your goals, age, and activity level.",
    body: "## The real protein math\n\nThe RDA is the floor, not the target...",
    coverImage: "https://picsum.photos/seed/blog-prot/1200/800",
    author: "Karthik Iyer",
    authorRole: "Sports Nutrition",
    category: "Performance",
    tags: ["protein", "muscle", "nutrition"],
    status: "published",
    publishedAt: "2026-05-02T08:00:00.000Z",
    readMinutes: 8,
    metaTitle: "How much protein do you need? A practical guide",
    metaDescription:
      "Calibrate your daily protein based on age, activity, and goals. With real numbers and food examples.",
    ogImage: "https://picsum.photos/seed/blog-prot/1200/630",
    keywords: ["protein", "muscle", "macros"],
    noIndex: false,
    views: 8230,
    createdAt: "2026-04-28T00:00:00.000Z",
    updatedAt: "2026-05-02T08:00:00.000Z",
  },
  {
    id: "blog-sleep-stack",
    title: "The 3-supplement sleep stack",
    slug: "the-3-supplement-sleep-stack",
    excerpt:
      "Magnesium glycinate, L-theanine, and a slow-release melatonin. The clinical case for each.",
    body: "## Better sleep, no grogginess\n\nMelatonin alone is overrated...",
    coverImage: "https://picsum.photos/seed/blog-sleep/1200/800",
    author: "Dr. Leela Menon",
    authorRole: "Endocrinologist",
    category: "Sleep",
    tags: ["sleep", "magnesium", "melatonin"],
    status: "draft",
    readMinutes: 5,
    metaTitle: "The 3-supplement sleep stack that actually works",
    metaDescription:
      "Three clinically backed supplements that improve sleep depth without grogginess.",
    ogImage: "https://picsum.photos/seed/blog-sleep/1200/630",
    keywords: ["sleep", "supplements", "magnesium", "melatonin"],
    noIndex: false,
    views: 0,
    createdAt: "2026-05-20T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
  },
];

const SEED_PRODUCTS: AdminProduct[] = [
  {
    id: "v1",
    name: "Daily Multivitamin",
    slug: "daily-multivitamin",
    brand: "Carbamide Forte",
    categoryId: "vitamins",
    sku: "VIT-MULTI-30",
    description: "23 essential vitamins & minerals.",
    longDescription:
      "A science-backed daily multivitamin with 23 essential nutrients, formulated for Indian adult RDA.",
    dosage: "1 tablet daily with water, after a meal.",
    ingredients: ["Vitamin A", "B-Complex", "Vitamin C", "Vitamin D", "Zinc", "Selenium"],
    cost: 220,
    mrp: 799,
    price: 499,
    taxPercent: 12,
    stock: 540,
    lowStockThreshold: 50,
    coverImage: "https://picsum.photos/seed/v1/720/540",
    gallery: [
      "https://picsum.photos/seed/v1-0/720/540",
      "https://picsum.photos/seed/v1-1/720/540",
      "https://picsum.photos/seed/v1-2/720/540",
      "https://picsum.photos/seed/v1-3/720/540",
    ],
    tags: ["Daily", "Adult"],
    badge: "Bestseller",
    status: "active",
    isFeatured: true,
    subscribable: true,
    rating: 4.5,
    reviews: 8120,
    metaTitle: "Daily Multivitamin by Carbamide Forte — 23 essential nutrients",
    metaDescription:
      "Adult daily multivitamin with 23 vitamins and minerals, RDA-matched. Lab tested.",
    createdAt: "2026-01-04T00:00:00.000Z",
    updatedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    id: "p1",
    name: "Whey Protein Isolate 1 kg",
    slug: "whey-protein-isolate-1kg",
    brand: "MuscleBlaze",
    categoryId: "performance",
    sku: "PERF-WHEY-1K",
    description: "27 g protein, low carb, fast-absorbing.",
    longDescription:
      "Pure whey isolate with 27 g of protein per serving and under 1 g of carbs. Chocolate flavour.",
    ingredients: ["Whey isolate", "Cocoa", "Stevia"],
    cost: 1200,
    mrp: 4500,
    price: 2899,
    taxPercent: 18,
    stock: 86,
    lowStockThreshold: 25,
    coverImage: "https://picsum.photos/seed/p1/720/540",
    gallery: [
      "https://picsum.photos/seed/p1-0/720/540",
      "https://picsum.photos/seed/p1-1/720/540",
    ],
    tags: ["27g protein", "Chocolate"],
    badge: "Bestseller",
    status: "active",
    isFeatured: true,
    subscribable: true,
    rating: 4.6,
    reviews: 18900,
    metaTitle: "Whey Protein Isolate 1kg — MuscleBlaze",
    metaDescription:
      "27 g pure protein per serving, low carb, chocolate flavour.",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  },
];

/* ----------------------------- Blogs ----------------------------- */

export async function fetchBlogs(): Promise<BlogPost[]> {
  const existing = readLocal<BlogPost[]>(LS_BLOGS);
  if (!existing) {
    writeLocal(LS_BLOGS, SEED_BLOGS);
    return delay(SEED_BLOGS);
  }
  return delay(existing);
}

export async function fetchBlog(idOrSlug: string): Promise<BlogPost | null> {
  const all = await fetchBlogs();
  return all.find((b) => b.id === idOrSlug || b.slug === idOrSlug) ?? null;
}

export async function saveBlog(
  patch: Partial<BlogPost> & Pick<BlogPost, "title">,
): Promise<BlogPost> {
  const all = await fetchBlogs();
  const existing = patch.id ? all.find((b) => b.id === patch.id) : undefined;
  const now = nowISO();
  const merged: BlogPost = existing
    ? { ...existing, ...patch, updatedAt: now }
    : {
        id: id("blog"),
        title: patch.title,
        slug: patch.slug ?? slugify(patch.title),
        excerpt: patch.excerpt ?? "",
        body: patch.body ?? "",
        coverImage: patch.coverImage ?? "",
        author: patch.author ?? "Anonymous",
        authorRole: patch.authorRole ?? "",
        category: patch.category ?? "General",
        tags: patch.tags ?? [],
        status: patch.status ?? "draft",
        publishedAt: patch.publishedAt,
        scheduledFor: patch.scheduledFor,
        readMinutes: patch.readMinutes ?? estimateRead(patch.body ?? ""),
        metaTitle: patch.metaTitle ?? patch.title,
        metaDescription: patch.metaDescription ?? patch.excerpt ?? "",
        ogImage: patch.ogImage ?? patch.coverImage ?? "",
        keywords: patch.keywords ?? [],
        canonicalUrl: patch.canonicalUrl,
        noIndex: patch.noIndex ?? false,
        views: 0,
        createdAt: now,
        updatedAt: now,
      };
  const next = existing
    ? all.map((b) => (b.id === merged.id ? merged : b))
    : [merged, ...all];
  writeLocal(LS_BLOGS, next);
  return delay(merged);
}

export async function deleteBlog(blogId: string): Promise<void> {
  const all = await fetchBlogs();
  writeLocal(
    LS_BLOGS,
    all.filter((b) => b.id !== blogId),
  );
  return delay(undefined);
}

/* ----------------------------- Products ----------------------------- */

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const existing = readLocal<AdminProduct[]>(LS_PRODUCTS);
  if (!existing) {
    writeLocal(LS_PRODUCTS, SEED_PRODUCTS);
    return delay(SEED_PRODUCTS);
  }
  return delay(existing);
}

export async function fetchAdminProduct(
  productId: string,
): Promise<AdminProduct | null> {
  const all = await fetchAdminProducts();
  return all.find((p) => p.id === productId) ?? null;
}

export async function saveAdminProduct(
  patch: Partial<AdminProduct> & Pick<AdminProduct, "name" | "categoryId" | "brand">,
): Promise<AdminProduct> {
  const all = await fetchAdminProducts();
  const existing = patch.id ? all.find((p) => p.id === patch.id) : undefined;
  const now = nowISO();
  const merged: AdminProduct = existing
    ? { ...existing, ...patch, updatedAt: now }
    : {
        id: id("prod"),
        name: patch.name,
        slug: patch.slug ?? slugify(patch.name),
        brand: patch.brand,
        categoryId: patch.categoryId,
        sku: patch.sku ?? `SKU-${id("sku").toUpperCase()}`,
        description: patch.description ?? "",
        longDescription: patch.longDescription ?? "",
        dosage: patch.dosage,
        ingredients: patch.ingredients ?? [],
        cost: patch.cost ?? 0,
        mrp: patch.mrp ?? 0,
        price: patch.price ?? 0,
        taxPercent: patch.taxPercent ?? 18,
        stock: patch.stock ?? 0,
        lowStockThreshold: patch.lowStockThreshold ?? 10,
        coverImage: patch.coverImage ?? "",
        gallery: patch.gallery ?? [],
        tags: patch.tags ?? [],
        badge: patch.badge,
        status: patch.status ?? "draft",
        isFeatured: patch.isFeatured ?? false,
        subscribable: patch.subscribable ?? true,
        rating: patch.rating ?? 0,
        reviews: patch.reviews ?? 0,
        vendorId: patch.vendorId,
        vendorName: patch.vendorName,
        metaTitle: patch.metaTitle ?? patch.name,
        metaDescription: patch.metaDescription ?? patch.description ?? "",
        createdAt: now,
        updatedAt: now,
      };
  const next = existing
    ? all.map((p) => (p.id === merged.id ? merged : p))
    : [merged, ...all];
  writeLocal(LS_PRODUCTS, next);
  return delay(merged);
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  const all = await fetchAdminProducts();
  writeLocal(
    LS_PRODUCTS,
    all.filter((p) => p.id !== productId),
  );
  return delay(undefined);
}

/* ----------------------------- Dashboard metrics ----------------------------- */

export async function fetchMetrics(): Promise<AdminMetric[]> {
  const [blogs, products] = await Promise.all([
    fetchBlogs(),
    fetchAdminProducts(),
  ]);
  const published = blogs.filter((b) => b.status === "published").length;
  const drafts = blogs.filter((b) => b.status === "draft").length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold).length;
  return delay([
    {
      label: "Revenue (30d)",
      value: "₹12,48,000",
      delta: { dir: "up", pct: 8.4 },
      hint: "vs previous 30 days",
    },
    {
      label: "New members",
      value: "342",
      delta: { dir: "up", pct: 12.1 },
      hint: "this month",
    },
    {
      label: "Active products",
      value: products.filter((p) => p.status === "active").length.toString(),
      hint: `${lowStock} low stock`,
    },
    {
      label: "Stock units",
      value: totalStock.toLocaleString(),
      hint: "across all SKUs",
    },
    {
      label: "Blog posts",
      value: blogs.length.toString(),
      hint: `${published} live, ${drafts} draft`,
    },
    {
      label: "Avg. cart value",
      value: "₹2,140",
      delta: { dir: "down", pct: 2.3 },
      hint: "vs previous 30 days",
    },
  ]);
}

/* ----------------------------- Helpers ----------------------------- */

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function estimateRead(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
