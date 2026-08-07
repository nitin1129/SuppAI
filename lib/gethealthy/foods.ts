/* Approximate calories per 100 g, for the food-calorie tool and the meal
   portion editor. Common Indian and general foods; values are rounded
   estimates for guidance only.

   piece:      grams in one typical piece (only for foods counted by piece,
               e.g. eggs, rotis). Absent = the food is measured by weight.
   pieceLabel: singular noun for one piece (e.g. "roti", "egg"). */

export type Food = { name: string; kcal: number; piece?: number; pieceLabel?: string };

export const FOODS: Food[] = [
  { name: "Rice (cooked)", kcal: 130 },
  { name: "Brown rice (cooked)", kcal: 111 },
  { name: "Roti / Chapati", kcal: 297, piece: 45, pieceLabel: "roti" },
  { name: "Bread (white)", kcal: 265, piece: 25, pieceLabel: "slice" },
  { name: "Idli", kcal: 58, piece: 40, pieceLabel: "idli" },
  { name: "Dosa", kcal: 168, piece: 80, pieceLabel: "dosa" },
  { name: "Poha", kcal: 130 },
  { name: "Upma", kcal: 132 },
  { name: "Oats (raw)", kcal: 389 },
  { name: "Quinoa (cooked)", kcal: 120 },
  { name: "Dal (cooked)", kcal: 116 },
  { name: "Rajma (cooked)", kcal: 127 },
  { name: "Chickpea / Chana (cooked)", kcal: 164 },
  { name: "Paneer", kcal: 265 },
  { name: "Tofu", kcal: 76 },
  { name: "Egg (whole)", kcal: 155, piece: 50, pieceLabel: "egg" },
  { name: "Chicken breast", kcal: 165 },
  { name: "Mutton", kcal: 294 },
  { name: "Fish", kcal: 206 },
  { name: "Milk (whole)", kcal: 61 },
  { name: "Curd / Yogurt", kcal: 60 },
  { name: "Greek yogurt", kcal: 59 },
  { name: "Cheese", kcal: 402 },
  { name: "Butter", kcal: 717 },
  { name: "Ghee", kcal: 900 },
  { name: "Whey protein (scoop)", kcal: 400 },
  { name: "Almonds", kcal: 579 },
  { name: "Cashew", kcal: 553 },
  { name: "Walnut", kcal: 654 },
  { name: "Peanuts", kcal: 567 },
  { name: "Banana", kcal: 89, piece: 118, pieceLabel: "banana" },
  { name: "Apple", kcal: 52, piece: 182, pieceLabel: "apple" },
  { name: "Orange", kcal: 47, piece: 130, pieceLabel: "orange" },
  { name: "Mango", kcal: 60 },
  { name: "Grapes", kcal: 69 },
  { name: "Watermelon", kcal: 30 },
  { name: "Potato", kcal: 77 },
  { name: "Sweet potato", kcal: 86 },
  { name: "Spinach", kcal: 23 },
  { name: "Broccoli", kcal: 34 },
  { name: "Sugar", kcal: 387 },
  { name: "Honey", kcal: 304 },
  { name: "Dark chocolate", kcal: 546 },
  { name: "Biryani", kcal: 200 },
  { name: "Samosa", kcal: 262, piece: 50, pieceLabel: "samosa" },
  { name: "Pizza", kcal: 266, piece: 107, pieceLabel: "slice" },
];

export function findFood(name: string): Food | undefined {
  const n = name.trim().toLowerCase();
  return FOODS.find((f) => f.name.toLowerCase() === n);
}

/* Best-effort: find the main food mentioned in a free-text meal detail by
   matching name keywords. Longest keyword match wins. */
const STOP = new Set(["cooked", "whole", "raw", "scoop", "with", "and", "the"]);
export function matchFood(text: string): Food | undefined {
  const t = text.toLowerCase();
  let best: Food | undefined;
  let bestLen = 0;
  for (const f of FOODS) {
    for (const kw of f.name.toLowerCase().split(/[^a-z]+/)) {
      if (kw.length < 3 || STOP.has(kw)) continue;
      if (t.includes(kw) && kw.length > bestLen) {
        best = f;
        bestLen = kw.length;
      }
    }
  }
  return best;
}

/** Grams stated in a detail like "Rice · 150 g". */
export function parseGrams(text: string): number | null {
  const m = /(\d+)\s*g\b/i.exec(text);
  return m ? Number(m[1]) : null;
}

/** A leading count like "3 eggs" or "2 servings" (not a gram amount). */
export function parseCount(text: string): number | null {
  const m = /^\s*(\d+)(?!\s*g\b)/.exec(text) || /(\d+)\s*(?:x|×|pcs?|pieces?|servings?)/i.exec(text);
  return m ? Number(m[1]) : null;
}
