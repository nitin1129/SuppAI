import type { ShopProduct } from "./types";

/* How each product is drawn on the shelf. The seeded catalogue has no real
   product photography (its images are picsum placeholders), so products are
   rendered as what they actually are: a capsule bottle, a powder tub, a tea
   tin, or boxed gear, each with its own printed label. Real uploaded images
   still win when a product has one. */

export type PackForm = "bottle" | "amber" | "softgel" | "tub" | "tin" | "box";

export type PackIcon =
  | "bands" | "mat" | "kettlebell" | "dumbbell" | "rope" | "wheel"
  | "watch" | "tracker" | "apparel" | "shoes" | "sleep"
  | "massage" | "roller" | "ball" | "sleeve";

export type Pack = { form: PackForm; label: string; sub: string; icon?: PackIcon };

const PACKS: Record<string, Pack> = {
  // Vitamins & minerals: white bottles
  v1: { form: "bottle", label: "MULTI", sub: "23 nutrients" },
  v2: { form: "bottle", label: "D3 + K2", sub: "MK-7" },
  v3: { form: "bottle", label: "B12", sub: "5000 mcg" },
  v4: { form: "bottle", label: "CAL + D3", sub: "with magnesium" },
  v5: { form: "bottle", label: "PROBIOTIC", sub: "50B CFU" },
  v6: { form: "bottle", label: "IMMUNE", sub: "echinacea" },

  // Sports performance: dark tubs
  p1: { form: "tub", label: "WHEY", sub: "isolate 1 kg" },
  p2: { form: "tub", label: "PRE", sub: "workout" },
  p3: { form: "tub", label: "CREATINE", sub: "3 g a scoop" },
  p4: { form: "tub", label: "BCAA", sub: "2 : 1 : 1" },
  p5: { form: "tub", label: "MASS", sub: "gainer 3 kg" },

  // Ayurveda: amber glass
  a1: { form: "amber", label: "ASHWA", sub: "KSM-66" },
  a2: { form: "amber", label: "CURCUMIN", sub: "+ piperine" },
  a3: { form: "amber", label: "TRIPHALA", sub: "detox" },
  a4: { form: "amber", label: "GINSENG", sub: "energy" },
  a5: { form: "amber", label: "BRAHMI", sub: "focus" },

  // Omega: dark softgel bottles
  o1: { form: "softgel", label: "OMEGA-3", sub: "1250 mg" },
  o2: { form: "softgel", label: "ALGAE", sub: "vegan omega" },
  o3: { form: "softgel", label: "COD LIVER", sub: "oil" },
  o4: { form: "softgel", label: "KRILL", sub: "omega oil" },

  // Plant-based: kraft tubs and tea tins
  pl1: { form: "tub", label: "PLANT", sub: "protein 1 kg" },
  pl2: { form: "tub", label: "HEMP", sub: "protein" },
  pl3: { form: "tin", label: "TULSI", sub: "green tea" },
  pl4: { form: "tin", label: "MATCHA", sub: "ceremonial" },
  pl5: { form: "tin", label: "CHAMOMILE", sub: "sleep tea" },

  // Training equipment, wearables, recovery: boxed
  e1: { form: "box", label: "BANDS", sub: "5-piece set", icon: "bands" },
  e2: { form: "box", label: "YOGA MAT", sub: "6 mm TPE", icon: "mat" },
  e3: { form: "box", label: "12 KG", sub: "kettlebell", icon: "kettlebell" },
  e4: { form: "box", label: "20 KG", sub: "dumbbell", icon: "dumbbell" },
  e5: { form: "box", label: "ROPE", sub: "steel", icon: "rope" },
  e6: { form: "box", label: "AB WHEEL", sub: "+ knee pad", icon: "wheel" },
  w1: { form: "box", label: "WATCH", sub: "AMOLED", icon: "watch" },
  w2: { form: "box", label: "BAND", sub: "fitness", icon: "tracker" },
  w3: { form: "box", label: "JOGGERS", sub: "tapered", icon: "apparel" },
  w4: { form: "box", label: "DRI-FIT", sub: "tee", icon: "apparel" },
  w5: { form: "box", label: "RUNNERS", sub: "cushioned", icon: "shoes" },
  w6: { form: "box", label: "SLEEP", sub: "silk mask", icon: "sleep" },
  r1: { form: "box", label: "MASSAGE", sub: "gun pro", icon: "massage" },
  r2: { form: "box", label: "ROLLER", sub: "high density", icon: "roller" },
  r3: { form: "box", label: "BALL", sub: "trigger point", icon: "ball" },
  r4: { form: "box", label: "SLEEVE", sub: "compression", icon: "sleeve" },
};

const FORM_BY_CATEGORY: Record<string, PackForm> = {
  vitamins: "bottle",
  performance: "tub",
  ayurveda: "amber",
  omega: "softgel",
  plant: "tub",
  equipment: "box",
  wearables: "box",
  recovery: "box",
};

/** Pack for any product, including ones added later that have no entry. */
export function packFor(p: Pick<ShopProduct, "id" | "name" | "categoryId">): Pack {
  const known = PACKS[p.id];
  if (known) return known;
  const words = p.name.split(/\s+/);
  return {
    form: FORM_BY_CATEGORY[p.categoryId] ?? "bottle",
    label: (words[0] ?? "").slice(0, 9).toUpperCase(),
    sub: words.slice(1, 3).join(" ").toLowerCase(),
  };
}

/** The seeded catalogue uses picsum stand-ins; those are not product photos. */
export function isPlaceholderImage(src?: string | null): boolean {
  return !src || /picsum\.photos/.test(src);
}
