import {
  Activity,
  Coffee,
  Dumbbell,
  Fish,
  Footprints,
  Leaf,
  Pill,
  Shirt,
} from "lucide-react";

import type { ShopCategory, ShopProduct } from "./types";

export const categories: ShopCategory[] = [
  {
    id: "vitamins",
    slug: "vitamins",
    name: "Vitamins & Minerals",
    tagline: "Foundational nutrients",
    blurb: "Multivitamins, calcium, vitamin D, B12, probiotics and more.",
    productCount: 42,
    icon: Pill,
    accent: "#006E42",
    accentSoft: "rgba(0,110,66,0.08)",
    emoji: "💊",
    featured: true,
  },
  {
    id: "performance",
    slug: "performance",
    name: "Sports Performance",
    tagline: "Train. Recover. Repeat.",
    blurb: "Whey & isolate, pre-workout, creatine, BCAAs.",
    productCount: 28,
    icon: Dumbbell,
    accent: "#0f3a26",
    accentSoft: "rgba(15,58,38,0.08)",
    emoji: "🏋️",
    featured: true,
  },
  {
    id: "ayurveda",
    slug: "ayurveda",
    name: "Ayurveda & Adaptogens",
    tagline: "Roots, herbs, balance",
    blurb: "Ashwagandha, turmeric, ginseng, classical formulations.",
    productCount: 24,
    icon: Leaf,
    accent: "#8b6a2a",
    accentSoft: "rgba(139,106,42,0.08)",
    emoji: "🌿",
  },
  {
    id: "omega",
    slug: "omega",
    name: "Omega & Essential Fats",
    tagline: "EPA, DHA, brain & heart",
    blurb: "Fish oil, krill oil, omega-3 vegan, cod liver.",
    productCount: 18,
    icon: Fish,
    accent: "#1e5d8a",
    accentSoft: "rgba(30,93,138,0.08)",
    emoji: "🐟",
  },
  {
    id: "plant",
    slug: "plant",
    name: "Plant-based & Tea",
    tagline: "Greens, grains, brews",
    blurb: "Pea protein, soy isolate, herbal teas, matcha.",
    productCount: 21,
    icon: Coffee,
    accent: "#3a7a3c",
    accentSoft: "rgba(58,122,60,0.08)",
    emoji: "🍵",
  },
  {
    id: "equipment",
    slug: "equipment",
    name: "Training Equipment",
    tagline: "Gear that lasts",
    blurb: "Resistance bands, yoga mats, kettlebells, dumbbells.",
    productCount: 34,
    icon: Activity,
    accent: "#2a2f3a",
    accentSoft: "rgba(42,47,58,0.08)",
    emoji: "🏋️‍♂️",
  },
  {
    id: "wearables",
    slug: "wearables",
    name: "Apparel & Wearables",
    tagline: "Wear it well",
    blurb: "Activewear, sleep masks, fitness bands, smart watches.",
    productCount: 56,
    icon: Shirt,
    accent: "#5a3a8a",
    accentSoft: "rgba(90,58,138,0.08)",
    emoji: "⌚",
  },
  {
    id: "recovery",
    slug: "recovery",
    name: "Recovery",
    tagline: "Reset your body",
    blurb: "Massage guns, foam rollers, compression boots, ice.",
    productCount: 16,
    icon: Footprints,
    accent: "#c46a4a",
    accentSoft: "rgba(196,106,74,0.08)",
    emoji: "🧊",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

/* ----------------------------- PRODUCTS ----------------------------- */

export const products: ShopProduct[] = [
  // Vitamins
  { id: "v1", categoryId: "vitamins", name: "Daily Multivitamin", brand: "Carbamide Forte", description: "23 essential vitamins & minerals.", price: 499, mrp: 799, rating: 4.5, reviews: 8120, tags: ["Daily", "Adult"], badge: "Bestseller", swatch: "#dfeae0" },
  { id: "v2", categoryId: "vitamins", name: "Vitamin D3 + K2 MK7", brand: "Wellbeing Nutrition", description: "Bone, immunity and heart support.", price: 649, mrp: 1099, rating: 4.7, reviews: 5240, tags: ["Bones", "Immunity"], swatch: "#e2e9d9" },
  { id: "v3", categoryId: "vitamins", name: "Methyl B12 5000 mcg", brand: "Now Foods", description: "High-strength sublingual B12.", price: 899, mrp: 1300, rating: 4.6, reviews: 2980, tags: ["Energy", "Vegan"], swatch: "#dde5dc" },
  { id: "v4", categoryId: "vitamins", name: "Calcium + D3 + Magnesium", brand: "HealthKart", description: "For bone & joint health.", price: 449, mrp: 750, rating: 4.4, reviews: 6320, tags: ["Bones"], swatch: "#e8ede2" },
  { id: "v5", categoryId: "vitamins", name: "Probiotic 50 Billion CFU", brand: "Garden of Life", description: "Gut, mood and immunity.", price: 1399, mrp: 1999, rating: 4.7, reviews: 3450, tags: ["Gut"], badge: "Editor's pick", swatch: "#dee7e2" },
  { id: "v6", categoryId: "vitamins", name: "Echinacea Immune Support", brand: "Himalayan Organics", description: "Herbal immune defense.", price: 349, mrp: 599, rating: 4.3, reviews: 1240, tags: ["Immunity", "Herbal"], swatch: "#e6eadd" },

  // Performance
  { id: "p1", categoryId: "performance", name: "Whey Protein Isolate 1 kg", brand: "MuscleBlaze", description: "27 g protein, low carb, fast-absorbing.", price: 2899, mrp: 4500, rating: 4.6, reviews: 18900, tags: ["27g protein", "Chocolate"], badge: "Bestseller", swatch: "#e6e2d7" },
  { id: "p2", categoryId: "performance", name: "Pre-Workout Surge", brand: "GNC", description: "Caffeine, beta-alanine, citrulline.", price: 2199, mrp: 3000, rating: 4.4, reviews: 6230, tags: ["Energy"], swatch: "#e8ddd9" },
  { id: "p3", categoryId: "performance", name: "Creatine Monohydrate", brand: "Optimum Nutrition", description: "Pure 3 g creatine per serving.", price: 1699, mrp: 2299, rating: 4.7, reviews: 8420, tags: ["Strength"], swatch: "#dde2e8" },
  { id: "p4", categoryId: "performance", name: "BCAA Recovery 2:1:1", brand: "MuscleTech", description: "Reduces fatigue, faster recovery.", price: 1599, mrp: 2199, rating: 4.5, reviews: 3140, tags: ["Recovery"], swatch: "#e6e0de" },
  { id: "p5", categoryId: "performance", name: "Mass Gainer 3 kg", brand: "Universal Nutrition", description: "Lean mass formula, 50 g protein.", price: 3499, mrp: 4799, rating: 4.5, reviews: 4250, tags: ["Bulk"], swatch: "#ede5d6" },

  // Ayurveda
  { id: "a1", categoryId: "ayurveda", name: "Ashwagandha KSM-66", brand: "Kapiva", description: "Stress, sleep, focus support.", price: 549, mrp: 999, rating: 4.5, reviews: 7320, tags: ["Stress", "Sleep"], badge: "Bestseller", swatch: "#ece2cb" },
  { id: "a2", categoryId: "ayurveda", name: "Curcumin 500 mg + Piperine", brand: "Carbamide Forte", description: "High-absorption turmeric extract.", price: 599, mrp: 999, rating: 4.6, reviews: 4890, tags: ["Joints"], swatch: "#edd9b5" },
  { id: "a3", categoryId: "ayurveda", name: "Triphala Detox", brand: "Patanjali", description: "Classical Ayurvedic blend for gut.", price: 299, mrp: 450, rating: 4.3, reviews: 2150, tags: ["Detox"], swatch: "#e8dfc4" },
  { id: "a4", categoryId: "ayurveda", name: "Ginseng Energy Capsules", brand: "Now Foods", description: "Sustained, calm energy.", price: 1199, mrp: 1599, rating: 4.4, reviews: 1290, tags: ["Energy"], swatch: "#e0e3d3" },
  { id: "a5", categoryId: "ayurveda", name: "Brahmi Cognition Support", brand: "Himalaya", description: "Memory and focus.", price: 449, mrp: 699, rating: 4.4, reviews: 1740, tags: ["Focus"], swatch: "#e3dec8" },

  // Omega
  { id: "o1", categoryId: "omega", name: "Omega-3 1250 mg", brand: "Wellbeing Nutrition", description: "EPA 750 / DHA 500 per serving.", price: 949, mrp: 1399, rating: 4.7, reviews: 9120, tags: ["Brain", "Heart"], badge: "Bestseller", swatch: "#d6e0e8" },
  { id: "o2", categoryId: "omega", name: "Vegan Omega from Algae", brand: "OZiva", description: "Plant-source DHA & EPA.", price: 1299, mrp: 1799, rating: 4.5, reviews: 2310, tags: ["Vegan"], swatch: "#dceae3" },
  { id: "o3", categoryId: "omega", name: "Cod Liver Oil", brand: "Seven Seas", description: "Vitamin A & D rich oil.", price: 599, mrp: 899, rating: 4.4, reviews: 3520, tags: ["Bones"], swatch: "#e0e6e8" },
  { id: "o4", categoryId: "omega", name: "Krill Oil Premium", brand: "Now Foods", description: "Phospholipid omega + astaxanthin.", price: 1899, mrp: 2599, rating: 4.6, reviews: 980, tags: ["Premium"], swatch: "#dedfe6" },

  // Plant
  { id: "pl1", categoryId: "plant", name: "Plant Protein Vanilla 1 kg", brand: "OZiva", description: "Pea + brown rice, 25 g protein.", price: 1899, mrp: 2599, rating: 4.5, reviews: 5320, tags: ["Vegan"], badge: "Bestseller", swatch: "#dde7d6" },
  { id: "pl2", categoryId: "plant", name: "Hemp Protein", brand: "Nutiva", description: "Complete amino profile, fibre rich.", price: 1499, mrp: 1999, rating: 4.4, reviews: 1240, tags: ["Vegan", "Fibre"], swatch: "#e1e8d7" },
  { id: "pl3", categoryId: "plant", name: "Tulsi Green Tea", brand: "Organic India", description: "Calming herbal infusion.", price: 249, mrp: 350, rating: 4.6, reviews: 4180, tags: ["Tea"], swatch: "#dde8dd" },
  { id: "pl4", categoryId: "plant", name: "Matcha Ceremonial Grade", brand: "Akira", description: "Sustained focus and antioxidants.", price: 799, mrp: 1100, rating: 4.7, reviews: 1820, tags: ["Tea", "Focus"], badge: "Editor's pick", swatch: "#d5e0d2" },
  { id: "pl5", categoryId: "plant", name: "Chamomile Sleep Tea", brand: "Vahdam", description: "Wind down at night.", price: 299, mrp: 399, rating: 4.5, reviews: 2240, tags: ["Sleep"], swatch: "#e6e9d6" },

  // Equipment
  { id: "e1", categoryId: "equipment", name: "Resistance Band Set (5-piece)", brand: "Boldfit", description: "Light to extra heavy, with carry pouch.", price: 799, mrp: 1299, rating: 4.5, reviews: 6420, tags: ["Strength"], badge: "Bestseller", swatch: "#e0e0e0" },
  { id: "e2", categoryId: "equipment", name: "Yoga Mat 6mm TPE", brand: "Strauss", description: "Non-slip, cushioned, eco-friendly.", price: 1499, mrp: 1999, rating: 4.6, reviews: 4810, tags: ["Yoga"], swatch: "#dee2e0" },
  { id: "e3", categoryId: "equipment", name: "Kettlebell 12 kg", brand: "Decathlon", description: "Powder-coated cast iron.", price: 1799, mrp: 2399, rating: 4.7, reviews: 1240, tags: ["Strength"], swatch: "#d8dde0" },
  { id: "e4", categoryId: "equipment", name: "Adjustable Dumbbell 20 kg", brand: "PowerMax", description: "Plate-loaded, includes rod.", price: 2999, mrp: 3999, rating: 4.5, reviews: 2410, tags: ["Strength"], swatch: "#dadcde" },
  { id: "e5", categoryId: "equipment", name: "Jump Rope (Steel)", brand: "Cosco", description: "Bearings, adjustable length.", price: 399, mrp: 599, rating: 4.4, reviews: 3120, tags: ["Cardio"], swatch: "#dde0e2" },
  { id: "e6", categoryId: "equipment", name: "Ab Wheel + Knee Pad", brand: "Boldfit", description: "Core strengthening combo.", price: 449, mrp: 699, rating: 4.3, reviews: 1840, tags: ["Core"], swatch: "#dee1e3" },

  // Wearables
  { id: "w1", categoryId: "wearables", name: "Smart Watch Pro", brand: "Noise ColorFit", description: "AMOLED, SpO2, sleep tracking.", price: 4499, mrp: 7999, rating: 4.5, reviews: 13420, tags: ["Smartwatch"], badge: "Bestseller", swatch: "#dee1e6" },
  { id: "w2", categoryId: "wearables", name: "Fitness Band Air", brand: "Mi", description: "Heart rate, steps, sleep.", price: 2499, mrp: 3499, rating: 4.4, reviews: 24130, tags: ["Tracker"], swatch: "#e0e3e7" },
  { id: "w3", categoryId: "wearables", name: "Training Joggers", brand: "Adidas", description: "Tapered fit, sweat-wicking.", price: 1999, mrp: 2999, rating: 4.6, reviews: 4210, tags: ["Apparel"], swatch: "#e3dfe6" },
  { id: "w4", categoryId: "wearables", name: "Performance T-shirt", brand: "Nike Dri-FIT", description: "Breathable, quick-dry.", price: 1499, mrp: 2299, rating: 4.7, reviews: 3120, tags: ["Apparel"], swatch: "#e6dfe2" },
  { id: "w5", categoryId: "wearables", name: "Running Shoes", brand: "Asics Gel-Nimbus", description: "Cushioned, long-distance.", price: 8999, mrp: 12999, rating: 4.8, reviews: 1240, tags: ["Shoes"], badge: "Editor's pick", swatch: "#e3dee0" },
  { id: "w6", categoryId: "wearables", name: "Silk Sleep Mask", brand: "Bombay Shaving Co.", description: "Block light for deeper sleep.", price: 599, mrp: 899, rating: 4.5, reviews: 1840, tags: ["Sleep"], swatch: "#e2dee2" },

  // Recovery
  { id: "r1", categoryId: "recovery", name: "Massage Gun Pro", brand: "Hyperice", description: "5 attachments, deep tissue.", price: 12999, mrp: 17999, rating: 4.7, reviews: 1240, tags: ["Premium"], badge: "Editor's pick", swatch: "#e8d8d2" },
  { id: "r2", categoryId: "recovery", name: "Foam Roller High-Density", brand: "Boldfit", description: "Self-myofascial release.", price: 799, mrp: 1199, rating: 4.5, reviews: 3210, tags: ["Stretch"], badge: "Bestseller", swatch: "#e6dad4" },
  { id: "r3", categoryId: "recovery", name: "Trigger Point Massage Ball", brand: "TheraBand", description: "Spot relief, knots.", price: 449, mrp: 699, rating: 4.4, reviews: 1820, tags: ["Stretch"], swatch: "#e4d8d2" },
  { id: "r4", categoryId: "recovery", name: "Cooling Compression Sleeve", brand: "Nivia", description: "For knees and elbows.", price: 599, mrp: 899, rating: 4.3, reviews: 1240, tags: ["Support"], swatch: "#e2d6d0" },
];

// Stable picsum seeds give each product a deterministic placeholder photo
// that looks photographic without depending on real product imagery yet.
products.forEach((p) => {
  if (!p.image) p.image = `https://picsum.photos/seed/sa-${p.id}/600/450`;
});

export function getProductsByCategory(categoryId: string) {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getFeaturedProducts(limit = 6) {
  return products.filter((p) => p.badge).slice(0, limit);
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

import type {
  BrandStat,
  ProductDetail,
  ProductReview,
} from "./types";

const MOCK_REVIEWS: Omit<ProductReview, "id">[] = [
  {
    author: "Neha Desai",
    age: 24,
    gender: "F",
    rating: 5,
    date: "2 weeks ago",
    body: "Honestly worth the price. Energy levels are up and I'm sleeping better within the first 10 days.",
  },
  {
    author: "Karthik Iyer",
    age: 31,
    gender: "M",
    rating: 5,
    date: "1 month ago",
    body: "Quality is on par with my old international brand at a fraction of the cost. Will reorder.",
  },
  {
    author: "Anita Roy",
    age: 39,
    gender: "F",
    rating: 4,
    date: "3 weeks ago",
    body: "Took about 3 weeks to feel a difference. Good ingredient panel, no aftertaste.",
  },
  {
    author: "Rohan Mehta",
    age: 27,
    gender: "M",
    rating: 5,
    date: "1 week ago",
    body: "Clean label, no fillers I can spot. Comfortable on an empty stomach.",
  },
];

function ratingBreakdown(rating: number, totalReviews: number): number[] {
  // Distribute reviews around the average rating in a believable curve.
  const buckets = [0, 0, 0, 0, 0]; // index 0 = 5 stars
  for (let i = 0; i < 5; i++) {
    const star = 5 - i;
    const distance = Math.abs(star - rating);
    buckets[i] = Math.max(0, 1 - distance / 2);
  }
  const sum = buckets.reduce((a, b) => a + b, 0);
  return buckets.map((w) => Math.round((w / sum) * totalReviews));
}

export function getProductDetail(id: string): ProductDetail | undefined {
  const p = getProduct(id);
  if (!p) return undefined;

  // 4 images at the same 4:3 ratio used by the thumbnails so nothing crops.
  const gallery = Array.from(
    { length: 4 },
    (_, i) => `https://picsum.photos/seed/sa-${p.id}-${i}/720/540`,
  );

  const ingredients = Array.from(
    new Set([...p.tags, "Quality tested", "Vegetarian", "Lab verified"]),
  ).slice(0, 6);

  const reviewsList: ProductReview[] = MOCK_REVIEWS.map((r, i) => ({
    ...r,
    id: `${p.id}-rev-${i}`,
  }));

  const stats: BrandStat[] = [
    { value: `${5 + (p.rating > 4.6 ? 6 : 3)}+`, label: "Years in market" },
    {
      value: `${Math.round(p.reviews / 1000) * 5}K+`,
      label: "Happy customers",
      accent: true,
    },
    {
      value: `${Math.round(p.rating * 10) / 10}★`,
      label: "Avg rating",
    },
  ];

  return {
    ...p,
    tagline: `${p.brand} · ${p.name.split(" ").slice(0, 3).join(" ")}`,
    longDescription: `${p.description} A science-backed formulation tested for purity and potency. Designed to fit your daily routine, with transparent labeling and third-party verification.`,
    dosage: p.tags.includes("Daily")
      ? "Take 1 capsule daily with water, preferably after a meal."
      : "As directed by your nutritionist or physician.",
    ingredients,
    gallery,
    reviewsList,
    ratingBreakdown: ratingBreakdown(p.rating, p.reviews),
    brandStats: stats,
  };
}
