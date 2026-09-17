"use client";

import { apiRequest, apiUrl } from "./base";

/* Meal planning on the health backend. Values here are the exact strings the
   API accepts; sending anything else comes back as a validation error. */

export type ApiGender = "Male" | "Female" | "Other";
export type DietType =
  | "Omnivore" | "Vegetarian" | "Vegan" | "Pescatarian"
  | "Low-carb/Keto" | "Gluten-free" | "Jain/Sattvic" | "Other";
export type ActivityLevel =
  | "Little movement"
  | "Walking, stretching everyday"
  | "Exercise 2-3 times a week"
  | "Daily training";
export type PlanType = "1 day" | "7 day";

export const DIET_TYPES: DietType[] = [
  "Omnivore", "Vegetarian", "Vegan", "Pescatarian",
  "Low-carb/Keto", "Gluten-free", "Jain/Sattvic", "Other",
];
export const ACTIVITY_LEVELS: ActivityLevel[] = [
  "Little movement",
  "Walking, stretching everyday",
  "Exercise 2-3 times a week",
  "Daily training",
];
export const GENDERS: ApiGender[] = ["Male", "Female", "Other"];

export type ApiUserProfile = {
  user_id: string;
  name: string;
  age: number;
  gender: ApiGender;
  height: number; // cm
  weight: number; // kg
  diet: DietType;
  activity_level: ActivityLevel;
  food_allergies?: string[];
  health_goals?: string[];
  disease?: string[];
  supplement_preferences?: string[];
  food_type?: string | null;
};

export type MealPlanResult = {
  meal_plan: string;
  bmi: number;
  bmr: number;
  calorie_range: string;
  daily_goal: string;
  download_url?: string | null;
};

export type RegisterResult = { user_id: string; name: string; message?: string };

export type CalorieBreakdown = {
  calories: Record<string, Record<string, number>>; // day -> meal -> kcal
  daily_totals: Record<string, number>;
  weekly_total: number;
};

export function registerUser(name: string, email: string): Promise<RegisterResult> {
  return apiRequest<RegisterResult>("/register", { method: "POST", body: { name, email } });
}

export function generateMealPlan(profile: ApiUserProfile, planType: PlanType): Promise<MealPlanResult> {
  return apiRequest<MealPlanResult>("/generate-meal-plan", {
    method: "POST",
    body: { user_profile: profile, plan_type: planType },
  });
}

export function parseCalories(mealPlan: string): Promise<CalorieBreakdown> {
  return apiRequest<CalorieBreakdown>(`/parse-calories?meal_plan=${encodeURIComponent(mealPlan)}`, { method: "POST" });
}

/** The API returns a relative download path; the PDF is served from the API host. */
export function mealPlanPdfUrl(downloadUrl: string): string {
  return apiUrl(downloadUrl);
}
