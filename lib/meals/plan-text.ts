/* The API returns a meal plan as formatted text, and the shape differs between
   plan types. A single day spells the numbers out:

     Lunch: Quinoa Salad (450 kcal, 20g P, 60g C, 15g F) - why it helps
     Time: 1:00 PM | Portion: 1 bowl | Prep: 15 min | Tags: Veg
     Ingredients: quinoa, black beans

   while a seven day plan writes them bare and keeps everything on one line:

     Lunch: Grilled Chicken Salad (350, 30, 10, 15) - why it helps | Prep: 15 min

   Both end with extra sections (Habits, Sunday Batch Preparation, Smart
   Grocery List). This reads either into something the UI can lay out. */

export type PlannedMeal = {
  slot: string;          // Breakfast, Lunch, Dinner, a snack
  title: string;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  why: string;
  time: string;
  portion: string;
  prep: string;
  fibre: string;
  cost: string;
  batch: string;
  tags: string[];
  ingredients: string[];
  cook: string;
  targets: string;
  swap: string;
};

export type PlannedDay = { label: string; meals: PlannedMeal[] };
export type PlanNote = { label: string; value: string };
export type PlanSection = { title: string; notes: PlanNote[]; bullets: string[] };
export type ParsedPlan = { days: PlannedDay[]; sections: PlanSection[] };

const MEAL_LINE = /^([A-Za-z][A-Za-z\s/&-]{2,28}?):\s*(.+?)\s*\(([^)]+)\)\s*(.*)$/;
const DAY_LINE = /^(Day\s*\d+)\b\s*(?:\(([^)]*)\))?\s*[:-]?\s*$/i;
const SECTION_LINE = /^([A-Za-z][A-Za-z\s&'-]{2,40}):\s*$/;
const LABELLED_MACRO = /(\d+(?:\.\d+)?)\s*g?\s*(?:of\s*)?([PCF])\b/gi;

const DETAIL_KEYS = new Set([
  "time", "portion", "prep", "fibre", "fiber", "cost", "batch",
  "tags", "ingredients", "cook", "targets", "swap",
]);

function emptyMeal(slot: string, title: string): PlannedMeal {
  return {
    slot, title, kcal: null, protein: null, carbs: null, fat: null, why: "",
    time: "", portion: "", prep: "", fibre: "", cost: "", batch: "",
    tags: [], ingredients: [], cook: "", targets: "", swap: "",
  };
}

/* The numbers in brackets come in three spellings, all kcal then protein,
   carbs, fat:  "(450 kcal, 20g P, 60g C, 15g F)"  "(350, 30, 10, 15)"
   "(300, 20g, 2g, 22g)". Labels win when present, otherwise order decides. */
function readNumbers(raw: string, meal: PlannedMeal): boolean {
  const numbers = [...raw.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  if (numbers.length === 0) return false;

  const labelled = /kcal|cal\b/i.test(raw) || /\d\s*g?\s*[PCF]\b/.test(raw);
  if (!labelled) {
    // Bare form: every part must be a plain number, optionally with a unit.
    const parts = raw.split(",").map((x) => x.trim());
    if (!parts.every((x) => /^\d+(\.\d+)?\s*(g|kcal|cal)?$/i.test(x))) return false;
  }

  const kcal = raw.match(/(\d+(?:\.\d+)?)\s*(?:kcal|cal)\b/i);
  meal.kcal = kcal ? Number(kcal[1]) : numbers[0];

  let found = false;
  for (const m of raw.matchAll(LABELLED_MACRO)) {
    found = true;
    const value = Number(m[1]);
    const key = m[2].toUpperCase();
    if (key === "P") meal.protein = value;
    else if (key === "C") meal.carbs = value;
    else if (key === "F") meal.fat = value;
  }
  if (!found && numbers.length >= 4) {
    [meal.protein, meal.carbs, meal.fat] = numbers.slice(1, 4);
  }
  return true;
}

function applyPair(meal: PlannedMeal, key: string, value: string) {
  switch (key) {
    case "time": meal.time = value; break;
    case "portion": meal.portion = value; break;
    case "prep": meal.prep = value; break;
    case "fibre": case "fiber": meal.fibre = value; break;
    case "cost": meal.cost = value; break;
    case "batch": meal.batch = /^(none|n\/a)$/i.test(value) ? "" : value; break;
    case "tags": meal.tags = value.split(",").map((t) => t.trim()).filter(Boolean); break;
    case "ingredients": meal.ingredients = value.replace(/\.$/, "").split(",").map((t) => t.trim()).filter(Boolean); break;
    case "cook": meal.cook = value; break;
    case "targets": meal.targets = value; break;
    case "swap": meal.swap = value; break;
    default: break;
  }
}

/** Detail segments are pipe separated; anything unlabelled is the "why" line. */
function readDetails(meal: PlannedMeal, tail: string, allowWhy: boolean) {
  for (const segment of tail.split("|").map((s) => s.trim()).filter(Boolean)) {
    const at = segment.indexOf(":");
    const key = at === -1 ? "" : segment.slice(0, at).trim().toLowerCase();
    if (key && DETAIL_KEYS.has(key)) {
      applyPair(meal, key, segment.slice(at + 1).trim());
    } else if (allowWhy && !meal.why) {
      meal.why = segment.replace(/^[-–]\s*/, "").trim();
    }
  }
}

export function parseMealPlan(text: string): ParsedPlan {
  const days: PlannedDay[] = [];
  const sections: PlanSection[] = [];
  let day: PlannedDay | null = null;
  let meal: PlannedMeal | null = null;
  let section: PlanSection | null = null;

  const closeMeal = () => {
    if (meal && day) day.meals.push(meal);
    meal = null;
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\*\*/g, "").replace(/\s+$/, "").trim();
    if (!line) continue;

    const dayMatch = line.match(DAY_LINE);
    if (dayMatch) {
      closeMeal();
      section = null;
      const suffix = dayMatch[2] ? ` (${dayMatch[2]})` : "";
      day = { label: `${dayMatch[1].replace(/\s+/, " ")}${suffix}`, meals: [] };
      days.push(day);
      continue;
    }

    const mealMatch = line.match(MEAL_LINE);
    if (mealMatch) {
      const candidate = emptyMeal(mealMatch[1].trim(), mealMatch[2].trim());
      if (readNumbers(mealMatch[3], candidate)) {
        closeMeal();
        section = null;
        if (!day) { day = { label: "Day 1", meals: [] }; days.push(day); }
        meal = candidate;
        readDetails(meal, mealMatch[4] ?? "", true);
        continue;
      }
    }

    const sectionMatch = line.match(SECTION_LINE);
    if (sectionMatch) {
      closeMeal();
      section = { title: sectionMatch[1].trim(), notes: [], bullets: [] };
      sections.push(section);
      continue;
    }

    if (section) {
      if (/^[-•*]\s+/.test(line)) {
        section.bullets.push(line.replace(/^[-•*]\s+/, ""));
      } else {
        const at = line.indexOf(":");
        if (at > 0) section.notes.push({ label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() });
        else section.bullets.push(line);
      }
      continue;
    }

    if (meal) readDetails(meal, line, false);
  }

  closeMeal();
  return { days: days.filter((d) => d.meals.length > 0), sections };
}

export function dayCalories(day: PlannedDay): number {
  return day.meals.reduce((sum, m) => sum + (m.kcal ?? 0), 0);
}
