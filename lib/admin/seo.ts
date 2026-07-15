/* Schema.org JSON-LD generators + SEO scoring (based on claude-seo plugin
   templates + E-E-A-T heuristics). */

import type { AdminProduct, BlogPost } from "./types";

const SITE = "https://suppai.health";
const ORG = {
  "@type": "Organization",
  name: "SuppAI",
  url: SITE,
  logo: {
    "@type": "ImageObject",
    url: `${SITE}/logo.png`,
  },
};

/* ----------------------- JSON-LD generators ----------------------- */

export type ArticleSeed = Pick<
  BlogPost,
  | "title"
  | "slug"
  | "excerpt"
  | "coverImage"
  | "author"
  | "authorRole"
  | "publishedAt"
  | "category"
  | "keywords"
  | "metaDescription"
  | "ogImage"
> & { updatedAt?: string };

export function articleJsonLd(seed: ArticleSeed) {
  const url = `${SITE}/blog/${seed.slug}`;
  const datePublished = seed.publishedAt ?? new Date().toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: seed.title,
    description: seed.metaDescription || seed.excerpt,
    image: [seed.ogImage || seed.coverImage].filter(Boolean),
    datePublished,
    dateModified: seed.updatedAt ?? datePublished,
    author: {
      "@type": "Person",
      name: seed.author,
      jobTitle: seed.authorRole || undefined,
    },
    publisher: ORG,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: seed.category,
    keywords: seed.keywords.join(", "),
  };
}

export type ProductSeed = Pick<
  AdminProduct,
  | "name"
  | "slug"
  | "brand"
  | "sku"
  | "description"
  | "longDescription"
  | "price"
  | "mrp"
  | "stock"
  | "rating"
  | "reviews"
  | "coverImage"
  | "gallery"
  | "metaDescription"
>;

