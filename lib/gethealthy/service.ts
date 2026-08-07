"use client";

/* ------------------------------ infra ------------------------------ */

const DELAY = 160;
const delay = <T,>(v: T, ms = DELAY): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
function uid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------ plan state ------------------------------ */

export type PlanStatus = "empty" | "active";

export type PlanState = {
  status: PlanStatus;
  fileName?: string;
  generatedAt?: string;
  day: number; // day X of 7 in the current cycle
};

const LS_STATE = "suppai.gethealthy.state.v1";
const LS_DONE = "suppai.gethealthy.done.v1";

export async function fetchPlanState(): Promise<PlanState> {
  return delay(readLocal<PlanState>(LS_STATE, { status: "empty", day: 1 }));
}

/** Persist the "generated" plan. The processing animation lives in the UI. */
export async function activatePlan(fileName: string): Promise<PlanState> {
  const next: PlanState = {
    status: "active",
    fileName,
    generatedAt: new Date().toISOString(),
    day: 3,
  };
  writeLocal(LS_STATE, next);
  return delay(next, 200);
}

export async function resetPlan(): Promise<PlanState> {
  const next: PlanState = { status: "empty", day: 1 };
  writeLocal(LS_STATE, next);
  writeLocal(LS_DONE, []);
  writeLocal(LS_DAY, DAY_PLAN);
  writeLocal(LS_ROUTINE, [] as RoutineItem[]);
  return delay(next, 140);
}

export async function fetchDoneIds(): Promise<string[]> {
  return delay(readLocal<string[]>(LS_DONE, []));
}
export async function toggleDone(id: string): Promise<string[]> {
  const cur = readLocal<string[]>(LS_DONE, []);
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  writeLocal(LS_DONE, next);
  return delay(next, 80);
}

/* ------------------------------ day plan ------------------------------ */

export type BlockType = "hydration" | "workout" | "meal" | "snack" | "mindfulness" | "habit";

export type DayBlock = {
  id: string;
  time: string;
  type: BlockType;
  title: string;
  detail: string;
  kcal?: number;
  custom?: boolean;
};

export const DAY_PLAN: DayBlock[] = [
  { id: "d1", time: "07:00", type: "hydration", title: "Morning hydration", detail: "500 ml water with lemon" },
  { id: "d2", time: "07:30", type: "workout", title: "Mobility flow", detail: "10 min stretch and breathing" },
  { id: "d3", time: "08:30", type: "meal", title: "Breakfast", detail: "Veg omelette with oats", kcal: 420 },
  { id: "d4", time: "11:00", type: "hydration", title: "Mid-morning", detail: "Green tea and 500 ml water" },
  { id: "d5", time: "13:30", type: "meal", title: "Lunch", detail: "Grilled paneer quinoa bowl", kcal: 560 },
  { id: "d6", time: "17:00", type: "workout", title: "Strength training", detail: "Upper body, 40 min" },
  { id: "d7", time: "20:00", type: "meal", title: "Dinner", detail: "Dal, quinoa and salad", kcal: 480 },
  { id: "d8", time: "22:30", type: "mindfulness", title: "Wind down", detail: "10 min breathing, lights out" },
];

export const DAY_CALORIE_TARGET = 1850;

const LS_DAY = "suppai.gethealthy.day.v1";

function byTime(a: DayBlock, b: DayBlock) {
  return (a.time || "99:99").localeCompare(b.time || "99:99");
}

/** The editable day plan (base plan seeded, then user add/remove). */
export async function fetchDayBlocks(): Promise<DayBlock[]> {
  return delay([...readLocal(LS_DAY, DAY_PLAN)].sort(byTime));
}
export async function addDayBlock(b: Omit<DayBlock, "id" | "custom">): Promise<DayBlock[]> {
  const list = readLocal(LS_DAY, DAY_PLAN);
  const created: DayBlock = { ...b, id: uid("db"), custom: true };
  const next = [...list, created].sort(byTime);
  writeLocal(LS_DAY, next);
  return delay(next, 200);
}
export async function removeDayBlock(id: string): Promise<DayBlock[]> {
  const next = readLocal(LS_DAY, DAY_PLAN).filter((b) => b.id !== id);
  writeLocal(LS_DAY, next);
  return delay(next, 140);
}

