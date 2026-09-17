"use client";

import type { ActivityLevel, ApiGender, DietType, MealPlanResult, PlanType } from "@/lib/api/meals";

/* Keeps the last generated plan on this device, so the plan card still shows
   it after a reload or once the page switches to the active plan view. */

const LS_LAST_PLAN = "suppai.mealplan.last.v1";

export type PlanInputs = {
  planType: PlanType;
  age: string;
  gender: ApiGender;
  height: string;
  weight: string;
  diet: DietType;
  activity: ActivityLevel;
  goals: string[];
  allergies: string;
};

export type SavedPlan = {
  result: MealPlanResult;
  inputs: PlanInputs;
  savedAt: string;
  /** Which day of the plan is on today's schedule, if any. */
  scheduledDay?: string;
};

export function readSavedPlan(): SavedPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_LAST_PLAN);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedPlan;
    return parsed?.result?.meal_plan ? parsed : null;
  } catch {
    return null;
  }
}

function write(plan: SavedPlan) {
  try {
    localStorage.setItem(LS_LAST_PLAN, JSON.stringify(plan));
  } catch {
    /* the plan still shows for this visit */
  }
}

export function savePlan(result: MealPlanResult, inputs: PlanInputs, scheduledDay?: string) {
  write({ result, inputs, savedAt: new Date().toISOString(), scheduledDay });
}

export function markScheduled(dayLabel: string) {
  const current = readSavedPlan();
  if (current) write({ ...current, scheduledDay: dayLabel });
}
