import type { DayBlock } from "./service";
import type { PlanSection, PlannedDay, PlannedMeal } from "@/lib/meals/plan-text";

/* Turns a generated plan into schedule blocks. The plan text is long; the
   schedule only needs what someone glances at: the dish, when, and a couple
   of numbers. The full recipe stays in the meal plan card. */

export type PlanBlock = Omit<DayBlock, "id" | "custom" | "source">;

const SLOT_TIME: Record<string, string> = {
  breakfast: "08:00",
  "mid-morning snack": "10:30",
  "morning snack": "10:30",
  lunch: "13:00",
  "afternoon snack": "16:00",
  "evening snack": "18:00",
  snack: "16:00",
  dinner: "19:30",
};

/** "8:00 AM" or "19:30" to "08:00"; the usual hour for the slot when there is none. */
export function slotTime(slot: string, time: string): string {
  const m = time.trim().match(/^(\d{1,2})[:.](\d{2})\s*(am|pm)?$/i);
  if (m) {
    let h = Number(m[1]);
    const suffix = m[3]?.toLowerCase();
    if (suffix === "pm" && h < 12) h += 12;
    if (suffix === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m[2]}`;
  }
  return SLOT_TIME[slot.trim().toLowerCase()] ?? "12:00";
}

function mealBlock(m: PlannedMeal): PlanBlock {
  const detail = [
    m.slot,
    m.protein !== null ? `${m.protein}g protein` : "",
    m.prep,
  ].filter(Boolean).join(" · ");
  return {
    time: slotTime(m.slot, m.time),
    type: /snack/i.test(m.slot) ? "snack" : "meal",
    title: m.title,
    detail,
    kcal: m.kcal ?? undefined,
  };
}

const firstSentence = (text: string) => text.split(/(?<=[.!?])\s/)[0].replace(/[.!]$/, "").trim();

/** Only the habits that belong at a time of day; rules of thumb stay in the card. */
function habitBlocks(sections: PlanSection[]): PlanBlock[] {
  const habits = sections.find((s) => /^habits?$/i.test(s.title));
  if (!habits) return [];
  const out: PlanBlock[] = [];
  for (const { label, value } of habits.notes) {
    if (/water/i.test(label)) {
      out.push({ time: "", type: "hydration", title: "Drink water", detail: `${value} through the day` });
    } else if (/walk/i.test(label)) {
      const minutes = value.match(/(\d+)\s*min/i);
      out.push({ time: "18:00", type: "workout", title: "Walk", detail: minutes ? `${minutes[1]} min` : firstSentence(value) });
    } else if (/prep/i.test(label)) {
      out.push({ time: "21:00", type: "habit", title: "Prep for tomorrow", detail: firstSentence(value) });
    }
  }
  return out;
}

export function planDayToBlocks(day: PlannedDay, sections: PlanSection[]): PlanBlock[] {
  return [...day.meals.map(mealBlock), ...habitBlocks(sections)];
}