export function productJsonLd(seed: ProductSeed) {
  const url = `${SITE}/shop/${seed.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: seed.name,
    description: seed.metaDescription || seed.description || seed.longDescription,
    sku: seed.sku,
    brand: { "@type": "Brand", name: seed.brand },
    image: [seed.coverImage, ...seed.gallery].filter(Boolean).slice(0, 6),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: seed.price,
      priceValidUntil: nextYearISO(),
      availability:
        seed.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: ORG,
    },
    aggregateRating:
      seed.reviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: seed.rating,
            reviewCount: seed.reviews,
          }
        : undefined,
  };
}

function nextYearISO() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

/* ----------------------- SEO scoring ----------------------- */

export type SeoCheck = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail?: string;
};

export type SeoReport = {
  score: number; // 0-100
  checks: SeoCheck[];
};

/* Blog SEO checklist: titles, meta, OG, body structure, keywords, E-E-A-T. */
export function scoreBlogSeo(seed: {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  keywords: string[];
  author: string;
  authorRole: string;
}): SeoReport {
  const checks: SeoCheck[] = [];

  // Title length
  const titleLen = (seed.metaTitle || seed.title).length;
  checks.push({
    id: "title-length",
    label: "Meta title length",
    status:
      titleLen >= 30 && titleLen <= 60
        ? "pass"
        : titleLen >= 20 && titleLen <= 70
          ? "warn"
          : "fail",
    detail: `${titleLen} chars (target 30–60)`,
  });

  // Description length
  const descLen = (seed.metaDescription || seed.excerpt).length;
  checks.push({
    id: "desc-length",
    label: "Meta description length",
    status:
      descLen >= 120 && descLen <= 160
        ? "pass"
        : descLen >= 80 && descLen <= 200
          ? "warn"
          : "fail",
    detail: `${descLen} chars (target 120–160)`,
  });

  // Slug
  checks.push({
    id: "slug",
    label: "URL slug",
    status:
      seed.slug.length >= 3 && seed.slug.length <= 75 && /^[a-z0-9-]+$/.test(seed.slug)
        ? "pass"
        : "fail",
    detail: seed.slug ? `${seed.slug.length} chars` : "missing",
  });

  // Cover image (for OG)
  checks.push({
    id: "og-image",
    label: "OG image set",
    status: seed.ogImage || seed.coverImage ? "pass" : "fail",
    detail: seed.ogImage || seed.coverImage ? "ready" : "no image",
  });

  // Headings in body
  const h2Count = (seed.body.match(/^##\s+/gm) ?? []).length;
  checks.push({
    id: "headings",
    label: "Body has H2 headings",
    status: h2Count >= 2 ? "pass" : h2Count === 1 ? "warn" : "fail",
    detail: `${h2Count} H2 found`,
  });

  // Word count
  const words = seed.body.split(/\s+/).filter(Boolean).length;
  checks.push({
    id: "word-count",
    label: "Article length",
    status: words >= 600 ? "pass" : words >= 300 ? "warn" : "fail",
    detail: `${words.toLocaleString()} words (600+ ideal)`,
  });

  // Keywords
  checks.push({
    id: "keywords",
    label: "Keywords set",
    status:
      seed.keywords.length >= 3 && seed.keywords.length <= 10
        ? "pass"
        : seed.keywords.length > 0
          ? "warn"
          : "fail",
    detail: `${seed.keywords.length} (3–10 ideal)`,
  });

  // Primary keyword in title (use first keyword)
  if (seed.keywords[0]) {
    const inTitle = (seed.metaTitle || seed.title)
      .toLowerCase()
      .includes(seed.keywords[0].toLowerCase());
    checks.push({
      id: "kw-in-title",
      label: "Primary keyword in title",
      status: inTitle ? "pass" : "warn",
      detail: inTitle ? "present" : `add "${seed.keywords[0]}"`,
    });
  }

  // E-E-A-T: author identity
  checks.push({
    id: "author-eeat",
    label: "Author credibility (E-E-A-T)",
    status: seed.author && seed.authorRole ? "pass" : seed.author ? "warn" : "fail",
    detail:
      seed.author && seed.authorRole
        ? "name + role"
        : seed.author
          ? "add role"
          : "missing author",
  });

  return { score: scoreFromChecks(checks), checks };
}

/* Product SEO checklist: name, description, schema-ready fields, images. */
export function scoreProductSeo(seed: {
  name: string;
  slug: string;
  brand: string;
  sku: string;
  description: string;
  longDescription: string;
  coverImage: string;
  gallery: string[];
  metaTitle: string;
  metaDescription: string;
  price: number;
  stock: number;
  tags: string[];
}): SeoReport {
  const checks: SeoCheck[] = [];

  const titleLen = (seed.metaTitle || seed.name).length;
  checks.push({
    id: "title-length",
    label: "Meta title length",
    status:
      titleLen >= 30 && titleLen <= 60
        ? "pass"
        : titleLen >= 20 && titleLen <= 70
          ? "warn"
          : "fail",
    detail: `${titleLen} chars`,
  });

  const descLen = (seed.metaDescription || seed.description).length;
  checks.push({
    id: "desc-length",
    label: "Meta description length",
    status:
      descLen >= 120 && descLen <= 160
        ? "pass"
        : descLen >= 60 && descLen <= 200
          ? "warn"
          : "fail",
    detail: `${descLen} chars`,
  });

  checks.push({
    id: "brand",
    label: "Brand set (Product schema)",
    status: seed.brand ? "pass" : "fail",
    detail: seed.brand || "missing",
  });

  checks.push({
    id: "sku",
    label: "SKU set (Product schema)",
    status: seed.sku ? "pass" : "fail",
    detail: seed.sku || "missing",
  });

  checks.push({
    id: "price",
    label: "Price set (Offer schema)",
    status: seed.price > 0 ? "pass" : "fail",
    detail: seed.price > 0 ? `₹${seed.price}` : "missing",
  });

  checks.push({
    id: "images",
    label: "≥2 images (Product gallery)",
    status:
      seed.gallery.length >= 1 && seed.coverImage
        ? "pass"
        : seed.coverImage
          ? "warn"
          : "fail",
    detail: `${seed.coverImage ? 1 : 0} cover + ${seed.gallery.length} gallery`,
  });

  const wordsLong = seed.longDescription.split(/\s+/).filter(Boolean).length;
  checks.push({
    id: "long-desc",
    label: "Long description filled",
    status: wordsLong >= 80 ? "pass" : wordsLong >= 30 ? "warn" : "fail",
    detail: `${wordsLong} words (80+ ideal)`,
  });

  checks.push({
    id: "tags",
    label: "Tags for discovery",
    status: seed.tags.length >= 2 ? "pass" : seed.tags.length === 1 ? "warn" : "fail",
    detail: `${seed.tags.length} tag${seed.tags.length === 1 ? "" : "s"}`,
  });

  checks.push({
    id: "stock",
    label: "Availability signal",
    status: seed.stock > 0 ? "pass" : "warn",
    detail: seed.stock > 0 ? "InStock" : "OutOfStock",
  });

  return { score: scoreFromChecks(checks), checks };
}

function scoreFromChecks(checks: SeoCheck[]): number {
  if (!checks.length) return 0;
  const value = checks.reduce(
    (s, c) => s + (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0),
    0,
  );
  return Math.round((value / checks.length) * 100);
}
