/* Approximate calories per 100 g, for the food-calorie tool. Common Indian
   and general foods; values are rounded estimates for guidance only. */

export type Food = { name: string; kcal: number };

export const FOODS: Food[] = [
  { name: "Rice (cooked)", kcal: 130 },
  { name: "Brown rice (cooked)", kcal: 111 },
  { name: "Roti / Chapati", kcal: 297 },
  { name: "Bread (white)", kcal: 265 },
  { name: "Idli", kcal: 58 },
  { name: "Dosa", kcal: 168 },
  { name: "Poha", kcal: 130 },
  { name: "Upma", kcal: 132 },
  { name: "Oats (raw)", kcal: 389 },
  { name: "Quinoa (cooked)", kcal: 120 },
  { name: "Dal (cooked)", kcal: 116 },
  { name: "Rajma (cooked)", kcal: 127 },
  { name: "Chickpea / Chana (cooked)", kcal: 164 },
  { name: "Paneer", kcal: 265 },
  { name: "Tofu", kcal: 76 },
  { name: "Egg (whole)", kcal: 155 },
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
  { name: "Banana", kcal: 89 },
  { name: "Apple", kcal: 52 },
  { name: "Orange", kcal: 47 },
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
  { name: "Samosa", kcal: 262 },
  { name: "Pizza", kcal: 266 },
];

export function findFood(name: string): Food | undefined {
  const n = name.trim().toLowerCase();
  return FOODS.find((f) => f.name.toLowerCase() === n);
}