export async function updateDayBlock(id: string, patch: Partial<Omit<DayBlock, "id">>): Promise<DayBlock[]> {
  const next = readLocal(LS_DAY, DAY_PLAN).map((b) => (b.id === id ? { ...b, ...patch } : b)).sort(byTime);
  writeLocal(LS_DAY, next);
  return delay(next, 150);
}

/* ------------------------------ weekly plan ------------------------------ */

export type WeekDay = {
  key: string;
  label: string;
  short: string;
  focus: string;
  items: string[];
  kcal: number;
};

export const WEEK_PLAN: WeekDay[] = [
  { key: "mon", label: "Monday", short: "Mon", focus: "Strength and high protein", items: ["Upper body session", "1.6g/kg protein", "8k steps"], kcal: 1850 },
  { key: "tue", label: "Tuesday", short: "Tue", focus: "Cardio and hydration", items: ["30 min zone-2 cardio", "3L water target", "Light dinner"], kcal: 1780 },
  { key: "wed", label: "Wednesday", short: "Wed", focus: "Active recovery", items: ["Mobility and yoga", "Anti-inflammatory meals", "Early sleep"], kcal: 1750 },
  { key: "thu", label: "Thursday", short: "Thu", focus: "Lower body strength", items: ["Legs and core", "Post-workout protein", "8k steps"], kcal: 1900 },
  { key: "fri", label: "Friday", short: "Fri", focus: "HIIT and clean meals", items: ["20 min HIIT", "Whole-food meals", "No late snacking"], kcal: 1820 },
  { key: "sat", label: "Saturday", short: "Sat", focus: "Long walk and meal prep", items: ["10k steps outdoors", "Prep for the week", "Flexible dinner"], kcal: 1950 },
  { key: "sun", label: "Sunday", short: "Sun", focus: "Rest and mindfulness", items: ["Full rest", "20 min meditation", "Reflect and plan"], kcal: 1700 },
];

/* ------------------------------ recipes ------------------------------ */

export type Recipe = {
  id: string;
  name: string;
  image: string;
  kcal: number;
  protein: number;
  timeMins: number;
  servings: number;
  tag: string;
  ingredients: string[];
  steps: string[];
};

