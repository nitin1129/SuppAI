"use client";

/* Client for the health-metrics endpoints. Shared plumbing lives in base.ts. */

import { apiRequest } from "./base";

export type BmiResult = { bmi: number; category: string };
export type BmrResult = { bmr: number };
export type Gender = "Male" | "Female" | "Other";
// calories is the total for the quantity; protein/carbs/fat are per 100g.
export type FoodResult = { found: boolean; calories: number; calories_per_100g: number; food_name: string; quantity: number; protein: number; carbs: number; fat: number };

export function calculateBmi(weightKg: number, heightCm: number): Promise<BmiResult> {
  return apiRequest<BmiResult>(`/calculate-bmi?weight_kg=${weightKg}&height_cm=${heightCm}`);
}

export function calculateBmr(weightKg: number, heightCm: number, age: number, gender: Gender): Promise<BmrResult> {
  return apiRequest<BmrResult>(`/calculate-bmr?weight_kg=${weightKg}&height_cm=${heightCm}&age=${age}&gender=${encodeURIComponent(gender)}`);
}

export function getFoodCalories(foodName: string, quantityGrams: number): Promise<FoodResult> {
  return apiRequest<FoodResult>(`/get-food-calories?food_name=${encodeURIComponent(foodName)}&quantity_grams=${quantityGrams}`, { method: "POST" });
}
