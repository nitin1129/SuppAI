"use client";

/* Meal / recipe library. Admin adds meals here; the Get Healthy page reads
   them as suggestions. Frontend-only, localStorage-backed. */

const DELAY = 160;
const delay = <T,>(v: T, ms = DELAY): Promise<T> => new Promise((r) => setTimeout(() => r(v), ms));

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
function uid(p: string) { return `${p}-${Math.random().toString(36).slice(2, 8)}`; }

export type Diet = "veg" | "egg" | "nonveg" | "vegan";

export const DIETS: { key: Diet; label: string; cls: string }[] = [
  { key: "veg", label: "Veg", cls: "bg-[#006E42]/10 text-[#006E42]" },
  { key: "egg", label: "Egg", cls: "bg-[#c79a3d]/16 text-[#9c7426]" },
  { key: "nonveg", label: "Non-veg", cls: "bg-[#c14040]/10 text-[#c14040]" },
  { key: "vegan", label: "Vegan", cls: "bg-[#5f52ad]/12 text-[#5f52ad]" },
];
export const DIET_META: Record<Diet, { label: string; cls: string }> = Object.fromEntries(DIETS.map((d) => [d.key, { label: d.label, cls: d.cls }])) as Record<Diet, { label: string; cls: string }>;

export const MEAL_CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "High protein", "Drink"];

export type Meal = {
  id: string;
  name: string;
  image: string;
  kcal: number;
  protein: number;
  timeMins: number;
  servings: number;
  category: string;
  diet: Diet;
  tag: string;
  description: string;
  youtubeUrl?: string;
  ingredients: string[];
  steps: string[];
  createdAt: string;
};

export type NewMeal = Omit<Meal, "id" | "createdAt"> & { id?: string };

const LS = "suppai.meals.v1";

/** Extract the 11-char video id from any common YouTube URL. */
export function youtubeId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function seed(): Meal[] {
  const now = Date.now();
  const base = (i: number, o: Partial<Meal>): Meal => ({
    id: `meal-${i}`, name: "", image: "", kcal: 0, protein: 0, timeMins: 15, servings: 1,
    category: "Lunch", diet: "veg", tag: "", description: "", ingredients: [], steps: [],
    createdAt: new Date(now - i * 3600000).toISOString(), ...o,
  });
  return [
    base(1, { name: "Paneer quinoa power bowl", image: "https://picsum.photos/seed/hp-bowl/640/480", kcal: 560, protein: 38, timeMins: 25, servings: 1, category: "High protein", diet: "veg", tag: "High protein", description: "27g protein per bowl, low-carb and filling.", ingredients: ["100g paneer, cubed", "1 cup cooked quinoa", "1/2 cup chickpeas", "Handful spinach", "1 tbsp olive oil", "Lemon, salt, pepper"], steps: ["Pan-sear paneer in olive oil until golden.", "Warm the chickpeas with a pinch of cumin.", "Layer quinoa, spinach, chickpeas and paneer.", "Finish with lemon, salt and pepper."] }),
    base(2, { name: "Overnight oats and berries", image: "https://picsum.photos/seed/oats/640/480", kcal: 320, protein: 14, timeMins: 5, servings: 1, category: "Breakfast", diet: "veg", tag: "Breakfast", description: "Fibre-rich make-ahead breakfast.", ingredients: ["1/2 cup rolled oats", "1/2 cup milk or yogurt", "1 tbsp chia seeds", "Handful mixed berries", "1 tsp honey"], steps: ["Mix oats, milk and chia in a jar.", "Stir in honey.", "Refrigerate overnight.", "Top with berries before eating."] }),
    base(3, { name: "Grilled chicken salad", image: "https://picsum.photos/seed/chsalad/640/480", kcal: 430, protein: 42, timeMins: 20, servings: 1, category: "Lunch", diet: "nonveg", tag: "Lean", description: "Lean protein with fresh greens.", ingredients: ["150g chicken breast", "2 cups salad greens", "1/2 cup cherry tomatoes", "1/4 cucumber", "1 tbsp olive oil", "Lemon and herbs"], steps: ["Season and grill the chicken, then slice.", "Toss greens, tomatoes and cucumber.", "Add sliced chicken on top.", "Dress with olive oil, lemon and herbs."] }),
    base(4, { name: "Masala egg wrap", image: "https://picsum.photos/seed/eggwrap/640/480", kcal: 410, protein: 24, timeMins: 15, servings: 1, category: "Snack", diet: "egg", tag: "Quick", description: "A fast, protein-packed wrap.", ingredients: ["2 eggs", "1 whole-wheat wrap", "1/4 onion, tomato", "Green chilli", "1 tsp oil", "Coriander"], steps: ["Whisk eggs with onion, tomato and chilli.", "Cook into a thin omelette.", "Warm the wrap and place the omelette on it.", "Roll up with coriander and serve."] }),
    base(5, { name: "Tofu veggie stir-fry", image: "https://picsum.photos/seed/tofu/640/480", kcal: 390, protein: 26, timeMins: 20, servings: 2, category: "Dinner", diet: "vegan", tag: "Vegan", description: "Crisp tofu with a savoury toss.", ingredients: ["200g firm tofu", "2 cups mixed vegetables", "1 tbsp soy sauce", "1 tsp sesame oil", "Garlic and ginger", "Spring onion"], steps: ["Press and cube tofu, pan-fry until crisp.", "Stir-fry garlic, ginger and vegetables on high heat.", "Return tofu, add soy sauce and sesame oil.", "Toss and garnish with spring onion."] }),
    base(6, { name: "Berry protein smoothie", image: "https://picsum.photos/seed/smoothie/640/480", kcal: 290, protein: 28, timeMins: 5, servings: 1, category: "Drink", diet: "veg", tag: "High protein", description: "A quick recovery shake.", ingredients: ["1 scoop whey or pea protein", "1 cup milk", "Handful frozen berries", "1/2 banana", "Ice"], steps: ["Add all ingredients to a blender.", "Blend until smooth.", "Adjust thickness with milk.", "Pour and drink fresh."] }),
  ];
}

export async function fetchMeals(): Promise<Meal[]> {
  return delay([...readLocal(LS, seed())].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function saveMeal(input: NewMeal): Promise<Meal[]> {
  const list = readLocal(LS, seed());
  let next: Meal[];
  if (input.id) {
    next = list.map((m) => (m.id === input.id ? { ...m, ...input, id: m.id } as Meal : m));
  } else {
    const created: Meal = { ...input, id: uid("meal"), createdAt: new Date().toISOString() } as Meal;
    next = [created, ...list];
  }
  writeLocal(LS, next);
  return delay(next, 220);
}

export async function deleteMeal(id: string): Promise<Meal[]> {
  const next = readLocal(LS, seed()).filter((m) => m.id !== id);
  writeLocal(LS, next);
  return delay(next, 140);
}