export const RECIPES: Recipe[] = [
  {
    id: "r1", name: "Paneer quinoa power bowl", image: "https://picsum.photos/seed/hp-bowl/640/480", kcal: 560, protein: 38, timeMins: 25, servings: 1, tag: "High protein",
    ingredients: ["100g paneer, cubed", "1 cup cooked quinoa", "1/2 cup chickpeas", "Handful spinach", "1 tbsp olive oil", "Lemon, salt, pepper"],
    steps: ["Pan-sear paneer in olive oil until golden.", "Warm the chickpeas with a pinch of cumin.", "Layer quinoa, spinach, chickpeas and paneer in a bowl.", "Finish with lemon juice, salt and pepper."],
  },
  {
    id: "r2", name: "Overnight oats and berries", image: "https://picsum.photos/seed/oats/640/480", kcal: 320, protein: 14, timeMins: 5, servings: 1, tag: "Breakfast",
    ingredients: ["1/2 cup rolled oats", "1/2 cup milk or yogurt", "1 tbsp chia seeds", "Handful mixed berries", "1 tsp honey"],
    steps: ["Mix oats, milk and chia in a jar.", "Stir in honey.", "Refrigerate overnight.", "Top with berries before eating."],
  },
  {
    id: "r3", name: "Grilled chicken salad", image: "https://picsum.photos/seed/chsalad/640/480", kcal: 430, protein: 42, timeMins: 20, servings: 1, tag: "Lean",
    ingredients: ["150g chicken breast", "2 cups salad greens", "1/2 cup cherry tomatoes", "1/4 cucumber", "1 tbsp olive oil", "Lemon and herbs"],
    steps: ["Season and grill the chicken, then slice.", "Toss greens, tomatoes and cucumber.", "Add sliced chicken on top.", "Dress with olive oil, lemon and herbs."],
  },
  {
    id: "r4", name: "Lentil quinoa khichdi", image: "https://picsum.photos/seed/khichdi/640/480", kcal: 480, protein: 22, timeMins: 30, servings: 2, tag: "Comfort",
    ingredients: ["1/2 cup quinoa", "1/2 cup moong dal", "1 tsp ghee", "Cumin, turmeric, ginger", "2 cups water", "Salt to taste"],
    steps: ["Rinse quinoa and dal together.", "Temper cumin and ginger in ghee.", "Add quinoa, dal, turmeric and water.", "Simmer 20 min until soft, season and serve."],
  },
  {
    id: "r5", name: "Greek yogurt parfait", image: "https://picsum.photos/seed/parfait/640/480", kcal: 260, protein: 18, timeMins: 10, servings: 1, tag: "Snack",
    ingredients: ["1 cup Greek yogurt", "2 tbsp granola", "1 tbsp nuts", "Handful berries", "Drizzle of honey"],
    steps: ["Spoon half the yogurt into a glass.", "Add a layer of granola and berries.", "Repeat the layers.", "Top with nuts and honey."],
  },
  {
    id: "r6", name: "Tofu veggie stir-fry", image: "https://picsum.photos/seed/tofu/640/480", kcal: 390, protein: 26, timeMins: 20, servings: 2, tag: "Vegan",
    ingredients: ["200g firm tofu", "2 cups mixed vegetables", "1 tbsp soy sauce", "1 tsp sesame oil", "Garlic and ginger", "Spring onion"],
    steps: ["Press and cube the tofu, then pan-fry until crisp.", "Stir-fry garlic, ginger and vegetables on high heat.", "Return tofu, add soy sauce and sesame oil.", "Toss and garnish with spring onion."],
  },
  {
    id: "r7", name: "Masala egg wrap", image: "https://picsum.photos/seed/eggwrap/640/480", kcal: 410, protein: 24, timeMins: 15, servings: 1, tag: "Quick",
    ingredients: ["2 eggs", "1 whole-wheat wrap", "1/4 onion, tomato", "Green chilli", "1 tsp oil", "Coriander"],
    steps: ["Whisk eggs with chopped onion, tomato and chilli.", "Cook into a thin omelette.", "Warm the wrap and place the omelette on it.", "Roll up with coriander and serve."],
  },
  {
    id: "r8", name: "Berry protein smoothie", image: "https://picsum.photos/seed/smoothie/640/480", kcal: 290, protein: 28, timeMins: 5, servings: 1, tag: "High protein",
    ingredients: ["1 scoop whey or pea protein", "1 cup milk", "Handful frozen berries", "1/2 banana", "Ice"],
    steps: ["Add all ingredients to a blender.", "Blend until smooth.", "Adjust thickness with milk.", "Pour and drink fresh."],
  },
  {
    id: "r9", name: "Chickpea avocado toast", image: "https://picsum.photos/seed/toast/640/480", kcal: 350, protein: 15, timeMins: 10, servings: 1, tag: "Vegetarian",
    ingredients: ["2 slices sourdough", "1/2 avocado", "1/3 cup chickpeas", "Lemon, chilli flakes", "Olive oil, salt"],
    steps: ["Toast the bread.", "Mash avocado with lemon and salt.", "Lightly crush the chickpeas.", "Spread avocado, top with chickpeas, oil and chilli flakes."],
  },
];

/* ------------------------------ weekly routine extras ------------------------------ */

export type RoutineKind = "food" | "exercise";
export type RoutineItem = { id: string; day: string; label: string; kind: RoutineKind };

const LS_ROUTINE = "suppai.gethealthy.routine.v1";

export async function fetchRoutineExtras(): Promise<RoutineItem[]> {
  return delay(readLocal<RoutineItem[]>(LS_ROUTINE, []));
}
export async function addRoutineItem(item: Omit<RoutineItem, "id">): Promise<RoutineItem[]> {
  const next = [...readLocal<RoutineItem[]>(LS_ROUTINE, []), { ...item, id: uid("rt") }];
  writeLocal(LS_ROUTINE, next);
  return delay(next, 180);
}
export async function removeRoutineItem(id: string): Promise<RoutineItem[]> {
  const next = readLocal<RoutineItem[]>(LS_ROUTINE, []).filter((r) => r.id !== id);
  writeLocal(LS_ROUTINE, next);
  return delay(next, 120);
}

/* ------------------------------ weekly achievements ------------------------------ */

export type Achievements = {
  streakDays: number;
  workoutsDone: number;
  workoutsTarget: number;
  activeMinutes: number;
  activeTarget: number;
  caloriesLogged: number;
  hydrationPct: number;
  adherencePct: number;
};

export async function fetchAchievements(): Promise<Achievements> {
  return delay({
    streakDays: 4,
    workoutsDone: 3,
    workoutsTarget: 5,
    activeMinutes: 210,
    activeTarget: 300,
    caloriesLogged: 9420,
    hydrationPct: 68,
    adherencePct: 82,
  });
}
